import Image from "next/image";
import { T_Repo } from "./types";

export type Item = {
  item: T_Repo;
  index: number;
};

export const PopularCard = ({ item, index }: Item) => {
  return (
    <div className="max-w-[720px] mx-auto pb-5">
      <div className="relative flex w-full flex-col rounded-xl border border-border bg-surface text-foreground shadow-[0_18px_40px_var(--shadow-color)]">
        <div className="align-middle text-center pt-2 flex items-center justify-between mb-2 px-4">
          <p># {index + 1}</p>
          <p>{item.language}</p>
        </div>
        <div className="relative mx-3 mt-3 h-48 overflow-hidden rounded-xl bg-surface-muted text-foreground sm:h-48">
          <Image
            className="h-full w-full object-cover"
            src={item.owner.avatar_url}
            alt={item.owner.login}
            width={150}
            height={150}
          />
        </div>
        <div className="p-6 pb-8 h-38">
          <div className="flex items-center justify-between mb-2">
            <p className="block font-sans text-base font-medium leading-relaxed text-foreground antialiased">
              Stars: {item.stargazers_count}
            </p>
          </div>
          <div className="flex items-center justify-between mb-2">
            <p className="block font-sans text-sm font-medium leading-relaxed text-foreground antialiased">
              User: {item.owner.login}
            </p>
          </div>
          <div className="flex items-center justify-between mb-2">
            <p className="block font-sans text-sm font-medium leading-relaxed text-foreground antialiased">
              Repo: {item.name}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
