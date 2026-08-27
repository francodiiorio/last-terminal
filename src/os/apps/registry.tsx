import type { ReactNode } from "react";
import TerminalApp from "@/os/terminal/TerminalApp";
import PowerApp from "@/os/apps/PowerApp";
import CameraApp from "@/os/apps/CameraApp";
import CommsApp from "@/os/apps/CommsApp";
import SettingsApp from "@/os/apps/SettingsApp";
import type { Strings } from "@/i18n";

export interface AppDef {
  id: string;
  icon: string;
  defaultPosition: { x: number; y: number };
  render: () => ReactNode;
}

export const APP_REGISTRY: Record<string, AppDef> = {
  terminal: {
    id: "terminal",
    icon: "[>_]",
    defaultPosition: { x: 72, y: 64 },
    render: () => <TerminalApp />,
  },
  power: {
    id: "power",
    icon: "[kW]",
    defaultPosition: { x: 660, y: 110 },
    render: () => <PowerApp />,
  },
  cameras: {
    id: "cameras",
    icon: "[CAM]",
    defaultPosition: { x: 660, y: 420 },
    render: () => <CameraApp />,
  },
  comms: {
    id: "comms",
    icon: "[@]",
    defaultPosition: { x: 72, y: 460 },
    render: () => <CommsApp />,
  },
  settings: {
    id: "settings",
    icon: "[::]",
    defaultPosition: { x: 900, y: 460 },
    render: () => <SettingsApp />,
  },
};

/** App titles are localized UI chrome (see src/i18n) -- looked up by app id, not stored on AppDef. */
export function getAppTitle(t: Strings, id: string): string {
  return (t.appTitles as Record<string, string>)[id] ?? id;
}
