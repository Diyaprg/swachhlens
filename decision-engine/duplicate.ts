import { db } from "@/lib/firebase-admin";
import type { WasteType } from "@/types/complaint";

interface DuplicateInput {
  wasteType: WasteType;
  lat: number;
  lng: number;
  createdAt: string;
}

export interface DuplicateResult {
  isDuplicate: boolean;
  duplicateOf: string | null;
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function distanceInMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const earthRadius = 6371000;

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
}

export async function findDuplicate(
  input: DuplicateInput
): Promise<DuplicateResult> {
  const cutoffTime = new Date(
    Date.now() - 48 * 60 * 60 * 1000
  );

  const snapshot = await db
    .collection("complaints")
    .where("wasteType", "==", input.wasteType)
    .where("status", "!=", "resolved")
    .get();

  for (const doc of snapshot.docs) {
    const complaint = doc.data();

    const complaintCreatedAt = new Date(
      complaint.createdAt
    );

    if (complaintCreatedAt < cutoffTime) {
      continue;
    }

    const distance = distanceInMeters(
      input.lat,
      input.lng,
      complaint.lat,
      complaint.lng
    );

    if (distance <= 100) {
      return {
        isDuplicate: true,
        duplicateOf: doc.id,
      };
    }
  }

  return {
    isDuplicate: false,
    duplicateOf: null,
  };
}