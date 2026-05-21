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
      <label className="my-5 flex h-5 justify-center text-sm font-medium text-muted">
        {label}
      </label>
      <Avatar src={img} alt={`${name} avatar`} size="mid" />
      <div className="h-20 flex items-center">
        <h2 className="mt-2 break-all text-2xl font-semibold text-foreground">
          {name}
        </h2>
      </div>

      <div className="flex w-full flex-col items-center justify-start">
        {children}
      </div>
    </div>
  );
};
