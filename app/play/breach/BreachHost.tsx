"use client";

import { useEffect, useRef, useState } from "react";
import type { GameEngine } from "../../../lib/game/GameEngine";
import type { PreviewState } from "../../../lib/game/types";
import type { MovementSnapshot } from "../../../lib/game/player/PlayerController";
import styles from "./breach.module.css";

export default function BreachHost() {
  const [state, setState] = useState<PreviewState>("LOBBY");
  const [attempt, setAttempt] = useState(0);
  const [stage, setStage] = useState("Loading renderer");
  const [error, setError] = useState("");
  const [fullscreenError, setFullscreenError] = useState("");
  const [capture, setCapture] = useState({ locked: false, denied: false });
  const [movement, setMovement] = useState<MovementSnapshot>({ state: "IDLE", dodgeCooldown: 0 });
  const mount = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const engine = useRef<GameEngine | null>(null);
  const launchButton = useRef<HTMLButtonElement>(null);
  const overlayButton = useRef<HTMLButtonElement>(null);
  const active = state === "PLAYING" || state === "PAUSED";

  useEffect(() => {
    if (!attempt || !mount.current) return;
    const container = mount.current;
    let cancelled = false;
    let owned: GameEngine | null = null;
    let frame: number | null = null;
    const release = () => {
      owned?.dispose();
      if (engine.current === owned) engine.current = null;
      owned = null;
    };
    const fail = (message: string) => {
      if (cancelled) return;
      cancelled = true;
      window.clearTimeout(timeout);
      if (frame !== null) window.cancelAnimationFrame(frame);
      release();
      setError(message);
      setState("ERROR");
    };
    const timeout = window.setTimeout(() => fail("Loading took too long. Check your connection and retry the preview."), 30000);
    void import("../../../lib/game/GameEngine")
      .then(({ GameEngine }) => {
        if (cancelled) return;
        setStage("Building Archive Zero");
        // Let the loading state paint before synchronous geometry/shader setup.
        frame = window.requestAnimationFrame(() => {
          frame = null;
          if (cancelled) return;
          try {
            owned = new GameEngine(container, {
              onPause: () => { if (!cancelled) setState("PAUSED"); },
              onError: message => fail(message),
              onCapture: (locked, denied) => { if (!cancelled) setCapture({ locked, denied }); },
              onMovement: snapshot => { if (!cancelled) setMovement(snapshot); },
            });
            if (cancelled) { release(); return; }
            engine.current = owned;
            window.clearTimeout(timeout);
            setState(owned.start() ? "PLAYING" : "PAUSED");
          } catch (reason) {
            fail(reason instanceof Error ? reason.message : "The renderer could not start. Retry the preview.");
          }
        });
      })
      .catch(() => fail("The renderer could not download. Check your connection and retry. If the app was updated, reload this page."));
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      if (frame !== null) window.cancelAnimationFrame(frame);
      release();
    };
  }, [attempt]);

  useEffect(() => {
    if (state === "PAUSED" || state === "ERROR") overlayButton.current?.focus();
  }, [state]);

  const launch = () => {
    engine.current?.dispose();
    engine.current = null;
    setError("");
    setFullscreenError("");
    setCapture({ locked: false, denied: false });
    setMovement({ state: "IDLE", dodgeCooldown: 0 });
    setStage("Loading renderer");
    setState("LOADING");
    setAttempt(value => value + 1);
  };
  const leave = () => {
    engine.current?.dispose();
    engine.current = null;
    setAttempt(0);
    setState("LOBBY");
    setFullscreenError("");
    if (document.fullscreenElement === viewport.current) void document.exitFullscreen().catch(() => {});
    // The lobby button is mounted on the next render.
  };
  useEffect(() => {
    if (state === "LOBBY") launchButton.current?.focus({ preventScroll: true });
  }, [state]);

  return <section className={styles.host} aria-labelledby="breach-title">
    <div className={styles.heading}>
      <div><span className="kicker">SYSTEM BREACH</span><h1 id="breach-title" className={styles.title}>Archive Zero</h1></div>
      <span className={styles.phase}>PHASE 02 <span>/</span> MOVEMENT PREVIEW</span>
    </div>
    <p className={styles.intro}>Enter Archive Zero. Cross the server galleries and find your footing above the digital void.</p>
    <div className={styles.viewport} ref={viewport}>
      <div className={styles.canvasMount} ref={mount} />
      {active && <div className={styles.telemetry} aria-hidden="true"><span>ARCHIVE ZERO / SECTOR 01</span><span>RENDERER ONLINE</span></div>}
      {state === "PLAYING" && <>
        <div className={styles.movementHud}><span>{movement.state.toLowerCase()}</span><span>Dodge {movement.dodgeCooldown > 0 ? `${movement.dodgeCooldown.toFixed(1)}s` : "ready"}</span></div>
        {!capture.locked && <p className={styles.captureHint}>{capture.denied ? "Mouse capture unavailable. Hold left mouse and drag to look around." : "Click the arena to capture the mouse. Escape pauses and releases it."}</p>}
      </>}
      {state === "LOBBY" && <div className={styles.overlay}>
        <span className={styles.index}>01 / SYSTEM BREACH</span>
        <h2>Enter the archive</h2>
        <p>Explore with a third-person debugger. Move, sprint, jump and dodge through the arena.<br />Combat arrives in Phase 3.</p>
        <div className={styles.keyGuide}><span><kbd>WASD</kbd> Move</span><span><kbd>Mouse</kbd> Look</span><span><kbd>Shift</kbd> Sprint</span><span><kbd>Space</kbd> Jump</span><span><kbd>C</kbd> Dodge</span></div>
        <button ref={launchButton} className="btn cyan solid" onClick={launch}>Launch arena preview <span aria-hidden="true">→</span></button>
        <span className={styles.requirement}>WEBGL 2 · KEYBOARD AND MOUSE REQUIRED</span>
      </div>}
      {state === "LOADING" && <div className={styles.overlay}>
        <div role="status"><span className={styles.index}>INITIALIZING SECTOR 01</span><h2>{stage}</h2><progress aria-label={stage} /><p>Preparing the arena and graphics resources.</p></div>
        <button className="btn cyan outline" onClick={leave}>Cancel loading</button>
      </div>}
      {state === "PAUSED" && <div className={`${styles.overlay} ${styles.paused}`}>
        <span className={styles.index}>PREVIEW SUSPENDED</span><h2>Take your time.</h2><p>Resume, then click the arena to capture the mouse. Your position is saved while paused.</p>
        <button ref={overlayButton} className="btn cyan solid" onClick={() => { if (engine.current?.start()) setState("PLAYING"); }}>Resume preview</button>
        <button className="btn cyan outline" onClick={() => { engine.current?.resetPlayer(); if (engine.current?.start()) setState("PLAYING"); }}>Reset position &amp; resume</button>
        <button className="btn pink outline" onClick={leave}>Return to preview lobby</button>
      </div>}
      {state === "ERROR" && <div className={styles.overlay}>
        <span className={styles.index}>CONNECTION INTERRUPTED</span><h2>Unable to open the archive</h2><p role="alert">{error}</p>
        <button ref={overlayButton} className="btn cyan solid" onClick={launch}>Retry preview</button>
        <button className="btn pink outline" onClick={leave}>Return to preview lobby</button>
      </div>}
      {active && <div className={styles.viewportControls}>
        <span className={styles.cameraLabel}>WASD MOVE · SHIFT SPRINT · SPACE JUMP · C DODGE · ESC PAUSE</span>
        {state === "PLAYING" && <button onClick={() => engine.current?.pause()}>Pause</button>}
        <button onClick={async () => {
          setFullscreenError("");
          try {
            if (document.fullscreenElement === viewport.current) await document.exitFullscreen();
            else if (viewport.current?.requestFullscreen) await viewport.current.requestFullscreen();
            else throw new Error();
          } catch { setFullscreenError("Fullscreen is unavailable. The preview still works in this page."); }
        }}>Toggle fullscreen</button>
        <button onClick={leave}>Exit preview</button>
      </div>}
    </div>
    {fullscreenError && <p role="status" className={styles.notice}>{fullscreenError}</p>}
    <div className={styles.footer}><p>Movement preview. Falling returns you to the entrance. No combat or rewards yet.</p><a href="/play">Back to Bug Hunter <span aria-hidden="true">↗</span></a></div>
  </section>;
}
