# Offline Plagiarism Checker — Local Setup

The app has a Next.js frontend, FastAPI backend, and local PostgreSQL database. Install dependencies and download the semantic model while online; afterward it can run locally without internet.

## 1. Get the code and prerequisites

Clone the repository, then install the tools for your operating system.

### Garuda Linux / Arch (fish)

```fish
sudo pacman -Syu      
sudo pacman -S git postgresql nodejs npm
```

Install [uv](https://docs.astral.sh/uv/getting-started/installation/) if it is not already available.

For a **new PostgreSQL installation only**:

```fish
sudo -iu postgres initdb -D /var/lib/postgres/data
sudo systemctl enable --now postgresql
sudo -iu postgres createuser --pwprompt plagiarism_user
sudo -iu postgres createdb --owner=plagiarism_user plagiarism_db
```

Do not run `initdb` over an existing PostgreSQL database cluster. If the service or role already exists, skip the corresponding setup command.

### macOS (Terminal with zsh)

Install [Homebrew](https://brew.sh/) if needed, then:

```zsh
brew install git node postgresql uv
brew services start postgresql
createuser --pwprompt plagiarism_user
createdb --owner=plagiarism_user plagiarism_db
```

If `psql`/`createuser` is not on your PATH after Homebrew installation, follow the PATH instructions printed by `brew install postgresql`. Skip user/database creation if they already exist.

### Windows (PowerShell)

Install [Git](https://git-scm.com/downloads), [Node.js](https://nodejs.org/en/download), [PostgreSQL](https://www.postgresql.org/download/windows/), and [uv](https://docs.astral.sh/uv/getting-started/installation/). The PostgreSQL installer asks you to choose the `postgres` superuser password and normally starts the database service.

Open **SQL Shell (psql)** from the Start menu, connect as `postgres` using that password, and enter these **two separate SQL statements**:

```sql
CREATE ROLE plagiarism_user WITH LOGIN PASSWORD 'CHOOSE_A_PASSWORD';
CREATE DATABASE plagiarism_db OWNER plagiarism_user;
```

If the role/database already exists, do not create it again. Keep the password for the backend configuration below. On macOS/Linux, `createuser --pwprompt` asks for this password instead.

### Clone the repository (any OS)

```text
git clone <YOUR_REPOSITORY_URL>
cd <CLONED_DIRECTORY>
```

Use these commands in your OS terminal or the Zed terminal. Replace the URL and directory name with the actual repository details.

## 2. Configure and start the backend

From the repository root:

**Garuda (fish) or macOS (zsh):**

```sh
cd backend
uv python install 3.12
uv venv --python 3.12 .venv
uv pip install --python .venv/bin/python -r requirements.txt
.venv/bin/python download_model.py
```

**Windows (PowerShell):**

```powershell
cd backend
uv python install 3.12
uv venv --python 3.12 .venv
uv pip install --python .venv/Scripts/python.exe -r requirements.txt
.venv/Scripts/python.exe download_model.py
```

`download_model.py` needs internet once. Verify that `backend/models/all-MiniLM-L6-v2/modules.json` exists. If you skip the model download, word-overlap matching still works, but semantic matching will be unavailable.

Create `backend/.env` (on **all** operating systems):

```dotenv
DATABASE_URL=postgresql://plagiarism_user:CHOOSE_A_PASSWORD@127.0.0.1:5432/plagiarism_db
```

Use the actual password you chose. URL-encode special URL characters in it. Keep `.env` out of Git.

**Start backend — Garuda (fish):**

```fish
set -x HF_HUB_OFFLINE 1
set -x TRANSFORMERS_OFFLINE 1
.venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

**Start backend — macOS (zsh):**

```zsh
export HF_HUB_OFFLINE=1 TRANSFORMERS_OFFLINE=1
.venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

**Start backend — Windows (PowerShell):**

```powershell
$env:HF_HUB_OFFLINE = "1"
$env:TRANSFORMERS_OFFLINE = "1"
.venv/Scripts/python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Visit `http://127.0.0.1:8000/health`. The database should say `connected`; `semantic_model: true` means the local model loaded. The backend creates its tables on first startup.

## 3. Configure and start the frontend

Open a **second terminal** at the repository root:

```text
cd frontend
npm install
```

Create `frontend/.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Then run:

```text
npm run dev
```

Open `http://localhost:3000`. Add a previous report as a reference PDF, then check another PDF against it.

## Running again offline

Start the local PostgreSQL service if it is stopped, then use the backend and frontend start commands above. On a **different computer**, download or transfer the model and install Python/npm dependencies before disconnecting from the internet. The current version stores extracted reference text in PostgreSQL; it does not retain the original PDF bytes. Text-based PDFs work; scanned PDFs need OCR, which is not included yet.
