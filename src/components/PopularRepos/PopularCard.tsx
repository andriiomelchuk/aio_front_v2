import { Repo } from "./types";

export type Item = {
  item: Repo;
  index: number;
};

export const PopularCard = ({ item, index }: Item) => {

  return (
    <div className="max-w-[720px] mx-auto pb-5">
      <div className="relative flex flex-col text-gray-700 bg-white shadow-md bg-clip-border rounded-xl w-full">
        <div className="align-middle text-center pt-2 flex items-center justify-between mb-2 px-4">
          <p># {index + 1}</p>
          <p>{item.language}</p>
        </div>
        <div className="relative mx-3 mt-3 overflow-hidden text-gray-700 bg-white bg-clip-border rounded-xl h-48 sm:h-56">
          <img
            src={item.owner.avatar_url}
            alt="card-image"
            className="object-cover w-full h-full"
          />
        </div>
        <div className="p-6 pb-8 h-38">
          <div className="flex items-center justify-between mb-2">
            <p className="block font-sans text-base antialiased font-medium leading-relaxed text-blue-gray-900 ">
              Stars: {item.stargazers_count}
            </p>
          </div>
          <div className="flex items-center justify-between mb-2">
            <p className="block font-sans text-base antialiased font-medium leading-relaxed text-blue-gray-900 text-sm">
              User: {item.owner.login}
            </p>
          </div>
          <div className="flex items-center justify-between mb-2">
            <p className="block font-sans text-base antialiased font-medium leading-relaxed text-blue-gray-900 text-sm">
              Repo: {item.name}
            </p>
          </div>
          <p className="block font-sans text-sm antialiased font-normal leading-normal text-gray-700 opacity-75"></p>
        </div>
      </div>
    </div>
  );
};
