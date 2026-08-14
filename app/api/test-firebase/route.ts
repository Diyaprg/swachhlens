import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const testRef = db.collection("test").doc("connection");

    await testRef.set({
      message: "Firebase connection successful",
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Firebase is working!",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Firebase connection failed",
      },
      { status: 500 }
    );
  }
}