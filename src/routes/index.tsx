import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Settings, Plus, Check, ChevronDown } from "lucide-react";
import {
  MODE_META,
  SLOT_META,
  type Mode,
  type SlotKey,
  scanFiles,
} from "@/lib/scan-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "YOSHIRO AI — 姿勢解析" },
      { name: "description", content: "姿勢と足の写真をアップロードしてAI解析を開始します。" },
    ],
  }),
  component: HomeScreen,
});

const MODES: { key: Mode; label: string }[] = [
  { key: "full", label: "総合解析" },
  { key: "front", label: "正面" },
  { key: "side", label: "真横" },
  { key: "foot", label: "足指" },
];

const MODE_HINT: Record<Mode, string> = {
  full: "正面・真横・足指の3枚を解析",
  front: "正面の姿勢のみを解析",
  side: "真横の姿勢のみを解析",
  foot: "足指のみを解析",
};

function HomeScreen() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>(scanFiles.getMode());
  const [filled, setFilled] = useState<Record<SlotKey, boolean>>({
    side: false,
    front: false,
    foot: false,
  });
  const inputs = {
    side: useRef<HTMLInputElement>(null),
    front: useRef<HTMLInputElement>(null),
    foot: useRef<HTMLInputElement>(null),
  };

  useEffect(() => {
    const current = scanFiles.all();
    setFilled({
      side: !!current.side,
      front: !!current.front,
      foot: !!current.foot,
    });
  }, []);

  useEffect(() => {
    scanFiles.setMode(mode);
  }, [mode]);

  const activeSlots = useMemo(() => MODE_META[mode].slots, [mode]);
  const allReady = activeSlots.every((k) => filled[k]);

  const onPick = (key: SlotKey, file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      scanFiles.set(key, file, reader.result as string);
      setFilled((s) => ({ ...s, [key]: true }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <main className="min-h-screen px-6 py-10 max-w-md mx-auto flex flex-col text-foreground">
      <header className="relative flex items-center justify-center mb-8">
        <h1 className="text-lg font-medium tracking-[0.15em]">YOSHIRO AI</h1>
        <button
          aria-label="Settings"
          className="neu-sm absolute right-0 size-12 grid place-items-center rounded-full"
        >
          <Settings className="size-5 text-muted-foreground" />
        </button>
      </header>

      {/* Mode tabs */}
      <div className="neu-inset rounded-full p-1.5 grid grid-cols-4 gap-1 mb-8">
        {MODES.map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            className={`h-9 rounded-full text-xs font-medium tracking-wider transition-all ${
              mode === m.key
                ? "bg-[var(--accent-cyan)] text-[var(--primary-foreground)] shadow-[0_6px_14px_-6px_var(--accent-cyan)]"
                : "text-muted-foreground"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground mb-6">{MODE_HINT[mode]}</p>



      {/* Upload card */}
      <section className="neu p-6 rounded-3xl">
        <div className="flex items-center justify-between mb-7">
          <h2 className="text-base font-semibold">写真をアップロードする</h2>
          <button
            aria-label="Collapse"
            className="neu-sm size-10 rounded-full grid place-items-center"
          >
            <ChevronDown className="size-4 text-muted-foreground" />
          </button>
        </div>

        <ul className="flex flex-col gap-7">
          {activeSlots.map((key) => {
            const meta = SLOT_META[key];
            const done = filled[key];
            return (
              <li key={key} className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">
                    {meta.title}
                  </p>
                  <p className="text-xs text-foreground/80 mt-1">{meta.subtitle}</p>
                </div>
                <button
                  onClick={() => inputs[key].current?.click()}
                  aria-label={`Upload ${meta.title}`}
                  className={`size-14 rounded-full grid place-items-center transition-all ${
                    done
                      ? "bg-[var(--accent-cyan)] text-[var(--primary-foreground)] shadow-[0_8px_20px_-8px_var(--accent-cyan)]"
                      : "neu-sm text-[var(--accent-cyan)]"
                  }`}
                >
                  {done ? (
                    <Check className="size-6" strokeWidth={3} />
                  ) : (
                    <Plus className="size-6" strokeWidth={2.5} />
                  )}
                </button>
                <input
                  ref={inputs[key]}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  hidden
                  onChange={(e) => onPick(key, e.target.files?.[0] ?? null)}
                />
              </li>
            );
          })}
        </ul>
      </section>

      <div className="flex-1 min-h-12" />

      <button
        disabled={!allReady}
        onClick={() => navigate({ to: "/analyzing" })}
        className={`mx-auto mb-2 h-14 w-64 rounded-full font-semibold tracking-[0.2em] text-sm transition-all ${
          allReady
            ? "bg-[var(--accent-cyan)] text-[var(--primary-foreground)] shadow-[0_10px_30px_-10px_var(--accent-cyan)]"
            : "neu-inset text-muted-foreground cursor-not-allowed"
        }`}
      >
        解析開始
      </button>
    </main>
  );
}
