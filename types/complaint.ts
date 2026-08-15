export type WasteType =
  | "plastic"
  | "organic"
  | "e_waste"
  | "hazardous"
  | "illegal_dump"
  | "drain_blockage"
  | "construction"
  | "mixed"
  | "other";

export type SizeCategory =
  | "small"
  | "medium"
  | "large";

export type PriorityLevel =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type ComplaintStatus =
  | "open"
  | "assigned"
  | "in_progress"
  | "resolved";

export interface Location {
  lat: number;
  lng: number;
}

export interface AIClassification {
  wasteType: WasteType;
  sizeCategory: SizeCategory;
  confidence: number;
  description: string;
}

export interface ComplaintInput {
  imageBase64: string;
  imageMimeType: string;
  lat: number;
  lng: number;
  comment?: string;
}

export interface Complaint {
  id: string;

  imageUrl?: string;

  wasteType: WasteType;
  sizeCategory: SizeCategory;

  aiConfidence: number;
  aiDescription: string;

  lat: number;
  lng: number;

  comment: string;

  volumeScore: number;
  locationScore: number;
  frequencyScore: number;
  ageScore: number;

  priorityScore: number;
  priorityLevel: PriorityLevel;

  recommendedAction: string;

  isDuplicate: boolean;
  duplicateOf: string | null;

  reportCount: number;

  status: ComplaintStatus;

  createdAt: string;
}