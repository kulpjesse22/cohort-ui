#!/usr/bin/env node
/**
 * Reads the real commit history into data/contributions.json.
 *
 * This runs at build time, not at request time: Vercel does not ship .git, so
 * anything derived from history has to be captured while the repository is
 * still present. The snapshot is committed, which also means the record the UI
 * shows can be diffed and disputed rather than generated invisibly.
 *
 * Contributors come from Co-Authored-By trailers. A commit carrying two
 * trailers is credited to both — that is not a rounding error, it is what
 * actually happens when two agents work the same file.
 */
import { execFileSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const SEP = "\x1e";
const FIELD = "\x1f";

const IDENTITIES = [
  { id: "claude", match: /claude/i, name: "Claude", kind: "agent" },
  { id: "codex", match: /codex/i, name: "Codex", kind: "agent" },
];

function git(args) {
  return execFileSync("git", args, { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
}

const raw = git([
  "log",
  "--pretty=format:%x1e%H%x1f%an%x1f%aI%x1f%s%x1f%(trailers:key=Co-Authored-By,valueonly,separator=%x2c)",
  "--numstat",
]);

const commits = raw
  .split(SEP)
  .filter((chunk) => chunk.trim())
  .map((chunk) => {
    const [header, ...statLines] = chunk.split("\n");
    const [sha, author, date, subject, trailers] = header.split(FIELD);

    // Files touched, and how much — the only honest measure of size we have.
    let added = 0;
    let removed = 0;
    const files = [];
    for (const line of statLines) {
      const m = line.match(/^(\d+|-)\t(\d+|-)\t(.+)$/);
      if (!m) continue;
      if (m[1] !== "-") added += Number(m[1]);
      if (m[2] !== "-") removed += Number(m[2]);
      files.push(m[3]);
    }

    const credited = IDENTITIES.filter((i) => i.match.test(trailers ?? "")).map((i) => i.id);

    return {
      sha: sha.slice(0, 7),
      author,
      date,
      subject,
      // Un-credited commits are the human's alone, which is worth showing too.
      contributors: credited.length ? credited : ["human"],
      shared: credited.length > 1,
      added,
      removed,
      files,
    };
  });

const byContributor = {};
for (const c of commits) {
  for (const id of c.contributors) {
    const b = (byContributor[id] ??= {
      id, commits: 0, shared: 0, added: 0, removed: 0,
      files: new Set(), first: c.date, last: c.date,
    });
    b.commits += 1;
    if (c.shared) b.shared += 1;
    b.added += c.added;
    b.removed += c.removed;
    c.files.forEach((f) => b.files.add(f));
    if (c.date < b.first) b.first = c.date;
    if (c.date > b.last) b.last = c.date;
  }
}

const snapshot = {
  generatedAt: new Date().toISOString(),
  head: git(["rev-parse", "--short", "HEAD"]).trim(),
  identities: [
    ...IDENTITIES.map(({ id, name, kind }) => ({ id, name, kind })),
    { id: "human", name: "Jesse", kind: "human" },
  ],
  contributors: Object.values(byContributor)
    .map((b) => ({ ...b, files: b.files.size }))
    .sort((a, b) => b.commits - a.commits),
  commits,
};

mkdirSync(path.join(process.cwd(), "data"), { recursive: true });
writeFileSync(
  path.join(process.cwd(), "data", "contributions.json"),
  JSON.stringify(snapshot, null, 2) + "\n"
);

console.log(
  `contributions: ${commits.length} commits — ` +
    snapshot.contributors.map((c) => `${c.id} ${c.commits}`).join(", ")
);
