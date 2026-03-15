"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredToken, clearAuthSession, fetchCurrentUser, logoutUser } from "@/lib/auth";
import { PermissionProvider, usePermissions } from "@/context/permission-context";
import Sidebar from "@/components/dashboard/sidebar";

function DashboardShell({ children }) {
  const router = useRouter();
  const { user } = usePermissions();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      clearAuthSession();
      router.replace("/login");
    }
  }

  return (
    <div className="flex min-h-screen bg-[#f6f3f2]">
      <Sidebar />

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-[#ececec] bg-white px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold text-[#1f2430]">
              Welcome, {user?.name || "User"}
            </h1>
            <p className="text-sm text-[#6b7280]">
              {user?.email} | {user?.role}
            </p>
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="rounded-2xl bg-[#ff6f3d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#ff6224] disabled:opacity-70"
          >
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </header>

        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function verifySession() {
      const token = getStoredToken();

      if (!token) {
        clearAuthSession();
        router.replace("/login");
        return;
      }

      const result = await fetchCurrentUser();

      if (!ignore) {
        if (!result.ok || !result.data.success) {
          clearAuthSession();
          router.replace("/login");
          return;
        }

        setChecking(false);
      }
    }

    verifySession();

    return () => {
      ignore = true;
    };
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f3f2]">
        <p className="text-gray-500">Checking authentication...</p>
      </div>
    );
  }

  return (
    <PermissionProvider>
      <DashboardShell>{children}</DashboardShell>
    </PermissionProvider>
  );
}