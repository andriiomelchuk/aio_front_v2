"use client"

import { Input } from "@/shared/ui/Input/Input";

export const MoviesSearch = () => {
  const filteredOption = ["all", "movie", "series", "games", "episode"];

  return (
    <>
      <form action="submit" className="flex flex-row"
        onSubmit={() => {}}
        >
        <Input
          placeholder="Type your movie to search"
          className="flex h-full flex-col justify-between items-center"
        />
        <div className="flex flex-row">
        {filteredOption.map((item) => (
          <label key={item} className="flex items-center gap-2 ml-5">
            <input type="radio" name="type" value={item}/>
            <span>{item}</span>
          </label>
        ))}
        </div>
        <button type="submit" className="ml-15">Search</button>
      </form>
    </>
  );
};
