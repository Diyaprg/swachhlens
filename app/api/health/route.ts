import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "SwachhLens API is running",
    phase: "Phase 1",
  });
}