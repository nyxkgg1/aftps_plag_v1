import type { Match } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  match: Match;
  number: number;
};

export function MatchCard({ match, number }: Props) {
  return (
    <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-100">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
              Match {number}
            </p>
            <CardTitle className="break-all text-lg">
              {match.source_file}
            </CardTitle>
            <p className="text-sm text-slate-500">
              Reference page {match.source_page} · Uploaded page{" "}
              {match.uploaded_page}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              Word overlap {match.word_overlap.toFixed(2)}
            </Badge>
            <Badge variant="outline">
              Meaning {match.semantic_similarity.toFixed(2)}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid gap-4 py-6 xl:grid-cols-2">
        <div className="min-w-0 rounded-xl border border-blue-100 bg-blue-50/60 p-5">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-blue-800">
            Uploaded report · page {match.uploaded_page}
          </p>
          <p className="whitespace-pre-wrap text-base leading-7 text-slate-800">
            {match.uploaded_text}
          </p>
        </div>

        <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-600">
            Reference report · page {match.source_page}
          </p>
          <p className="whitespace-pre-wrap text-base leading-7 text-slate-800">
            {match.source_text}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
