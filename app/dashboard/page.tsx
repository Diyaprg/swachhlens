"use client";

import { useEffect, useState } from "react";

interface Complaint {
  id: string;
  wasteType: string;
  sizeCategory: string;
  lat: number;
  lng: number;
  priorityScore: number;
  priorityLevel: string;
  recommendedAction: string;
  status: string;
  isDuplicate: boolean;
  duplicateOf: string | null;
  reportCount: number;
  aiConfidence: number;
  aiDescription: string;
  comment: string;
  createdAt: string;
}

export default function Dashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchComplaints();
  }, []);

  async function fetchComplaints() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/complaints");

      if (!response.ok) {
        throw new Error("Failed to fetch complaints");
      }

      const data = await response.json();

      if (data.success) {
        setComplaints(data.complaints || []);
      } else {
        throw new Error(data.error || "Failed to fetch complaints");
      }
    } catch (error) {
      console.error(error);
      setError("Unable to load complaints");
    } finally {
      setLoading(false);
    }
  }

  async function updateComplaintStatus(
    complaintId: string,
    status: string
  ) {
    try {
      const response = await fetch(
        `/api/complaints/${complaintId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      setComplaints((prev) =>
        prev.map((complaint) =>
          complaint.id === complaintId
            ? { ...complaint, status }
            : complaint
        )
      );
    } catch (error) {
      console.error(error);
      alert("Failed to update status");
    }
  }

  const totalReports = complaints.length;

  const criticalReports = complaints.filter(
    (c) => c.priorityLevel === "critical"
  ).length;

  const highPriority = complaints.filter(
    (c) =>
      c.priorityLevel === "high" ||
      c.priorityLevel === "critical"
  ).length;

  const openReports = complaints.filter(
    (c) => c.status === "open"
  ).length;

  const inProgress = complaints.filter(
    (c) => c.status === "in_progress"
  ).length;

  const resolvedReports = complaints.filter(
    (c) => c.status === "resolved"
  ).length;

  function formatWasteType(type: string) {
    return type
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function formatStatus(status: string) {
    if (status === "in_progress") return "In Progress";

    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  function getPriorityStyle(priority: string) {
    switch (priority) {
      case "critical":
        return "bg-red-50 text-red-700 border-red-200";

      case "high":
        return "bg-orange-50 text-orange-700 border-orange-200";

      case "medium":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";

      default:
        return "bg-green-50 text-green-700 border-green-200";
    }
  }

  function getStatusStyle(status: string) {
    switch (status) {
      case "resolved":
        return "bg-green-50 text-green-700 border-green-200";

      case "in_progress":
        return "bg-blue-50 text-blue-700 border-blue-200";

      default:
        return "bg-orange-50 text-orange-700 border-orange-200";
    }
  }

  return (
    <main className="min-h-screen bg-slate-100">

      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 bg-white shadow-lg lg:block">

        <div className="flex h-20 items-center border-b px-6">
          <div>
            <h1 className="text-xl font-bold text-green-700">
              🌿 SwachhLens
            </h1>

            <p className="text-xs text-gray-500">
              Smart Waste Management
            </p>
          </div>
        </div>

        <nav className="p-4">

          <div className="rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
            📊 Dashboard
          </div>

          <div className="mt-2 rounded-xl px-4 py-3 text-sm text-gray-600 hover:bg-gray-50">
            🗑️ Complaints
          </div>

          <div className="mt-2 rounded-xl px-4 py-3 text-sm text-gray-600 hover:bg-gray-50">
            📍 Locations
          </div>

          <div className="mt-2 rounded-xl px-4 py-3 text-sm text-gray-600 hover:bg-gray-50">
            📈 Analytics
          </div>

        </nav>

        <div className="absolute bottom-0 w-full border-t p-5">
          <p className="text-xs text-gray-400">
            Municipal Control Center
          </p>

          <p className="mt-1 text-sm font-semibold text-gray-700">
            Admin Dashboard
          </p>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <section className="lg:ml-64">

        {/* TOP BAR */}
        <header className="border-b bg-white px-6 py-5 lg:px-8">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-sm font-medium text-green-600">
                MUNICIPAL CONTROL CENTER
              </p>

              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                Waste Management Dashboard
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Monitor, prioritize and resolve citizen waste complaints.
              </p>
            </div>

            <button
              onClick={fetchComplaints}
              className="rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
            >
              ↻ Refresh Data
            </button>

          </div>

        </header>

        <div className="p-6 lg:p-8">

          {/* ERROR */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* STAT CARDS */}
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">

            {/* TOTAL */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-gray-500">
                    Total Reports
                  </p>

                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {loading ? "..." : totalReports}
                  </p>
                </div>

                <div className="rounded-xl bg-green-50 p-3 text-xl">
                  📋
                </div>

              </div>
            </div>

            {/* CRITICAL */}
            <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-gray-500">
                    Critical
                  </p>

                  <p className="mt-2 text-3xl font-bold text-red-600">
                    {loading ? "..." : criticalReports}
                  </p>
                </div>

                <div className="rounded-xl bg-red-50 p-3 text-xl">
                  🚨
                </div>

              </div>
            </div>

            {/* HIGH */}
            <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-gray-500">
                    High Priority
                  </p>

                  <p className="mt-2 text-3xl font-bold text-orange-600">
                    {loading ? "..." : highPriority}
                  </p>
                </div>

                <div className="rounded-xl bg-orange-50 p-3 text-xl">
                  ⚠️
                </div>

              </div>
            </div>

            {/* OPEN */}
            <div className="rounded-2xl border border-yellow-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-gray-500">
                    Open
                  </p>

                  <p className="mt-2 text-3xl font-bold text-yellow-600">
                    {loading ? "..." : openReports}
                  </p>
                </div>

                <div className="rounded-xl bg-yellow-50 p-3 text-xl">
                  🕐
                </div>

              </div>
            </div>

            {/* RESOLVED */}
            <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-gray-500">
                    Resolved
                  </p>

                  <p className="mt-2 text-3xl font-bold text-green-600">
                    {loading ? "..." : resolvedReports}
                  </p>
                </div>

                <div className="rounded-xl bg-green-50 p-3 text-xl">
                  ✓
                </div>

              </div>
            </div>

          </div>

          {/* QUICK SUMMARY */}
          <div className="mt-6 grid gap-5 md:grid-cols-3">

            <div className="rounded-2xl bg-gradient-to-r from-green-600 to-green-500 p-6 text-white shadow-sm">
              <p className="text-sm text-green-100">
                Resolution Progress
              </p>

              <p className="mt-2 text-3xl font-bold">
                {totalReports
                  ? Math.round(
                      (resolvedReports / totalReports) * 100
                    )
                  : 0}
                %
              </p>

              <div className="mt-4 h-2 rounded-full bg-green-400">
                <div
                  className="h-2 rounded-full bg-white"
                  style={{
                    width: `${
                      totalReports
                        ? (resolvedReports / totalReports) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">
                In Progress
              </p>

              <p className="mt-2 text-3xl font-bold text-blue-600">
                {loading ? "..." : inProgress}
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Complaints currently being handled
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">
                Critical Attention
              </p>

              <p className="mt-2 text-3xl font-bold text-red-600">
                {loading ? "..." : criticalReports}
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Require immediate municipal action
              </p>
            </div>

          </div>

          {/* COMPLAINT TABLE */}
          <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

            <div className="flex flex-col gap-3 border-b px-6 py-5 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Waste Complaints
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Latest complaints received from citizens
                </p>
              </div>

              <div className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-600">
                {totalReports} Reports
              </div>

            </div>

            {loading ? (
              <div className="p-12 text-center text-gray-500">
                Loading complaints...
              </div>
            ) : complaints.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                No complaints found.
              </div>
            ) : (

              <div className="overflow-x-auto">

                <table className="w-full min-w-[1100px]">

                  <thead className="bg-slate-50">

                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">

                      <th className="px-6 py-4">
                        Waste Issue
                      </th>

                      <th className="px-6 py-4">
                        Priority
                      </th>

                      <th className="px-6 py-4">
                        Score
                      </th>

                      <th className="px-6 py-4">
                        Location
                      </th>

                      <th className="px-6 py-4">
                        Status
                      </th>

                      <th className="px-6 py-4">
                        Reports
                      </th>

                      <th className="px-6 py-4">
                        Date
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-gray-100">

                    {complaints.map((complaint) => (

                      <tr
                        key={complaint.id}
                        className="transition hover:bg-gray-50"
                      >

                        {/* WASTE */}
                        <td className="px-6 py-5">

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
                              🗑️
                            </div>

                            <div>

                              <p className="font-semibold text-gray-900">
                                {formatWasteType(
                                  complaint.wasteType
                                )}
                              </p>

                              <p className="text-sm text-gray-500">
                                {formatWasteType(
                                  complaint.sizeCategory
                                )} volume
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* PRIORITY */}
                        <td className="px-6 py-5">

                          <span
                            className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${getPriorityStyle(
                              complaint.priorityLevel
                            )}`}
                          >
                            {formatWasteType(
                              complaint.priorityLevel
                            )}
                          </span>

                        </td>

                        {/* SCORE */}
                        <td className="px-6 py-5">

                          <div className="font-bold text-gray-900">
                            {complaint.priorityScore}
                            <span className="font-normal text-gray-400">
                              {" "}
                              / 100
                            </span>
                          </div>

                          <div className="mt-2 h-1.5 w-20 rounded-full bg-gray-200">

                            <div
                              className={`h-1.5 rounded-full ${
                                complaint.priorityLevel ===
                                "critical"
                                  ? "bg-red-500"
                                  : complaint.priorityLevel ===
                                    "high"
                                  ? "bg-orange-500"
                                  : "bg-yellow-500"
                              }`}
                              style={{
                                width: `${Math.min(
                                  complaint.priorityScore,
                                  100
                                )}%`,
                              }}
                            />

                          </div>

                        </td>

                        {/* LOCATION */}
                        <td className="px-6 py-5">

                          <p className="text-sm font-medium text-gray-700">
                            📍 {complaint.lat.toFixed(5)}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {complaint.lng.toFixed(5)}
                          </p>

                        </td>

                        {/* STATUS */}
                        <td className="px-6 py-5">

                          <select
                            value={complaint.status}
                            onChange={(e) =>
                              updateComplaintStatus(
                                complaint.id,
                                e.target.value
                              )
                            }
                            className={`rounded-lg border px-3 py-2 text-xs font-semibold outline-none ${getStatusStyle(
                              complaint.status
                            )}`}
                          >

                            <option value="open">
                              Open
                            </option>

                            <option value="in_progress">
                              In Progress
                            </option>

                            <option value="resolved">
                              Resolved
                            </option>

                          </select>

                        </td>

                        {/* REPORTS */}
                        <td className="px-6 py-5">

                          <p className="font-semibold text-gray-900">
                            {complaint.reportCount}
                          </p>

                          {complaint.isDuplicate && (
                            <span className="text-xs font-medium text-blue-600">
                              Duplicate
                            </span>
                          )}

                        </td>

                        {/* DATE */}
                        <td className="whitespace-nowrap px-6 py-5 text-sm text-gray-500">

                          {new Date(
                            complaint.createdAt
                          ).toLocaleString()}

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </div>

      </section>

    </main>
  );
}