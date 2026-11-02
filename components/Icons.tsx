/**
 * Line icons for icon buttons. One grid, one size, one stroke: every icon is
 * drawn on a 16px box with a 1.4px round stroke and takes its colour from the
 * button, so a button is muted (ink-3) until it is hovered or active.
 * State glyphs (kinds, verdicts, provenance) live in Marks.tsx, not here.
 */

type Props = { className?: string };

function Icon({ className, children }: Props & { children: React.ReactNode }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className ?? ""}`}
    >
      {children}
    </svg>
  );
}

export function MenuIcon(p: Props) {
  return (
    <Icon {...p}>
      <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11" />
    </Icon>
  );
}

export function InfoIcon(p: Props) {
  return (
    <Icon {...p}>
      <circle cx="8" cy="8" r="6" />
      <path d="M8 7.25v4M8 4.9v.01" />
    </Icon>
  );
}

export function SearchIcon(p: Props) {
  return (
    <Icon {...p}>
      <circle cx="7.2" cy="7.2" r="4.4" />
      <path d="m10.5 10.5 3 3" />
    </Icon>
  );
}

export function SunIcon(p: Props) {
  return (
    <Icon {...p}>
      <circle cx="8" cy="8" r="2.9" />
      <path d="M8 1.75v1.3M8 12.95v1.3M14.25 8h-1.3M3.05 8h-1.3M12.42 3.58l-.92.92M4.5 11.5l-.92.92M12.42 12.42l-.92-.92M4.5 4.5l-.92-.92" />
    </Icon>
  );
}

export function MoonIcon(p: Props) {
  return (
    <Icon {...p}>
      <path d="M13.25 9.5A5.5 5.5 0 0 1 6.5 2.75a5.5 5.5 0 1 0 6.75 6.75Z" />
    </Icon>
  );
}

export function BoldIcon(p: Props) {
  return (
    <Icon {...p}>
      <path d="M4.75 3h4a2.5 2.5 0 0 1 0 5h-4zM4.75 8h4.75a2.5 2.5 0 0 1 0 5H4.75z" />
    </Icon>
  );
}

export function ItalicIcon(p: Props) {
  return (
    <Icon {...p}>
      <path d="M10.5 3h-4M9.5 13h-4M8.75 3l-1.5 10" />
    </Icon>
  );
}

export function CodeIcon(p: Props) {
  return (
    <Icon {...p}>
      <path d="m5.5 4.5-3.5 3.5 3.5 3.5M10.5 4.5l3.5 3.5-3.5 3.5" />
    </Icon>
  );
}

export function AtIcon(p: Props) {
  return (
    <Icon {...p}>
      <circle cx="8" cy="8" r="2.5" />
      <path d="M10.5 8v1a1.75 1.75 0 0 0 3.5 0V8a6 6 0 1 0-2.35 4.77" />
    </Icon>
  );
}

export function CloseIcon(p: Props) {
  return (
    <Icon {...p}>
      <path d="m4 4 8 8M12 4l-8 8" />
    </Icon>
  );
}

export function PlayIcon(p: Props) {
  return (
    <Icon {...p}>
      <path d="M5 3.5v9L12.5 8z" />
    </Icon>
  );
}

export function WaveIcon(p: Props) {
  return (
    <Icon {...p}>
      <path d="M2 8h1.25M5 5v6M8 2.75v10.5M11 5.5v5M14 8h-1" />
    </Icon>
  );
}

export function ChevronDownIcon(p: Props) {
  return (
    <Icon {...p}>
      <path d="m4.5 6.25 3.5 3.5 3.5-3.5" />
    </Icon>
  );
}

export function ChevronRightIcon(p: Props) {
  return (
    <Icon {...p}>
      <path d="m6.25 4.5 3.5 3.5-3.5 3.5" />
    </Icon>
  );
}

export function ArrowLeftIcon(p: Props) {
  return (
    <Icon {...p}>
      <path d="M13 8H3.5M7.5 4 3.5 8l4 4" />
    </Icon>
  );
}

export function LinkIcon(p: Props) {
  return (
    <Icon {...p}>
      <path d="M6.75 9.25a2.75 2.75 0 0 0 3.9 0l2-2a2.76 2.76 0 0 0-3.9-3.9l-.6.6" />
      <path d="M9.25 6.75a2.75 2.75 0 0 0-3.9 0l-2 2a2.76 2.76 0 0 0 3.9 3.9l.6-.6" />
    </Icon>
  );
}

export function BranchIcon(p: Props) {
  return (
    <Icon {...p}>
      <circle cx="4.75" cy="3.75" r="1.5" />
      <circle cx="4.75" cy="12.25" r="1.5" />
      <circle cx="11.25" cy="5.25" r="1.5" />
      <path d="M4.75 5.25v5.5M11.25 6.75c0 2.5-2 3-4.25 3.5-1 .2-1.75.6-2.25 1" />
    </Icon>
  );
}

export function PromptIcon(p: Props) {
  return (
    <Icon {...p}>
      <path d="M2.5 4h7M2.5 7.25h5M2.5 10.5h3.5M9.5 9.25 12 11.5l-2.5 2.25M12.5 13.75H14" />
    </Icon>
  );
}

export function ShareIcon(p: Props) {
  return (
    <Icon {...p}>
      <path d="M8 2.5v7.5M5 5.25 8 2.5l3 2.75M3.5 8.5v3.75c0 .7.55 1.25 1.25 1.25h6.5c.7 0 1.25-.55 1.25-1.25V8.5" />
    </Icon>
  );
}

export function ExternalIcon(p: Props) {
  return (
    <Icon {...p}>
      <path d="M9.5 2.75h3.75V6.5M13.25 2.75 7.5 8.5M11.5 9.5v2.75c0 .55-.45 1-1 1h-6.75c-.55 0-1-.45-1-1V5.5c0-.55.45-1 1-1H6.5" />
    </Icon>
  );
}

export function CheckIcon(p: Props) {
  return (
    <Icon {...p}>
      <path d="m3.5 8.25 3 3 6-6.5" />
    </Icon>
  );
}

export function FileIcon(p: Props) {
  return (
    <Icon {...p}>
      <path d="M9 2.25H4.75c-.55 0-1 .45-1 1v9.5c0 .55.45 1 1 1h6.5c.55 0 1-.45 1-1V5.5Z" />
      <path d="M9 2.25V5.5h3.25" />
    </Icon>
  );
}

export function SettingsIcon(p: Props) {
  return (
    <Icon {...p}>
      <path d="M2.5 4.75h6M11.5 4.75h2M2.5 11.25h2M7.5 11.25h6" />
      <circle cx="10" cy="4.75" r="1.5" />
      <circle cx="6" cy="11.25" r="1.5" />
    </Icon>
  );
}

export function InboxIcon(p: Props) {
  return (
    <Icon {...p}>
      <path d="M2.5 9.25 4.2 3.6c.13-.42.5-.6.95-.6h5.7c.45 0 .82.18.95.6l1.7 5.65V12c0 .55-.45 1-1 1h-9c-.55 0-1-.45-1-1Z" />
      <path d="M2.5 9.25h3l.75 1.5h3.5l.75-1.5h3" />
    </Icon>
  );
}

export function AgentsIcon(p: Props) {
  return (
    <Icon {...p}>
      <circle cx="6" cy="5.5" r="2.25" />
      <path d="M2 13c.35-2.2 1.9-3.5 4-3.5s3.65 1.3 4 3.5" />
      <path d="M10.5 3.5a2.1 2.1 0 0 1 0 4.1M11.75 9.75c1.1.4 1.9 1.45 2.15 3.25" />
    </Icon>
  );
}

export function BoardIcon(p: Props) {
  return (
    <Icon {...p}>
      <rect x="2.25" y="2.75" width="3.25" height="10.5" rx="1" />
      <rect x="6.4" y="2.75" width="3.25" height="7" rx="1" />
      <rect x="10.55" y="2.75" width="3.25" height="8.75" rx="1" />
    </Icon>
  );
}

export function ListIcon(p: Props) {
  return (
    <Icon {...p}>
      <path d="M5.5 4h8M5.5 8h8M5.5 12h8M2.5 4h.01M2.5 8h.01M2.5 12h.01" />
    </Icon>
  );
}

export function ComposeIcon(p: Props) {
  return (
    <Icon {...p}>
      <path d="M7.5 2.75H4c-.7 0-1.25.55-1.25 1.25v8c0 .7.55 1.25 1.25 1.25h8c.7 0 1.25-.55 1.25-1.25V8.5" />
      <path d="M11.6 2.4a1.3 1.3 0 0 1 1.85 1.85L8.4 9.3l-2.4.6.6-2.4Z" />
    </Icon>
  );
}

export function TimelineIcon(p: Props) {
  return (
    <Icon {...p}>
      <path d="M4 2.5v11" />
      <circle cx="4" cy="5" r="1.4" />
      <circle cx="4" cy="11" r="1.4" />
      <path d="M7.5 5h6M7.5 11h4.5" />
    </Icon>
  );
}

export function MemoryIcon(p: Props) {
  return (
    <Icon {...p}>
      <path d="M8 2.25 13.5 5 8 7.75 2.5 5Z" />
      <path d="m2.5 8 5.5 2.75L13.5 8M2.5 11l5.5 2.75L13.5 11" />
    </Icon>
  );
}

export function HashIcon(p: Props) {
  return (
    <Icon {...p}>
      <path d="M6.25 2.5 5 13.5M11 2.5 9.75 13.5M2.75 6h11M2.25 10h11" />
    </Icon>
  );
}

export function ChatIcon(p: Props) {
  return (
    <Icon {...p}>
      <path d="M2.75 4c0-.7.55-1.25 1.25-1.25h8c.7 0 1.25.55 1.25 1.25v5.5c0 .7-.55 1.25-1.25 1.25H7.25L4.5 13v-2.25H4c-.7 0-1.25-.55-1.25-1.25Z" />
    </Icon>
  );
}

export function ReviewIcon(p: Props) {
  return (
    <Icon {...p}>
      <rect x="2.75" y="2.75" width="10.5" height="10.5" rx="2" />
      <path d="m5.5 8.25 1.75 1.75 3.25-3.5" />
    </Icon>
  );
}

export function PlusIcon(p: Props) {
  return (
    <Icon {...p}>
      <path d="M8 3.25v9.5M3.25 8h9.5" />
    </Icon>
  );
}

export function GearIcon(p: Props) {
  return (
    <Icon {...p}>
      <circle cx="8" cy="8" r="2" />
      <path d="M8 1.75v1.5M8 12.75v1.5M14.25 8h-1.5M3.25 8h-1.5M12.42 3.58l-1.06 1.06M4.64 11.36l-1.06 1.06M12.42 12.42l-1.06-1.06M4.64 4.64 3.58 3.58" />
      <circle cx="8" cy="8" r="4.25" />
    </Icon>
  );
}

export function UserPlusIcon(p: Props) {
  return (
    <Icon {...p}>
      <circle cx="6.5" cy="5.5" r="2.5" />
      <path d="M2 13.25c.4-2.3 2.1-3.75 4.5-3.75 1 0 1.9.25 2.6.75M12 9v4M10 11h4" />
    </Icon>
  );
}
