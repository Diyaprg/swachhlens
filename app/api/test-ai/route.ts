import { NextRequest, NextResponse } from "next/server";
import { classifyWasteImage } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.imageBase64 || !body.imageMimeType) {
      return NextResponse.json(
        {
          success: false,
          error: "imageBase64 and imageMimeType are required",
        },
        { status: 400 }
      );
    }

    console.log("Starting AI test...");

    const classification = await classifyWasteImage(
      body.imageBase64,
      body.imageMimeType
    );

    console.log("AI classification:", classification);

    return NextResponse.json({
      success: true,
      classification,
    });
  } catch (error) {
    console.error("AI test error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "AI classification failed",
      },
      { status: 500 }
    );
  }
}