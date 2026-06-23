type StatBlockProps = {
  label: string;
  value: string | number;
  className?: string;
};

export function StatBlock({ label, value, className = "" }: StatBlockProps) {
  return (
    <div
      className={`rounded-md border border-white/6 bg-surface-quiet p-4 ${className}`}
    >
      <p className="text-title text-primary-text">{value}</p>
      <p className="mt-1 text-label uppercase text-secondary-text">{label}</p>
    </div>
  );
}
