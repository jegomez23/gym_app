"use client";

import { useEffect, useRef, useState } from "react";

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
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // A cached image can already be complete before onLoad attaches, so its event
    // would never fire — check directly and reveal it without a fade in that case.
    if (imgRef.current?.complete) {
      setLoaded(true);
    }
  }, [src]);

  const initialsClass = size >= 48 ? "text-heading" : "text-caption";

  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent-soft font-semibold text-accent ${initialsClass} ${className}`}
      style={{ height: size, width: size }}
    >
      {/* The accent circle with initials is the placeholder; the photo fades in over
          it once decoded, so a person's face is never seen to snap into existence. */}
      <span aria-hidden={src ? "true" : undefined}>{initials(name)}</span>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-(--duration-base) ease-out-soft ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setLoaded(true)}
          ref={imgRef}
          src={src}
        />
      ) : null}
    </span>
  );
}
