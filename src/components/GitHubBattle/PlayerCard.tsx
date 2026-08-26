import { Avatar } from "@/shared/ui/Avatar";
import type { T_PlayerCardProps } from "./types";

export const PlayerCard = ({
  name,
  img,
  children,
  label,
}: T_PlayerCardProps) => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-between">
      <label className="my-5 flex h-5 justify-center text-sm font-medium text-muted">
        {label}
      </label>
      <Avatar src={img} alt={`${name} avatar`} size="mid" />
      <div className="flex h-20 w-full items-center justify-center">
        <h2 className="mt-2 break-all text-center text-2xl font-semibold text-foreground">
          {name}
        </h2>
      </div>

      <div className="flex w-full flex-col items-center justify-start">
        {children}
      </div>
    </div>
  );
};
