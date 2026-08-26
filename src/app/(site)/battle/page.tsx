import { GitHub } from "@/components/GitHubBattle";
import { Suspense } from "react";

export default function BattlePage() {
  return (
    <Suspense fallback={null}>
      <GitHub />
    </Suspense>
  );
}
