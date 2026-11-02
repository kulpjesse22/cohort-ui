import type { DiffFile } from "@/lib/reviews";
import { lineCounts } from "@/lib/reviews";
import { FileIcon } from "./Icons";

/**
 * One file's change. The left column is the change itself: old and new line
 * numbers, a + or − sign, and the line, tinted. The right column is the file
 * as it reads afterwards, set in a single quiet tone so it reads as
 * reference, not as a second diff. Below `lg` the right column goes and the
 * change stands alone.
 *
 * Lines wrap rather than scroll sideways, so both columns stay aligned row for
 * row and nothing hides off the edge of a phone. Ligatures are off: `=>`
 * must read as written.
 */

type Row =
  | { kind: "ctx" | "add" | "del"; oldNo: number | null; newNo: number | null; text: string }
  | { kind: "gap"; label: string };

function toRows(file: DiffFile): Row[] {
  const rows: Row[] = [];
  file.hunks.forEach((hunk, i) => {
    if (i > 0 || hunk.oldStart > 1) {
      rows.push({ kind: "gap", label: `Lines from ${hunk.newStart}` });
    }
    let oldNo = hunk.oldStart;
    let newNo = hunk.newStart;
    for (const raw of hunk.lines) {
      const sign = raw.charAt(0);
      const text = raw.slice(1);
      if (sign === "+") rows.push({ kind: "add", oldNo: null, newNo: newNo++, text });
      else if (sign === "-") rows.push({ kind: "del", oldNo: oldNo++, newNo: null, text });
      else rows.push({ kind: "ctx", oldNo: oldNo++, newNo: newNo++, text });
    }
  });
  return rows;
}

type Tok = { t: string; c?: string };

const TS_KEYWORDS = new Set([
  "import", "from", "export", "const", "let", "var", "function", "return", "if", "else",
  "try", "catch", "finally", "await", "async", "new", "typeof", "interface", "type", "as",
  "extends", "true", "false", "null", "undefined", "for", "of", "in", "while", "default",
  "class", "satisfies",
]);

const TS_RE =
  /(\/\/.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b\d[\d_]*(?:\.\d+)?\b)|(<\/?[A-Za-z][\w.]*)|([A-Za-z_$][\w$]*)/g;

function tokenizeTs(line: string): Tok[] {
  if (/^\s*(\*|\/\*\*?|\/\/)/.test(line)) return [{ t: line, c: "syn-comment" }];
  const out: Tok[] = [];
  let last = 0;
  for (const m of line.matchAll(TS_RE)) {
    const at = m.index ?? 0;
    if (at > last) out.push({ t: line.slice(last, at) });
    const [text, comment, str, num, tag, ident] = m;
    if (comment) out.push({ t: text, c: "syn-comment" });
    else if (str) out.push({ t: text, c: "syn-string" });
    else if (num) out.push({ t: text, c: "syn-number" });
    else if (tag) out.push({ t: text, c: "syn-type" });
    else if (ident && TS_KEYWORDS.has(ident)) out.push({ t: text, c: "syn-keyword" });
    else if (ident && /^[A-Z]/.test(ident)) out.push({ t: text, c: "syn-type" });
    else out.push({ t: text });
    last = at + text.length;
  }
  if (last < line.length) out.push({ t: line.slice(last) });
  return out;
}

function tokenizeMd(line: string): Tok[] {
  if (/^#{1,6}\s/.test(line)) return [{ t: line, c: "syn-type font-semibold" }];
  const out: Tok[] = [];
  const lead = line.match(/^(\s*)([-*]|\d+\.|\|)(\s)/);
  let rest = line;
  if (lead) {
    out.push({ t: lead[1] }, { t: lead[2], c: "syn-keyword" }, { t: lead[3] });
    rest = line.slice(lead[0].length);
  }
  let last = 0;
  for (const m of rest.matchAll(/(`[^`]+`)|(\*\*[^*]+\*\*)|(\|)/g)) {
    const at = m.index ?? 0;
    if (at > last) out.push({ t: rest.slice(last, at) });
    if (m[1]) out.push({ t: m[0], c: "syn-string" });
    else if (m[2]) out.push({ t: m[0], c: "font-semibold" });
    else out.push({ t: m[0], c: "syn-comment" });
    last = at + m[0].length;
  }
  if (last < rest.length) out.push({ t: rest.slice(last) });
  return out;
}

function Code({ text, path }: { text: string; path: string }) {
  const toks = path.endsWith(".md") ? tokenizeMd(text) : tokenizeTs(text);
  return (
    <>
      {toks.map((tok, i) =>
        tok.c ? (
          <span key={i} className={tok.c}>
            {tok.t}
          </span>
        ) : (
          tok.t
        )
      )}
    </>
  );
}

/** A wrapped line hangs under its own indentation, two characters further in. */
function hang(text: string, extraRem: number): React.CSSProperties {
  const depth = (text.match(/^ */)?.[0].length ?? 0) + 2;
  return { paddingLeft: `calc(${depth}ch + ${extraRem}rem)`, textIndent: `-${depth}ch` };
}

const ROW_TINT = { ctx: "", add: "diff-add", del: "diff-del" } as const;
const SIGN = { ctx: " ", add: "+", del: "−" } as const;
const SR = { ctx: "", add: "Added: ", del: "Removed: " } as const;

export function DiffPanel({ file }: { file: DiffFile }) {
  const rows = toRows(file);
  const { added, removed } = lineCounts([file]);

  return (
    <section
      aria-label={`Changes to ${file.path}`}
      className="code-panel overflow-hidden rounded-lg border border-line"
    >
      <header className="flex items-center gap-2 border-b border-line px-3 py-2">
        <FileIcon className="text-ink-3" />
        <span className="min-w-0 flex-1 truncate font-mono text-label text-ink-2" title={file.path}>
          {file.path}
        </span>
        <span className="shrink-0 font-mono text-label tabular-nums">
          <span className="diff-add-ink">+{added}</span>{" "}
          <span className="diff-del-ink">−{removed}</span>
        </span>
      </header>

      <div className="hidden grid-cols-[minmax(0,1fr)_minmax(0,1fr)] border-b border-line text-label font-semibold uppercase tracking-[0.06em] text-ink-3 lg:grid">
        <span className="px-3 py-1.5">Change</span>
        <span className="border-l border-line px-3 py-1.5">After</span>
      </div>

      <ol className="font-mono text-label leading-[1.7] [font-variant-ligatures:none]">
        {rows.map((row, i) =>
          row.kind === "gap" ? (
            <li key={i} className="border-y border-line px-3 py-1 text-ink-3">
              <span aria-hidden="true">⋯ </span>
              {row.label}
            </li>
          ) : (
            <li key={i} className="grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div
                className={`grid grid-cols-[2.25rem_2.25rem_1rem_minmax(0,1fr)] ${ROW_TINT[row.kind]}`}
              >
                <span className="select-none pr-2 text-right tabular-nums text-ink-3" aria-hidden="true">
                  {row.oldNo ?? ""}
                </span>
                <span className="select-none pr-2 text-right tabular-nums text-ink-3" aria-hidden="true">
                  {row.newNo ?? ""}
                </span>
                <span
                  aria-hidden="true"
                  className={`select-none text-center ${
                    row.kind === "add" ? "diff-add-ink" : row.kind === "del" ? "diff-del-ink" : ""
                  }`}
                >
                  {SIGN[row.kind]}
                </span>
                <span
                  className="whitespace-pre-wrap pr-3 text-ink [overflow-wrap:anywhere]"
                  style={hang(row.text, 0)}
                >
                  <span className="sr-only">{SR[row.kind]}</span>
                  <Code text={row.text} path={file.path} />
                </span>
              </div>
              <div
                aria-hidden="true"
                className="hidden grid-cols-[2.25rem_minmax(0,1fr)] border-l border-line lg:grid"
              >
                <span className="select-none pr-2 text-right tabular-nums text-ink-3">
                  {row.kind === "del" ? "" : row.newNo}
                </span>
                <span
                  className="whitespace-pre-wrap pr-3 text-ink-3 [overflow-wrap:anywhere]"
                  style={hang(row.text, 0.25)}
                >
                  {row.kind === "del" ? "" : row.text}
                </span>
              </div>
            </li>
          )
        )}
      </ol>
    </section>
  );
}
