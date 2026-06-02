import type { ButtonHTMLAttributes, ReactNode } from "react";

type AppButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary";
};

export function AppButton({
  children,
  className = "",
  variant = "primary",
  ...props
}: AppButtonProps) {
  const variantClass =
    variant === "primary"
      ? "bg-accent text-[#111410] shadow-[0_18px_48px_var(--accent-glow)] hover:bg-accent-hover"
      : "border border-white/8 bg-white/5 text-primary-text hover:border-[var(--accent-border)] hover:bg-white/8";

  return (
    <button
      className={`min-h-13 rounded-full px-7 text-sm font-semibold tracking-[0.01em] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:hover:border-white/8 disabled:hover:bg-white/5 disabled:opacity-45 ${variantClass} ${className}`}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}
