"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./unity-host.module.css";

// An isolated document owns the Unity loader, canvas and runtime. Removing the
// iframe disposes that entire context, including navigation during startup.
export default function UnityHost({ buildBase = "/unity/clash-of-errors" }: { buildBase?: string }) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [fullscreenError, setFullscreenError] = useState("");
  const [frameUrl, setFrameUrl] = useState("");
  const frame = useRef<HTMLIFrameElement>(null);
  const area = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!attempt) return;
    const controller = new AbortController();
    let disposed = false;
    const fail = (message: string) => {
      if (disposed) return;
      clearTimeout(timer);
      setError(message); setState("error"); setFrameUrl("");
    };
    const base = new URL(buildBase.replace(/\/$/, "") + "/", window.location.href);
    const receive = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow || event.origin !== base.origin || event.data?.channel !== "clash-unity") return;
      if (event.data.type === "progress" && typeof event.data.value === "number") setProgress(Math.max(0, Math.min(1, event.data.value)));
      if (event.data.type === "ready") { clearTimeout(timer); setState("ready"); }
      if (event.data.type === "error") fail("Unity could not start. Check browser WebGL support and the build files, then retry.");
    };
    window.addEventListener("message", receive);
    const timer = setTimeout(() => fail("Unity took too long to start. Check your connection and retry."), 180000);
    void fetch(new URL("index.html", base), { signal: controller.signal, cache: "no-store" })
      .then(async response => {
        if (!response.ok || !(await response.text()).includes('name="clash-unity-build"')) throw new Error("unavailable");
        if (!disposed) setFrameUrl(new URL("index.html", base).href);
      })
      .catch(() => { if (!controller.signal.aborted) fail("Unity build unavailable. Run the Unity Web build steps in docs/unity-phase-0.md, then retry."); });
    return () => { disposed = true; controller.abort(); clearTimeout(timer); window.removeEventListener("message", receive); };
  }, [attempt, buildBase]);

  const launch = () => { setFrameUrl(""); setError(""); setProgress(null); setState("loading"); setAttempt(value => value + 1); };
  return <section className={styles.host}>
    <span className="kicker">UNITY WEB // PHASE 0</span>
    <h1 className={styles.title}>Clash of Errors</h1>
    <p>Explore the rendering foundation. Movement and combat arrive in a later phase.</p>
    <div className={styles.area} ref={area}>
      {frameUrl && <iframe key={attempt} ref={frame} src={frameUrl} title="Clash of Errors Unity game" allow="fullscreen; autoplay" allowFullScreen />}
      {state !== "ready" && <div className={styles.status}>
        {state === "idle" && <><h2>Ready to enter?</h2><p>Desktop browser · keyboard and mouse · WebGL required</p><button className="btn cyan solid" onClick={launch}>Launch Unity demo</button></>}
        {state === "loading" && <div role="status"><p>Loading Unity…</p><progress aria-label="Unity loading" max={1} value={progress ?? undefined} />{progress !== null && <p>{Math.round(progress * 100)}%</p>}</div>}
        {state === "error" && <><p role="alert">{error}</p><button className="btn cyan solid" onClick={launch}>Retry launch</button></>}
      </div>}
    </div>
    <div className={styles.controls}>
      <a className="btn pink outline" href="/">Return home</a>
      <button className="btn cyan outline" disabled={state !== "ready"} onClick={async () => {
        setFullscreenError("");
        try { if (!area.current?.requestFullscreen) throw new Error(); await area.current.requestFullscreen(); }
        catch { setFullscreenError("Fullscreen is unavailable in this browser. You can continue in the game area."); }
      }}>Fullscreen</button>
    </div>
    {fullscreenError && <p role="status">{fullscreenError}</p>}
    <p className={styles.hint}>Click inside the game to focus it. Escape exits fullscreen. Existing coding modes remain available from your dashboard.</p>
  </section>;
}
