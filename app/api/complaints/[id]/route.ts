import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.status) {
      return NextResponse.json(
        {
          success: false,
          error: "Status is required",
        },
        { status: 400 }
      );
    }

    const allowedStatuses = ["open", "in_progress", "resolved"];

    if (!allowedStatuses.includes(body.status)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid status",
        },
        { status: 400 }
      );
    }

    const complaintRef = db.collection("complaints").doc(id);

    const complaintDoc = await complaintRef.get();

    if (!complaintDoc.exists) {
      return NextResponse.json(
        {
          success: false,
          error: "Complaint not found",
        },
        { status: 404 }
      );
    }

    await complaintRef.update({
      status: body.status,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Complaint status updated successfully",
      complaintId: id,
      status: body.status,
    });
  } catch (error) {
    console.error("Update complaint error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update complaint",
      },
      { status: 500 }
    );
  }
}
