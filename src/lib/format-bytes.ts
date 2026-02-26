const units = ["B", "KB", "MB", "GB", "TB"];

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes <= 0) return "0 B";

  const k = 1024;
  const dm = Math.max(0, decimals);
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(k)),
    units.length - 1
  );

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${units[i]}`;
}
