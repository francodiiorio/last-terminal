/**
 * Structured crew manifest for narrative-designer reference and future personnel-file content
 * (Milestone 1). Kept in sync with docs/lore/CHARACTERS.md -- that document is the authoritative
 * prose version; update both together.
 */
export interface CrewMember {
  id: string;
  name: string;
  role: string;
  status: "player-character" | "confirmed-deceased" | "unresolved";
}

export const CREW: CrewMember[] = [
  { id: "reyes", name: "Reyes", role: "Systems & Logistics Officer", status: "player-character" },
  { id: "anand-kel", name: "Dr. Priya Anand-Kel", role: "Lead Signal Analyst", status: "unresolved" },
  { id: "bakke", name: "Dr. Soren Bakke", role: "Astrophysicist", status: "confirmed-deceased" },
  { id: "lindqvist", name: "Petra Lindqvist", role: "Chief Engineer", status: "unresolved" },
  { id: "faraday", name: "Cole Faraday", role: "Communications Technician", status: "unresolved" },
  { id: "idris", name: "Dr. Yusuf Idris", role: "Medical Officer", status: "unresolved" },
];
