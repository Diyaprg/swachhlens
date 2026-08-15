"use client";

import { useEffect, useState } from "react";

type Priority = "critical" | "high" | "medium" | "low";
type Status = "open" | "in_progress" | "resolved";

interface Complaint {
  id: string;
  latitude: number;
  longitude: number;
  priority: Priority;
  wasteType?: string;
  description?: string;
  status?: Status;
  createdAt?: string;
}

const PRIORITY_COLORS: Record<Priority, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#22c55e",
};
  
function getRecommendedAction(priority: Priority) {
  switch (priority) {
    case "critical":
      return {
        title: "Immediate Action Required",
        description:
          "Dispatch a municipal response team immediately.",
      };

    case "high":
      return {
        title: "Resolve Within 24 Hours",
        description:
          "Assign the complaint to a field team as soon as possible.",
      };

    case "medium":
      return {
        title: "Schedule Collection",
        description:
          "Add this complaint to the upcoming waste collection schedule.",
      };

    case "low":
      return {
        title: "Routine Monitoring",
        description:
          "Monitor the location and handle it during routine operations.",
      };

    default:
      return {
        title: "Review Complaint",
        description:
          "Review the complaint and assign an appropriate action.",
      };
  }
}

export default function ComplaintList() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  const [priorityFilter, setPriorityFilter] =
    useState("all");

  const [statusFilter, setStatusFilter] =
    useState("all");

  useEffect(() => {
    loadComplaints();
  }, []);

  async function loadComplaints() {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/complaints",
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load complaints");
      }

      const data = await response.json();

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.complaints)
        ? data.complaints
        : Array.isArray(data.data)
        ? data.data
        : [];

const normalized: Complaint[] = [];

list.forEach((item: any, index: number) => {
  const latitude = Number(
    item.latitude ??
      item.lat ??
      item.location?.latitude ??
      item.location?.lat
  );

  const longitude = Number(
    item.longitude ??
      item.lng ??
      item.lon ??
      item.location?.longitude ??
      item.location?.lng
  );

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return;
  }

  const rawPriority = String(
    item.priority ?? "medium"
  ).toLowerCase();

  const priority: Priority =
    rawPriority === "critical" ||
    rawPriority === "high" ||
    rawPriority === "medium" ||
    rawPriority === "low"
      ? rawPriority
      : "medium";

  const rawStatus = String(
    item.status ?? "open"
  ).toLowerCase();

  const status: Status =
    rawStatus === "open" ||
    rawStatus === "in_progress" ||
    rawStatus === "resolved"
      ? rawStatus
      : "open";

  normalized.push({
    id: String(
      item.id ??
        item._id ??
        `complaint-${index}`
    ),

    latitude,
    longitude,

    priority,

    wasteType:
      item.wasteType ??
      item.waste_type ??
      "mixed",

    description:
      item.description ??
      item.comment ??
      item.comments ??
      "",

    status,

    createdAt:
      item.createdAt ??
      item.created_at ??
      "",
  });
});
      setComplaints(normalized);
    } catch (error) {
      console.error(
        "Complaint list error:",
        error
      );

      setComplaints([]);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(
    id: string,
    status: Status
  ) {
    try {
      const response = await fetch(
        `/api/complaints/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to update status"
        );
      }

      setComplaints((previous) =>
        previous.map((complaint) =>
          complaint.id === id
            ? {
                ...complaint,
                status,
              }
            : complaint
        )
      );
    } catch (error) {
      console.error(
        "Status update error:",
        error
      );

      alert(
        "Failed to update complaint status"
      );
    }
  }

  const filteredComplaints =
    complaints.filter((complaint) => {
      const priorityMatch =
        priorityFilter === "all" ||
        complaint.priority === priorityFilter;

      const statusMatch =
        statusFilter === "all" ||
        complaint.status === statusFilter;

      return priorityMatch && statusMatch;
    });

  const total = complaints.length;

  const open = complaints.filter(
    (c) => c.status === "open"
  ).length;

  const inProgress = complaints.filter(
    (c) => c.status === "in_progress"
  ).length;

  const resolved = complaints.filter(
    (c) => c.status === "resolved"
  ).length;

  return (
    <section className="mt-8">

      {/* TITLE */}

      <div className="mb-5">
        <h2 className="text-2xl font-bold text-gray-900">
          Complaint Management
        </h2>

        <p className="mt-1 text-gray-600">
          View and manage reported waste complaints.
        </p>
      </div>

      {/* STATS */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-sm text-gray-500">
            Total Reports
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {total}
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-sm text-gray-500">
            Open
          </p>

          <p className="mt-2 text-3xl font-bold text-red-500">
            {open}
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-sm text-gray-500">
            In Progress
          </p>

          <p className="mt-2 text-3xl font-bold text-orange-500">
            {inProgress}
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-sm text-gray-500">
            Resolved
          </p>

          <p className="mt-2 text-3xl font-bold text-green-500">
            {resolved}
          </p>
        </div>

      </div>

      {/* FILTERS */}

      <div className="mt-6 rounded-xl bg-white p-5 shadow">

        <div className="flex flex-col gap-4 sm:flex-row">

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Priority
            </label>

            <select
              value={priorityFilter}
              onChange={(e) =>
                setPriorityFilter(
                  e.target.value
                )
              }
              className="rounded-lg border border-gray-300 px-4 py-2"
            >
              <option value="all">
                All Priorities
              </option>

              <option value="critical">
                Critical
              </option>

              <option value="high">
                High
              </option>

              <option value="medium">
                Medium
              </option>

              <option value="low">
                Low
              </option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Status
            </label>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
              className="rounded-lg border border-gray-300 px-4 py-2"
            >
              <option value="all">
                All Status
              </option>

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
          </div>

        </div>

      </div>

      {/* COMPLAINTS */}

      <div className="mt-6 space-y-4">

        {loading ? (
          <div className="rounded-xl bg-white p-8 text-center shadow">
            <p className="text-gray-500">
              Loading complaints...
            </p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center shadow">
            <p className="text-gray-500">
              No complaints found.
            </p>
          </div>
        ) : (
          filteredComplaints.map(
            (complaint) => {

              const color =
                PRIORITY_COLORS[
                  complaint.priority
                ];

                const action = getRecommendedAction(
  complaint.priority
);

              return (
                <div
                  key={complaint.id}
                  className="rounded-xl bg-white p-5 shadow"
                >

                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                    {/* DETAILS */}

                    <div className="flex-1">

                      <div className="flex flex-wrap items-center gap-3">

                        <h3 className="font-bold text-gray-900">
                          Waste Complaint
                        </h3>

                        <span
                          className="rounded-full px-3 py-1 text-xs font-bold text-white"
                          style={{
                            backgroundColor:
                              color,
                          }}
                        >
                          {complaint.priority.toUpperCase()}
                        </span>

                      </div>

                      <div className="mt-3 grid gap-2 text-sm text-gray-600 sm:grid-cols-2">

                        <p>
                          <strong>
                            Waste:
                          </strong>{" "}
                          {complaint.wasteType}
                        </p>

                        <p>
                          <strong>
                            Status:
                          </strong>{" "}
                          {complaint.status ===
                          "in_progress"
                            ? "In Progress"
                            : complaint.status
                              ? complaint.status
                                  .charAt(0)
                                  .toUpperCase() +
                                complaint.status.slice(
                                  1
                                )
                              : "Open"}
                        </p>

                        <p>
                          <strong>
                            Location:
                          </strong>{" "}
                          {complaint.latitude.toFixed(
                            6
                          )}
                          ,{" "}
                          {complaint.longitude.toFixed(
                            6
                          )}
                        </p>

                        {complaint.description && (
                          <p className="sm:col-span-2">
                            <strong>
                              Description:
                            </strong>{" "}
                            {
                              complaint.description
                            }
                          </p>
                        )}
<div className="sm:col-span-2 mt-3 rounded-lg bg-gray-50 p-4">
  <p className="text-sm font-bold text-gray-900">
    Recommended Action
  </p>

  <p className="mt-1 text-sm font-semibold text-green-700">
    {action.title}
  </p>

  <p className="mt-1 text-sm text-gray-600">
    {action.description}
  </p>
</div>
                      </div>

                    </div>

                    {/* STATUS */}

                    <div>

                      <label className="mb-1 block text-xs font-semibold text-gray-500">
                        Update Status
                      </label>

                      <select
                        value={
                          complaint.status ??
                          "open"
                        }
                        onChange={(e) =>
                          updateStatus(
                            complaint.id,
                            e.target
                              .value as Status
                          )
                        }
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm"
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

                    </div>

                  </div>

                </div>
              );
            }
          )
        )}

      </div>

    </section>
  );
}