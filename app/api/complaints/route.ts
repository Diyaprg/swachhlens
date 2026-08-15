import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { classifyWasteImage } from "@/lib/gemini";
import { runDecisionEngine } from "@/decision-engine";
import type {
  Complaint,
  ComplaintInput,
} from "@/types/complaint";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<ComplaintInput>;

    // Validate required fields
    if (
      !body.imageBase64 ||
      !body.imageMimeType ||
      typeof body.lat !== "number" ||
      typeof body.lng !== "number"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "imageBase64, imageMimeType, lat and lng are required.",
        },
        { status: 400 }
      );
    }

    // Validate coordinates
    if (
      body.lat < -90 ||
      body.lat > 90 ||
      body.lng < -180 ||
      body.lng > 180
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid latitude or longitude.",
        },
        { status: 400 }
      );
    }

    // Step 1: AI only classifies the image
    const classification = await classifyWasteImage(
      body.imageBase64,
      body.imageMimeType
    );

    const complaintRef = db.collection("complaints").doc();

    const now = new Date().toISOString();

    // Step 2: Run the decision engine
    const decision = await runDecisionEngine({
      wasteType: classification.wasteType,
      sizeCategory: classification.sizeCategory,
      lat: body.lat,
      lng: body.lng,
      createdAt: now,
      reportCount: 1,
    });

    // Step 3: If duplicate, increase the original report count
    if (decision.isDuplicate && decision.duplicateOf) {
      const duplicateRef = db
        .collection("complaints")
        .doc(decision.duplicateOf);

      const duplicateSnapshot = await duplicateRef.get();

      if (duplicateSnapshot.exists) {
        const duplicateData =
          duplicateSnapshot.data() as Complaint;

        await duplicateRef.update({
          reportCount: (duplicateData.reportCount || 1) + 1,
        });
      }
    }

    // Step 4: Create the complaint document
    const complaint: Complaint = {
      id: complaintRef.id,

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

      createdAt: now,
    };

    await complaintRef.set(complaint);

    return NextResponse.json(
      {
        success: true,
        complaint,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Complaint creation error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create complaint.",
      },
      { status: 500 }
    );
  }
}