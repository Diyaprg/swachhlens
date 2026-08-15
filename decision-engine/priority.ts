import type { PriorityLevel, SizeCategory, WasteType } from "@/types/complaint";

interface PriorityInput {
  wasteType: WasteType;
  sizeCategory: SizeCategory;
  reportCount: number;
  createdAt: string;
}

export interface PriorityResult {
  volumeScore: number;
  locationScore: number;
  frequencyScore: number;
  ageScore: number;
  priorityScore: number;
  priorityLevel: PriorityLevel;
}

function calculateVolumeScore(sizeCategory: SizeCategory): number {
  switch (sizeCategory) {
    case "large":
      return 35;
    case "medium":
      return 25;
    case "small":
      return 15;
    default:
      return 15;
  }
}

function calculateFrequencyScore(reportCount: number): number {
  if (reportCount >= 5) return 20;
  if (reportCount >= 3) return 15;
  if (reportCount >= 2) return 10;
  return 5;
}

function calculateAgeScore(createdAt: string): number {
  const createdTime = new Date(createdAt).getTime();
  const now = Date.now();

  const ageHours = Math.max(0, (now - createdTime) / (1000 * 60 * 60));

  if (ageHours >= 48) return 20;
  if (ageHours >= 24) return 15;
  if (ageHours >= 6) return 10;
  return 5;
}

function calculateLocationScore(wasteType: WasteType): number {
  if (wasteType === "hazardous") return 25;
  if (wasteType === "e_waste") return 23;
  if (wasteType === "drain_blockage") return 22;

  return 15;
}

export function calculatePriority(
  input: PriorityInput
): PriorityResult {
  const volumeScore = calculateVolumeScore(input.sizeCategory);

  const frequencyScore = calculateFrequencyScore(
    input.reportCount
  );

  const ageScore = calculateAgeScore(input.createdAt);

  const locationScore = calculateLocationScore(
    input.wasteType
  );

  let priorityScore =
    volumeScore +
    locationScore +
    frequencyScore +
    ageScore;

  // Hazardous, e-waste and drain blockage get maximum priority.
  if (
    input.wasteType === "hazardous" ||
    input.wasteType === "e_waste" ||
    input.wasteType === "drain_blockage"
  ) {
    priorityScore = 100;
  }

  let priorityLevel: PriorityLevel;

  if (priorityScore >= 80) {
    priorityLevel = "critical";
  } else if (priorityScore >= 60) {
    priorityLevel = "high";
  } else if (priorityScore >= 40) {
    priorityLevel = "medium";
  } else {
    priorityLevel = "low";
  }

  return {
    volumeScore,
    locationScore,
    frequencyScore,
    ageScore,
    priorityScore,
    priorityLevel,
  };
}