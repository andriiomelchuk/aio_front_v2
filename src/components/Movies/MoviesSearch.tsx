"use client";

import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input/Input";
import Loader from "@/shared/ui/Loader/Loader";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { T_MovieSearchType } from "./types";

export const MoviesSearch = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathName = usePathname();
  const [isPending, startTransition] = useTransition();

  const movieTypes = [
    { label: "all", value: "multi" },
    { label: "movie", value: "movie" },
    { label: "series", value: "tv" },
    { label: "person", value: "person" },
  ];

  const [movie, setMovie] = useState(searchParams.get("query") ?? "");
  const [movieType, setMovieType] = useState(searchParams.get("type") ?? "multi");

  const movieSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    const trimmedMovie = movie.trim();
    if (!trimmedMovie) return;
    params.set("query", trimmedMovie);
    params.set("type", movieType);
    startTransition(() => {
      router.push(`${pathName}?${params.toString()}`);
    });
  };

  const changeMovieType = (newType: T_MovieSearchType) => {
    setMovieType(newType);
    const params = new URLSearchParams(searchParams.toString());

    if (!params.get("query")) return;

    params.set("type", newType);
    startTransition(() => {
      router.push(`${pathName}?${params.toString()}`);
    });
  };

  return (
    <>
      <form
        className="flex flex-col items-center"
        onSubmit={(event) => {
          event.preventDefault();
          movieSearch();
        }}
      >
        <div className="flex flex-row">
          <Input
            placeholder="Type your movie to search"
            className="flex h-full flex-col justify-between items-center"
            onChange={(e) => setMovie(e.target.value)}
            value={movie}
          />
          <Button className="ml-3">Search</Button>
        </div>
        <div className="flex flex-row mt-5">
          {movieTypes.map((item) => (
            <label key={item.label} className="flex items-center gap-2 ml-5">
              <input
                type="radio"
                name="type"
                value={item.value}
                checked={movieType === item.value}
                onChange={(e) => {
                  changeMovieType(e.target.value as T_MovieSearchType);
                }}
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </form>
      {isPending && <Loader />}
    </>
  );
};
