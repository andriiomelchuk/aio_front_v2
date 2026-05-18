import { PopularLanguages as Languages } from "./PopularLanguages";
import { PopularCard } from "./PopularCard";
import { Repo } from "./types";

type Items = {
  items: Repo[];
};

export const Popular = ({ items }: Items) => {
  return (
    <div>
      <div className="mx-auto  px-10 py-8 flex justify-center items-center">
        <Languages></Languages>
      </div>
      <div className="mx-auto max-w-8xl px-10 py-8 grid xl:grid-cols-6 lg:grid-cols-4 sm:grid-cols-3 grid-cols-1 gap-6">
        {items.map((item, index) => (
          <PopularCard
            key={item.id}
            item={item}
            index={index}
          ></PopularCard>
        ))}
      </div>
    </div>
  );
};
