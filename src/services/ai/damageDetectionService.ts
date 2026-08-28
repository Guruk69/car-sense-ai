import type { DamageType, DetectionResult, Severity } from "@/types";

const API_URL = import.meta.env['VITE_AI_API_URL'] as string | undefined;

export function isRealInferenceConfigured(): boolean {
  return Boolean(API_URL);
}

export function inferenceModeLabel(): string {
  return isRealInferenceConfigured() ? "YOLOv8 API" : "Demo inference";
}

interface ApiDetection {
  class: DamageType;
  confidence: number;
  severity: Severity;
  part: string;
  bbox: { x: number; y: number; width: number; height: number };
}

interface ApiResponse {
  success: boolean;
  detections: ApiDetection[];
  error?: string;
}

export class DamageDetectionError extends Error {}

async function readImageSize(file: File): Promise<{ width: number; height: number }> {
  const url = URL.createObjectURL(file);
  try {
    const bitmap = await createImageBitmap(file);
    return { width: bitmap.width, height: bitmap.height };
  } catch {
    return await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => resolve({ width: 1024, height: 768 });
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Deterministic pseudo-random generator so a given image always yields the same demo result. */
function seededRandom(seed: number) {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

const DEMO_PARTS: Record<DamageType, string[]> = {
  dent: ["front_door", "rear_door", "bonnet", "fender", "rear_bumper"],
  scratch: ["rear_bumper", "front_door", "front_bumper", "rear_door", "bonnet"],
  crack: ["windshield", "front_bumper", "headlight", "rear_bumper"],
  broken_part: ["headlight", "tail_light", "side_mirror", "front_bumper"],
};

const DAMAGE_TYPES: DamageType[] = ["dent", "scratch", "crack", "broken_part"];
const SEVERITIES: Severity[] = ["minor", "moderate", "severe"];

function mockDetect(file: File, width: number, height: number): DetectionResult {
  const random = seededRandom(file.size + file.name.length * 977 + 13);
  const count = 1 + Math.floor(random() * 2.4);
  const detections = Array.from({ length: count }, () => {
    const damageType = DAMAGE_TYPES[Math.floor(random() * DAMAGE_TYPES.length)]!;
    const severity = SEVERITIES[Math.floor(random() * SEVERITIES.length)]!;
    const parts = DEMO_PARTS[damageType];
    const part = parts[Math.floor(random() * parts.length)]!;
    const boxWidth = width * (0.16 + random() * 0.24);
    const boxHeight = height * (0.14 + random() * 0.22);
    return {
      class: damageType,
      severity,
      part,
      confidence: Number((0.74 + random() * 0.22).toFixed(2)),
      bbox: {
        x: Math.round(random() * (width - boxWidth)),
        y: Math.round(random() * (height - boxHeight)),
        width: Math.round(boxWidth),
        height: Math.round(boxHeight),
      },
    };
  });

  return { success: true, detections, source: "mock", imageWidth: width, imageHeight: height };
}

/**
 * Single abstraction the UI talks to.
 * Mock mode is used until VITE_AI_API_URL points at the YOLOv8 inference backend
 * (POST /api/detect-damage, multipart/form-data field "image").
 */
export async function detectDamage(file: File): Promise<DetectionResult> {
  const { width, height } = await readImageSize(file);

  if (!API_URL) {
    await new Promise((resolve) => setTimeout(resolve, 900));
    return mockDetect(file, width, height);
  }

  const form = new FormData();
  form.append("image", file);

  let payload: ApiResponse;
  try {
    const response = await fetch(`${API_URL.replace(/\/$/, "")}/api/detect-damage`, {
      method: "POST",
      body: form,
    });
    if (!response.ok) {
      throw new DamageDetectionError(`Inference service responded with ${response.status}`);
    }
    payload = (await response.json()) as ApiResponse;
  } catch (error) {
    throw new DamageDetectionError(
      error instanceof DamageDetectionError
        ? error.message
        : "Damage analysis is temporarily unavailable.",
    );
  }

  if (!payload.success) {
    throw new DamageDetectionError(payload.error ?? "Damage analysis is temporarily unavailable.");
  }

  return {
    success: true,
    detections: payload.detections ?? [],
    source: "api",
    imageWidth: width,
    imageHeight: height,
  };
}
