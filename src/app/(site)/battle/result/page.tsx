import { ResultBattle } from "@/components/GitHubBattle/ResultBattle";
import { Suspense } from "react";
import { PageLoading } from "@/shared/ui";


export default function ResultBattlePage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <ResultBattle />
    </Suspense>
  );
}
