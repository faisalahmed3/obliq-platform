"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { sidebarLinks } from "@/lib/sidebar-links";
import { usePermissions } from "@/context/permission-context";

export default function Sidebar() {
  const pathname = usePathname();
  const { hasPermission, user } = usePermissions();

  const visibleLinks = sidebarLinks.filter((item) =>
    hasPermission(item.permission)
  );

  return (
    <aside className="w-[240px] border-r border-[#ececec] bg-white px-4 py-6">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-[#1f2430]">Obliq</h2>
        <p className="mt-2 text-sm text-[#6b7280]">
          {user?.name} • {user?.role}
        </p>
      </div>

      <nav className="flex flex-col gap-2">
        {visibleLinks.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                active
                  ? "bg-[#ff6f3d] text-white"
                  : "text-[#4b5563] hover:bg-[#fff1ea] hover:text-[#ff6f3d]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}