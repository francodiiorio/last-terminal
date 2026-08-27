/**
 * Structured crew manifest, source of truth for the /crew/*.personnel files generated in
 * content/files/tree.ts. Kept in sync with docs/lore/CHARACTERS.md -- that document is the
 * authoritative prose version; update both together.
 */
export interface CrewMember {
  id: string;
  name: string;
  role: string;
  status: "player-character" | "confirmed-deceased" | "unresolved";
  /** short personnel-file body, in the station's clipped administrative register */
  note: string[];
}

export const CREW: CrewMember[] = [
  {
    id: "reyes",
    name: "Reyes",
    role: "Systems & Logistics Officer",
    status: "player-character",
    note: ["See /crew/reyes-personal.log for personal records."],
  },
  {
    id: "anand-kel",
    name: "Dr. Priya Anand-Kel",
    role: "Lead Signal Analyst",
    status: "unresolved",
    note: [
      "Senior signal analysis lead. Highest clearance among science staff.",
      "Deep-watch status: UNCONFIRMED at time of last system update.",
    ],
  },
  {
    id: "bakke",
    name: "Dr. Soren Bakke",
    role: "Astrophysicist",
    status: "confirmed-deceased",
    note: [
      "Structural and orbital survey lead, Tantalus.",
      "Deep-watch status: STASIS FAILURE, MD 214 0500. Deceased.",
      "See /system/deepwatch-status.log.",
    ],
  },
  {
    id: "lindqvist",
    name: "Petra Lindqvist",
    role: "Chief Engineer",
    status: "unresolved",
    note: [
      "Power systems and hull integrity.",
      "Deep-watch status: UNCONFIRMED at time of last system update.",
    ],
  },
  {
    id: "faraday",
    name: "Cole Faraday",
    role: "Communications Technician",
    status: "unresolved",
    note: [
      "Outbound traffic and Concord correspondence.",
      "Deep-watch status: UNCONFIRMED at time of last system update.",
    ],
  },
  {
    id: "idris",
    name: "Dr. Yusuf Idris",
    role: "Medical Officer",
    status: "unresolved",
    note: [
      "Station physician.",
      "Deep-watch status: UNCONFIRMED at time of last system update.",
    ],
  },
];
