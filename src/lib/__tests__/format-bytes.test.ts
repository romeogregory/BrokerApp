import { describe, expect, it } from "vitest";
import { formatBytes } from "@/lib/format-bytes";

describe("formatBytes", () => {
  it("returns '0 B' for zero bytes", () => {
    expect(formatBytes(0)).toBe("0 B");
  });

  it("returns bytes for sub-KB values", () => {
    expect(formatBytes(500)).toBe("500 B");
  });

  it("returns '1 KB' at the 1024 boundary", () => {
    expect(formatBytes(1024)).toBe("1 KB");
  });

  it("returns MB with decimal precision", () => {
    expect(formatBytes(1234567)).toBe("1.18 MB");
  });

  it("returns '1 GB' at the GB boundary", () => {
    expect(formatBytes(1073741824)).toBe("1 GB");
  });

  it("returns '1 TB' at the TB boundary", () => {
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
