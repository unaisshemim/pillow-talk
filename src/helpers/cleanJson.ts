export function cleanJsonResponse(raw: string): string {
  return raw
    .replace(/^```json/, "")
    .replace(/^```/, "")
    .replace(/```$/, "")
    .trim();
}