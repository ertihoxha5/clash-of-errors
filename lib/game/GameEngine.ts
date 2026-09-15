import {
  ACESFilmicToneMapping, Color, DirectionalLight, FogExp2, HemisphereLight,
  PCFSoftShadowMap, PerspectiveCamera, Scene, WebGLRenderer,
} from "three";
import { FrameLoop } from "./core/FrameLoop";
import { ResourceScope } from "./core/ResourceScope";
import { BreachArena } from "./world/BreachArena";
import type { EngineEvents } from "./types";

/** Browser-only. Import dynamically from the host, never from a server page. */
export class GameEngine {
  private scope = new ResourceScope();
  private renderer: WebGLRenderer | null = null;
  private scene = new Scene();
  private camera = new PerspectiveCamera(48, 1, .2, 180);
  private arena: BreachArena | null = null;
  private loop: FrameLoop | null = null;
  private disposed = false;
  private paused = true;
  private failed = false;
  private motion: MediaQueryList | null = null;

  constructor(private container: HTMLElement, private events: EngineEvents) {
    try { this.initialize(); } catch (error) { this.dispose(); throw error; }
  }

  private initialize(): void {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-label", "Archive Zero, a three-dimensional System Breach arena preview");
    canvas.setAttribute("role", "img");
    canvas.tabIndex = 0;
    let context: WebGL2RenderingContext | null;
    try { context = canvas.getContext("webgl2", { antialias: true, alpha: false }); }
    catch { context = null; }
    if (!context) throw new Error("WebGL 2 is unavailable. Enable browser hardware acceleration or try another supported browser.");
    // Register immediately: even a renderer-constructor failure must release the context.
    this.scope.defer(() => context.getExtension("WEBGL_lose_context")?.loseContext());
    const renderer = new WebGLRenderer({ canvas, context, antialias: true });
    this.renderer = renderer;
    this.scope.defer(() => renderer.dispose());
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    this.container.appendChild(canvas);
    this.scope.defer(() => canvas.remove());

    this.scene.background = new Color(0x080e19);
    this.scene.fog = new FogExp2(0x080e19, .018);
    this.camera.position.set(27, 22, 34);
    this.camera.lookAt(0, 2, -3);
    this.scene.add(new HemisphereLight(0xb6e1ed, 0x161324, 2));
    const sun = new DirectionalLight(0xe1eef7, 3.2);
    sun.position.set(-12, 28, 18);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -28, right: 28, top: 28, bottom: -28, near: 1, far: 85 });
    sun.shadow.bias = -.0005;
    sun.shadow.normalBias = .04;
    this.scene.add(sun);
    this.scope.defer(() => sun.shadow.dispose());
    this.arena = this.scope.own(new BreachArena());
    this.scene.add(this.arena.root);
    this.motion = window.matchMedia("(prefers-reduced-motion: reduce)");

    this.loop = new FrameLoop(
      { request: callback => window.requestAnimationFrame(callback), cancel: id => window.cancelAnimationFrame(id) },
      delta => this.arena?.update(delta),
      alpha => this.draw(alpha),
      () => this.fail("The preview stopped rendering. Restart the preview to recover."),
    );
    this.scope.defer(() => this.loop?.stop());
    const observer = new ResizeObserver(this.resize);
    observer.observe(this.container);
    this.scope.defer(() => observer.disconnect());
    window.addEventListener("resize", this.resize);
    this.scope.defer(() => window.removeEventListener("resize", this.resize));
    window.addEventListener("blur", this.pause);
    this.scope.defer(() => window.removeEventListener("blur", this.pause));
    document.addEventListener("visibilitychange", this.visibility);
    this.scope.defer(() => document.removeEventListener("visibilitychange", this.visibility));
    canvas.addEventListener("keydown", this.keydown);
    this.scope.defer(() => canvas.removeEventListener("keydown", this.keydown));
    canvas.addEventListener("webglcontextlost", this.contextLost);
    this.scope.defer(() => canvas.removeEventListener("webglcontextlost", this.contextLost));
    this.resize();
    renderer.compile(this.scene, this.camera);
    this.draw(0);
  }

  private draw(alpha: number): void {
    if (this.disposed || this.failed) return;
    this.arena?.animate(alpha, this.motion?.matches ?? false);
    this.renderer?.render(this.scene, this.camera);
  }

  private resize = (): void => {
    if (this.disposed || this.failed || !this.renderer) return;
    try {
      const { width, height } = this.container.getBoundingClientRect();
      this.camera.aspect = Math.max(1, width) / Math.max(1, height);
      // Fit the arena on narrow screens without distorting perspective.
      this.camera.fov = this.camera.aspect < 1.2 ? 65 : 48;
      this.camera.updateProjectionMatrix();
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      this.renderer.setSize(Math.max(1, width), Math.max(1, height), false);
      if (this.paused) this.draw(0);
    } catch { this.fail("The preview could not resize. Restart the preview to recover."); }
  };

  private visibility = (): void => { if (document.hidden) this.pause(); };
  private keydown = (event: KeyboardEvent): void => {
    if (event.key === "Escape") { event.preventDefault(); this.pause(); }
  };
  private contextLost = (event: Event): void => {
    event.preventDefault();
    this.fail("The graphics connection was lost. Restart the preview to create a fresh renderer.");
  };

  private fail(message: string): void {
    if (this.disposed || this.failed) return;
    this.failed = true;
    this.loop?.stop();
    this.events.onError(message);
  }

  start(): boolean {
    if (this.disposed || this.failed) return false;
    if (document.hidden) { this.events.onPause(); return false; }
    this.paused = false;
    this.loop?.start();
    this.renderer?.domElement.focus({ preventScroll: true });
    return true;
  }

  pause = (): void => {
    if (this.disposed || this.failed || this.paused) return;
    this.paused = true;
    this.loop?.stop();
    this.events.onPause();
  };

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.scope.dispose();
    this.scene.clear();
    this.renderer = null;
    this.arena = null;
    this.loop = null;
    this.motion = null;
  }
}
