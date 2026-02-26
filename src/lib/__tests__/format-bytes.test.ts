import { formatBytes } from "@/lib/format-bytes";

describe("formatBytes", () => {
  it("returns '0 B' for zero bytes", () => {
    expect(formatBytes(0)).toBe("0 B");
  });

  it("returns bytes below 1 KB", () => {
    expect(formatBytes(500)).toBe("500 B");
  });

  it("returns '1 KB' at exact KB boundary", () => {
    expect(formatBytes(1024)).toBe("1 KB");
  });

  it("returns fractional MB", () => {
    expect(formatBytes(1234567)).toBe("1.18 MB");
  });

  it("returns '1 GB' at exact GB boundary", () => {
    expect(formatBytes(1073741824)).toBe("1 GB");
  });

  it("returns '1 TB' at TB range", () => {
    expect(formatBytes(1099511627776)).toBe("1 TB");
  });

  it("returns '0 B' for negative input", () => {
    expect(formatBytes(-1)).toBe("0 B");
  });

  it("respects custom decimals parameter", () => {
    expect(formatBytes(1234567, 1)).toBe("1.2 MB");
  });

  it("respects zero decimals", () => {
    expect(formatBytes(1234567, 0)).toBe("1 MB");
  });
});
