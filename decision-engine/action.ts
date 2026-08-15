import type { WasteType } from "@/types/complaint";

export function getRecommendedAction(
  wasteType: WasteType
): string {
  switch (wasteType) {
    case "hazardous":
      return "Immediate hazmat escalation and safe removal.";

    case "e_waste":
      return "Assign authorized e-waste collection team.";

    case "drain_blockage":
      return "Dispatch drainage and sanitation team immediately.";

    case "illegal_dump":
      return "Assign cleanup crew and investigate illegal dumping.";

    case "construction":
      return "Assign construction-waste cleanup team.";

    case "plastic":
      return "Assign solid waste or recycling collection team.";

    case "organic":
      return "Assign organic waste collection team.";

    case "mixed":
      return "Assign general waste cleanup crew.";

    default:
      return "Assign appropriate municipal cleanup team.";
  }
}