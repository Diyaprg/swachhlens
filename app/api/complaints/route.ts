import { NextRequest, NextResponse } from "next/server";
import { classifyWasteImage } from "@/lib/gemini";
import { db } from "@/lib/firebase-admin";
import { runDecisionEngine } from "@/lib/decision-engine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate image
    if (!body.imageBase64 || !body.imageMimeType) {
      return NextResponse.json(
        {
          success: false,
          error: "imageBase64 and imageMimeType are required",
        },
        { status: 400 }
      );
    }

    // Validate location
    if (
      typeof body.lat !== "number" ||
      typeof body.lng !== "number"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Valid latitude and longitude are required",
        },
        { status: 400 }
      );
    }

    console.log("Starting Gemini classification...");

    // Gemini classification
    const classification = await classifyWasteImage(
      body.imageBase64,
      body.imageMimeType
    );

    console.log("Gemini classification:", classification);

    const createdAt = new Date().toISOString();

    // Decision Engine
    const decision = await runDecisionEngine({
      wasteType: classification.wasteType,
      sizeCategory: classification.sizeCategory,
      lat: body.lat,
      lng: body.lng,
      createdAt,
      reportCount: 1,
    });

    console.log("Decision engine result:", decision);

    // Complaint object
    const complaint = {
      wasteType: classification.wasteType,
      sizeCategory: classification.sizeCategory,

      aiConfidence: classification.confidence,
      aiDescription: classification.description,

      lat: body.lat,
      lng: body.lng,

      comment: body.comment || "",

      volumeScore: decision.volumeScore,
      locationScore: decision.locationScore,
      frequencyScore: decision.frequencyScore,
      ageScore: decision.ageScore,

      priorityScore: decision.priorityScore,
      priorityLevel: decision.priorityLevel,

      recommendedAction: decision.recommendedAction,

      isDuplicate: decision.isDuplicate,
      duplicateOf: decision.duplicateOf,

      reportCount: 1,

      status: "open",

      createdAt,
    };

    // Save to Firebase
    const docRef = await db
      .collection("complaints")
      .add(complaint);

    console.log("Complaint saved:", docRef.id);

    return NextResponse.json({
      success: true,
      complaintId: docRef.id,
      classification,
      decision,
    });
  } catch (error) {
    console.error("Complaint submission error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Complaint submission failed",
      },
      { status: 500 }
    );
  }
}

// ==========================================
// GET ALL COMPLAINTS
// ==========================================

export async function GET() {
  try {
    const snapshot = await db
      .collection("complaints")
      .orderBy("createdAt", "desc")
      .get();

    const complaints = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      complaints,
    });
  } catch (error) {
    console.error("Fetching complaints error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch complaints",
      },
      { status: 500 }
    );
  }
}