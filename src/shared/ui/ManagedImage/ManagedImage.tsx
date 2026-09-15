"use client";

import Image from "next/image";
import { useManagedImageUrl } from "@/shared/lib";
import type { T_ManagedImageProps } from "./types";

const imageLoader = ({ src }: { src: string }) => src;

export const ManagedImage = ({ src, alt, ...props }: T_ManagedImageProps) => {
  const resolvedSource = useManagedImageUrl(src);

  if (!resolvedSource) return null;

  return (
    <Image
      {...props}
      loader={imageLoader}
      unoptimized
      src={resolvedSource}
      alt={alt}
    />
  );
};
