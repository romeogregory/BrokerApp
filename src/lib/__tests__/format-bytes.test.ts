import { describe, expect, it } from "vitest";
import { formatBytes } from "../format-bytes";

describe("formatBytes", () => {
  it("returns '0 B' for 0 bytes", () => {
    expect(formatBytes(0)).toBe("0 B");
  });

  it("returns '0 B' for negative input", () => {
    expect(formatBytes(-1)).toBe("0 B");
  });

  it("formats bytes below 1 KB", () => {
    expect(formatBytes(500)).toBe("500 B");
  });

  it("returns '1 KB' at the 1024 boundary", () => {
    expect(formatBytes(1024)).toBe("1 KB");
  });

  it("formats megabytes with decimal precision", () => {
    expect(formatBytes(1234567)).toBe("1.18 MB");
  });

  it("formats gigabytes", () => {
    expect(formatBytes(1073741824)).toBe("1 GB");
  });

  it("formats terabytes", () => {
    expect(formatBytes(1099511627776)).toBe("1 TB");
  });

  it("respects custom decimal precision", () => {
    expect(formatBytes(1234567, 0)).toBe("1 MB");
    expect(formatBytes(1234567, 3)).toBe("1.177 MB");
  });

  it("handles 1 byte", () => {
    expect(formatBytes(1)).toBe("1 B");
  });
});
