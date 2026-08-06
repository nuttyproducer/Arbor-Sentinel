/** Resolve the accent colour for a given evidence category. */
export function categoryAccent(category: string): "clay" | "blue" | "amber" {
  if (category === "court record" || category === "human-rights report") return "clay";
  if (category === "official UN document" || category === "parliamentary document") return "blue";
  return "amber";
}
