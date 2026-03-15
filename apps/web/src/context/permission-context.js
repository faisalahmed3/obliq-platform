"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchCurrentUser, clearAuthSession } from "@/lib/auth";
import { useRouter } from "next/navigation";

const PermissionContext = createContext(null);

export function PermissionProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      const result = await fetchCurrentUser();

      if (!result.ok || !result.data.success) {
        clearAuthSession();
        setUser(null);
        setPermissions([]);
        setLoading(false);
        return;
      }

      setUser(result.data.user);
      setPermissions(result.data.permissions || []);
      setLoading(false);
    }

    loadSession();
  }, [router]);

  const value = useMemo(() => {
    return {
      user,
      permissions,
      loading,
      hasPermission: (key) => permissions.includes(key),
      hasAnyPermission: (keys = []) => keys.some((key) => permissions.includes(key)),
      hasAllPermissions: (keys = []) => keys.every((key) => permissions.includes(key)),
    };
  }, [user, permissions, loading]);

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionContext);

  if (!context) {
    throw new Error("usePermissions must be used inside PermissionProvider");
  }

  return context;
}