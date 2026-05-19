"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, Compass, Heart, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const links: {
  href: string;
  label: string;
  icon: typeof Brain;
  accent?: boolean;
}[] = [
  { href: "/timeline", label: "Línea", icon: Brain },
  { href: "/favorites", label: "Favoritos", icon: Heart },
  { href: "/memories/new", label: "Nuevo", icon: Plus, accent: true },
  { href: "/explore", label: "Explorar", icon: Compass },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="glass safe-bottom fixed inset-x-0 bottom-0 z-50 border-t border-border/60"
      aria-label="Navegación principal"
    >
      <div className="mx-auto flex h-[var(--nav-height)] max-w-lg items-center justify-around px-2">
        {links.map(({ href, label, icon: Icon, accent }) => {
          const active =
            pathname === href ||
            (href !== "/timeline" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2 text-xs transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-2xl transition-colors",
                  accent &&
                    "bg-primary text-primary-foreground shadow-lg shadow-primary/25",
                  !accent && active && "bg-primary/10",
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
