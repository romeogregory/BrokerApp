"use client";

import { useState, useCallback, useRef } from "react";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageFile {
  id: string;
  file: File;
  previewUrl: string;
}

interface ImageGalleryProps {
  images: ImageFile[];
  onImagesChange: (images: ImageFile[]) => void;
}

export type { ImageFile };

export function ImageGallery({ images, onImagesChange }: ImageGalleryProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const imageFiles = fileArray.filter((f) =>
        f.type.startsWith("image/")
      );

      const newImages: ImageFile[] = imageFiles.map((file) => ({
        id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        file,
        previewUrl: URL.createObjectURL(file),
      }));

      onImagesChange([...images, ...newImages]);
    },
    [images, onImagesChange]
  );

  const removeImage = useCallback(
    (id: string) => {
      const image = images.find((img) => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.previewUrl);
      }
      onImagesChange(images.filter((img) => img.id !== id));
    },
    [images, onImagesChange]
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
      {/* Thumbnail grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-[var(--space-3)] sm:grid-cols-3">
          {images.map((image) => (
            <div
              key={image.id}
              className="group relative aspect-[4/3] overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- blob URLs from createObjectURL are not compatible with next/image */}
              <img
                src={image.previewUrl}
                alt={image.file.name}
                className="h-full w-full object-cover"
              />
              <Button
                variant="destructive"
                size="icon-xs"
                className="absolute top-[var(--space-1)] right-[var(--space-1)] opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                onClick={() => removeImage(image.id)}
                aria-label={`Verwijder ${image.file.name}`}
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
            JPG, PNG of WebP
          </p>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  );
}
