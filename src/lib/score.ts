export type ScoreTone = "green" | "blue" | "orange" | "red";

export function scoreTone(score: number): ScoreTone {
  if (score >= 85) return "green";
  if (score >= 70) return "blue";
  if (score >= 50) return "orange";
  return "red";
}
