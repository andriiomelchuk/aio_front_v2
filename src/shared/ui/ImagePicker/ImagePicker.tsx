"use client";

import { useRef, useState, type DragEvent } from "react";
import Image from "next/image";
import { ImageUp, Trash2 } from "lucide-react";
import { deleteManagedImage, isManagedImageReference, saveManagedImage, useManagedImageUrl } from "@/shared/lib";
import { useI18n } from "@/shared/i18n";
import { Button } from "../Button";
import { Input } from "../Input";
import type { T_ImagePickerProps } from "./types";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const imageLoader = ({ src }: { src: string }) => src;

export const ImagePicker = ({ label, value = "", alt = "", required, onChange }: T_ImagePickerProps) => {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrl = useManagedImageUrl(value);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");

  const selectFile = async (file?: File) => {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError(t("imagePicker.invalidType"));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(t("imagePicker.fileTooLarge"));
      return;
    }

    try {
      const reference = await saveManagedImage(file);
      if (isManagedImageReference(value)) void deleteManagedImage(value);
      onChange(reference);
      setError("");
    } catch {
      setError(t("imagePicker.saveFailed"));
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    void selectFile(event.dataTransfer.files[0]);
  };

  const clearImage = () => {
    if (isManagedImageReference(value)) void deleteManagedImage(value);
    onChange("");
    setError("");
  };

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div
        className={`grid gap-3 rounded-md border border-dashed p-3 transition sm:grid-cols-[120px_1fr] ${isDragging ? "border-accent bg-accent-soft" : "border-border bg-background"}`}
        onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="relative aspect-square overflow-hidden rounded-md border border-border bg-surface-muted">
          {previewUrl ? (
            <Image loader={imageLoader} unoptimized fill src={previewUrl} alt={alt} sizes="120px" className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted"><ImageUp aria-hidden="true" className="h-8 w-8" /></div>
          )}
        </div>
        <div className="min-w-0 space-y-3">
          <Input required={required && !value} type="url" value={isManagedImageReference(value) ? "" : value} placeholder={t("imagePicker.urlPlaceholder")} onChange={(event) => onChange(event.target.value)} />
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" className="h-9" onClick={() => inputRef.current?.click()}>{t("imagePicker.chooseFile")}</Button>
            {value && <Button type="button" variant="danger" className="flex h-9 w-9 items-center justify-center p-0" onClick={clearImage} aria-label={t("imagePicker.remove")} title={t("imagePicker.remove")}><Trash2 aria-hidden="true" className="h-5 w-5" /></Button>}
          </div>
          <p className="text-xs text-muted">{t("imagePicker.dropHint")}</p>
          <input ref={inputRef} className="sr-only" type="file" accept={ACCEPTED_TYPES.join(",")} onChange={(event) => { void selectFile(event.target.files?.[0]); event.target.value = ""; }} />
        </div>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
};
