import { PopularLanguages as Languages } from "./PopularLanguages";
import { PopularCard } from "./PopularCard";
import { T_Repo } from "./types";
import { PageHeader } from "@/shared/ui/PageHeader/PageHeader";

type Items = {
  items: T_Repo[];
};

export const Popular = ({ items }: Items) => {
  return (
    <>
      <PageHeader
        eyebrow="GitHub popular"
        title="Popular Repositories"
        description="Browse the most starred repositories by language."
      />
      <div className="mx-auto flex justify-center items-center">
        <Languages></Languages>
      </div>
      {items.length ? (
        <div className="grid grid-cols-1 gap-5 py-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item, index) => (
            <PopularCard key={item.id} item={item} index={index} />
          ))}
        </div>
      ) : (
        <div className="mx-auto max-w-xl rounded-lg border border-border bg-surface p-6 text-center">
          <h2 className="text-lg font-semibold text-foreground">
            No repositories found
          </h2>

          <p className="mt-2 text-sm text-muted">
            Try selecting another language.
          </p>
        </div>
      )}
    </>
  );
};
