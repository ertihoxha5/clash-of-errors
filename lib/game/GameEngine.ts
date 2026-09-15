import {
  ACESFilmicToneMapping, Color, DirectionalLight, FogExp2, HemisphereLight,
  PCFSoftShadowMap, PerspectiveCamera, Scene, WebGLRenderer,
} from "three";
import { FrameLoop } from "./core/FrameLoop";
import { ResourceScope } from "./core/ResourceScope";
import { BreachArena } from "./world/BreachArena";
import { CollisionWorld } from "./world/CollisionWorld";
import { PlayerController } from "./player/PlayerController";
import { PlayerAvatar } from "./player/PlayerAvatar";
import { PlayerInput } from "./player/PlayerInput";
import { ThirdPersonCamera } from "./player/ThirdPersonCamera";
import type { EngineEvents } from "./types";

/** Browser-only. Import dynamically from the host, never from a server page. */
export class GameEngine {
  private scope = new ResourceScope();
  private renderer: WebGLRenderer | null = null;
  private scene = new Scene();
  private camera = new PerspectiveCamera(60, 1, .08, 180);
  private arena: BreachArena | null = null;
  private loop: FrameLoop | null = null;
  private disposed = false;
  private paused = true;
  private failed = false;
  private motion: MediaQueryList | null = null;
  private player: PlayerController | null = null;
  private avatar: PlayerAvatar | null = null;
  private input: PlayerInput | null = null;
  private followCamera: ThirdPersonCamera | null = null;
  private hudTimer = 0;

  constructor(private container: HTMLElement, private events: EngineEvents) {
    try { this.initialize(); } catch (error) { this.dispose(); throw error; }
  }

  private initialize(): void {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-label", "Archive Zero movement preview. WASD move, Shift sprint, Space jump, C dodge. Click to capture mouse. Escape pauses.");
    canvas.setAttribute("role", "application");
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
    const world = this.scope.own(new CollisionWorld(this.arena.solids));
    this.player = new PlayerController(world);
    this.avatar = this.scope.own(new PlayerAvatar());
    this.scene.add(this.avatar.root);
    this.followCamera = new ThirdPersonCamera(this.camera, world, this.player.position);
    this.input = this.scope.own(new PlayerInput(canvas, this.pause,
      (locked, denied) => this.events.onCapture?.(locked, denied)));
    this.motion = window.matchMedia("(prefers-reduced-motion: reduce)");

    this.loop = new FrameLoop(
      { request: callback => window.requestAnimationFrame(callback), cancel: id => window.cancelAnimationFrame(id) },
      this.update,
      alpha => this.draw(alpha),
      () => this.fail("The preview stopped rendering. Restart the preview to recover."),
    );
    this.scope.defer(() => this.loop?.stop());
    const observer = new ResizeObserver(this.resize);
    this.scope.defer(() => observer.disconnect());
    observer.observe(this.container);
    window.addEventListener("resize", this.resize);
    this.scope.defer(() => window.removeEventListener("resize", this.resize));
    window.addEventListener("blur", this.pause);
    this.scope.defer(() => window.removeEventListener("blur", this.pause));
    document.addEventListener("visibilitychange", this.visibility);
    this.scope.defer(() => document.removeEventListener("visibilitychange", this.visibility));
    canvas.addEventListener("webglcontextlost", this.contextLost);
    this.scope.defer(() => canvas.removeEventListener("webglcontextlost", this.contextLost));
    this.resize();
    renderer.compile(this.scene, this.camera);
    this.draw(0);
  }

  private update = (delta: number): void => {
    if (!this.player || !this.input || !this.followCamera) return;
    const command = this.input.sample();
    this.followCamera.look(command.lookX, command.lookY);
    const resets = this.player.resets;
    this.player.update(delta, command, this.followCamera.yaw);
    if (this.player.resets !== resets) { this.followCamera.reset(this.player.position); this.input.clear(); }
    this.followCamera.update(delta, this.player.position);
    this.avatar?.update(delta, this.player);
    this.arena?.update(delta);
    this.hudTimer -= delta;
    if (this.hudTimer <= 0) {
      this.hudTimer = .1;
      this.events.onMovement?.({ state: this.player.state, dodgeCooldown: this.player.dodgeCooldown });
    }
  };

  private draw(alpha: number): void {
    if (this.disposed || this.failed) return;
    this.arena?.animate(alpha, this.motion?.matches ?? false);
    if (this.player) this.avatar?.render(alpha, this.player);
    this.followCamera?.render(alpha);
    // When cover forces the camera against the capsule, avoid rendering its interior.
    if (this.avatar && this.player) this.avatar.root.visible = this.camera.position.distanceToSquared(this.player.position) > 2.5;
    this.renderer?.render(this.scene, this.camera);
  }

  private resize = (): void => {
    if (this.disposed || this.failed || !this.renderer) return;
    try {
      const { width, height } = this.container.getBoundingClientRect();
      this.camera.aspect = Math.max(1, width) / Math.max(1, height);
      this.camera.fov = this.camera.aspect < 1.2 ? 70 : 60;
      this.camera.updateProjectionMatrix();
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      this.renderer.setSize(Math.max(1, width), Math.max(1, height), false);
      if (this.paused) this.draw(1);
    } catch { this.fail("The preview could not resize. Restart the preview to recover."); }
  };

  private visibility = (): void => { if (document.hidden) this.pause(); };
  private contextLost = (event: Event): void => {
    event.preventDefault();
    this.fail("The graphics connection was lost. Restart the preview to create a fresh renderer.");
  };

  private fail(message: string): void {
    if (this.disposed || this.failed) return;
    this.failed = true;
    this.loop?.stop();
    this.input?.setActive(false);
    this.events.onError(message);
  }

  start(): boolean {
    if (this.disposed || this.failed) return false;
    if (document.hidden) { this.events.onPause(); return false; }
    this.paused = false;
    this.input?.setActive(true);
    this.loop?.start();
    this.renderer?.domElement.focus({ preventScroll: true });
    return true;
  }

  pause = (): void => {
    if (this.disposed || this.failed || this.paused) return;
    this.paused = true;
    this.loop?.stop();
    this.input?.setActive(false);
    this.player?.clearActions();
    this.events.onPause();
  };

  resetPlayer(): void {
    if (this.disposed || this.failed || !this.player) return;
    this.player.reset();
    this.input?.clear();
    this.followCamera?.reset(this.player.position);
    this.avatar?.update(0, this.player);
    this.draw(1);
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.scope.dispose();
    this.scene.clear();
    this.renderer = null;
    this.arena = null;
    this.loop = null;
    this.motion = null;
    this.player = null;
    this.avatar = null;
    this.input = null;
    this.followCamera = null;
  }
}
