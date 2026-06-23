import type { ButtonHTMLAttributes, ReactNode } from "react";

type AppButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "quiet";

type AppButtonSize = "md" | "lg";

type AppButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  loading?: boolean;
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-[0.01em] transition duration-(--duration-fast) ease-out-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-border focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100";

const variantClass: Record<AppButtonVariant, string> = {
  primary:
    "bg-accent text-[#111410] shadow-glow hover:bg-accent-hover disabled:hover:bg-accent",
  secondary:
    "border border-white/8 bg-white/5 text-primary-text hover:border-accent-border hover:bg-white/10 disabled:hover:border-white/8 disabled:hover:bg-white/5",
  ghost:
    "text-secondary-text hover:bg-white/5 hover:text-primary-text disabled:hover:bg-transparent",
  danger:
    "border border-danger-border bg-danger-soft text-danger hover:bg-[color-mix(in_srgb,var(--danger)_22%,transparent)]",
  quiet:
    "border border-white/6 bg-surface-quiet text-secondary-text hover:text-primary-text hover:bg-white/5",
};

// 44px+ touch targets per Apple HIG.
const sizeClass: Record<AppButtonSize, string> = {
  md: "min-h-11 px-5 text-caption",
  lg: "min-h-13 px-7 text-body",
};

export function AppButton({
  children,
  className = "",
  variant = "primary",
  size = "lg",
  loading = false,
  disabled,
  ...props
}: AppButtonProps) {
  return (
    <button
      aria-busy={loading || undefined}
      className={`${base} ${variantClass[variant]} ${sizeClass[size]} ${className}`}
      disabled={disabled || loading}
      type="button"
      {...props}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent opacity-80"
        />
      )}
      {children}
    </button>
  );
}
