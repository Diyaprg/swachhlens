"use client";

import { useState } from "react";

export default function ReportPage() {
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [locationLoading, setLocationLoading] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");

  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [submittedData, setSubmittedData] = useState<{
    photoName: string;
    latitude: number | null;
    longitude: number | null;
    comment: string;
    createdAt: string;
  } | null>(null);

  // Handle photo selection
  const handlePhotoChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setPhoto(file);

    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);

    setSubmitted(false);
  };

  // Get user's current location
  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage(
        "❌ Geolocation is not supported by this browser."
      );
      return;
    }

    setLocationLoading(true);
    setLocationMessage("📍 Detecting your location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setLatitude(lat);
        setLongitude(lng);

        setLocationLoading(false);
        setLocationMessage("✅ Location captured successfully!");
      },
      (error) => {
        console.error(error);

        setLocationLoading(false);
        setLocationMessage(
          "❌ Unable to get location. Please allow location permission."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Submit report
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!photo) {
      alert("Please upload a waste photo.");
      return;
    }

    if (latitude === null || longitude === null) {
      alert("Please capture your location.");
      return;
    }

    const createdAt = new Date().toISOString();

    const reportData = {
      photoName: photo.name,
      latitude,
      longitude,
      comment,
      createdAt,
    };

    console.log("SwachhLens Report:", reportData);

    setSubmittedData(reportData);
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 text-gray-900">
      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-3 text-5xl">♻️</div>

          <h1 className="text-3xl font-bold text-gray-900">
            SwachhLens
          </h1>

          <p className="mt-2 text-gray-600">
            Report waste issues in your area
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl bg-white p-6 shadow-lg">

          <form onSubmit={handleSubmit} className="space-y-7">

            {/* PHOTO SECTION */}
            <section>
              <h2 className="mb-3 text-xl font-semibold text-gray-900">
                📷 Waste Photo
              </h2>

              <label
                htmlFor="photo"
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-green-400 bg-green-50 p-8 transition hover:bg-green-100"
              >
                <div className="mb-3 text-4xl">📸</div>

                <p className="font-semibold text-gray-800">
                  Take a photo or choose an image
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Upload a clear photo of the waste issue
                </p>

                <input
                  id="photo"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>

              {/* Image Preview */}
              {preview && (
                <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
                  <img
                    src={preview}
                    alt="Waste preview"
                    className="max-h-80 w-full object-cover"
                  />

                  <div className="bg-gray-50 p-3 text-sm text-gray-600">
                    📄 {photo?.name}
                  </div>
                </div>
              )}
            </section>

            {/* LOCATION SECTION */}
            <section>
              <h2 className="mb-3 text-xl font-semibold text-gray-900">
                📍 Location
              </h2>

              <div className="rounded-xl bg-gray-100 p-4">

                {latitude !== null && longitude !== null ? (
                  <div>
                    <p className="font-semibold text-green-700">
                      ✅ Location captured
                    </p>

                    <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-lg bg-white p-3">
                        <p className="text-gray-500">Latitude</p>
                        <p className="font-semibold text-gray-900">
                          {latitude.toFixed(6)}
                        </p>
                      </div>

                      <div className="rounded-lg bg-white p-3">
                        <p className="text-gray-500">Longitude</p>
                        <p className="font-semibold text-gray-900">
                          {longitude.toFixed(6)}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600">
                    Location has not been captured yet.
                  </p>
                )}

                <button
                  type="button"
                  onClick={getLocation}
                  disabled={locationLoading}
                  className="mt-4 w-full rounded-xl bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {locationLoading
                    ? "📍 Detecting Location..."
                    : "📍 Get My Current Location"}
                </button>

                {locationMessage && (
                  <p className="mt-3 text-center text-sm text-gray-700">
                    {locationMessage}
                  </p>
                )}
              </div>
            </section>

            {/* TIMESTAMP */}
            <section>
              <h2 className="mb-3 text-xl font-semibold text-gray-900">
                🕐 Timestamp
              </h2>

              <div className="rounded-xl bg-gray-100 p-4 text-gray-700">
                Automatically captured when the report is submitted.
              </div>
            </section>

            {/* COMMENT */}
            <section>
              <label
                htmlFor="comment"
                className="mb-3 block text-xl font-semibold text-gray-900"
              >
                💬 Comment
              </label>

              <textarea
                id="comment"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Describe the waste issue..."
                rows={5}
                className="w-full resize-none rounded-xl border border-gray-300 bg-white p-4 text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
              />

              <p className="mt-2 text-right text-sm text-gray-500">
                {comment.length}/500
              </p>
            </section>

            {/* SUBMIT */}
            <button
              type="submit"
              className="w-full rounded-xl bg-green-600 px-6 py-4 text-lg font-bold text-white shadow-md transition hover:bg-green-700 active:scale-[0.99]"
            >
              🚮 Submit Waste Report
            </button>

          </form>

          {/* SUCCESS MESSAGE */}
          {submitted && submittedData && (
            <div className="mt-6 rounded-xl border border-green-300 bg-green-50 p-5">

              <div className="mb-4 flex items-center gap-3">
                <span className="text-3xl">✅</span>

                <div>
                  <h3 className="text-lg font-bold text-green-800">
                    Waste report submitted successfully!
                  </h3>

                  <p className="text-sm text-green-700">
                    Your report has been captured.
                  </p>
                </div>
              </div>

              <div className="space-y-2 rounded-lg bg-white p-4 text-sm">

                <p>
                  <strong>📷 Photo:</strong>{" "}
                  {submittedData.photoName}
                </p>

                <p>
                  <strong>📍 Latitude:</strong>{" "}
                  {submittedData.latitude?.toFixed(6)}
                </p>

                <p>
                  <strong>📍 Longitude:</strong>{" "}
                  {submittedData.longitude?.toFixed(6)}
                </p>

                <p>
                  <strong>💬 Comment:</strong>{" "}
                  {submittedData.comment || "No comment provided"}
                </p>

                <p>
                  <strong>🕐 Submitted:</strong>{" "}
                  {new Date(
                    submittedData.createdAt
                  ).toLocaleString()}
                </p>

              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-500">
          SwachhLens • AI-powered waste response system
        </p>

      </div>
    </main>
  );
}