import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ChevronRight, Footprints, MessageSquareQuote } from "lucide-react";

type AnalyzeResult = {
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

export const Route = createFileRoute("/result")({
  head: () => ({
    meta: [
      { title: "Foot Scan — Result" },
      { name: "description", content: "Your foot analysis results." },
    ],
  }),
  component: ResultScreen,
});

function ResultScreen() {
  const navigate = useNavigate();
  const [data, setData] = useState<AnalyzeResult | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("foot:result");
    if (!raw) {
      navigate({ to: "/" });
      return;
    }
    setData(JSON.parse(raw));
  }, [navigate]);

  if (!data) return null;

  return (
    <main className="min-h-screen px-5 py-8 max-w-md mx-auto flex flex-col gap-5">
      <header className="flex items-center gap-3">
        <Link to="/" className="neu-sm size-11 grid place-items-center">
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Result</p>
          <h1 className="text-xl font-semibold">Your Foot Report</h1>
        </div>
      </header>

      <ScoreCard score={data.score} footAge={data.foot_age} />

      <MetricCard label="Hallux" icon="HV" left={data.hallux_left} right={data.hallux_right} unit="°" />
      <MetricCard label="Tailor" icon="TB" left={data.tailor_left} right={data.tailor_right} unit="°" />
      <MetricCard label="Splay" icon="SP" left={data.splay_left} right={data.splay_right} unit="mm" />

      <CommentCard comment={data.comment} />

      <ArticleList articles={data.articles} />
    </main>
  );
}

function ScoreCard({ score, footAge }: { score: number; footAge: number }) {
  const pct = Math.max(0, Math.min(100, score));
  const r = 60;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;

  return (
    <section className="neu p-6 flex items-center gap-6">
      <div className="neu-inset size-40 rounded-full grid place-items-center shrink-0 relative">
        <svg viewBox="0 0 160 160" className="size-36 -rotate-90">
          <circle cx="80" cy="80" r={r} stroke="oklch(1 0 0 / 0.06)" strokeWidth="10" fill="none" />
          <circle
            cx="80"
            cy="80"
            r={r}
            stroke="url(#scoreGrad)"
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${dash} ${c}`}
          />
          <defs>
            <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="oklch(0.85 0.16 200)" />
              <stop offset="1" stopColor="oklch(0.75 0.18 260)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute text-center">
          <div className="text-4xl font-bold text-accent-cyan">{score}</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Score</div>
        </div>
      </div>
      <div className="flex-1">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Foot Age</p>
        <p className="text-5xl font-bold mt-1">{footAge}</p>
        <p className="text-sm text-muted-foreground mt-2">years</p>
      </div>
    </section>
  );
}

function MetricCard({
  label,
  icon,
  left,
  right,
  unit,
}: {
  label: string;
  icon: string;
  left: number;
  right: number;
  unit: string;
}) {
  return (
    <section className="neu p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="neu-inset size-10 rounded-full grid place-items-center text-[11px] font-bold text-accent-cyan">
            {icon}
          </div>
          <h3 className="font-semibold">{label}</h3>
        </div>
        <Footprints className="size-4 text-muted-foreground" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Side label="Left" value={left} unit={unit} />
        <Side label="Right" value={right} unit={unit} />
      </div>
    </section>
  );
}

function Side({ label, value, unit }: { label: string; value: number; unit: string }) {
  const pct = Math.min(100, (value / 60) * 100);
  return (
    <div className="neu-inset p-3 rounded-xl">
      <div className="flex justify-between items-baseline">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-lg font-semibold">
          {value}
          <span className="text-xs text-muted-foreground ml-0.5">{unit}</span>
        </span>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-black/30 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent-cyan to-primary"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function CommentCard({ comment }: { comment: string }) {
  return (
    <section className="neu p-5 flex gap-4">
      <div className="neu-inset size-10 rounded-full grid place-items-center shrink-0">
        <MessageSquareQuote className="size-5 text-accent-warn" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Comment</p>
        <p className="mt-1 text-sm leading-relaxed">{comment}</p>
      </div>
    </section>
  );
}

function ArticleList({ articles }: { articles: { title: string; url: string }[] }) {
  return (
    <section className="neu p-5">
      <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Related Articles</h3>
      <ul className="flex flex-col gap-3">
        {articles.map((a, i) => (
          <li key={i}>
            <a
              href={a.url}
              className="neu-sm flex items-center justify-between px-4 py-3 active:shadow-neu-inset transition-shadow"
            >
              <span className="text-sm">{a.title}</span>
              <ChevronRight className="size-4 text-accent-cyan" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
