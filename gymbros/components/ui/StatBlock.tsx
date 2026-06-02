type StatBlockProps = {
  label: string;
  value: string | number;
  className?: string;
};

export function StatBlock({ label, value, className = "" }: StatBlockProps) {
  return (
    <div
      className={`rounded-2xl border border-white/6 bg-white/[0.035] p-4 ${className}`}
    >
      <p className="text-2xl font-semibold text-primary-text">{value}</p>
      <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-secondary-text">
        {label}
      </p>
    </div>
  );
}
