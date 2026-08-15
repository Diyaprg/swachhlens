"use client";

import dynamic from "next/dynamic";

const Map = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[650px] items-center justify-center bg-gray-100">
      <p className="text-gray-500">
        Loading map...
      </p>
    </div>
  ),
});

export default function MapWrapper() {
  return <Map />;
}