import { ResultBattle } from "@/components/GitHubBattle/ResultBattle";
import { Suspense } from "react";


export default function ResultBattlePage() {
  return (
    <Suspense fallback={null}>
      <ResultBattle />
    </Suspense>
  );
}
