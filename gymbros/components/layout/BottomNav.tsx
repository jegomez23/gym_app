"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icon, type IconName } from "@/components/ui/Icon";

type NavItem = {
  href: string;
  label: string;
  icon: IconName;
};

// Commit sits in the center as the product's defining act.
const leftItems: NavItem[] = [
  { href: "/", label: "Hoy", icon: "today" },
  { href: "/archive", label: "Archivo", icon: "archive" },
];

const rightItems: NavItem[] = [
  { href: "/circle", label: "Círculo", icon: "circle" },
  { href: "/profile", label: "Perfil", icon: "profile" },
];

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-label uppercase transition duration-(--duration-fast) ${
        active
          ? "text-accent"
          : "text-secondary-text hover:text-primary-text active:scale-95"
      }`}
      href={item.href}
    >
      <Icon name={item.icon} size={22} />
      <span className="tracking-[0.08em]">{item.label}</span>
    </Link>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const commitActive = pathname === "/commit";

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-20 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-4"
    >
      <div className="mx-auto flex max-w-md items-center justify-between gap-1 rounded-full border border-white/10 bg-[#171814]/86 px-3 py-2 shadow-e3 backdrop-blur-2xl">
        {leftItems.map((item) => (
          <NavLink
            active={pathname === item.href}
            item={item}
            key={item.href}
          />
        ))}

        <Link
          aria-current={commitActive ? "page" : undefined}
          aria-label="Dejar evidencia"
          className={`-mt-7 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent text-[#111410] shadow-glow transition duration-(--duration-fast) ease-out-soft hover:bg-accent-hover active:scale-95 ${
            commitActive
              ? "ring-2 ring-white/30 ring-offset-2 ring-offset-background"
              : ""
          }`}
          href="/commit"
        >
          <Icon name="commit" size={26} strokeWidth={2.25} />
        </Link>

        {rightItems.map((item) => (
          <NavLink
            active={pathname === item.href}
            item={item}
            key={item.href}
          />
        ))}
      </div>
    </nav>
  );
}
