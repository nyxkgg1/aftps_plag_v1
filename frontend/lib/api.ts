import type {
  CheckResult,
  ReferenceUploadResult,
} from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function uploadPdf<T>(path: string, file: File): Promise<T> {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is missing from .env.local");
  }

  const form = new FormData();
  form.append("file", file);

  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    body: form,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof data.detail === "string"
        ? data.detail
        : "The server could not process this PDF.",
    );
  }

  return data as T;
}

export function addReferencePdf(file: File) {
  return uploadPdf<ReferenceUploadResult>("/documents", file);
}

export function checkPdf(file: File) {
  return uploadPdf<CheckResult>("/check", file);
}