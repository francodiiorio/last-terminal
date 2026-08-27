import type { NotificationLevel } from "@/core/events/types";

export type StationScene = "boot" | "desktop";

export interface NotificationItem {
  id: string;
  message: string;
  level: NotificationLevel;
  createdAtMinutes: number;
}

export interface StationState {
  scene: StationScene;
  notifications: NotificationItem[];
}

export const INITIAL_STATION_STATE: StationState = {
  scene: "boot",
  notifications: [],
};
