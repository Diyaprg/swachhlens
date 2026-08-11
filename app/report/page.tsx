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
    latitude: number;
    longitude: number;
    comment: string;
    createdAt: string;
  } | null>(null);

  // ================================
  // PHOTO CAPTURE
  // ================================

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

  // ================================
  // GPS LOCATION
  // ================================

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage(
        "❌ Geolocation is not supported by your browser."
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
        setLocationMessage(
          "✅ Location captured successfully!"
        );
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

  // ================================
  // REPORT ISSUE
  // ================================

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    // Check photo
    if (!photo) {
      alert("Please take or select a waste photo.");
      return;
    }

    // Check location
    if (latitude === null || longitude === null) {
      alert("Please capture your current location.");
      return;
    }

    // Automatically capture timestamp
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

        {/* ================================
            HEADER
        ================================= */}

        <div className="mb-8 text-center">

          <div className="mb-3 text-5xl">
            ♻️
          </div>

          <h1 className="text-3xl font-bold text-green-700">
            SwachhLens
          </h1>

          <p className="mt-2 text-gray-600">
            Report a waste issue in your area
          </p>

        </div>


        {/* ================================
            REPORT FORM
        ================================= */}

        <div className="rounded-2xl bg-white p-6 shadow-lg">

          <form
            onSubmit={handleSubmit}
            className="space-y-7"
          >

            {/* ================================
                PHOTO
            ================================= */}

            <section>

              <h2 className="mb-3 text-xl font-semibold text-gray-900">
                📷 Waste Photo
              </h2>

              <label
                htmlFor="photo"
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-green-400 bg-green-50 p-8 transition hover:bg-green-100"
              >

                <div className="mb-3 text-4xl">
                  📸
                </div>

                <p className="font-semibold text-gray-800">
                  Take a Photo / Choose Photo
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Capture a clear photo of the waste issue
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


              {/* PHOTO PREVIEW */}

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


            {/* ================================
                GPS LOCATION
            ================================= */}

            <section>

              <h2 className="mb-3 text-xl font-semibold text-gray-900">
                📍 Location
              </h2>

              <div className="rounded-xl bg-gray-100 p-4">

                {latitude !== null &&
                longitude !== null ? (

                  <div>

                    <p className="font-semibold text-green-700">
                      ✅ Location captured
                    </p>

                    <div className="mt-3 grid grid-cols-2 gap-3">

                      <div className="rounded-lg bg-white p-3">

                        <p className="text-sm text-gray-500">
                          Latitude
                        </p>

                        <p className="font-semibold text-gray-900">
                          {latitude.toFixed(6)}
                        </p>

                      </div>


                      <div className="rounded-lg bg-white p-3">

                        <p className="text-sm text-gray-500">
                          Longitude
                        </p>

                        <p className="font-semibold text-gray-900">
                          {longitude.toFixed(6)}
                        </p>

                      </div>

                    </div>

                  </div>

                ) : (

                  <p className="text-gray-600">
                    GPS location has not been captured yet.
                  </p>

                )}


                {/* LOCATION BUTTON */}

                <button
                  type="button"
                  onClick={getLocation}
                  disabled={locationLoading}
                  className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
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


            {/* ================================
                TIMESTAMP
            ================================= */}

            <section>

              <h2 className="mb-3 text-xl font-semibold text-gray-900">
                🕐 Timestamp
              </h2>

              <div className="rounded-xl bg-gray-100 p-4 text-gray-700">

                <p>
                  The current date and time will be
                  automatically captured when you report
                  the issue.
                </p>

              </div>

            </section>


            {/* ================================
                COMMENT
            ================================= */}

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
                onChange={(event) =>
                  setComment(event.target.value)
                }
                placeholder="What's happening? Describe the waste issue..."
                rows={5}
                maxLength={500}
                className="w-full resize-none rounded-xl border border-gray-300 bg-white p-4 text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
              />


              <div className="mt-2 flex justify-between">

                <p className="text-sm text-gray-500">
                  Optional
                </p>

                <p className="text-sm text-gray-500">
                  {comment.length}/500
                </p>

              </div>

            </section>


            {/* ================================
                REPORT ISSUE BUTTON
            ================================= */}

            <button
              type="submit"
              className="w-full rounded-xl bg-green-600 px-6 py-4 text-lg font-bold text-white shadow-md transition hover:bg-green-700 active:scale-[0.99]"
            >
              🚮 REPORT ISSUE
            </button>

          </form>


          {/* ================================
              SUCCESS MESSAGE
          ================================= */}

          {submitted && submittedData && (

            <div className="mt-6 rounded-xl border border-green-300 bg-green-50 p-5">

              <div className="mb-4 flex items-center gap-3">

                <span className="text-3xl">
                  ✅
                </span>

                <div>

                  <h3 className="text-lg font-bold text-green-800">
                    Report submitted successfully!
                  </h3>

                  <p className="text-sm text-green-700">
                    Your waste issue has been captured.
                  </p>

                </div>

              </div>


              {/* REPORT SUMMARY */}

              <div className="space-y-4 rounded-xl bg-white p-5 text-sm text-gray-800">

                {/* PHOTO */}

                <div>

                  <strong className="text-base">
                    📷 Photo:
                  </strong>

                  <p className="mt-1 break-all text-gray-600">
                    {submittedData.photoName}
                  </p>

                </div>


                {/* LOCATION */}

                <div>

                  <strong className="text-base">
                    📍 Location:
                  </strong>

                  <p className="mt-1 text-gray-600">
                    Latitude:{" "}
                    {submittedData.latitude.toFixed(6)}
                  </p>

                  <p className="text-gray-600">
                    Longitude:{" "}
                    {submittedData.longitude.toFixed(6)}
                  </p>

                </div>


                {/* COMMENT */}

                <div>

                  <strong className="text-base">
                    💬 Comment:
                  </strong>

                  <p className="mt-1 break-words text-gray-600">
                    {submittedData.comment ||
                      "No comment provided"}
                  </p>

                </div>


                {/* TIMESTAMP */}

                <div>

                  <strong className="text-base">
                    🕐 Reported at:
                  </strong>

                  <p className="mt-1 text-gray-600">
                    {new Date(
                      submittedData.createdAt
                    ).toLocaleString()}
                  </p>

                </div>

              </div>

            </div>

          )}

        </div>


        {/* ================================
            FOOTER
        ================================= */}

        <p className="mt-6 text-center text-sm text-gray-500">
          SwachhLens • AI-powered waste response system
        </p>

      </div>

    </main>
  );
}