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

  it("returns '500 B' for sub-KB value", () => {
    expect(formatBytes(500)).toBe("500 B");
  });

  it("returns '1 GB' for exact GB boundary", () => {
    expect(formatBytes(1073741824)).toBe("1 GB");
  });

  it("respects custom decimal precision", () => {
    expect(formatBytes(1234567, 0)).toBe("1 MB");
  });
});
