import type { ReactNode } from "react";
import TerminalApp from "@/os/terminal/TerminalApp";
import PowerApp from "@/os/apps/PowerApp";

export interface AppDef {
  id: string;
  title: string;
  icon: string;
  defaultPosition: { x: number; y: number };
  render: () => ReactNode;
}

export const APP_REGISTRY: Record<string, AppDef> = {
  terminal: {
    id: "terminal",
    title: "TERMINAL",
    icon: "[>_]",
    defaultPosition: { x: 72, y: 64 },
    render: () => <TerminalApp />,
  },
  power: {
    id: "power",
    title: "POWER GRID",
    icon: "[kW]",
    defaultPosition: { x: 660, y: 110 },
    render: () => <PowerApp />,
  },
};
