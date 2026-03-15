"use client";

import { usePermissions } from "@/context/permission-context";

export default function SettingsPage() {
  const { hasPermission, loading, user } = usePermissions();

  if (loading) {
    return (
      <main className="p-6 md:p-8">
        <div className="rounded-[28px] bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
          <p className="text-[#6b7280]">Loading settings page...</p>
        </div>
      </main>
    );
  }

  if (!hasPermission("settings.view")) {
    return (
      <main className="p-6 md:p-8">
        <div className="rounded-[28px] bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
          <h1 className="text-2xl font-semibold text-[#1f2430]">403 Forbidden</h1>
          <p className="mt-2 text-[#6b7280]">
            You do not have permission to view the Settings page.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 md:p-8">
      <section className="rounded-[28px] bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
        <div>
          <p className="text-sm font-medium text-[#ff6f3d]">Settings Module</p>
          <h1 className="mt-2 text-3xl font-semibold text-[#1f2430]">Settings</h1>
          <p className="mt-2 text-[#6b7280]">
            Manage account preferences and platform configuration.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-[#f0f0f0] p-6">
            <h2 className="text-lg font-semibold text-[#1f2430]">Profile</h2>
            <div className="mt-4 space-y-2 text-sm text-[#6b7280]">
              <p>Name: {user?.name}</p>
              <p>Email: {user?.email}</p>
              <p>Role: {user?.role}</p>
              <p>Status: {user?.status}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-[#f0f0f0] p-6">
            <h2 className="text-lg font-semibold text-[#1f2430]">
              Application Settings
            </h2>
            <p className="mt-4 text-sm text-[#6b7280]">
              Global system settings and module configuration will go here.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}