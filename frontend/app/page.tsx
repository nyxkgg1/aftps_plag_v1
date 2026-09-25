import { AppSidebar } from "@/components/checker/app-sidebar";
import { DocumentCheck } from "@/components/checker/document-check";
import { ReferenceUpload } from "@/components/checker/reference-upload";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <AppSidebar />

      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 lg:px-10 lg:py-10">
          <header className="mb-8 border-b border-slate-200 pb-8">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
              Document review
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Plagiarism checker
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Compare a report with PDFs in your local reference collection.
              Review matched passages and their source pages below.
            </p>
          </header>

          <div className="space-y-8">
            <section
              id="reference-library"
              aria-label="Reference library"
            >
              <ReferenceUpload />
            </section>

            <section id="check-report" aria-label="Check report">
              <DocumentCheck />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}