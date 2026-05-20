import { PlayerCardProps } from "./types";


export const PlayerCard = ({ name, img, onDelete, playerId }: PlayerCardProps) => {
  return (
    <>
       <div className="flex flex-col items-center justify-center">
        <div className="relative mb-5 h-24 w-24 overflow-hidden rounded-full border-2 border-green-500 bg-zinc-900 flex justify-center items-center">
          <img
            className="h-full w-full object-cover"
            src={img}
            alt={`${name} avatar`}
          />
        </div>

        <div className="text-xs font-semibold uppercase tracking-normal text-green-400">
          Ready
        </div>

        <h2 className="mt-2 break-all text-2xl font-semibold text-white">
          {name}
        </h2>
      </div>

      <button
        className="mt-6 rounded-md border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-red-500 hover:bg-red-500/10 hover:text-red-300"
        onClick={() => onDelete(playerId)}
      >
        Change player
      </button>
    </>
  );
};
