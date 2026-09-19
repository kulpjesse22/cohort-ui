import { AGENTS, type AgentId } from "./agents";

/**
 * Agent customization — the part of an agent's identity a human can change.
 *
 * The split matters. Identity (name, mark, colour, voice, working style) is
 * customizable. Scope and boundaries are NOT: they come from `Agents/*.md` and
 * are structural. You can make Athena warmer; you cannot make her write product
 * code. Keeping that line is what stops this becoming decorative.
 */

export const MARK_OPTIONS = [
  "claudia",
  "augustus",
  "julius",
  "athena",
  "hephaestus",
] as const;
export type MarkId = (typeof MARK_OPTIONS)[number];

export const COLOR_OPTIONS = ["slate", "teal", "sand", "clay", "rust"] as const;
export type ColorId = (typeof COLOR_OPTIONS)[number];

/**
 * Colours saved before the palette change. The ids were named for the hues
 * they were (violet, sky, amber, rose); the new set is named for the hues it
 * is. A stored id that no longer exists would resolve to no `.agent-*` class
 * at all, leaving `--hue` unset, so it is translated on read rather than left
 * to fail quietly. `teal` kept its name and needs no entry.
 */
const LEGACY_COLORS: Record<string, ColorId> = {
  violet: "slate",
  sky: "sand",
  amber: "clay",
  rose: "rust",
};

export function normalizeColor(value: unknown): ColorId | undefined {
  if (typeof value !== "string") return undefined;
  if ((COLOR_OPTIONS as readonly string[]).includes(value)) return value as ColorId;
  return LEGACY_COLORS[value];
}

export interface Voice {
  id: string;
  name: string;
  accent: string;
  descriptive: string;
}

// Premade ElevenLabs voices only. Library voices return HTTP 402 on the free
// tier even once added to My Voices, so they are deliberately excluded.
export const VOICES: Voice[] = [
  { id: "pFZP5JQG7iQjIQuC4Bku", name: "Lily", accent: "British", descriptive: "velvety" },
  { id: "Xb7hH8MSUJpSbSDYk0k2", name: "Alice", accent: "British", descriptive: "clear" },
  { id: "onwK4e9ZLuTAKqWW03F9", name: "Daniel", accent: "British", descriptive: "formal" },
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "George", accent: "British", descriptive: "mature" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah", accent: "American", descriptive: "reassuring" },
  { id: "XrExE9yKIg1WjnnlVkGX", name: "Matilda", accent: "American", descriptive: "upbeat" },
  { id: "bIHbv24MWmeRgasZH58o", name: "Will", accent: "American", descriptive: "chill" },
  { id: "nPczCjzI2devNBz1zQrb", name: "Brian", accent: "American", descriptive: "classy" },
  { id: "SAz9YHcvj6GT2YYXdXww", name: "River", accent: "American", descriptive: "calm" },
];

export interface AgentCustomization {
  displayName: string;
  title: string;
  mark: MarkId;
  color: ColorId;
  voiceId: string;
  /** One line on how this agent works. Flavour that informs behaviour. */
  workingStyle: string;
}

const DEFAULT_VOICE: Record<AgentId, string> = {
  claudia: "Xb7hH8MSUJpSbSDYk0k2",
  augustus: "bIHbv24MWmeRgasZH58o",
  julius: "nPczCjzI2devNBz1zQrb",
  athena: "pFZP5JQG7iQjIQuC4Bku",
  hephaestus: "onwK4e9ZLuTAKqWW03F9",
};

const DEFAULT_STYLE: Record<AgentId, string> = {
  claudia: "Refuses to assign ambiguous work. Asks the blocking question first.",
  augustus: "Designs for the failure path before the happy path.",
  julius: "Reads the state model before building, not after review.",
  athena: "Systematic clarity over decorative simplicity. Specific fixes, never vague notes.",
  hephaestus: "Presents a designed direction, not a questionnaire.",
};

export function defaultCustomization(id: AgentId): AgentCustomization {
  const agent = AGENTS[id];
  return {
    displayName: agent.name,
    title: agent.title,
    mark: id,
    color: agent.color as ColorId,
    voiceId: DEFAULT_VOICE[id],
    workingStyle: DEFAULT_STYLE[id],
  };
}
