export interface FilesystemState {
  cwd: string;
  unlockedIds: string[];
  readIds: string[];
}

export const INITIAL_FILESYSTEM_STATE: FilesystemState = {
  cwd: "/",
  unlockedIds: [],
  readIds: [],
};
