// In-memory store for selected files, analysis mode, and results.

export type SlotKey = "side" | "front" | "foot";
export type Mode = "full" | "side" | "front" | "foot";

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

export const MODE_META: Record<Mode, { label: string; slots: SlotKey[] }> = {
  full: { label: "総合解析", slots: ["side", "front", "foot"] },
  side: { label: "姿勢解析 -真横-", slots: ["side"] },
  front: { label: "姿勢解析 -正面-", slots: ["front"] },
  foot: { label: "足指解析", slots: ["foot"] },
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
  mode: Mode;
  side?: SideResult;
  front?: FrontResult;
  foot?: FootResult;
  previews: Partial<Record<SlotKey, string>>;
};

type FileMap = Partial<Record<SlotKey, File>>;

const g = globalThis as unknown as {
  __scanFiles?: FileMap;
  __scanPreviews?: Partial<Record<SlotKey, string>>;
  __scanMode?: Mode;
};

if (!g.__scanFiles) g.__scanFiles = {};
if (!g.__scanPreviews) g.__scanPreviews = {};
if (!g.__scanMode) g.__scanMode = "full";

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
  setMode(m: Mode) {
    g.__scanMode = m;
  },
  getMode(): Mode {
    return g.__scanMode ?? "full";
  },
};

export const RESULT_KEY = "yoshiro:result";
