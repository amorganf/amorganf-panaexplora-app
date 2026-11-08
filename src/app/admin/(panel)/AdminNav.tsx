"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = { href: string; label: string };

export default function AdminNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Menú de administración" className="d-grid gap-1">
      {items.map((item) => {
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`d-block rounded-3 px-3 py-2 text-decoration-none ${
              active ? "bg-white text-dark fw-semibold" : "text-white-50"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}