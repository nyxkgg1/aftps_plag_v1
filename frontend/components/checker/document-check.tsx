"use client";

import { useState } from "react";
import { checkPdf } from "@/lib/api";
import type { CheckResult } from "@/lib/types";
import { ResultsPanel } from "@/components/checker/results-panel";
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

export function DocumentCheck() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CheckResult | null>(null);

  async function handleCheck() {
    if (!file) return;

    setBusy(true);
    setError("");
    setResult(null);

    try {
      setResult(await checkPdf(file));
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Check failed.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>2. Check a report</CardTitle>
          <CardDescription>
            Compare a PDF against reports already added to the local collection.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="candidate-pdf">PDF to check</Label>
            <Input
              id="candidate-pdf"
              type="file"
              accept=".pdf,application/pdf"
              onChange={(event) =>
                setFile(event.target.files?.[0] ?? null)
              }
            />
          </div>

          <Button
            type="button"
            onClick={handleCheck}
            aria-disabled={!file || busy}
            className={!file || busy ? "opacity-50" : ""}
          >
            {busy ? "Checking…" : "Check for matches"}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {result && <ResultsPanel result={result} />}
    </div>
  );
}
