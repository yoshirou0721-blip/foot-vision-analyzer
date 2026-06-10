import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, Settings } from "lucide-react";
import styles from "./result.module.css";
import {
  scanFiles,
  type Combined,
  type FootResult,
  type FrontResult,
  type SideResult,
} from "@/lib/scan-store";

export const Route = createFileRoute("/result")({
  head: () => ({ meta: [{ title: "YOSHIRO AI — 解析結果" }] }),
  component: ResultScreen,
});

function severity(deg: number): "ok" | "mid" | "high" {
  if (deg < 15) return "ok";
  if (deg < 30) return "mid";
  return "high";
}

function ResultScreen() {
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

  const postureScores = [data.front?.score, data.side?.score].filter(
    (n): n is number => typeof n === "number",
  );
  const postureScore = postureScores.length
    ? Math.round(postureScores.reduce((a, b) => a + b, 0) / postureScores.length)
    : 0;

  return (
    <div style={{ background: "#0f1114", minHeight: "100vh", padding: "16px 0" }}>
      <div className={styles.result}>
        <div className={styles.neonBackground} />
        <div className={styles.neonBackground2} />

        {/* Header */}
        <div className={styles.title}>詳細結果</div>
        <button
          className={`${styles.navBtn} ${styles.navLeft}`}
          onClick={() => navigate({ to: "/" })}
          aria-label="戻る"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          className={`${styles.navBtn} ${styles.navRight}`}
          aria-label="設定"
        >
          <Settings size={18} />
        </button>

        {/* Score reference table */}
        <div className={styles.refCard} />
        <div className={styles.refTitle}>姿勢スコア基準表</div>
        {[
          { left: 13, bg: "rgba(117,126,149,0.5)", label: "~59", sub: "深刻な歪み" },
          { left: 90, bg: "rgba(117,126,149,0.5)", label: "~69", sub: "要ケア" },
          { left: 162, bg: "rgba(233,234,240,0.5)", label: "~79", sub: "惜しい" },
          { left: 234, bg: "rgba(255,255,255,0.69)", label: "~89", sub: "良い姿勢" },
          {
            left: 306,
            bg: "linear-gradient(180deg, rgba(47,184,255,0.5), rgba(158,236,217,0.5))",
            label: "~100",
            sub: "美姿勢",
          },
        ].map((t) => (
          <div
            key={t.label}
            className={styles.refTile}
            style={{ left: t.left, background: t.bg }}
          >
            <b>{t.label}</b>
            <small>{t.sub}</small>
          </div>
        ))}

        {/* Posture score battery */}
        <PostureBattery score={postureScore} />
        <div className={styles.scoreText}>
          <b>{postureScore}</b>
          <span>点</span>
        </div>

        {/* Front body + markers */}
        {data.front && (
          <FrontSection result={data.front} preview={data.previews.front} />
        )}

        {/* Front comment */}
        {data.front && (
          <CommentCard top={1078} title="姿勢コメント" body={data.front.comment} />
        )}

        {/* Side body + markers */}
        {data.side && (
          <SideSection result={data.side} preview={data.previews.side} />
        )}

        {/* Side comment */}
        {data.side && (
          <CommentCard top={1937} title="姿勢コメント" body={data.side.comment} />
        )}

        {/* Foot age battery */}
        {data.foot && <FootAgeBattery age={data.foot.foot_age} />}

        {/* Foot photo + metrics */}
        {data.foot && <FootSection result={data.foot} preview={data.previews.foot} />}

        {/* Foot comment */}
        {data.foot && (
          <CommentCard top={3036} title="足指コメント" body={data.foot.comment} tall />
        )}

        {/* Articles */}
        {data.foot?.articles && data.foot.articles.length > 0 && (
          <div className={styles.articlesWrap}>
            <div className={styles.articlesHeader}>おすすめ記事</div>
            {data.foot.articles.slice(0, 6).map((a, i) => (
              <a key={i} href={a.url} className={styles.articleRow} target="_blank" rel="noreferrer">
                <span className={styles.articleTitle}>{a.title}</span>
                <span className={styles.articleArrow}>›</span>
              </a>
            ))}
          </div>
        )}

        {/* CTA */}
        <button className={styles.cta} onClick={() => navigate({ to: "/" })}>
          もう一度分析する
        </button>
      </div>
    </div>
  );
}

function PostureBattery({ score }: { score: number }) {
  const pct = Math.max(4, Math.min(100, score));
  return (
    <div className={styles.battery}>
      <div className={styles.batteryLabel}>姿勢スコア</div>
      <div className={styles.batteryBase}>
        <div className={styles.batteryFill} style={{ width: `calc(${pct}% - 8px)` }} />
      </div>
    </div>
  );
}

function FootAgeBattery({ age }: { age: number }) {
  const pct = Math.max(4, Math.min(100, 100 - age));
  return (
    <div className={styles.batteryParent}>
      <div className={styles.battery} style={{ position: "absolute", top: 0, left: 0 }}>
        <div className={styles.batteryLabel}>足指年齢</div>
        <div className={styles.batteryBase}>
          <div className={styles.batteryFill} style={{ width: `calc(${pct}% - 8px)` }} />
        </div>
      </div>
      <div className={styles.scoreText} style={{ top: 23, left: 80, right: "auto" }}>
        <b>{age}</b>
        <span>歳</span>
      </div>
      <div className={styles.passLine}>
        <span>合格ライン</span>
      </div>
    </div>
  );
}

/* ============ FRONT ============ */
function FrontSection({ result, preview }: { result: FrontResult; preview?: string }) {
  // Build 5 rows mapped to the Figma slider stack.
  const rows: Array<{
    label: string;
    sub1: string;
    val1: string;
    sub2?: string;
    val2?: string;
    knobPct: number;
  }> = [
    {
      label: "頭",
      sub1: "傾き",
      val1: `${Math.round(result.gravity_rate)}%`,
      sub2: result.gravity_text,
      val2: "",
      knobPct: Math.min(100, result.gravity_rate),
    },
    {
      label: "肩",
      sub1: "ズレ",
      val1: result.judge,
      knobPct: 50,
    },
    {
      label: "腰",
      sub1: "傾き",
      val1: `${Math.round(result.o_rate)}%`,
      sub2: "O脚率",
      val2: "",
      knobPct: Math.min(100, result.o_rate),
    },
    {
      label: "膝",
      sub1: "ズレ",
      val1: result.left_leg_type,
      knobPct: 50,
    },
    {
      label: "脚",
      sub1: "傾き",
      val1: `${Math.round(result.x_rate)}%`,
      sub2: "X脚率",
      val2: "",
      knobPct: Math.min(100, result.x_rate),
    },
  ];

  const tops = [770, 803, 846, 876, 918]; // slider tops from Figma
  const labelTops = [765, 799, 838, 871, 910];

  return (
    <>
      <div className={styles.bodyFront}>
        {preview ? <img src={preview} alt="正面" /> : <div style={{width:"100%",height:"100%",background:"rgba(255,255,255,0.04)",borderRadius:12}} />}
        <div className={styles.markerR}>右</div>
        <div className={styles.markerL}>左</div>
      </div>

      {/* big judge label on right */}
      <div className={styles.rowJudge} style={{ top: 752 }}>{result.judge}</div>

      {/* Left tabs (head/shoulder/hip/knee) — 4 of 5 rows */}
      {["頭", "肩", "腰", "膝"].map((c, i) => (
        <div key={c} className={styles.rowLeftTab} style={{ top: 770 + i * 72 }}>
          {c}
        </div>
      ))}

      {/* Vertical guideline */}
      <div className={styles.vline} style={{ top: 769, left: 209, height: 273 }} />

      {rows.map((r, i) => (
        <div key={i}>
          <div className={styles.rowLabel} style={{ top: labelTops[i] }}>{r.sub1}</div>
          <div className={styles.rowSub} style={{ top: labelTops[i] + 14 }}>{r.val1}</div>
          {r.sub2 && (
            <>
              <div className={styles.rowLabel} style={{ top: labelTops[i] + 34 }}>{r.sub2}</div>
              <div className={styles.rowSub} style={{ top: labelTops[i] + 48 }}>{r.val2}</div>
            </>
          )}
          <div className={styles.sliderTrack} style={{ top: tops[i] + 6 }} />
          <div
            className={styles.knob}
            style={{
              top: tops[i] - 0.75,
              left: 82 + Math.max(0, Math.min(264, (r.knobPct / 100) * 250)),
            }}
          >
            {Math.round(r.knobPct)}
          </div>
        </div>
      ))}
    </>
  );
}

/* ============ SIDE ============ */
function SideSection({ result, preview }: { result: SideResult; preview?: string }) {
  const rows = [
    { label: "首", val: result.posture_type, knobPct: 30 },
    { label: "骨盤", val: result.pelvis_type, knobPct: 50 },
    { label: "膝", val: result.knee_type, knobPct: 70 },
  ];
  const tops = [1713, 1794, 1867];
  const labelTops = [1698, 1772, 1844];

  return (
    <>
      <div className={styles.bodySide}>
        {preview ? <img src={preview} alt="真横" /> : <div style={{width:"100%",height:"100%",background:"rgba(255,255,255,0.04)",borderRadius:12}} />}
        <div className={styles.markerR} style={{ top: 240, left: 0 }}>後</div>
        <div className={styles.markerL} style={{ top: 276, left: 145 }}>前</div>
      </div>

      <div className={styles.rowJudge} style={{ top: 1689 }}>{result.judge}</div>

      {/* Left tabs */}
      {["首", "骨盤", "膝"].map((c, i) => (
        <div
          key={c}
          className={styles.rowLeftTab}
          style={{ top: tops[i] - 15, left: 32 }}
        >
          {c}
        </div>
      ))}

      {/* Horizontal guideline */}
      <div
        className={styles.vline}
        style={{ top: 1705, left: 214, height: 183 }}
      />

      {rows.map((r, i) => (
        <div key={r.label}>
          <div className={styles.rowLabel} style={{ top: labelTops[i], left: 62 }}>傾き</div>
          <div className={styles.rowSub} style={{ top: labelTops[i], left: 88 }}>
            {r.val}
          </div>
          <div className={styles.sliderTrack} style={{ top: tops[i] + 7, left: 87 }} />
          <div
            className={`${styles.knob} ${styles.knobLg}`}
            style={{
              top: tops[i],
              left: 87 + Math.max(0, Math.min(260, (r.knobPct / 100) * 250)),
            }}
          >
            {Math.round(r.knobPct)}
          </div>
        </div>
      ))}
    </>
  );
}

/* ============ FOOT ============ */
function FootSection({ result, preview }: { result: FootResult; preview?: string }) {
  if (preview) {
    /* render */
  }
  const groups = [
    {
      title: "外反母趾",
      topLabel: 2716,
      topTrack1: 2725,
      topTrack2: 2759,
      right: result.hallux_right,
      left: result.hallux_left,
      max: 60,
      unit: "°",
    },
    {
      title: "内反小趾",
      topLabel: 2814,
      topTrack1: 2822,
      topTrack2: 2856,
      right: result.tailor_right,
      left: result.tailor_left,
      max: 60,
      unit: "°",
    },
    {
      title: "開帳足％",
      topLabel: 2912,
      topTrack1: 2920,
      topTrack2: 2954,
      right: result.splay_right,
      left: result.splay_left,
      max: 100,
      unit: "",
    },
  ];

  return (
    <>
      {preview ? (
        <img className={styles.footImg} src={preview} alt="足指" />
      ) : (
        <div className={styles.footImg} style={{ background: "rgba(255,255,255,0.04)" }} />
      )}

      {groups.map((g) => {
        const sevR = severity(g.right);
        const sevL = severity(g.left);
        const pctR = Math.min(100, (g.right / g.max) * 100);
        const pctL = Math.min(100, (g.left / g.max) * 100);
        return (
          <div key={g.title}>
            <div className={styles.footMetricLabel} style={{ top: g.topLabel }}>
              {g.title}
            </div>
            <div className={styles.severityNormal} style={{ top: g.topLabel + 57 }}>正常</div>
            <div className={styles.severitySevere} style={{ top: g.topLabel + 57 }}>重度</div>

            {/* Right */}
            <div className={styles.footSideLabel} style={{ top: g.topLabel + 5 }}>右</div>
            <div className={styles.footTrack} style={{ top: g.topTrack1 }} />
            <div
              className={`${styles.knob} ${styles.knobLg}`}
              style={{
                top: g.topTrack1 - 9,
                left: 86 + Math.max(0, Math.min(250, (pctR / 100) * 250)),
                color: sevR === "high" ? "#ff8585" : sevR === "mid" ? "#ffcc66" : undefined,
              }}
            >
              {Math.round(g.right)}{g.unit}
            </div>

            {/* Left */}
            <div className={styles.footSideLabel} style={{ top: g.topLabel + 39 }}>左</div>
            <div className={styles.footTrack} style={{ top: g.topTrack2 }} />
            <div
              className={`${styles.knob} ${styles.knobLg}`}
              style={{
                top: g.topTrack2 - 9,
                left: 86 + Math.max(0, Math.min(250, (pctL / 100) * 250)),
                color: sevL === "high" ? "#ff8585" : sevL === "mid" ? "#ffcc66" : undefined,
              }}
            >
              {Math.round(g.left)}{g.unit}
            </div>
          </div>
        );
      })}
    </>
  );
}

function CommentCard({
  top,
  title,
  body,
  tall,
}: {
  top: number;
  title: string;
  body: string;
  tall?: boolean;
}) {
  return (
    <div
      className={styles.commentCard}
      style={{ top, minHeight: tall ? 399 : 260 }}
    >
      <div className={styles.commentTitle}>{title}</div>
      <div className={styles.commentBody}>{body}</div>
    </div>
  );
}
