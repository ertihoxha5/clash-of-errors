export type PreviewState = "LOBBY" | "LOADING" | "PLAYING" | "PAUSED" | "ERROR";

export interface EngineEvents {
  onPause(): void;
  onError(message: string): void;
}
