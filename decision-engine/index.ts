import type {
  SizeCategory,
  WasteType,
} from "@/types/complaint";

import { findDuplicate } from "./duplicate";
import { calculatePriority } from "./priority";
import { getRecommendedAction } from "./action";

interface DecisionInput {
  wasteType: WasteType;
  sizeCategory: SizeCategory;
  lat: number;
  lng: number;
  createdAt: string;
  reportCount: number;
}

export async function runDecisionEngine(
  input: DecisionInput
) {
  const duplicate = await findDuplicate({
    wasteType: input.wasteType,
    lat: input.lat,
    lng: input.lng,
    createdAt: input.createdAt,
  });

  const priority = calculatePriority({
    wasteType: input.wasteType,
    sizeCategory: input.sizeCategory,
    reportCount: input.reportCount,
    createdAt: input.createdAt,
  });

  const recommendedAction = getRecommendedAction(
    input.wasteType
  );

  return {
    ...duplicate,
    ...priority,
    recommendedAction,
  };
}