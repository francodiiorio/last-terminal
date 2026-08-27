export type FlagValue = boolean | number | string;
export type StoryFlags = Record<string, FlagValue>;

export function getFlag(flags: StoryFlags, id: string): FlagValue | undefined {
  return flags[id];
}

export function setFlag(flags: StoryFlags, id: string, value: FlagValue): StoryFlags {
  return { ...flags, [id]: value };
}

export function flagEquals(flags: StoryFlags, id: string, expected: FlagValue): boolean {
  return flags[id] === expected;
}
