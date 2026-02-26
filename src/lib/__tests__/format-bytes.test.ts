import { describe, it, expect } from "vitest";
import { formatBytes } from "@/lib/format-bytes";

describe("formatBytes", () => {
  it("returns '0 B' for zero bytes", () => {
    expect(formatBytes(0)).toBe("0 B");
  });

  it("returns bytes for values under 1024", () => {
    expect(formatBytes(500)).toBe("500 B");
  });

  it("converts to KB at 1024 boundary", () => {
    expect(formatBytes(1024)).toBe("1 KB");
  });

  it("converts to MB with default 2 decimal places", () => {
    expect(formatBytes(1234567)).toBe("1.18 MB");
  });

  it("converts to GB", () => {
    expect(formatBytes(1073741824)).toBe("1 GB");
  });

  it("converts to TB", () => {
    expect(formatBytes(1099511627776)).toBe("1 TB");
  });

  it("returns '0 B' for negative input", () => {
    expect(formatBytes(-1)).toBe("0 B");
  });

  it("respects custom decimal precision of 1", () => {
    expect(formatBytes(1234567, 1)).toBe("1.2 MB");
  });

  it("respects custom decimal precision of 0", () => {
    expect(formatBytes(1234567, 0)).toBe("1 MB");
  });
});
