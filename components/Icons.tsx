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
