

import { Popular as PopularRepos } from "@/components/PopularRepos";
import { getPopular } from "@/lib/github";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Popular Repositories",
  description: "Discover popular GitHub repositories by programming language.",
};

type SearchParams = {
  searchParams: Promise< {
    language?: string;
  }>;
};

export default async function PopularPage({ searchParams }: SearchParams) {
  const params = await searchParams;

  if (!params.language){
    redirect("/popular?language=all");
  }

  const repos = await getPopular(params.language);

  return (
    <Suspense fallback={null}>
      <PopularRepos items={repos.items} />
    </Suspense>
  );
}
