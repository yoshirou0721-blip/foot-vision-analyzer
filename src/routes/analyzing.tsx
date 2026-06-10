import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, Settings } from "lucide-react";
import {
  RESULT_KEY,
  SLOT_META,
  scanFiles,
  type SlotKey,
  type Combined,
} from "@/lib/scan-store";

export const Route = createFileRoute("/analyzing")({
  head: () => ({
    meta: [{ title: "YOSHIRO AI — 解析中" }],
  }),
  component: AnalyzingScreen,
});

const ORDER: SlotKey[] = ["side", "front", "foot"];

function AnalyzingScreen() {
  const navigate = useNavigate();
  const [pct, setPct] = useState(5);
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const files = scanFiles.all();
    if (!ORDER.every((k) => files[k])) {
      navigate({ to: "/" });
      return;
    }

    // Smooth progress animation up to 90% while requests run
    const start = Date.now();
    const interval = window.setInterval(() => {
      const elapsed = Date.now() - start;
      setPct((p) => {
        if (p >= 90) return p;
        const target = Math.min(90, Math.floor(15 + elapsed / 60));
        return target;
      });
    }, 120);

    const run = async () => {
      try {
        const responses = await Promise.all(
          ORDER.map(async (key) => {
            const fd = new FormData();
            fd.append("image", files[key]!);
            const url = SLOT_META[key].endpoint;
            console.log("[analyze]", key, url);
            const res = await fetch(url, { method: "POST", body: fd });
            console.log("[analyze]", key, "status", res.status);
            if (!res.ok) {
              const t = await res.text();
              throw new Error(`${key}: ${res.status} ${t.slice(0, 120)}`);
            }
            const data = await res.json();
            console.log("[analyze]", key, "data", data);
            return [key, data] as const;
          }),
        );

        const combined: Combined = { previews: scanFiles.previews() };
        for (const [k, d] of responses) (combined as any)[k] = d;
        sessionStorage.setItem(RESULT_KEY, JSON.stringify(combined));
        setPct(100);
        window.setTimeout(() => navigate({ to: "/result" }), 350);
      } catch (e) {
        console.error("[analyze] failed", e);
        setError(
          e instanceof TypeError
            ? "APIに接続できません。FastAPIサーバー (127.0.0.1:8000) が起動しているか、CORS設定をご確認ください。"
            : e instanceof Error
              ? e.message
              : "解析中にエラーが発生しました。",
        );
      } finally {
        window.clearInterval(interval);
      }
    };
    run();

    return () => window.clearInterval(interval);
  }, [navigate]);

  return (
    <main className="min-h-screen px-6 py-10 max-w-md mx-auto flex flex-col text-foreground">
      <header className="relative flex items-center justify-center mb-12">
        <Link
          to="/"
          aria-label="Back"
          className="neu-sm absolute left-0 size-12 grid place-items-center rounded-full"
        >
          <ChevronLeft className="size-5" />
        </Link>
        <h1 className="text-lg font-medium tracking-[0.2em]">YOSHIRO AI</h1>
        <button className="neu-sm absolute right-0 size-12 grid place-items-center rounded-full">
          <Settings className="size-5 text-muted-foreground" />
        </button>
      </header>

      <p className="text-center text-2xl mt-8 mb-12">解析中...</p>

      {/* Iridescent orb */}
      <div className="mx-auto relative size-56">
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,oklch(0.85_0.18_240),oklch(0.55_0.22_320)_45%,oklch(0.3_0.05_260)_75%)] blur-[2px] animate-[pulse_3s_ease-in-out_infinite]" />
        <div className="absolute inset-3 rounded-full bg-[conic-gradient(from_120deg,oklch(0.8_0.2_220),oklch(0.7_0.22_300),oklch(0.85_0.18_200),oklch(0.8_0.2_220))] mix-blend-screen opacity-90 animate-[spin_8s_linear_infinite]" />
        <div className="absolute inset-6 rounded-full bg-[radial-gradient(circle_at_70%_70%,oklch(0.95_0.05_240_/_0.5),transparent_60%)]" />
        <div className="absolute inset-0 rounded-full ring-1 ring-white/10 shadow-[0_30px_60px_-20px_oklch(0.55_0.22_300_/_0.6)]" />
      </div>

      {/* Progress bar */}
      <div className="mt-14 flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full bg-black/40 overflow-hidden shadow-inner">
          <div
            className="h-full rounded-full bg-[var(--accent-cyan)] transition-[width] duration-200 ease-out shadow-[0_0_12px_var(--accent-cyan)]"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs font-medium w-10 text-right">{pct}%</span>
      </div>

      {error && (
        <div role="alert" className="neu-inset mt-8 p-4 text-sm text-accent-warn leading-relaxed">
          {error}
          <div className="mt-3">
            <Link to="/" className="underline text-accent-cyan">
              戻る
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
