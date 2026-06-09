import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Camera, Upload, Sparkles, ImageIcon } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Foot Scan — Camera" },
      { name: "description", content: "Capture or upload a photo of your feet to start analysis." },
    ],
  }),
  component: CameraScreen,
});

function CameraScreen() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFile = (f: File | null) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/analyze", { method: "POST", body: fd });
      const data = await res.json();
      sessionStorage.setItem("foot:result", JSON.stringify(data));
      navigate({ to: "/result" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen px-5 py-8 max-w-md mx-auto flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Step 01</p>
          <h1 className="text-2xl font-semibold mt-1">Foot Scan</h1>
        </div>
        <div className="neu-sm size-12 grid place-items-center">
          <Sparkles className="size-5 text-accent-cyan" />
        </div>
      </header>

      {/* Camera frame */}
      <section className="neu p-5">
        <div className="neu-inset aspect-[3/4] relative overflow-hidden">
          {preview ? (
            <img src={preview} alt="preview" className="absolute inset-0 size-full object-cover" />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-muted-foreground">
              <div className="flex flex-col items-center gap-3">
                <ImageIcon className="size-10 opacity-50" />
                <p className="text-sm">Position both feet inside the guide</p>
              </div>
            </div>
          )}

          {/* Guide lines */}
          <svg
            className="absolute inset-0 size-full pointer-events-none"
            viewBox="0 0 300 400"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="guide" x1="0" x2="1">
                <stop offset="0" stopColor="oklch(0.82 0.15 200)" stopOpacity="0.9" />
                <stop offset="1" stopColor="oklch(0.82 0.15 200)" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            {/* corners */}
            {[
              [10, 10, 40, 10, 10, 40],
              [290, 10, 260, 10, 290, 40],
              [10, 390, 40, 390, 10, 360],
              [290, 390, 260, 390, 290, 360],
            ].map((c, i) => (
              <polyline
                key={i}
                points={`${c[0]},${c[1]} ${c[2]},${c[3]} ${c[0]},${c[1]} ${c[4]},${c[5]}`}
                stroke="url(#guide)"
                strokeWidth="2"
                fill="none"
              />
            ))}
            {/* center crosshair */}
            <line x1="150" y1="180" x2="150" y2="220" stroke="url(#guide)" strokeWidth="1" />
            <line x1="130" y1="200" x2="170" y2="200" stroke="url(#guide)" strokeWidth="1" />
            {/* foot outlines (left/right ovals) */}
            <ellipse cx="105" cy="200" rx="55" ry="150" stroke="url(#guide)" strokeWidth="1" fill="none" strokeDasharray="4 6" />
            <ellipse cx="195" cy="200" rx="55" ry="150" stroke="url(#guide)" strokeWidth="1" fill="none" strokeDasharray="4 6" />
          </svg>
        </div>
      </section>

      {/* Upload / Camera buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => cameraRef.current?.click()}
          className="neu-sm py-5 flex flex-col items-center gap-2 active:shadow-neu-inset transition-shadow"
        >
          <Camera className="size-6 text-accent-cyan" />
          <span className="text-sm">Take Photo</span>
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="neu-sm py-5 flex flex-col items-center gap-2 active:shadow-neu-inset transition-shadow"
        >
          <Upload className="size-6 text-accent-cyan" />
          <span className="text-sm">Upload</span>
        </button>
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
      </div>

      {/* Analysis Start */}
      <button
        disabled={!file || loading}
        onClick={analyze}
        className="neu py-5 mt-auto font-semibold tracking-wide text-accent-cyan disabled:opacity-40 disabled:cursor-not-allowed active:shadow-neu-inset transition-shadow"
      >
        {loading ? "Analyzing…" : "ANALYSIS START"}
      </button>
    </main>
  );
}
