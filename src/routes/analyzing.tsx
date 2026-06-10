import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, Settings } from "lucide-react";
import styles from "./analyzing.module.css";
import {
  MODE_META,
  SLOT_META,
  scanFiles,
  type Combined,
} from "@/lib/scan-store";

export const Route = createFileRoute("/analyzing")({
  head: () => ({ meta: [{ title: "YOSHIRO AI — 解析中" }] }),
  component: AnalyzingScreen,
});

function AnalyzingScreen() {
  const navigate = useNavigate();
  const [pct, setPct] = useState(5);
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const mode = scanFiles.getMode();
    const slots = MODE_META[mode].slots;
    const files = scanFiles.all();
    if (!slots.every((k) => files[k])) {
      navigate({ to: "/" });
      return;
    }

    const start = Date.now();
    const interval = window.setInterval(() => {
      const elapsed = Date.now() - start;
      setPct((p) => (p >= 90 ? p : Math.min(90, Math.floor(15 + elapsed / 60))));
    }, 120);

    const run = async () => {
      try {
        const responses = await Promise.all(
          slots.map(async (key) => {
            const fd = new FormData();
            fd.append("image", files[key]!);
            const url = SLOT_META[key].endpoint;
            const res = await fetch(url, { method: "POST", body: fd });
            if (!res.ok) {
              const t = await res.text();
              throw new Error(`${key}: ${res.status} ${t.slice(0, 120)}`);
            }
            return [key, await res.json()] as const;
          }),
        );

        const combined: Combined = { mode, previews: scanFiles.previews() };
        for (const [k, d] of responses) (combined as any)[k] = d;
        scanFiles.setResult(combined);
        setPct(100);
        window.setTimeout(() => navigate({ to: "/summary" }), 350);
      } catch (e) {
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
    <div style={{ background: "#0f1114", minHeight: "100vh", padding: "16px 0" }}>
      <div className={styles.analyzing}>
        <button
          className={styles.backButton}
          onClick={() => navigate({ to: "/" })}
          aria-label="戻る"
        >
          <ChevronLeft size={22} />
        </button>
        <button className={styles.setting} aria-label="設定">
          <Settings size={20} />
        </button>

        <div className={styles.title}>YOSHIRO AI</div>
        <div className={styles.heading}>解析中...</div>

        <div className={styles.orb} />

        <div className={styles.sliderWrap}>
          <div className={styles.track} />
          <div className={styles.fill} style={{ width: `calc(${pct}% - 2px)` }} />
        </div>
        <div className={styles.pct}>{pct}%</div>

        {error && (
          <div role="alert" className={styles.error}>
            {error}
            <div style={{ marginTop: 10 }}>
              <Link to="/">戻る</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
