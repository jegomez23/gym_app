type AvatarProps = {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
};

function initials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "GC"
  );
}

export function Avatar({ name, src, size = 44, className = "" }: AvatarProps) {
  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent-soft text-caption font-semibold text-accent ${className}`}
      style={{ height: size, width: size }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt="" className="h-full w-full object-cover" src={src} />
      ) : (
        initials(name)
      )}
    </span>
  );
}
