"use client";

import { usePermissions } from "@/context/permission-context";

export default function DashboardPage() {
  const { user, permissions } = usePermissions();

  return (
    <main className="p-6 md:p-8">
      <section className="rounded-[28px] bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
        <div>
          <p className="text-sm font-medium text-[#ff6f3d]">Obliq Dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold text-[#1f2430]">
            Welcome, {user?.name || "User"}
          </h1>
          <p className="mt-2 text-[#6b7280]">
            Email: {user?.email} | Role: {user?.role} | Status: {user?.status}
          </p>
        </div>

        <div className="mt-10">
          <h2 className="text-lg font-semibold text-[#1f2430]">
            Resolved Permissions
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            {permissions.map((permission) => (
              <span
                key={permission}
                className="rounded-full bg-[#fff1ea] px-4 py-2 text-sm font-medium text-[#ff6f3d]"
              >
                {permission}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}