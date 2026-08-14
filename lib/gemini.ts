import { GoogleGenAI } from "@google/genai";
import type {
  AIClassification,
  WasteType,
  SizeCategory,
} from "@/types/complaint";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not configured");
}

const ai = new GoogleGenAI({
  apiKey,
});

const allowedWasteTypes: WasteType[] = [
  "plastic",
  "organic",
  "e_waste",
  "hazardous",
  "illegal_dump",
  "drain_blockage",
  "construction",
  "mixed",
  "other",
];

const allowedSizes: SizeCategory[] = [
  "small",
  "medium",
  "large",
];

export async function classifyWasteImage(
  imageBase64: string,
  mimeType: string
): Promise<AIClassification> {
  const prompt = `
You are a waste classification system for SwachhLens, a municipal waste reporting platform.

Analyze the provided image.

Return ONLY valid JSON.

The JSON must have exactly these fields:

{
  "wasteType": "...",
  "sizeCategory": "...",
  "confidence": 0.0,
  "description": "..."
}

wasteType MUST be exactly one of:

plastic
organic
e_waste
hazardous
illegal_dump
drain_blockage
construction
mixed
other

sizeCategory MUST be exactly one of:

small
medium
large

confidence must be a number between 0 and 1.

description should briefly describe what is visible in the image.

Do NOT determine urgency.
Do NOT determine priority.
Do NOT recommend an action.

Only classify what is visible.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType,
              data: imageBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    ],
  });

  const text = response.text?.trim();

  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  // Remove markdown code fences if Gemini adds them.
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  let result: AIClassification;

  try {
    result = JSON.parse(cleaned);
  } catch {
    throw new Error("Gemini returned invalid JSON");
  }

  if (!allowedWasteTypes.includes(result.wasteType)) {
    result.wasteType = "other";
  }

  if (!allowedSizes.includes(result.sizeCategory)) {
    result.sizeCategory = "medium";
  }

  result.confidence = Math.max(
    0,
    Math.min(1, Number(result.confidence) || 0)
  );

  result.description =
    typeof result.description === "string"
      ? result.description
      : "Waste detected in submitted image.";

  return result;
}