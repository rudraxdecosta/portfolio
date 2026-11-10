export type SceneId = "orbit" | "city" | "storm" | "planet";

export type ChapterId = "home" | "signal" | "work" | "about" | "vision" | "contact";

export interface NavItem {
  id: ChapterId;
  label: string;
}

export interface Mission {
  number: string;
  title: string;
  planet: "gas" | "void" | "ice";
  category: string;
  description: string;
  tags: string[];
}

export interface MetricItem {
  value: number;
  label: string;
  detail: string;
  tone: "yellow" | "violet" | "light";
}

export type MilestoneItem = [string, string, string];

export interface DiveState {
  /** 0 -> 1 across the long approach from deep space */
  approach: number;
  /** 0 -> 1 across the final plunge through the event horizon */
  plunge: number;
}
