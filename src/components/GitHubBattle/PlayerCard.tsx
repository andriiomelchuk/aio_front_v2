import { Avatar } from "@/shared/ui/Avatar";
import { T_PlayerCardProps } from "./types";

export const PlayerCard = ({
  name,
  img,
  children,
  label,
}: T_PlayerCardProps) => {
  return (
    <div className="flex h-full flex-col justify-between items-center">
      <label className="text-sm font-medium text-zinc-300 flex justify-center h-5 my-5">
        {label}
      </label>
      <Avatar src={img} alt={`${name} avatar`} size="mid"/>
      <div className="h-20 flex items-center">
        <h2 className="mt-2 break-all text-2xl font-semibold text-white">
          {name}
        </h2>
      </div>

        <div className="w-full flex justify-start items-center flex-col">
          {children}
        </div>

    </div>
  );
};
