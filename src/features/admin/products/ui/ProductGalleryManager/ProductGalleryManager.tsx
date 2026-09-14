"use client";

import { useState } from "react";
import Image from "next/image";
import type { T_ProductImage } from "@/entities/product/model/types";
import { useI18n } from "@/shared/i18n";
import { Button } from "@/shared/ui";
import type { T_ProductGalleryManagerProps } from "./types";

const createImageId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}`;
};

const fileToDataUrl = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
};

export const ProductGalleryManager = ({
  images = [],
  thumbnail = "",
}: T_ProductGalleryManagerProps) => {
  const { t } = useI18n();

  const [galleryImages, setGalleryImages] = useState<T_ProductImage[]>(
    images.map((image, index) => ({
      ...image,
      isMain: image.isMain ?? (image.url === thumbnail || index === 0),
      sortOrder: image.sortOrder ?? index,
    })),
  );

  const mainImage = galleryImages.find((image) => image.isMain);

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) {
      return;
    }

    const uploadedImages = await Promise.all(
      Array.from(files).map(async (file, index) => ({
        id: createImageId(),
        url: await fileToDataUrl(file),
        alt: file.name,
        isMain: galleryImages.length === 0 && index === 0,
        sortOrder: galleryImages.length + index,
      })),
    );

    setGalleryImages((currentImages) => [...currentImages, ...uploadedImages]);
  };

  const handleRemove = (imageId: string) => {
    setGalleryImages((currentImages) => {
      const nextImages = currentImages.filter((image) => image.id !== imageId);

      if (nextImages.some((image) => image.isMain)) {
        return nextImages.map((image, index) => ({
          ...image,
          sortOrder: index,
        }));
      }

      return nextImages.map((image, index) => ({
        ...image,
        isMain: index === 0,
        sortOrder: index,
      }));
    });
  };

  const handleSetMain = (imageId: string) => {
    setGalleryImages((currentImages) =>
      currentImages.map((image) => ({
        ...image,
        isMain: image.id === imageId,
      })),
    );
  };

  const handleAltChange = (imageId: string, alt: string) => {
    setGalleryImages((currentImages) =>
      currentImages.map((image) =>
        image.id === imageId ? { ...image, alt } : image,
      ),
    );
  };

  return (
    <div className="grid gap-4">
      <input
        type="hidden"
        name="thumbnail"
        value={mainImage?.url ?? thumbnail}
      />

      <input
        type="hidden"
        name="images"
        value={JSON.stringify(galleryImages)}
      />

      <label className="flex min-h-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border bg-background px-4 py-3 text-center transition hover:bg-surface-muted">
        <span className="text-sm font-medium text-foreground">
          {t("admin.product.form.galleryUploadLabel")}
        </span>

        <span className="text-xs text-muted">
          {t("admin.product.form.galleryUploadHint")}
        </span>

        <input
          className="sr-only"
          type="file"
          accept="image/*"
          multiple
          onChange={(event) => handleUpload(event.target.files)}
        />
      </label>

      {galleryImages.length > 0 && (
        <div className="grid max-h-[520px] grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
          {galleryImages.map((image) => (
            <div
              key={image.id}
              className="overflow-hidden rounded-md border border-border bg-background"
            >
              <div className="relative aspect-square bg-surface-muted">
                <Image
                  src={image.url}
                  alt={image.alt || t("admin.product.form.galleryImageAlt")}
                  fill
                  unoptimized
                  sizes="(max-width: 639px) 50vw, (max-width: 1279px) 25vw, 17vw"
                  className="object-cover"
                />
              </div>

              <div className="grid gap-2 p-2">
                <input
                  name={`galleryAlt-${image.id}`}
                  type="text"
                  value={image.alt ?? ""}
                  onChange={(event) =>
                    handleAltChange(image.id, event.target.value)
                  }
                  placeholder={t("admin.product.form.galleryAltLabel")}
                  className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none transition placeholder:text-muted focus:border-accent"
                />

                <div className="grid grid-cols-2 gap-1">
                  <Button
                    type="button"
                    variant={image.isMain ? "default" : "ghost"}
                    className="inline-flex h-8 items-center justify-center px-2 text-center text-xs leading-4"
                    onClick={() => handleSetMain(image.id)}
                  >
                    {image.isMain
                      ? t("admin.product.form.galleryMainShort")
                      : t("admin.product.form.gallerySetMainShort")}
                  </Button>

                  <Button
                    type="button"
                    variant="danger"
                    className="inline-flex h-8 items-center justify-center px-2 text-center text-xs leading-4"
                    onClick={() => handleRemove(image.id)}
                  >
                    {t("admin.product.form.galleryRemoveShort")}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
