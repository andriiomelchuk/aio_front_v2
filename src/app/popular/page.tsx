import { getPopular } from "@/lib/api";

import { Popular as PopularRepos } from "@/components/PopularRepos";
import { redirect } from "next/navigation";

type SearchParams = {
  searchParams: Promise< {
    language?: string;
  }>;
};

export default async function Popular({ searchParams }: SearchParams) {
  const params = await searchParams;

  if (!params.language){
    redirect("/popular?language=all");
  }

  const repos = await getPopular(params.language);

  return (
    <div>
      <PopularRepos items={repos.items}></PopularRepos>
    </div>
  );
}
