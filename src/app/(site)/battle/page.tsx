import { GitHub } from "@/components/GitHubBattle";
import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GitHub Battle",
  description: "Compare two GitHub profiles and discover the winner.",
  alternates: { canonical: "/battle" },
};

export default function BattlePage() {
  return (
    <Suspense fallback={null}>
      <GitHub />
    </Suspense>
  );
}
