import type { MovementSnapshot } from "./player/PlayerController";

export type PreviewState = "LOBBY" | "LOADING" | "PLAYING" | "PAUSED" | "ERROR";

export interface EngineEvents {
  onPause(): void;
  onError(message: string): void;
  onCapture?(locked: boolean, denied: boolean): void;
  onMovement?(snapshot: MovementSnapshot): void;
}
