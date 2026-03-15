"use client";

import { usePermissions } from "@/context/permission-context";

export default function TasksPage() {
  const { hasPermission, loading } = usePermissions();

  if (loading) {
    return (
      <main className="p-6 md:p-8">
        <div className="rounded-[28px] bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
          <p className="text-[#6b7280]">Loading tasks page...</p>
        </div>
      </main>
    );
  }

  if (!hasPermission("tasks.view")) {
    return (
      <main className="p-6 md:p-8">
        <div className="rounded-[28px] bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
          <h1 className="text-2xl font-semibold text-[#1f2430]">403 Forbidden</h1>
          <p className="mt-2 text-[#6b7280]">
            You do not have permission to view the Tasks page.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 md:p-8">
      <section className="rounded-[28px] bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-[#ff6f3d]">Tasks Module</p>
            <h1 className="mt-2 text-3xl font-semibold text-[#1f2430]">Tasks</h1>
            <p className="mt-2 text-[#6b7280]">
              Track assignments, follow-ups, and workspace activity.
            </p>
          </div>

          <button className="rounded-2xl bg-[#ff6f3d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#ff6224]">
            Add Task
          </button>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            {
              title: "Call about proposal",
              priority: "Urgent",
              client: "Bluestone",
            },
            {
              title: "Send onboarding docs",
              priority: "High",
              client: "Tech Ltd.",
            },
            {
              title: "Follow up with Mira",
              priority: "Low",
              client: "Omar Rahman",
            },
          ].map((task) => (
            <div
              key={task.title}
              className="rounded-3xl border border-[#f0f0f0] p-6"
            >
              <h2 className="text-lg font-semibold text-[#1f2430]">{task.title}</h2>
              <p className="mt-2 text-sm text-[#6b7280]">Client: {task.client}</p>

              <div className="mt-4">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    task.priority === "Urgent"
                      ? "bg-red-100 text-red-700"
                      : task.priority === "High"
                      ? "bg-pink-100 text-pink-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {task.priority}
                </span>
              </div>

              <div className="mt-6 h-2 rounded-full bg-[#f1f1f1]">
                <div className="h-2 w-1/2 rounded-full bg-[#ff8a3d]" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}