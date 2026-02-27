const UNITS = ["B", "KB", "MB", "GB", "TB"];

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes <= 0) return "0 B";

  const k = 1024;
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(k)),
    UNITS.length - 1,
  );

  const value = bytes / Math.pow(k, i);
  return `${parseFloat(value.toFixed(decimals))} ${UNITS[i]}`;
}
