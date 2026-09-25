import type { CheckResult } from "@/lib/types";
import { MatchCard } from "@/components/checker/match-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  result: CheckResult;
};

export function ResultsPanel({ result }: Props) {
  return (
    <section className="space-y-4" aria-label="Check results">
      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
        </CardHeader>

        <CardContent className="space-y-2 text-sm">
          {result.message ? (
            <p>{result.message}</p>
          ) : (
            <>
              <p>
                Checked <strong>{result.passages_checked}</strong>{" "}
                passages against{" "}
                <strong>{result.reference_passages}</strong>{" "}
                reference passages.
              </p>
              <p>
                Semantic model:{" "}
                {result.semantic_model_loaded
                  ? "loaded"
                  : "not loaded"}
              </p>
              <p>
                Matches shown: <strong>{result.matches.length}</strong>
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {!result.message && result.matches.length === 0 && (
        <Alert>
          <AlertDescription>
            No passages crossed the current matching thresholds.
          </AlertDescription>
        </Alert>
      )}

      {result.matches.map((match, index) => (
        <MatchCard
          key={`${match.source_file}-${match.source_page}-${match.uploaded_page}-${index}`}
          match={match}
          number={index + 1}
        />
      ))}
    </section>
  );
}
