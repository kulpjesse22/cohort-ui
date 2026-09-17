import snapshot from "@/data/contributions.json";

export type ContributorId = "human" | "claude" | "codex";
export type ContributorKind = "human" | "agent";

export interface ContributionIdentity {
  id: ContributorId;
  name: string;
  kind: ContributorKind;
}

export interface ContributionSummary {
  id: ContributorId;
  commits: number;
  shared: number;
  added: number;
  removed: number;
  files: number;
  first: string;
  last: string;
}

export interface ContributionCommit {
  sha: string;
  author: string;
  date: string;
  subject: string;
  contributors: ContributorId[];
  shared: boolean;
  added: number;
  removed: number;
  files: string[];
}

export interface ContributionSnapshot {
  generatedAt: string;
  head: string;
  identities: ContributionIdentity[];
  contributors: ContributionSummary[];
  commits: ContributionCommit[];
}

export function getContributionSnapshot(): ContributionSnapshot {
  return snapshot as ContributionSnapshot;
}

export function getContributorIdentity(id: ContributorId): ContributionIdentity {
  const found = getContributionSnapshot().identities.find((identity) => identity.id === id);
  return found ?? { id, name: id, kind: id === "human" ? "human" : "agent" };
}
