import { describe, it, expect, beforeEach, vi } from "vitest";
import { createMockSupabaseClient } from "@/test-utils";

// Mock the client module so storage functions use our mock
const mockSupabase = createMockSupabaseClient();
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => mockSupabase.client,
}));

// Import after mock is set up
import {
  validateFile,
  uploadPropertyImage,
  deletePropertyImage,
} from "@/lib/supabase/storage";

function createMockFile(
  size: number,
  type: string,
  name = "test.jpg"
): File {
  const buffer = new ArrayBuffer(size);
  return new File([buffer], name, { type });
}

describe("validateFile", () => {
  it("returns null for valid JPEG file under 10MB", () => {
    const file = createMockFile(5 * 1024 * 1024, "image/jpeg");
    expect(validateFile(file)).toBeNull();
  });

  it("returns null for valid PNG file under 10MB", () => {
    const file = createMockFile(1024, "image/png");
    expect(validateFile(file)).toBeNull();
  });

  it("returns null for valid WebP file under 10MB", () => {
    const file = createMockFile(2 * 1024 * 1024, "image/webp");
    expect(validateFile(file)).toBeNull();
  });

  it("returns Dutch error for file >10MB", () => {
    const file = createMockFile(11 * 1024 * 1024, "image/jpeg");
    expect(validateFile(file)).toBe("Bestand te groot (max 10MB)");
  });

  it("returns Dutch error for unsupported MIME type", () => {
    const file = createMockFile(1024, "image/gif");
    expect(validateFile(file)).toBe("Ongeldig bestandstype (alleen JPG, PNG of WebP)");
  });

  it("returns size error before type error when both are invalid", () => {
    const file = createMockFile(11 * 1024 * 1024, "image/gif");
    expect(validateFile(file)).toBe("Bestand te groot (max 10MB)");
  });
});

describe("uploadPropertyImage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.storageBucket.upload.mockResolvedValue({ data: { path: "test/path" }, error: null });
    mockSupabase.storageBucket.getPublicUrl.mockReturnValue({
      data: { publicUrl: "https://example.com/test-image.jpg" },
    });
  });

  it("throws on invalid file (validateFile rejects)", async () => {
    const largeFile = createMockFile(11 * 1024 * 1024, "image/jpeg");

    await expect(
      uploadPropertyImage("user-1", "prop-1", largeFile)
    ).rejects.toThrow("Bestand te groot (max 10MB)");
  });

  it("constructs correct storage path format", async () => {
    const file = createMockFile(1024, "image/jpeg", "photo.jpg");

    await uploadPropertyImage("user-1", "prop-1", file);

    const uploadCall = mockSupabase.storageBucket.upload.mock.calls[0];
    const path = uploadCall[0] as string;

    // Path should be: userId/propertyId/timestamp-uuid.ext
    expect(path).toMatch(/^user-1\/prop-1\/\d+-[a-f0-9]{8}\.jpg$/);
  });

  it("uses correct extension mapping for PNG", async () => {
    const file = createMockFile(1024, "image/png", "photo.png");

    await uploadPropertyImage("user-1", "prop-1", file);

    const uploadCall = mockSupabase.storageBucket.upload.mock.calls[0];
    const path = uploadCall[0] as string;

    expect(path).toMatch(/\.png$/);
  });

  it("uses correct extension mapping for WebP", async () => {
    const file = createMockFile(1024, "image/webp", "photo.webp");

    await uploadPropertyImage("user-1", "prop-1", file);

    const uploadCall = mockSupabase.storageBucket.upload.mock.calls[0];
    const path = uploadCall[0] as string;

    expect(path).toMatch(/\.webp$/);
  });

  it("calls upload with correct options", async () => {
    const file = createMockFile(1024, "image/jpeg", "photo.jpg");

    await uploadPropertyImage("user-1", "prop-1", file);

    expect(mockSupabase.storage.from).toHaveBeenCalledWith("property-images");
    expect(mockSupabase.storageBucket.upload).toHaveBeenCalledWith(
      expect.any(String),
      file,
      { cacheControl: "3600", upsert: false }
    );
  });

  it("returns { url, path } from getPublicUrl", async () => {
    const file = createMockFile(1024, "image/jpeg", "photo.jpg");

    const result = await uploadPropertyImage("user-1", "prop-1", file);

    expect(result.url).toBe("https://example.com/test-image.jpg");
    expect(result.path).toMatch(/^user-1\/prop-1\//);
  });

  it("throws Dutch error on upload error", async () => {
    mockSupabase.storageBucket.upload.mockResolvedValue({
      data: null,
      error: { message: "storage full" },
    });

    const file = createMockFile(1024, "image/jpeg", "photo.jpg");

    await expect(
      uploadPropertyImage("user-1", "prop-1", file)
    ).rejects.toThrow("Uploaden mislukt: storage full");
  });
});

describe("deletePropertyImage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.storageBucket.remove.mockResolvedValue({ data: [], error: null });
  });

  it("calls remove with the correct path", async () => {
    await deletePropertyImage("user-1/prop-1/image.jpg");

    expect(mockSupabase.storage.from).toHaveBeenCalledWith("property-images");
    expect(mockSupabase.storageBucket.remove).toHaveBeenCalledWith([
      "user-1/prop-1/image.jpg",
    ]);
  });

  it("returns void on success", async () => {
    const result = await deletePropertyImage("some/path.jpg");
    expect(result).toBeUndefined();
  });

  it("throws Dutch error on error", async () => {
    mockSupabase.storageBucket.remove.mockResolvedValue({
      data: null,
      error: { message: "not found" },
    });

    await expect(deletePropertyImage("bad/path.jpg")).rejects.toThrow(
      "Verwijderen mislukt: not found"
    );
  });
});
