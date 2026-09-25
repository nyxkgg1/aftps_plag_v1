import os
import re
from contextlib import asynccontextmanager
from io import BytesIO
from pathlib import Path

import fitz
import psycopg
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

DATABASE_URL = os.environ["DATABASE_URL"]
MODEL_DIR = Path(__file__).resolve().parent.parent / "models" / "all-MiniLM-L6-v2"
MAX_FILE_BYTES = 10 * 1024 * 1024
model = None


def connect():
    return psycopg.connect(DATABASE_URL)


def create_tables():
    with connect() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS documents (
                id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                filename TEXT NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT now()
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS passages (
                id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                document_id BIGINT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
                page_number INTEGER NOT NULL,
                content TEXT NOT NULL
            )
        """)


@asynccontextmanager
async def lifespan(app: FastAPI):
    global model
    create_tables()

    # The model is loaded strictly from a local folder.
    if MODEL_DIR.exists():
        from sentence_transformers import SentenceTransformer
        model = SentenceTransformer(
            str(MODEL_DIR),
            local_files_only=True,
            trust_remote_code=False,
        )

    yield


app = FastAPI(title="Offline Plagiarism Checker", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


def normalise(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


async def extract_passages(file: UploadFile):
    raw = await file.read(MAX_FILE_BYTES + 1)

    if len(raw) > MAX_FILE_BYTES:
        raise HTTPException(413, "PDF exceeds the 10 MB limit.")

    if not raw.startswith(b"%PDF-"):
        raise HTTPException(400, "The uploaded file is not a PDF.")

    try:
        pdf = fitz.open(stream=BytesIO(raw), filetype="pdf")
        if pdf.needs_pass:
            raise HTTPException(400, "Password-protected PDFs are not supported.")

        passages = []
        for page_index, page in enumerate(pdf):
            # A paragraph is our first simple unit of comparison.
            blocks = page.get_text("blocks")
            for block in blocks:
                text = normalise(block[4])
                if len(text.split()) >= 12:
                    passages.append({
                        "page": page_index + 1,
                        "text": text[:3000],
                    })
        pdf.close()

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(400, "Could not read this PDF.")

    if not passages:
        raise HTTPException(
            400,
            "No usable text found. Scanned image PDFs need OCR, which is not in Version 1.",
        )

    return passages


def word_ngrams(text: str, n: int = 5) -> set[tuple[str, ...]]:
    words = re.findall(r"\w+", text.lower())
    return set(zip(*(words[i:] for i in range(n)))) if len(words) >= n else set()


def overlap_score(a: str, b: str) -> float:
    left = word_ngrams(a)
    right = word_ngrams(b)
    if not left or not right:
        return 0.0
    return len(left & right) / min(len(left), len(right))


def semantic_scores(query: str, candidates: list[str]) -> list[float]:
    if model is None or not candidates:
        return [0.0] * len(candidates)

    vectors = model.encode(
        [query, *candidates],
        normalize_embeddings=True,
        convert_to_numpy=True,
    )
    return [float(vectors[0] @ vector) for vector in vectors[1:]]


@app.get("/health")
def health():
    with connect() as conn:
        conn.execute("SELECT 1").fetchone()
    return {"database": "connected", "semantic_model": model is not None}


@app.get("/documents")
def documents():
    with connect() as conn:
        rows = conn.execute(
            "SELECT id, filename, created_at FROM documents ORDER BY id DESC"
        ).fetchall()

    return [
        {"id": row[0], "filename": row[1], "created_at": row[2]}
        for row in rows
    ]


@app.post("/documents")
async def add_reference(file: UploadFile = File(...)):
    passages = await extract_passages(file)
    filename = Path(file.filename or "reference.pdf").name[:200]

    with connect() as conn:
        existing = conn.execute(
            """
            SELECT id
            FROM documents
            WHERE filename = %s
            ORDER BY id
            LIMIT 1
            """,
            (filename,),
        ).fetchone()

        if existing:
            return {
                "already_exists": True,
                "id": existing[0],
                "filename": filename,
                "message": "This PDF filename is already present in the database.",
            }

        document_id = conn.execute(
            "INSERT INTO documents (filename) VALUES (%s) RETURNING id",
            (filename,),
        ).fetchone()[0]

        with conn.cursor() as cursor:
            cursor.executemany(
                """
                INSERT INTO passages (document_id, page_number, content)
                VALUES (%s, %s, %s)
                """,
                [(document_id, p["page"], p["text"]) for p in passages],
            )

    return {
        "already_exists": False,
        "id": document_id,
        "filename": filename,
        "passages": len(passages),
    }

    with connect() as conn:
        document_id = conn.execute(
            "INSERT INTO documents (filename) VALUES (%s) RETURNING id",
            (filename,),
        ).fetchone()[0]

        with conn.cursor() as cursor:
            cursor.executemany(
                """
                INSERT INTO passages (document_id, page_number, content)
                VALUES (%s, %s, %s)
                """,
                [(document_id, p["page"], p["text"]) for p in passages],
            )

    return {"id": document_id, "filename": filename, "passages": len(passages)}


@app.post("/check")
async def check(file: UploadFile = File(...)):
    uploaded = await extract_passages(file)

    with connect() as conn:
        rows = conn.execute("""
            SELECT p.page_number, p.content, d.filename
            FROM passages p
            JOIN documents d ON d.id = p.document_id
        """).fetchall()

    if not rows:
        return {
            "message": "No reference PDFs yet. Add at least one reference PDF first.",
            "matches": [],
        }

    matches = []

    for passage in uploaded:
        # Simple implementation: compare each uploaded paragraph to the
        # paragraphs already stored in PostgreSQL.
        scored = []
        for source_page, source_text, source_name in rows:
            exact = overlap_score(passage["text"], source_text)
            scored.append((exact, source_page, source_text, source_name))

        # Semantic comparison runs on the best overlap candidates. This keeps
        # the first implementation manageable on a normal laptop.
        candidates = sorted(scored, reverse=True, key=lambda item: item[0])[:20]
        semantic = semantic_scores(
            passage["text"],
            [item[2] for item in candidates],
        )

        for (exact, source_page, source_text, source_name), meaning in zip(
            candidates, semantic
        ):
            if exact >= 0.25 or meaning >= 0.78:
                matches.append({
                    "uploaded_page": passage["page"],
                    "uploaded_text": passage["text"][:400],
                    "source_file": source_name,
                    "source_page": source_page,
                    "source_text": source_text[:400],
                    "word_overlap": round(exact, 3),
                    "semantic_similarity": round(meaning, 3),
                })

    matches.sort(
        key=lambda item: max(
            item["word_overlap"],
            item["semantic_similarity"],
        ),
        reverse=True,
    )

    return {
        "passages_checked": len(uploaded),
        "reference_passages": len(rows),
        "semantic_model_loaded": model is not None,
        "matches": matches[:30],
    }
