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
      className={`inline-flex min-h-11 items-center rounded-full px-4 text-caption font-medium transition duration-(--duration-fast) active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? "bg-accent text-[#111410] shadow-glow"
          : "border border-white/8 bg-white/5 text-secondary-text hover:border-accent-border hover:text-primary-text active:bg-white/8"
      } ${className}`}
      type="button"
      {...props}
    >
      {label}
    </button>
  );
}
