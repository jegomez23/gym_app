import type { ButtonHTMLAttributes } from "react";

type PillOptionProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  active?: boolean;
};

export function PillOption({
  label,
  active = false,
  className = "",
  ...props
}: PillOptionProps) {
  return (
    <button
      aria-pressed={active}
      className={`rounded-full px-4 py-2 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? "bg-accent text-[#111410] shadow-[0_10px_26px_var(--accent-glow)]"
          : "border border-white/8 bg-white/5 text-secondary-text hover:border-[var(--accent-border)] hover:text-primary-text active:bg-white/8"
      } ${className}`}
      type="button"
      {...props}
    >
      {label}
    </button>
  );
}
