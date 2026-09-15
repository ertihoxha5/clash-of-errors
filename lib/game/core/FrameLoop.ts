export interface FrameScheduler {
  request(callback: (time: number) => void): number;
  cancel(handle: number): void;
}

/** Fixed updates, interpolated rendering, and no catch-up burst after resuming. */
export class FrameLoop {
  private handle: number | null = null;
  private running = false;
  private previous: number | null = null;
  private accumulator = 0;
  private readonly step = 1 / 60;

  constructor(
    private scheduler: FrameScheduler,
    private update: (delta: number) => void,
    private render: (alpha: number) => void,
    private onError: (error: unknown) => void,
  ) {}

  start(): void {
    if (this.running) return;
    this.running = true;
    this.previous = null;
    this.accumulator = 0;
    this.handle = this.scheduler.request(this.frame);
  }

  stop(): void {
    this.running = false;
    if (this.handle !== null) this.scheduler.cancel(this.handle);
    this.handle = null;
    this.previous = null;
    this.accumulator = 0;
  }

  private frame = (time: number): void => {
    if (!this.running) return;
    this.handle = null;
    const elapsed = this.previous === null ? 0 : Math.min(.1, Math.max(0, (time - this.previous) / 1000));
    this.previous = time;
    this.accumulator += elapsed;
    try {
      while (this.accumulator + 1e-9 >= this.step) {
        this.update(this.step);
        this.accumulator = Math.max(0, this.accumulator - this.step);
      }
      this.render(this.accumulator / this.step);
    } catch (error) {
      this.stop();
      this.onError(error);
      return;
    }
    if (this.running) this.handle = this.scheduler.request(this.frame);
  };
}
