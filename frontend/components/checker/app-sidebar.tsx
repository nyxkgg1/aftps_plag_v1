import { FileSearch, FolderOpen, HardDrive, ShieldCheck } from "lucide-react";

export function AppSidebar() {
  return (
    <aside className="border-b border-slate-200 bg-white lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:border-b-0 lg:border-r">
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-6">
        <div className="flex size-9 items-center justify-center rounded-lg bg-blue-700 text-white">
          <FileSearch className="size-5" />
        </div>
        <div>
          <p className="text-sm font-bold leading-tight text-slate-900">
            Originality
          </p>
          <p className="text-xs text-slate-500">Local checker</p>
        </div>
      </div>

      <div className="space-y-7 px-4 py-6">
        <div>
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Workspace
          </p>

          <nav aria-label="Main navigation" className="mt-3 space-y-1">
            <a
              href="#check-report"
              className="flex items-center gap-3 rounded-lg bg-blue-50 px-3 py-2.5 text-sm font-semibold text-blue-700"
            >
              <FileSearch className="size-4" />
              Check report
            </a>
            <a
              href="#reference-library"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              <FolderOpen className="size-4" />
              Add reference
            </a>
          </nav>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <HardDrive className="size-4 text-blue-700" />
            Runs on this computer
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            The application connects to your local FastAPI server and
            PostgreSQL database.
          </p>
        </div>
      </div>

      <div className="hidden border-t border-slate-200 px-6 py-4 lg:absolute lg:inset-x-0 lg:bottom-0 lg:block">
        <p className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="size-4" />
          Offline workflow
        </p>
      </div>
    </aside>
  );
}
