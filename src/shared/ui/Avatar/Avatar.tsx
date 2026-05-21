import { T_AvatarProps } from "./types";

const avatarSizeClasses = {
  small: {
    wrapper: "h-16 w-16",
    image: "h-14 w-14",
    text: "text-lg",
  },
  mid: {
    wrapper: "h-28 w-28",
    image: "h-24 w-24",
    text: "text-2xl",
  },
  big: {
    wrapper: "h-40 w-40",
    image: "h-36 w-36",
    text: "text-4xl",
  },
};

export const Avatar = ({ src, alt, size = "mid" }: T_AvatarProps) => {
  const classes = avatarSizeClasses[size];

  return (
    <div
      className={`flex items-center justify-center rounded-full border border-zinc-700 ${classes.wrapper}`}
    >
      <div
        className={`flex items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 font-semibold text-zinc-500 ${classes.image} ${classes.text}`}
      >
        {src ? (
          <img
            className="h-full w-full rounded-full object-cover"
            src={src}
            alt={alt}
          />
        ) : (
          <span>?</span>
        )}
      </div>
    </div>
  );
};
