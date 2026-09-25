"use client";

import { useState } from "react";
import { addReferencePdf } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ReferenceUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  async function handleUpload() {
    if (!file) return;

    setBusy(true);
    setMessage("");

    try {
      const result = await addReferencePdf(file);
      setError(false);
      setMessage(
        result.already_exists
          ? `${result.filename} is already present in the database.`
          : `Added ${result.filename} with ${result.passages} passages.`,
      );
    } catch (caught) {
      setError(true);
      setMessage(
        caught instanceof Error ? caught.message : "Upload failed.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>1. Add a reference report</CardTitle>
        <CardDescription>
          This PDF becomes part of the local collection used for comparison.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reference-pdf">Reference PDF</Label>
          <Input
            id="reference-pdf"
            type="file"
            accept=".pdf,application/pdf"
            onChange={(event) =>
              setFile(event.target.files?.[0] ?? null)
            }
          />
        </div>

        <Button
          type="button"
          onClick={handleUpload}
          aria-disabled={!file || busy}
          className={!file || busy ? "opacity-50" : ""}
        >
          {busy ? "Adding…" : "Add to reference collection"}
        </Button>

        {message && (
          <Alert variant={error ? "destructive" : "default"}>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
