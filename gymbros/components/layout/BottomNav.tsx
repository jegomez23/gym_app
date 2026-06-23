"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Hoy" },
  { href: "/commit", label: "Commit" },
  { href: "/archive", label: "Archivo" },
  { href: "/circle", label: "Círculo" },
  { href: "/profile", label: "Perfil" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-20 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4"
    >
      <div className="mx-auto grid max-w-lg grid-cols-5 gap-1 rounded-full border border-white/10 bg-[#171814]/86 p-1.5 shadow-[0_18px_60px_rgb(0_0_0/0.42)] backdrop-blur-2xl">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={`rounded-full px-2 py-3 text-center text-[0.72rem] font-semibold transition ${
                isActive
                  ? "bg-accent text-[#111410] shadow-[0_10px_28px_var(--accent-glow)]"
                  : "text-secondary-text hover:bg-white/5 hover:text-primary-text active:bg-white/8"
              }`}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
