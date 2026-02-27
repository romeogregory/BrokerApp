import { describe, it, expect } from "vitest";
import { formatBytes } from "@/lib/format-bytes";

describe("formatBytes", () => {
  it("returns '0 B' for 0 bytes", () => {
    expect(formatBytes(0)).toBe("0 B");
  });

  it("returns '1 KB' for 1024 bytes", () => {
    expect(formatBytes(1024)).toBe("1 KB");
  });

  it("returns '1.18 MB' for 1234567 bytes", () => {
    expect(formatBytes(1234567)).toBe("1.18 MB");
  });

  it("returns '0 B' for negative input", () => {
    expect(formatBytes(-1)).toBe("0 B");
  });

  it("handles bytes below 1024", () => {
    expect(formatBytes(500)).toBe("500 B");
  });

  it("handles GB values", () => {
    expect(formatBytes(1073741824)).toBe("1 GB");
  });

  it("handles TB values", () => {
    expect(formatBytes(1099511627776)).toBe("1 TB");
  });

  describe("decimal precision parameter", () => {
    it("uses 2 decimal places by default", () => {
      expect(formatBytes(1234567)).toBe("1.18 MB");
    });

    it("supports 0 decimal places", () => {
      expect(formatBytes(1234567, 0)).toBe("1 MB");
    });

    it("supports 1 decimal place", () => {
      expect(formatBytes(1234567, 1)).toBe("1.2 MB");
    });

    it("supports 3 decimal places", () => {
      expect(formatBytes(1234567, 3)).toBe("1.177 MB");
    });
  });
});
