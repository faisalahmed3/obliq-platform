"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePermissions } from "@/context/permission-context";
import { clearAuthSession } from "@/lib/auth";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function UsersPage() {
  const router = useRouter();
  const { hasPermission, loading: permissionLoading } = usePermissions();

  const [users, setUsers] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "agent",
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [updatingUser, setUpdatingUser] = useState(false);
  const [editError, setEditError] = useState("");
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "agent",
  });

  function resetCreateForm() {
    setCreateForm({
      name: "",
      email: "",
      password: "",
      role: "agent",
    });
    setCreateError("");
  }

  function resetEditForm() {
    setEditForm({
      name: "",
      email: "",
      role: "agent",
    });
    setEditError("");
    setEditingUser(null);
  }

  function handleUnauthorized() {
    clearAuthSession();
    router.replace("/login");
  }

  useEffect(() => {
    let ignore = false;

    async function loadUsers() {
      try {
        const token = localStorage.getItem("accessToken");

        const res = await fetch(`${API_URL}/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (ignore) return;

        if (res.status === 401) {
          handleUnauthorized();
          return;
        }

        if (data.success) {
          setUsers(data.users || []);
        } else {
          setError(data.message || "Failed to load users");
        }
      } catch (err) {
        if (!ignore) {
          console.error("Failed to fetch users:", err);
          setError("Failed to fetch users");
        }
      } finally {
        if (!ignore) {
          setPageLoading(false);
        }
      }
    }

    if (!permissionLoading && hasPermission("users.view")) {
      loadUsers();
    } else if (!permissionLoading) {
      setPageLoading(false);
    }

    return () => {
      ignore = true;
    };
  }, [permissionLoading, hasPermission, router]);

  async function handleCreateUser() {
    try {
      setCreatingUser(true);
      setCreateError("");

      const token = localStorage.getItem("accessToken");

      const res = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createForm),
      });

      const data = await res.json();

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!data.success) {
        setCreateError(data.message || "Failed to create user");
        return;
      }

      setUsers((prev) => [data.user, ...prev]);
      setShowCreateModal(false);
      resetCreateForm();
    } catch (err) {
      console.error("Failed to create user:", err);
      setCreateError("Failed to create user");
    } finally {
      setCreatingUser(false);
    }
  }

  function openEditModal(user) {
    setEditingUser(user);
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "agent",
    });
    setEditError("");
    setShowEditModal(true);
  }

  async function handleEditUser() {
    if (!editingUser) return;

    try {
      setUpdatingUser(true);
      setEditError("");

      const token = localStorage.getItem("accessToken");

      const res = await fetch(`${API_URL}/users/${editingUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!data.success) {
        setEditError(data.message || "Failed to update user");
        return;
      }

      setUsers((prev) =>
        prev.map((item) =>
          item.id === editingUser.id ? data.user : item
        )
      );

      setShowEditModal(false);
      resetEditForm();
    } catch (err) {
      console.error("Failed to update user:", err);
      setEditError("Failed to update user");
    } finally {
      setUpdatingUser(false);
    }
  }

  async function handleSuspendToggle(user) {
    try {
      setActionLoadingId(user.id);

      const nextStatus = user.status === "active" ? "suspended" : "active";
      const token = localStorage.getItem("accessToken");

      const res = await fetch(`${API_URL}/users/${user.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: nextStatus,
        }),
      });

      const data = await res.json();

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!data.success) {
        console.error(data.message || "Failed to update status");
        return;
      }

      setUsers((prev) =>
        prev.map((item) =>
          item.id === user.id ? { ...item, status: data.user.status } : item
        )
      );
    } catch (err) {
      console.error("Failed to update user status:", err);
    } finally {
      setActionLoadingId(null);
    }
  }

  if (permissionLoading || pageLoading) {
    return (
      <main className="p-6 md:p-8">
        <div className="rounded-[28px] bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
          <p className="text-[#6b7280]">Loading users...</p>
        </div>
      </main>
    );
  }

  if (!hasPermission("users.view")) {
    return (
      <main className="p-6 md:p-8">
        <div className="rounded-[28px] bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
          <h1 className="text-2xl font-semibold text-[#1f2430]">403 Forbidden</h1>
          <p className="mt-3 text-[#6b7280]">
            You do not have permission to view the Users page.
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-6 md:p-8">
        <div className="rounded-[28px] bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
          <h1 className="text-2xl font-semibold text-[#1f2430]">Users</h1>
          <p className="mt-3 text-red-500">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="p-6 md:p-8">
        <div className="rounded-[28px] bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-500">Users Module</p>
              <h1 className="text-3xl font-bold text-[#1f2430]">Users</h1>
              <p className="text-gray-500">
                Manage users, roles, and permission assignments.
              </p>
            </div>

            {hasPermission("users.create") && (
              <button
                onClick={() => {
                  resetCreateForm();
                  setShowCreateModal(true);
                }}
                className="rounded-lg bg-orange-500 px-5 py-2 text-white transition hover:bg-orange-600"
              >
                Create User
              </button>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#ececec]">
            <table className="w-full">
              <thead className="bg-[#fafafa] text-left text-black">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-t border-[#f0f0f0] text-black"
                  >
                    <td className="p-4">{user.name}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">{user.roleLabel || user.role}</td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-sm ${
                          user.status === "active"
                            ? "bg-green-100 text-green-700"
                            : user.status === "suspended"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/users/${user.id}`}
                          className="rounded-lg border border-[#dbe4ff] px-3 py-1.5 text-sm text-[#3b5bdb] hover:bg-[#f5f8ff]"
                        >
                          View Details
                        </Link>

                        {hasPermission("users.edit") && (
                          <button
                            onClick={() => openEditModal(user)}
                            className="rounded-lg border border-[#ececec] px-3 py-1.5 text-sm text-[#4b5563] hover:bg-[#fafafa]"
                          >
                            Edit
                          </button>
                        )}

                        {hasPermission("users.suspend") && (
                          <button
                            onClick={() => handleSuspendToggle(user)}
                            disabled={actionLoadingId === user.id}
                            className="rounded-lg border border-[#ffd8c9] px-3 py-1.5 text-sm text-[#ff6f3d] hover:bg-[#fff5f0] disabled:opacity-70"
                          >
                            {actionLoadingId === user.id
                              ? "Updating..."
                              : user.status === "active"
                              ? "Suspend"
                              : "Activate"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {users.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-6 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
            <h2 className="text-2xl font-semibold text-[#1f2430]">Create User</h2>
            <p className="mt-1 text-sm text-[#6b7280]">
              Add a new user to the platform.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#404756]">
                  Name
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Enter full name"
                  className="w-full rounded-xl border border-[#e5e7eb] bg-white px-4 py-3 text-[15px] text-[#1f2430] placeholder:text-[#9ca3af] outline-none transition focus:border-[#ff7a45] focus:ring-4 focus:ring-[#ff7a45]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#404756]">
                  Email
                </label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="Enter email"
                  className="w-full rounded-xl border border-[#e5e7eb] bg-white px-4 py-3 text-[15px] text-[#1f2430] placeholder:text-[#9ca3af] outline-none transition focus:border-[#ff7a45] focus:ring-4 focus:ring-[#ff7a45]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#404756]">
                  Password
                </label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, password: e.target.value }))
                  }
                  placeholder="Enter password"
                  className="w-full rounded-xl border border-[#e5e7eb] bg-white px-4 py-3 text-[15px] text-[#1f2430] placeholder:text-[#9ca3af] outline-none transition focus:border-[#ff7a45] focus:ring-4 focus:ring-[#ff7a45]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#404756]">
                  Role
                </label>
                <select
                  value={createForm.role}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, role: e.target.value }))
                  }
                  className="w-full rounded-xl border border-[#e5e7eb] bg-white px-4 py-3 text-[15px] text-[#1f2430] outline-none transition focus:border-[#ff7a45] focus:ring-4 focus:ring-[#ff7a45]/10"
                >
                  <option value="agent">Agent</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                  <option value="customer">Customer</option>
                </select>
              </div>

              {createError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {createError}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  resetCreateForm();
                }}
                className="rounded-xl px-4 py-2 text-sm font-medium text-[#4b5563] transition hover:bg-[#f7f7f7]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCreateUser}
                disabled={creatingUser}
                className="rounded-xl bg-[#ff6f3d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#ff6224] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {creatingUser ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
            <h2 className="text-2xl font-semibold text-[#1f2430]">Edit User</h2>
            <p className="mt-1 text-sm text-[#6b7280]">
              Update user name, email, and role.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#404756]">
                  Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Enter full name"
                  className="w-full rounded-xl border border-[#e5e7eb] bg-white px-4 py-3 text-[15px] text-[#1f2430] placeholder:text-[#9ca3af] outline-none transition focus:border-[#ff7a45] focus:ring-4 focus:ring-[#ff7a45]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#404756]">
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="Enter email"
                  className="w-full rounded-xl border border-[#e5e7eb] bg-white px-4 py-3 text-[15px] text-[#1f2430] placeholder:text-[#9ca3af] outline-none transition focus:border-[#ff7a45] focus:ring-4 focus:ring-[#ff7a45]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#404756]">
                  Role
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, role: e.target.value }))
                  }
                  className="w-full rounded-xl border border-[#e5e7eb] bg-white px-4 py-3 text-[15px] text-[#1f2430] outline-none transition focus:border-[#ff7a45] focus:ring-4 focus:ring-[#ff7a45]/10"
                >
                  <option value="agent">Agent</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                  <option value="customer">Customer</option>
                </select>
              </div>

              {editError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {editError}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  resetEditForm();
                }}
                className="rounded-xl px-4 py-2 text-sm font-medium text-[#4b5563] transition hover:bg-[#f7f7f7]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleEditUser}
                disabled={updatingUser}
                className="rounded-xl bg-[#ff6f3d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#ff6224] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {updatingUser ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}