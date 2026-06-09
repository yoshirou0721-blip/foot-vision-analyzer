import { createFileRoute } from "@tanstack/react-router";

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

const MOCK: AnalyzeResult = {
  score: 65,
  foot_age: 69,
  hallux_right: 30,
  hallux_left: 30,
  tailor_right: 30,
  tailor_left: 30,
  splay_right: 42,
  splay_left: 42,
  comment: "外反母趾と開帳足が認められます。",
  articles: [
    { title: "外反母趾の原因とは？", url: "#" },
    { title: "開帳足を改善するストレッチ", url: "#" },
    { title: "正しい靴の選び方ガイド", url: "#" },
  ],
};

export const Route = createFileRoute("/api/analyze")({
  server: {
    handlers: {
      POST: async () => {
        // TODO: forward to FastAPI when ready
        await new Promise((r) => setTimeout(r, 600));
        return Response.json(MOCK);
      },
    },
  },
});
