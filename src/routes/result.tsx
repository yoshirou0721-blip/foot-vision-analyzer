import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ChevronRight, Footprints, MessageSquareQuote } from "lucide-react";

type AnalysisType = "foot" | "front" | "side";

type FootResult = {
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

type FrontResult = {
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

type SideResult = {
  score: number;
  judge: string;
  posture_type: string;
  pelvis_type: string;
  knee_type: string;
  comment: string;
};

type Stored =
  | { type: "foot"; data: FootResult }
  | { type: "front"; data: FrontResult }
  | { type: "side"; data: SideResult };

const TITLES: Record<AnalysisType, string> = {
  foot: "Your Foot Report",
  front: "Front Posture Report",
  side: "Side Posture Report",
};

export const Route = createFileRoute("/result")({
  head: () => ({
    meta: [
      { title: "Scan — Result" },
      { name: "description", content: "Your analysis results." },
    ],
  }),
  component: ResultScreen,
});

function ResultScreen() {
  const navigate = useNavigate();
  const [stored, setStored] = useState<Stored | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("foot:result");
    if (!raw) {
      navigate({ to: "/" });
      return;
    }
    const parsed = JSON.parse(raw);
    // Backward compat: if the older shape (no `type`) is found, assume foot.
    if (parsed && typeof parsed === "object" && "type" in parsed && "data" in parsed) {
      setStored(parsed as Stored);
    } else {
      setStored({ type: "foot", data: parsed as FootResult });
    }
  }, [navigate]);

  if (!stored) return null;

  return (
    <main className="min-h-screen px-5 py-8 max-w-md mx-auto flex flex-col gap-5">
      <header className="flex items-center gap-3">
        <Link to="/" className="neu-sm size-11 grid place-items-center">
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Result</p>
          <h1 className="text-xl font-semibold">{TITLES[stored.type]}</h1>
        </div>
      </header>

      {stored.type === "foot" && <FootView data={stored.data} />}
      {stored.type === "front" && <FrontView data={stored.data} />}
      {stored.type === "side" && <SideView data={stored.data} />}
    </main>
  );
}

/* ---------- Foot ---------- */

function FootView({ data }: { data: FootResult }) {
  return (
    <>
      <ScoreCard score={data.score} sub={{ label: "Foot Age", value: data.foot_age, unit: "years" }} />
      <MetricCard label="Hallux" icon="HV" left={data.hallux_left} right={data.hallux_right} unit="°" />
      <MetricCard label="Tailor" icon="TB" left={data.tailor_left} right={data.tailor_right} unit="°" />
      <MetricCard label="Splay" icon="SP" left={data.splay_left} right={data.splay_right} unit="mm" />
      <CommentCard comment={data.comment} />
      <ArticleList articles={data.articles ?? []} />
    </>
  );
}

/* ---------- Front Posture ---------- */

function FrontView({ data }: { data: FrontResult }) {
  return (
    <>
      <ScoreCard score={data.score} sub={{ label: "Judge", value: data.judge }} />
      <InfoCard
        title="Center of Gravity"
        rows={[
          { label: "Position", value: data.gravity_text },
          { label: "Rate", value: `${data.gravity_rate}%` },
        ]}
      />
      <DualCard
        title="Leg Type"
        left={{ label: "Left", value: data.left_leg_type }}
        right={{ label: "Right", value: data.right_leg_type }}
      />
      <section className="neu p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Leg Alignment</h3>
          <Footprints className="size-4 text-muted-foreground" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Side label="O Rate" value={data.o_rate} unit="%" />
          <Side label="X Rate" value={data.x_rate} unit="%" />
        </div>
      </section>
      <CommentCard comment={data.comment} />
    </>
  );
}

/* ---------- Side Posture ---------- */

function SideView({ data }: { data: SideResult }) {
  return (
    <>
      <ScoreCard score={data.score} sub={{ label: "Judge", value: data.judge }} />
      <InfoCard
        title="Posture Analysis"
        rows={[
          { label: "Posture", value: data.posture_type },
          { label: "Pelvis", value: data.pelvis_type },
          { label: "Knee", value: data.knee_type },
        ]}
      />
      <CommentCard comment={data.comment} />
    </>
  );
}

/* ---------- Shared ---------- */

function ScoreCard({
  score,
  sub,
}: {
  score: number;
  sub: { label: string; value: string | number; unit?: string };
}) {
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
      <div className="flex-1 min-w-0">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{sub.label}</p>
        <p className="text-3xl font-bold mt-1 break-words">{sub.value}</p>
        {sub.unit && <p className="text-sm text-muted-foreground mt-2">{sub.unit}</p>}
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
  const pct = Math.min(100, Math.max(0, (value / (unit === "%" ? 100 : 60)) * 100));
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

function InfoCard({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: string | number }[];
}) {
  return (
    <section className="neu p-5">
      <h3 className="font-semibold mb-4">{title}</h3>
      <div className="flex flex-col gap-2">
        {rows.map((r, i) => (
          <div key={i} className="neu-inset px-4 py-3 rounded-xl flex justify-between items-center">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">{r.label}</span>
            <span className="text-sm font-semibold">{r.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function DualCard({
  title,
  left,
  right,
}: {
  title: string;
  left: { label: string; value: string };
  right: { label: string; value: string };
}) {
  return (
    <section className="neu p-5">
      <h3 className="font-semibold mb-4">{title}</h3>
      <div className="grid grid-cols-2 gap-4">
        {[left, right].map((s, i) => (
          <div key={i} className="neu-inset p-3 rounded-xl">
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className="text-base font-semibold mt-1">{s.value}</div>
          </div>
        ))}
      </div>
    </section>
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
  if (!articles.length) return null;
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
