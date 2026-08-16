import MapWrapper from "./MapWrapper";
import ComplaintList from "./ComplaintList";
export default function LocationsPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-green-600">
            Municipal Control Center
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Complaint Locations
          </h1>

          <p className="mt-2 text-gray-600">
            View reported waste complaints on the map.
          </p>
        </div>

        <MapWrapper />
        <ComplaintList />
      </div>
    </main>
  );
}