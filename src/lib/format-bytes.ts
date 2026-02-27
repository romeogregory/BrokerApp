const UNITS = ["B", "KB", "MB", "GB", "TB"] as const;

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes <= 0) return "0 B";

  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const unit = UNITS[Math.min(i, UNITS.length - 1)];
  const value = bytes / Math.pow(k, Math.min(i, UNITS.length - 1));

  return `${parseFloat(value.toFixed(decimals))} ${unit}`;
}
