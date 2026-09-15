import { ResourceScope } from "../core/ResourceScope";
import type { PlayerCommand } from "./PlayerController";

const MOVEMENT_KEYS = new Set(["KeyW", "KeyA", "KeyS", "KeyD", "ShiftLeft", "ShiftRight", "Space", "KeyC"]);

export class PlayerInput {
  private scope = new ResourceScope();
  private keys = new Set<string>();
  private active = false;
  private disposed = false;
  private ownedLock = false;
  private dragging = false;
  private dragged = false;
  private captureDenied = false;
  private pendingLock = false;
  private jump = false;
  private dodge = false;
  private lookX = 0;
  private lookY = 0;
  private command: PlayerCommand = { x: 0, forward: 0, sprint: false, jump: false, dodge: false, lookX: 0, lookY: 0 };

  constructor(private canvas: HTMLCanvasElement, private pause: () => void,
    private onCapture: (locked: boolean, denied: boolean) => void) {
    const listen = (target: EventTarget, name: string, listener: EventListener) => {
      target.addEventListener(name, listener);
      this.scope.defer(() => target.removeEventListener(name, listener));
    };
    listen(document, "keydown", this.keydown);
    listen(document, "keyup", this.keyup);
    listen(document, "mousemove", this.mousemove);
    listen(document, "mouseup", () => { this.dragging = false; });
    listen(canvas, "mousedown", this.mousedown);
    listen(canvas, "click", this.click);
    listen(canvas, "blur", () => { if (this.active && !this.locked) this.pause(); });
    listen(document, "pointerlockchange", this.lockChanged);
    listen(document, "pointerlockerror", this.lockError);
  }

  private get locked(): boolean { return document.pointerLockElement === this.canvas; }
  private get focused(): boolean { return this.locked || document.activeElement === this.canvas; }

  private keydown = (raw: Event): void => {
    const event = raw as KeyboardEvent;
    if (!this.active || !this.focused || event.isComposing) return;
    if (event.code === "Escape" || event.code === "Tab") { this.pause(); return; }
    if (!MOVEMENT_KEYS.has(event.code) || event.metaKey || event.altKey) return;
    event.preventDefault();
    if (!event.repeat && !this.keys.has(event.code)) {
      if (event.code === "Space") this.jump = true;
      if (event.code === "KeyC") this.dodge = true;
    }
    this.keys.add(event.code);
  };
  private keyup = (raw: Event): void => { this.keys.delete((raw as KeyboardEvent).code); };
  private mousedown = (raw: Event): void => {
    const event = raw as MouseEvent;
    if (!this.active || event.button !== 0) return;
    this.canvas.focus({ preventScroll: true });
    this.dragging = !this.locked;
    this.dragged = false;
  };
  private mousemove = (raw: Event): void => {
    const event = raw as MouseEvent;
    if (!this.active || (!this.locked && !this.dragging)) return;
    const x = event.movementX || 0, y = event.movementY || 0;
    if (Math.abs(x) + Math.abs(y) > 2) this.dragged = true;
    this.lookX += x;
    this.lookY += y;
  };
  private click = (): void => {
    if (!this.active || this.locked || this.pendingLock || this.dragged || this.captureDenied) return;
    if (!this.canvas.requestPointerLock) { this.captureDenied = true; this.onCapture(false, true); return; }
    this.pendingLock = true;
    try {
      const result = this.canvas.requestPointerLock();
      // Older browsers return void and report via events; newer ones also return a promise.
      if (result && typeof result.then === "function") {
        void result.then(() => {
          this.pendingLock = false;
          if (this.disposed || !this.active) this.releaseLock();
        }).catch(() => this.lockError());
      }
    } catch { this.lockError(); }
  };
  private lockChanged = (): void => {
    this.pendingLock = false;
    const wasLocked = this.ownedLock;
    this.ownedLock = this.locked;
    if (this.locked && (!this.active || this.disposed)) { this.releaseLock(); return; }
    if (this.disposed) return;
    if (this.locked) { this.captureDenied = false; this.dragging = false; this.lookX = this.lookY = 0; }
    this.onCapture(this.locked, this.captureDenied);
    if (wasLocked && !this.locked && this.active) { this.clear(); this.pause(); }
  };
  private lockError = (): void => {
    if (!this.pendingLock) return;
    this.pendingLock = false;
    if (this.disposed) return;
    this.captureDenied = true;
    this.onCapture(false, true);
  };
  private releaseLock(): void {
    if (!this.locked) return;
    try { document.exitPointerLock(); } catch { /* A document being torn down may already be inactive. */ }
  }

  setActive(active: boolean): void {
    this.active = active && !this.disposed;
    this.clear();
    if (!this.active) this.releaseLock();
  }

  clear(): void {
    this.keys.clear();
    this.jump = this.dodge = this.dragging = false;
    this.lookX = this.lookY = 0;
  }

  sample(): PlayerCommand {
    const c = this.command;
    c.x = Number(this.keys.has("KeyD")) - Number(this.keys.has("KeyA"));
    c.forward = Number(this.keys.has("KeyW")) - Number(this.keys.has("KeyS"));
    c.sprint = this.keys.has("ShiftLeft") || this.keys.has("ShiftRight");
    c.jump = this.jump; c.dodge = this.dodge;
    c.lookX = this.lookX; c.lookY = this.lookY;
    this.jump = this.dodge = false;
    this.lookX = this.lookY = 0;
    return c;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.setActive(false);
    this.scope.dispose();
  }
}
