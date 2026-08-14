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

    const result = await classifyWasteImage(
      body.imageBase64,
      body.imageMimeType
    );

    return NextResponse.json({
      success: true,
      classification: result,
    });
  } catch (error) {
    console.error("AI classification error:", error);

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