import { createClient } from "@/lib/supabase/client";

const BUCKET_NAME = "property-images";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function validateFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) {
    return "Bestand te groot (max 10MB)";
  }
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return "Ongeldig bestandstype (alleen JPG, PNG of WebP)";
  }
  return null;
}

export async function uploadPropertyImage(
  userId: string,
  propertyId: string,
  file: File
): Promise<{ url: string; path: string }> {
  const validationError = validateFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const ext = MIME_TO_EXT[file.type] ?? "jpg";
  const filename = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const storagePath = `${userId}/${propertyId}/${filename}`;

  const supabase = createClient();
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Uploaden mislukt: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath);

  return { url: publicUrl, path: storagePath };
}

export async function deletePropertyImage(path: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);

  if (error) {
    throw new Error(`Verwijderen mislukt: ${error.message}`);
  }
}

export function getPropertyImageUrl(
  path: string,
  options?: { width?: number; height?: number }
): string {
  const supabase = createClient();

  if (options?.width || options?.height) {
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path, {
      transform: {
        width: options.width ?? 0,
        height: options.height ?? 0,
      },
    });
    return data.publicUrl;
  }

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
  return data.publicUrl;
}
