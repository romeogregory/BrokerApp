"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  uploadPropertyImage,
  deletePropertyImage,
  validateFile,
} from "@/lib/supabase/storage";

interface ImageFile {
  id: string;
  file?: File;
  previewUrl: string;
  storagePath?: string;
  isUploading?: boolean;
}

interface ImageGalleryProps {
  images: ImageFile[];
  onImagesChange: (images: ImageFile[]) => void;
  userId?: string;
  propertyId?: string;
}

export type { ImageFile };

export function ImageGallery({
  images,
  onImagesChange,
  userId,
  propertyId,
}: ImageGalleryProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef(images);
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  const dismissErrors = useCallback(() => setErrors([]), []);

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const validationErrors: string[] = [];
      const validFiles: File[] = [];

      for (const file of fileArray) {
        const error = validateFile(file);
        if (error) {
          validationErrors.push(`${file.name}: ${error}`);
        } else {
          validFiles.push(file);
        }
      }

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        setTimeout(() => setErrors([]), 5000);
      }

      if (validFiles.length === 0) return;

      const useStorage = userId && propertyId;

      const newImages: ImageFile[] = validFiles.map((file) => ({
        id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        isUploading: !!useStorage,
      }));

      const updatedImages = [...imagesRef.current, ...newImages];
      onImagesChange(updatedImages);

      if (!useStorage) return;

      for (const image of newImages) {
        uploadPropertyImage(userId, propertyId, image.file!)
          .then(({ url, path }) => {
            const current = imagesRef.current;
            const updated = current.map((img) => {
              if (img.id !== image.id) return img;
              // Revoke the blob URL to prevent memory leaks
              if (img.previewUrl.startsWith("blob:")) {
                URL.revokeObjectURL(img.previewUrl);
              }
              return {
                ...img,
                previewUrl: url,
                storagePath: path,
                isUploading: false,
                file: undefined,
              };
            });
            onImagesChange(updated);
          })
          .catch((err) => {
            const current = imagesRef.current;
            onImagesChange(current.filter((img) => img.id !== image.id));
            // Revoke the blob URL on failure too
            if (image.previewUrl.startsWith("blob:")) {
              URL.revokeObjectURL(image.previewUrl);
            }
            setErrors((prev) => [
              ...prev,
              `${image.file?.name ?? "Bestand"}: ${err instanceof Error ? err.message : "Uploaden mislukt"}`,
            ]);
            setTimeout(() => setErrors([]), 5000);
          });
      }
    },
    [userId, propertyId, onImagesChange]
  );

  const removeImage = useCallback(
    (id: string) => {
      const image = imagesRef.current.find((img) => img.id === id);
      if (image) {
        if (image.previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(image.previewUrl);
        }
        if (image.storagePath) {
          deletePropertyImage(image.storagePath).catch(() => {
            // Deletion from storage failed silently — image is already removed from UI
          });
        }
      }
      onImagesChange(imagesRef.current.filter((img) => img.id !== id));
    },
    [onImagesChange]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isDragOver) setIsDragOver(true);
    },
    [isDragOver]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        addFiles(e.target.files);
      }
      // Reset so the same file can be selected again
      e.target.value = "";
    },
    [addFiles]
  );

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      {/* Validation errors */}
      {errors.length > 0 && (
        <div
          className="flex flex-col gap-[var(--space-1)] rounded-[var(--radius-md)] bg-[var(--destructive-subtle)] px-[var(--space-4)] py-[var(--space-3)]"
          role="alert"
        >
          {errors.map((error, i) => (
            <p
              key={i}
              className="text-[13px] text-[var(--destructive)]"
            >
              {error}
            </p>
          ))}
          <button
            onClick={dismissErrors}
            className="mt-[var(--space-1)] self-start text-[12px] font-medium text-[var(--destructive)] underline"
          >
            Sluiten
          </button>
        </div>
      )}

      {/* Thumbnail grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-[var(--space-3)] sm:grid-cols-3">
          {images.map((image) => (
            <div
              key={image.id}
              className="group relative aspect-[4/3] overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- blob URLs and Supabase Storage URLs are not compatible with next/image */}
              <img
                src={image.previewUrl}
                alt={image.file?.name ?? "Afbeelding"}
                className="h-full w-full object-cover"
              />
              {/* Upload progress overlay */}
              {image.isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-[var(--surface-1)]/70">
                  <Loader2 className="size-6 animate-spin text-[var(--brand)]" />
                </div>
              )}
              <Button
                variant="destructive"
                size="icon-xs"
                className="absolute top-[var(--space-1)] right-[var(--space-1)] opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                onClick={() => removeImage(image.id)}
                disabled={image.isUploading}
                aria-label={`Verwijder ${image.file?.name ?? "afbeelding"}`}
              >
                <X className="size-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFilePicker}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openFilePicker();
          }
        }}
        className={`
          flex cursor-pointer flex-col items-center justify-center gap-[var(--space-3)]
          rounded-[var(--radius-md)] border-2 border-dashed
          px-[var(--space-6)] py-[var(--space-10)]
          transition-colors duration-150
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus-visible:ring-offset-2
          ${
            isDragOver
              ? "border-[var(--brand)] bg-[var(--brand-subtle)]"
              : "border-[var(--border-emphasis)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)]"
          }
        `}
      >
        <div
          className={`rounded-[var(--radius-full)] p-[var(--space-3)] ${
            isDragOver
              ? "bg-[var(--brand)] text-[var(--brand-foreground)]"
              : "bg-[var(--surface-3)] text-[var(--ink-tertiary)]"
          }`}
        >
          <ImagePlus className="size-6" />
        </div>
        <div className="text-center">
          <p className="text-[14px] font-medium text-[var(--ink-secondary)]">
            Sleep foto&apos;s hierheen of klik om te uploaden
          </p>
          <p className="mt-[var(--space-1)] text-[12px] text-[var(--ink-tertiary)]">
            JPG, PNG of WebP (max 10MB)
          </p>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  );
}
