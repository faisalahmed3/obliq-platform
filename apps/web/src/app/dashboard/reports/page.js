"use client";

import { usePermissions } from "@/context/permission-context";

export default function ReportsPage() {
  const { hasPermission, loading } = usePermissions();

  if (loading) {
    return (
      <main className="p-6 md:p-8">
        <div className="rounded-[28px] bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
          <p className="text-[#6b7280]">Loading reports page...</p>
        </div>
      </main>
    );
  }

  if (!hasPermission("reports.view")) {
    return (
      <main className="p-6 md:p-8">
        <div className="rounded-[28px] bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
          <h1 className="text-2xl font-semibold text-[#1f2430]">403 Forbidden</h1>
          <p className="mt-2 text-[#6b7280]">
            You do not have permission to view the Reports page.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 md:p-8">
      <section className="rounded-[28px] bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
        <div>
          <p className="text-sm font-medium text-[#ff6f3d]">Reports Module</p>
          <h1 className="mt-2 text-3xl font-semibold text-[#1f2430]">Reports</h1>
          <p className="mt-2 text-[#6b7280]">
            Permission-based analytics and operational summaries.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-[#f0f0f0] p-6">
            <p className="text-sm text-[#6b7280]">Open Tasks</p>
            <h2 className="mt-3 text-3xl font-semibold text-[#1f2430]">24</h2>
          </div>

          <div className="rounded-3xl border border-[#f0f0f0] p-6">
            <p className="text-sm text-[#6b7280]">Active Users</p>
            <h2 className="mt-3 text-3xl font-semibold text-[#1f2430]">12</h2>
          </div>

          <div className="rounded-3xl border border-[#f0f0f0] p-6">
            <p className="text-sm text-[#6b7280]">Pending Reviews</p>
            <h2 className="mt-3 text-3xl font-semibold text-[#1f2430]">7</h2>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-[#f0f0f0] p-6">
          <h3 className="text-lg font-semibold text-[#1f2430]">Monthly Summary</h3>
          <p className="mt-2 text-sm text-[#6b7280]">
            Report charts and export tools will go here.
          </p>
        </div>
      </section>
    </main>
  );
}