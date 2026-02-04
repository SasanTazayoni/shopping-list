export function formatDate(date: Date | null) {
  return date ? date.toLocaleString() : "—";
}
