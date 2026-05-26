export type T_AvatarSize = "small" | "mid" | "big";

export type T_AvatarProps = {
  src?: string | null;
  alt: string;
  size?: T_AvatarSize;
  form?: string
};