import type { ImageProps } from "next/image";

export type T_ManagedImageProps = Omit<ImageProps, "src"> & {
  src: string;
};
