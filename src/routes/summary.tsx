import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, Settings } from "lucide-react";
import styles from "./summary.module.css";
import { scanFiles, type Combined } from "@/lib/scan-store";

export const Route = createFileRoute("/summary")({
  head: () => ({ meta: [{ title: "YOSHIRO AI — 解析結果" }] }),
  component: SummaryScreen,
});

function SummaryScreen() {
  const navigate = useNavigate();
  const [data, setData] = useState<Combined | null>(null);

  useEffect(() => {
    const r = scanFiles.getResult();
    if (!r) {
      navigate({ to: "/" });
      return;
    }
    setData(r);
  }, [navigate]);

  if (!data) return null;

  const scores = [data.front?.score, data.side?.score, data.foot?.score].filter(
    (n): n is number => typeof n === "number",
  );
  const overall = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;

  // STATIC Figma label fallback "猫背"; replaced by API posture_type when present.
  const postureType = data.side?.posture_type ?? data.front?.judge ?? "猫背";

  // Slider rows (Figma fixed labels). Dynamic values map to knob position only.
  const halluxMax = Math.max(
    data.foot?.hallux_left ?? 0,
    data.foot?.hallux_right ?? 0,
  );
  const tailorMax = Math.max(
    data.foot?.tailor_left ?? 0,
    data.foot?.tailor_right ?? 0,
  );

  return (
    <div style={{ background: "#0f1114", minHeight: "100vh", padding: "16px 0" }}>
      <div className={styles.summaryResult}>
        <div className={styles.neonBackground} />

        {/* Header */}
        <div className={styles.title}>解析結果</div>
        <button
          className={styles.button}
          onClick={() => navigate({ to: "/" })}
          aria-label="戻る"
        >
          <ChevronLeft size={22} />
        </button>
        <button className={styles.button2} aria-label="設定">
          <Settings size={20} />
        </button>

        {/* STATIC label */}
        <div className={styles.overallLabel}>総合評価</div>

        {/* Circular progress with API score */}
        <div className={styles.progressBar}>
          <div className={styles.ringOuter} />
          <div
            className={styles.ringArc}
            style={{ ["--arc" as string]: `${overall}%` }}
          />
          <div className={styles.ringInner} />
          <div className={styles.scoreNum}>{overall}</div>
        </div>

        {/* STATIC label + API posture type */}
        <div className={styles.postureTitle}>姿勢タイプ</div>
        <div className={styles.postureCard}>
          <div className={styles.postureValue}>{postureType}</div>
        </div>

        {/* Sliders panel — STATIC Figma row labels */}
        <div className={styles.mode}>
          <SliderRow label="姿勢" pct={clampPct(overall)} />
          <SliderRow label="外反母趾" pct={clampPct((halluxMax / 60) * 100)} />
          <SliderRow label="内反小趾" pct={clampPct((tailorMax / 60) * 100)} />
        </div>

        {/* STATIC Figma scale tick labels */}
        <div className={styles.tick} style={{ top: 533 }}>{overall}点</div>
        <div className={styles.tick} style={{ top: 551 }}>正常</div>
        <div className={styles.tick} style={{ top: 603 }}>15°</div>
        <div className={styles.tick} style={{ top: 621 }}>中等度</div>
        <div className={styles.tick} style={{ top: 690 }}>25°</div>
        <div className={styles.tick} style={{ top: 708 }}>重度</div>

        {/* CTA → /result */}
        <button className={styles.cta} onClick={() => navigate({ to: "/result" })}>
          詳細を見る
        </button>
      </div>
    </div>
  );
}

function SliderRow({ label, pct }: { label: string; pct: number }) {
  return (
    <div className={styles.row}>
      <div className={styles.rowLabel}>{label}</div>
      <div className={styles.slider}>
        <div className={styles.sliderTrack} />
        <div className={styles.sliderFill} style={{ width: `${pct}%` }} />
        <div className={styles.sliderKnob} style={{ left: `${pct}%` }} />
      </div>
    </div>
  );
}

function clampPct(n: number) {
  return Math.max(0, Math.min(100, n));
}
