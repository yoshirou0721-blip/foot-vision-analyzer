import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, Settings, MessageSquareQuote, ChevronRight, Sparkles } from "lucide-react";
import { RESULT_KEY, type Combined } from "@/lib/scan-store";

export const Route = createFileRoute("/result")({
  head: () => ({
    meta: [{ title: "YOSHIRO AI — 解析結果" }],
  }),
  component: ResultScreen,
});

function severity(deg: number): { label: string; tone: "ok" | "mid" | "high" } {
  if (deg < 15) return { label: "正常", tone: "ok" };
  if (deg < 30) return { label: "中等度", tone: "mid" };
  return { label: "重度", tone: "high" };
}

const toneClass: Record<string, string> = {
  ok: "text-[var(--accent-cyan)]",
  mid: "text-[var(--accent-warn)]",
  high: "text-[var(--accent-danger)]",
};

function ResultScreen() {
  const navigate = useNavigate();
  const [data, setData] = useState<Combined | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(RESULT_KEY);
    if (!raw) {
      navigate({ to: "/" });
      return;
    }
    try {
      setData(JSON.parse(raw) as Combined);
    } catch {
      navigate({ to: "/" });
    }
  }, [navigate]);

  if (!data) return null;

  const scores = [data.side?.score, data.front?.score, data.foot?.score].filter(
    (n): n is number => typeof n === "number",
  );
  const overall = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;

  const postureType = data.side?.posture_type ?? data.front?.judge ?? "—";

  const halluxAvg = data.foot
    ? Math.round((data.foot.hallux_left + data.foot.hallux_right) / 2)
    : null;
  const tailorAvg = data.foot
    ? Math.round((data.foot.tailor_left + data.foot.tailor_right) / 2)
    : null;

  return (
    <main className="min-h-screen px-6 py-10 max-w-md mx-auto flex flex-col gap-7 text-foreground pb-16">
      <header className="relative flex items-center justify-center">
        <Link
          to="/"
          aria-label="Back"
          className="neu-sm absolute left-0 size-12 grid place-items-center rounded-full"
        >
          <ChevronLeft className="size-5" />
        </Link>
        <h1 className="text-lg font-medium tracking-[0.15em]">解析結果</h1>
        <button className="neu-sm absolute right-0 size-12 grid place-items-center rounded-full">
          <Settings className="size-5 text-muted-foreground" />
        </button>
      </header>

      {/* Score gauge */}
      <section className="flex flex-col items-center">
        <p className="text-sm text-foreground/90 mb-3">総合評価</p>
        <ScoreRing score={overall} />
      </section>

      {/* Posture type pill */}
      <section className="flex flex-col items-center gap-3">
        <p className="text-sm text-foreground/90">姿勢タイプ</p>
        <div className="neu-inset h-14 w-full max-w-xs rounded-full grid place-items-center">
          <span className="text-lg font-semibold">{postureType}</span>
        </div>
      </section>

      {/* Analysis photos thumbnails */}
      {(data.previews.side || data.previews.front || data.previews.foot) && (
        <section className="grid grid-cols-3 gap-3">
          {(["side", "front", "foot"] as const).map((k) => {
            const src = data.previews[k];
            const label = k === "side" ? "真横" : k === "front" ? "正面" : "足指";
            return (
              <div key={k} className="neu-sm p-2 rounded-2xl">
                <div className="aspect-[3/4] rounded-xl overflow-hidden bg-black/30">
                  {src ? (
                    <img src={src} alt={label} className="size-full object-cover" />
                  ) : null}
                </div>
                <p className="text-[10px] text-center mt-2 text-muted-foreground tracking-widest">
                  {label}
                </p>
              </div>
            );
          })}
        </section>
      )}

      {/* Metric bars */}
      <section className="flex flex-col gap-6 px-1">
        {data.front && (
          <MetricBar
            label="姿勢"
            value={data.front.score}
            max={100}
            unit="点"
            severityLabel={data.front.judge}
            tone="ok"
          />
        )}
        {halluxAvg !== null && (
          <MetricBar
            label="外反母趾"
            value={halluxAvg}
            max={60}
            unit="°"
            severityLabel={severity(halluxAvg).label}
            tone={severity(halluxAvg).tone}
          />
        )}
        {tailorAvg !== null && (
          <MetricBar
            label="内反小趾"
            value={tailorAvg}
            max={60}
            unit="°"
            severityLabel={severity(tailorAvg).label}
            tone={severity(tailorAvg).tone}
          />
        )}
      </section>

      {/* Comments */}
      {data.side?.comment && <CommentCard title="姿勢コメント" body={data.side.comment} />}
      {data.front?.comment && <CommentCard title="正面コメント" body={data.front.comment} />}
      {data.foot?.comment && <CommentCard title="足コメント" body={data.foot.comment} />}

      {/* Recommended actions */}
      <RecommendedActions />

      {/* Articles */}
      {data.foot?.articles && data.foot.articles.length > 0 && (
        <section className="neu p-5 rounded-3xl">
          <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
            関連記事
          </h3>
          <ul className="flex flex-col gap-3">
            {data.foot.articles.map((a, i) => (
              <li key={i}>
                <a
                  href={a.url}
                  className="neu-sm flex items-center justify-between px-4 py-3 rounded-xl active:shadow-neu-inset"
                >
                  <span className="text-sm">{a.title}</span>
                  <ChevronRight className="size-4 text-accent-cyan" />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex justify-center pt-2">
        <button
          onClick={() => navigate({ to: "/" })}
          className="h-14 w-64 rounded-full bg-[var(--accent-cyan)] text-[var(--primary-foreground)] font-semibold tracking-[0.15em] text-sm shadow-[0_10px_30px_-10px_var(--accent-cyan)]"
        >
          詳細を見る
        </button>
      </div>

      <p className={`hidden ${toneClass.ok} ${toneClass.mid} ${toneClass.high}`} />
    </main>
  );
}

function ScoreRing({ score }: { score: number }) {
  const r = 78;
  const c = 2 * Math.PI * r;
  const dash = (Math.max(0, Math.min(100, score)) / 100) * c;
  return (
    <div className="relative size-56 grid place-items-center">
      <svg viewBox="0 0 200 200" className="size-full -rotate-90">
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.85 0.17 200)" />
            <stop offset="100%" stopColor="oklch(0.55 0.18 230)" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r={r} stroke="oklch(1 0 0 / 0.04)" strokeWidth="14" fill="none" />
        <circle
          cx="100"
          cy="100"
          r={r}
          stroke="url(#ringGrad)"
          strokeWidth="14"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${dash} ${c}`}
        />
      </svg>
      <div className="absolute inset-6 rounded-full neu-inset grid place-items-center">
        <span className="text-6xl font-bold text-[var(--accent-cyan)] tracking-tight">{score}</span>
      </div>
    </div>
  );
}

function MetricBar({
  label,
  value,
  max,
  unit,
  severityLabel,
  tone,
}: {
  label: string;
  value: number;
  max: number;
  unit: string;
  severityLabel: string;
  tone: "ok" | "mid" | "high";
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-muted-foreground w-16 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-black/40 overflow-hidden">
        <div
          className="h-full rounded-full bg-[var(--accent-cyan)] shadow-[0_0_10px_var(--accent-cyan)]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="w-16 text-right shrink-0">
        <div className="text-sm font-semibold">
          {value}
          {unit}
        </div>
        <div className={`text-[11px] ${toneClass[tone]}`}>{severityLabel}</div>
      </div>
    </div>
  );
}

function CommentCard({ title, body }: { title: string; body: string }) {
  return (
    <section className="neu p-5 rounded-3xl flex gap-4">
      <div className="neu-inset size-10 rounded-full grid place-items-center shrink-0">
        <MessageSquareQuote className="size-5 text-accent-warn" />
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
        <p className="mt-1 text-sm leading-relaxed">{body}</p>
      </div>
    </section>
  );
}

function RecommendedActions() {
  const actions = [
    { title: "ストレッチを行う", desc: "猫背改善のための胸開きストレッチ" },
    { title: "正しい靴を選ぶ", desc: "外反母趾を悪化させない靴選びのコツ" },
    { title: "足指エクササイズ", desc: "足のアーチを保つ簡単トレーニング" },
  ];
  return (
    <section className="neu p-5 rounded-3xl">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="size-4 text-accent-cyan" />
        <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          おすすめのアクション
        </h3>
      </div>
      <ul className="flex flex-col gap-3">
        {actions.map((a, i) => (
          <li
            key={i}
            className="neu-sm rounded-2xl px-4 py-3 flex items-center justify-between gap-3"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium">{a.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{a.desc}</p>
            </div>
            <ChevronRight className="size-4 text-accent-cyan shrink-0" />
          </li>
        ))}
      </ul>
    </section>
  );
}
