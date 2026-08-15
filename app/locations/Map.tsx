
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

type Priority = "critical" | "high" | "medium" | "low";
type FilterType = "all" | Priority;

interface Complaint {
  id: string;
  latitude: number;
  longitude: number;
  priority: Priority;
  wasteType?: string;
  description?: string;
  status?: string;
  createdAt?: string;
}

interface MarkerComplaint extends Complaint {
  displayLatitude: number;
  displayLongitude: number;
}

const COLORS: Record<Priority, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#22c55e",
};

const CENTER: [number, number] = [20.2961, 85.8245];

/* =========================
   MAP RESIZE HANDLER
========================= */

function AutoResize() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();

    const resizeObserver = new ResizeObserver(() => {
      const width = container.clientWidth;
      const height = container.clientHeight;

      if (width > 0 && height > 0) {
        map.invalidateSize(true);
      }
    });

    resizeObserver.observe(container);

    const timer = setTimeout(() => {
      map.invalidateSize(true);
    }, 300);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(timer);
    };
  }, [map]);

  return null;
}

/* =========================
   MAIN MAP
========================= */

export default function ComplaintMap() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  /* =========================
     LOAD COMPLAINTS
  ========================= */

  useEffect(() => {
    async function loadComplaints() {
      try {
        setLoading(true);

        const response = await fetch("/api/complaints", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch complaints");
        }

        const data = await response.json();

        console.log("MAP DATA:", data);

        const list: any[] = Array.isArray(data)
          ? data
          : Array.isArray(data.complaints)
          ? data.complaints
          : Array.isArray(data.data)
          ? data.data
          : [];

        /* =========================
           NORMALIZE DATA
        ========================= */

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

            status:
              item.status ??
              "open",

            createdAt:
              item.createdAt ??
              item.created_at ??
              "",
          });
        });

        console.log(
          "VALID COMPLAINTS:",
          normalized.length
        );

        setComplaints(normalized);
      } catch (error) {
        console.error(
          "Complaint loading error:",
          error
        );

        setComplaints([]);
      } finally {
        setLoading(false);
      }
    }

    loadComplaints();
  }, []);

  /* =========================
     UPDATE STATUS
  ========================= */

  async function updateComplaintStatus(
    complaintId: string,
    newStatus: string
  ) {
    try {
      setUpdatingId(complaintId);

      const response = await fetch(
        `/api/complaints/${complaintId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to update status"
        );
      }

      setComplaints(
        (currentComplaints) =>
          currentComplaints.map(
            (complaint) =>
              complaint.id === complaintId
                ? {
                    ...complaint,
                    status: newStatus,
                  }
                : complaint
          )
      );

      console.log(
        "STATUS UPDATED:",
        complaintId,
        newStatus
      );
    } catch (error) {
      console.error(
        "Status update error:",
        error
      );

      alert(
        "Failed to update complaint status."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  /* =========================
     FILTER
  ========================= */

  const filteredComplaints = useMemo(() => {
    if (filter === "all") {
      return complaints;
    }

    return complaints.filter(
      (complaint) =>
        complaint.priority === filter
    );
  }, [complaints, filter]);

  /* =========================
     HANDLE SAME LOCATIONS
  ========================= */

  const markerPositions =
    useMemo<MarkerComplaint[]>(() => {
      const counts = new Map<string, number>();

      return filteredComplaints.map(
        (complaint) => {
          const key =
            `${complaint.latitude.toFixed(6)},` +
            `${complaint.longitude.toFixed(6)}`;

          const count =
            counts.get(key) ?? 0;

          counts.set(key, count + 1);

          if (count === 0) {
            return {
              ...complaint,
              displayLatitude:
                complaint.latitude,
              displayLongitude:
                complaint.longitude,
            };
          }

          const angle =
            count * (Math.PI / 3);

          const offset = 0.00012;

          return {
            ...complaint,

            displayLatitude:
              complaint.latitude +
              Math.sin(angle) * offset,

            displayLongitude:
              complaint.longitude +
              Math.cos(angle) * offset,
          };
        }
      );
    }, [filteredComplaints]);

  /* =========================
     PRIORITY COUNTS
  ========================= */

  const priorityCounts = useMemo(() => {
    const counts = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    complaints.forEach((complaint) => {
      counts[complaint.priority]++;
    });

    return counts;
  }, [complaints]);

  /* =========================
     STATUS COUNTS
  ========================= */

  const statusCounts = useMemo(() => {
    const counts = {
      open: 0,
      in_progress: 0,
      resolved: 0,
    };

    complaints.forEach((complaint) => {
      const status = complaint.status;

      if (status === "in_progress") {
        counts.in_progress++;
      } else if (status === "resolved") {
        counts.resolved++;
      } else {
        counts.open++;
      }
    });

    return counts;
  }, [complaints]);

  /* =========================
     UI
  ========================= */

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-lg">

      {/* HEADER */}

      <div className="border-b px-6 py-5">
        <h2 className="text-xl font-bold text-gray-900">
          Waste Complaint Map
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Complaint locations and priority levels
        </p>
      </div>

      {/* MAP */}

      <div
        className="relative w-full"
        style={{ height: 650 }}
      >

        <MapContainer
          center={CENTER}
          zoom={13}
          scrollWheelZoom={true}
          style={{
            width: "100%",
            height: "100%",
          }}
        >

          <AutoResize />

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* COMPLAINT MARKERS */}

          {markerPositions.map(
            (complaint) => {
              const color =
                COLORS[complaint.priority];

              return (
                <CircleMarker
                  key={complaint.id}
                  center={[
                    complaint.displayLatitude,
                    complaint.displayLongitude,
                  ]}
                  radius={12}
                  pathOptions={{
                    color: "#ffffff",
                    weight: 3,
                    fillColor: color,
                    fillOpacity: 1,
                  }}
                >

                  <Popup>

                    <div className="min-w-[220px]">

                      <h3 className="mb-2 text-base font-bold">
                        Waste Complaint
                      </h3>

                      <p className="mb-1">
                        <strong>
                          Priority:
                        </strong>{" "}

                        <span
                          style={{
                            color,
                            fontWeight: "bold",
                          }}
                        >
                          {complaint.priority.toUpperCase()}
                        </span>
                      </p>

                      <p className="mb-1">
                        <strong>
                          Waste:
                        </strong>{" "}

                        {complaint.wasteType ||
                          "mixed"}
                      </p>

                      {complaint.description && (
                        <p className="mb-1">
                          <strong>
                            Description:
                          </strong>{" "}

                          {complaint.description}
                        </p>
                      )}

                      {/* STATUS */}

                      <div className="mt-3">

                        <p className="mb-1">
                          <strong>
                            Status:
                          </strong>
                        </p>

                        <select
                          value={
                            complaint.status ||
                            "open"
                          }
                          disabled={
                            updatingId ===
                            complaint.id
                          }
                          onChange={(event) =>
                            updateComplaintStatus(
                              complaint.id,
                              event.target.value
                            )
                          }
                          className="w-full rounded-md border border-gray-300 px-2 py-2 text-sm"
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

                        {updatingId ===
                          complaint.id && (
                          <p className="mt-1 text-xs text-gray-500">
                            Updating status...
                          </p>
                        )}

                      </div>

                      {/* LOCATION */}

                      <p className="mt-2 text-xs text-gray-500">
                        {complaint.latitude.toFixed(
                          6
                        )}
                        ,{" "}
                        {complaint.longitude.toFixed(
                          6
                        )}
                      </p>

                    </div>

                  </Popup>

                </CircleMarker>
              );
            }
          )}

        </MapContainer>

        {/* SHOWING */}

        <div className="absolute left-5 top-5 z-[1000] rounded-xl bg-white px-5 py-3 shadow-lg">

          <p className="text-xs text-gray-500">
            Showing
          </p>

          <p className="text-2xl font-bold text-gray-900">
            {loading
              ? "..."
              : filteredComplaints.length}
          </p>

          <p className="text-xs text-gray-500">
            complaints
          </p>

        </div>

        {/* FILTER */}

        <div className="absolute right-5 top-5 z-[1000] rounded-xl bg-white p-4 shadow-lg">

          <p className="mb-2 font-bold text-gray-900">
            Filter Priority
          </p>

          <select
            value={filter}
            onChange={(event) =>
              setFilter(
                event.target.value as FilterType
              )
            }
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none"
          >

            <option value="all">
              All
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

        {/* LEGEND */}

        <div className="absolute bottom-5 right-5 z-[1000] rounded-xl bg-white p-4 shadow-lg">

          <p className="mb-3 font-bold text-gray-900">
            Priority
          </p>

          <div className="space-y-2 text-sm">

            <div className="flex items-center gap-2">

              <span
                className="h-4 w-4 rounded-full"
                style={{
                  backgroundColor:
                    COLORS.critical,
                }}
              />

              <span>
                Critical
              </span>

              <span className="ml-auto text-gray-500">
                {priorityCounts.critical}
              </span>

            </div>

            <div className="flex items-center gap-2">

              <span
                className="h-4 w-4 rounded-full"
                style={{
                  backgroundColor:
                    COLORS.high,
                }}
              />

              <span>
                High
              </span>

              <span className="ml-auto text-gray-500">
                {priorityCounts.high}
              </span>

            </div>

            <div className="flex items-center gap-2">

              <span
                className="h-4 w-4 rounded-full"
                style={{
                  backgroundColor:
                    COLORS.medium,
                }}
              />

              <span>
                Medium
              </span>

              <span className="ml-auto text-gray-500">
                {priorityCounts.medium}
              </span>

            </div>

            <div className="flex items-center gap-2">

              <span
                className="h-4 w-4 rounded-full"
                style={{
                  backgroundColor:
                    COLORS.low,
                }}
              />

              <span>
                Low
              </span>

              <span className="ml-auto text-gray-500">
                {priorityCounts.low}
              </span>

            </div>

          </div>

        </div>

      </div>

      {/* STATUS SUMMARY */}

      <div className="grid grid-cols-1 gap-4 border-t bg-gray-50 p-5 sm:grid-cols-3">

        <div className="rounded-xl bg-white p-4 shadow-sm">

          <p className="text-sm text-gray-500">
            Open
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900">
            {statusCounts.open}
          </p>

        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">

          <p className="text-sm text-gray-500">
            In Progress
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900">
            {statusCounts.in_progress}
          </p>

        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">

          <p className="text-sm text-gray-500">
            Resolved
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900">
            {statusCounts.resolved}
          </p>

        </div>

      </div>

    </div>
  );
}

