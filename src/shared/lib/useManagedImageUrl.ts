"use client";

import { useEffect, useState } from "react";
import { isManagedImageReference, loadManagedImage } from "./managedImages";

export const useManagedImageUrl = (source?: string) => {
  const [managedImage, setManagedImage] = useState({ source: "", url: "" });

  useEffect(() => {
    if (!source || !isManagedImageReference(source)) return;

    let objectUrl = "";
    let isActive = true;

    void loadManagedImage(source).then((image) => {
      if (!image || !isActive) return;
      objectUrl = URL.createObjectURL(image);
      setManagedImage({ source, url: objectUrl });
    }).catch(() => {
      if (isActive) setManagedImage({ source, url: "" });
    });

    return () => {
      isActive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [source]);

  if (!source) return "";
  if (!isManagedImageReference(source)) return source;

  return managedImage.source === source ? managedImage.url : "";
};
