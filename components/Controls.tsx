"use client";

import { ChevronDownIcon } from "./Icons";

export function Switch({
  id,
  checked,
  onChange,
  labelledBy,
  disabled,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  labelledBy: string;
  disabled?: boolean;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="switch"
    />
  );
}

export function Select<T extends string>({
  id,
  value,
  options,
  onChange,
  disabled,
  labelledBy,
  compact = false,
}: {
  id: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (v: T) => void;
  disabled?: boolean;
  labelledBy: string;
  compact?: boolean;
}) {
  return (
    <span className="relative inline-flex">
      <select
        id={id}
        value={value}
        disabled={disabled}
        aria-labelledby={labelledBy}
        onChange={(e) => onChange(e.target.value as T)}
        className={`aff-fill appearance-none rounded-md pl-2.5 pr-8 text-meta text-ink-2 hover:text-ink ${
          compact ? "h-7 min-w-[7.75rem]" : "h-8 min-w-[8.5rem]"
        } ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-3" />
    </span>
  );
}
