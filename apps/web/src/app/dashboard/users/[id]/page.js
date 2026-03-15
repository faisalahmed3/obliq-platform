"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { clearAuthSession } from "@/lib/auth";
import {
  fetchPermissions,
  fetchUserById,
  updateUserPermissions,
} from "@/lib/permissions";
import { usePermissions } from "@/context/permission-context";

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { permissions: actorPermissions = [] } = usePermissions();

  const [user, setUser] = useState(null);
  const [allPermissions, setAllPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [userOverrides, setUserOverrides] = useState([]);
  const [resolvedPermissions, setResolvedPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function handleUnauthorized() {
    clearAuthSession();
    router.replace("/login");
  }

  useEffect(() => {
    let ignore = false;

    async function loadPage() {
      try {
        setLoading(true);
        setError("");
        setSuccessMessage("");

        const [userResult, permissionsResult] = await Promise.all([
          fetchUserById(params.id),
          fetchPermissions(),
        ]);

        if (ignore) return;

        if (userResult.status === 401 || permissionsResult.status === 401) {
          handleUnauthorized();
          return;
        }

        if (!userResult.ok || !userResult.data?.success) {
          setError(userResult.data?.message || "Failed to load user details");
          return;
        }

        if (!permissionsResult.ok || !permissionsResult.data?.success) {
          setError(
            permissionsResult.data?.message || "Failed to load permissions"
          );
          return;
        }

        setUser(userResult.data.user || null);
        setAllPermissions(permissionsResult.data.permissions || []);
        setRolePermissions(userResult.data.rolePermissions || []);
        setUserOverrides(userResult.data.userOverrides || []);
        setResolvedPermissions(userResult.data.resolvedPermissions || []);
      } catch (err) {
        console.error("Failed to load user details page:", err);
        if (!ignore) {
          setError("Failed to load user details");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadPage();

    return () => {
      ignore = true;
    };
  }, [params.id, router]);

  const actorPermissionSet = useMemo(
    () => new Set(actorPermissions),
    [actorPermissions]
  );

  const userOverrideMap = useMemo(() => {
    const map = new Map();
    userOverrides.forEach((item) => {
      map.set(item.permissionKey, item.granted);
    });
    return map;
  }, [userOverrides]);

  function getEffectiveState(permissionKey) {
    if (userOverrideMap.has(permissionKey)) {
      return userOverrideMap.get(permissionKey);
    }
    return rolePermissions.includes(permissionKey);
  }

  function toggleOverride(permissionKey) {
    const currentEffective = getEffectiveState(permissionKey);

    setUserOverrides((prev) => {
      const existing = prev.find((item) => item.permissionKey === permissionKey);

      if (!existing) {
        return [...prev, { permissionKey, granted: !currentEffective }];
      }

      const nextGranted = !existing.granted;

      return prev.map((item) =>
        item.permissionKey === permissionKey
          ? { ...item, granted: nextGranted }
          : item
      );
    });
  }

  async function handleSavePermissions() {
    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      const result = await updateUserPermissions(params.id, userOverrides);

      if (result.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!result.ok || !result.data?.success) {
        const invalidList =
          result.data?.invalidPermissions?.length > 0
            ? `: ${result.data.invalidPermissions.join(", ")}`
            : "";

        setError(
          `${result.data?.message || "Failed to save permissions"}${invalidList}`
        );
        return;
      }

      setRolePermissions(result.data.rolePermissions || []);
      setUserOverrides(result.data.userOverrides || []);
      setResolvedPermissions(result.data.resolvedPermissions || []);
      setSuccessMessage("Permissions updated successfully.");
    } catch (err) {
      console.error("Failed to save permissions:", err);
      setError("Failed to save permissions");
    } finally {
      setSaving(false);
    }
  }

  const groupedPermissions = useMemo(() => {
    return allPermissions.reduce((acc, permission) => {
      const group = permission.module || "general";
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(permission);
      return acc;
    }, {});
  }, [allPermissions]);

  if (loading) {
    return (
      <main className="p-6 md:p-8">
        <div className="rounded-[28px] bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
          <p className="text-[#6b7280]">Loading user details...</p>
        </div>
      </main>
    );
  }

  if (error && !user) {
    return (
      <main className="p-6 md:p-8">
        <div className="rounded-[28px] bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
          <h1 className="text-2xl font-semibold text-[#1f2430]">
            User Details
          </h1>
          <p className="mt-3 text-red-500">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 md:p-8">
      <section className="rounded-[28px] bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm text-orange-500">User Details</p>
            <h1 className="mt-2 text-3xl font-bold text-[#1f2430]">
              {user?.name}
            </h1>
            <p className="mt-2 text-[#6b7280]">
              {user?.email} | {user?.roleLabel || user?.role} | {user?.status}
            </p>
          </div>

          <button
            type="button"
            onClick={handleSavePermissions}
            disabled={saving}
            className="rounded-xl bg-[#ff6f3d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#ff6224] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? "Saving..." : "Save Overrides"}
          </button>
        </div>

        {error ? (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        {successMessage ? (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {successMessage}
          </div>
        ) : null}

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-[#ececec] p-6">
            <h2 className="text-lg font-semibold text-[#1f2430]">
              Role Permissions
            </h2>

            <div className="mt-4 flex flex-wrap gap-3">
              {rolePermissions.length > 0 ? (
                rolePermissions.map((permission) => (
                  <span
                    key={permission}
                    className="rounded-full bg-[#f5f8ff] px-4 py-2 text-sm font-medium text-[#3b5bdb]"
                  >
                    {permission}
                  </span>
                ))
              ) : (
                <p className="text-sm text-[#6b7280]">No role permissions.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-[#ececec] p-6">
            <h2 className="text-lg font-semibold text-[#1f2430]">
              User Overrides
            </h2>

            <div className="mt-4 flex flex-wrap gap-3">
              {userOverrides.length > 0 ? (
                userOverrides.map((item) => (
                  <span
                    key={`${item.permissionKey}-${item.granted}`}
                    className={`rounded-full px-4 py-2 text-sm font-medium ${
                      item.granted
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {item.permissionKey} {item.granted ? "(grant)" : "(deny)"}
                  </span>
                ))
              ) : (
                <p className="text-sm text-[#6b7280]">No user overrides.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-[#ececec] p-6">
            <h2 className="text-lg font-semibold text-[#1f2430]">
              Resolved Permissions
            </h2>

            <div className="mt-4 flex flex-wrap gap-3">
              {resolvedPermissions.length > 0 ? (
                resolvedPermissions.map((permission) => (
                  <span
                    key={permission}
                    className="rounded-full bg-[#fff1ea] px-4 py-2 text-sm font-medium text-[#ff6f3d]"
                  >
                    {permission}
                  </span>
                ))
              ) : (
                <p className="text-sm text-[#6b7280]">No resolved permissions.</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-8">
          {Object.entries(groupedPermissions).map(([moduleName, permissions]) => (
            <div
              key={moduleName}
              className="rounded-2xl border border-[#ececec] p-6"
            >
              <h3 className="text-lg font-semibold capitalize text-[#1f2430]">
                {moduleName}
              </h3>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {permissions.map((permission) => {
                  const effectiveGranted = getEffectiveState(permission.key);
                  const hasOverride = userOverrideMap.has(permission.key);
                  const canAssign = actorPermissionSet.has(permission.key);

                  return (
                    <label
                      key={permission.key}
                      className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                        canAssign
                          ? "border-[#f0f0f0]"
                          : "border-[#f3e2e2] bg-[#fafafa]"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium text-[#1f2430]">
                          {permission.label}
                        </p>
                        <p className="text-xs text-[#6b7280]">{permission.key}</p>

                        <div className="mt-2 flex flex-wrap gap-2">
                          {rolePermissions.includes(permission.key) ? (
                            <span className="rounded-full bg-[#eef4ff] px-2.5 py-1 text-[11px] font-medium text-[#3b5bdb]">
                              role
                            </span>
                          ) : null}

                          {hasOverride ? (
                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                                userOverrideMap.get(permission.key)
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              override {userOverrideMap.get(permission.key) ? "grant" : "deny"}
                            </span>
                          ) : null}

                          {!canAssign ? (
                            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-500">
                              cannot assign
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <input
                        type="checkbox"
                        checked={effectiveGranted}
                        onChange={() => toggleOverride(permission.key)}
                        disabled={!canAssign}
                        className="h-4 w-4 disabled:cursor-not-allowed disabled:opacity-40"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}