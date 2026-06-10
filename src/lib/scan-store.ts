// Tiny in-memory store for selected files + analysis results.
// Files can't be JSON-serialized into sessionStorage, so we keep them in memory
// and persist only the JSON results across the analyzing → result navigation.

export type SlotKey = "side" | "front" | "foot";

export const SLOT_META: Record<
  SlotKey,
  { title: string; subtitle: string; endpoint: string; cameraLabel: string }
> = {
  side: {
    title: "真横の姿勢",
    subtitle: "横向きの姿勢を撮影",
    endpoint: "http://127.0.0.1:8000/analyze-side",
    cameraLabel: "姿勢  -右側面-",
  },
  front: {
    title: "正面の姿勢",
    subtitle: "真正面の姿勢を撮影",
    endpoint: "http://127.0.0.1:8000/analyze-front",
    cameraLabel: "姿勢  -正面-",
  },
  foot: {
    title: "足指の写真",
    subtitle: "真上からの足の写真を撮影",
    endpoint: "http://127.0.0.1:8000/analyze",
    cameraLabel: "足  -真上-",
  },
};

export type FrontResult = {
  score: number;
  judge: string;
  gravity_text: string;
  gravity_rate: number;
  left_leg_type: string;
  right_leg_type: string;
  o_rate: number;
  x_rate: number;
  comment: string;
};

export type SideResult = {
  score: number;
  judge: string;
  posture_type: string;
  pelvis_type: string;
  knee_type: string;
  comment: string;
};

export type FootResult = {
  score: number;
  foot_age: number;
  hallux_right: number;
  hallux_left: number;
  tailor_right: number;
  tailor_left: number;
  splay_right: number;
  splay_left: number;
  comment: string;
  articles: { title: string; url: string }[];
};

export type Combined = {
  side?: SideResult;
  front?: FrontResult;
  foot?: FootResult;
  previews: Partial<Record<SlotKey, string>>; // data URLs for result screen
};

type FileMap = Partial<Record<SlotKey, File>>;

const g = globalThis as unknown as {
  __scanFiles?: FileMap;
  __scanPreviews?: Partial<Record<SlotKey, string>>;
};

if (!g.__scanFiles) g.__scanFiles = {};
if (!g.__scanPreviews) g.__scanPreviews = {};

export const scanFiles = {
  set(key: SlotKey, file: File, preview: string) {
    g.__scanFiles![key] = file;
    g.__scanPreviews![key] = preview;
  },
  clear(key: SlotKey) {
    delete g.__scanFiles![key];
    delete g.__scanPreviews![key];
  },
  get(key: SlotKey) {
    return g.__scanFiles![key];
  },
  all(): FileMap {
    return { ...g.__scanFiles };
  },
  previews(): Partial<Record<SlotKey, string>> {
    return { ...g.__scanPreviews };
  },
  reset() {
    g.__scanFiles = {};
    g.__scanPreviews = {};
  },
};

export const RESULT_KEY = "yoshiro:result";
