/** Own resources as soon as they are created, including during partial startup. */
export class ResourceScope {
  private cleanups: (() => void)[] = [];
  private closed = false;

  defer(cleanup: () => void): void {
    if (this.closed) cleanup();
    else this.cleanups.push(cleanup);
  }

  own<T extends { dispose(): void }>(resource: T): T {
    this.defer(() => resource.dispose());
    return resource;
  }

  dispose(): void {
    if (this.closed) return;
    this.closed = true;
    const errors: unknown[] = [];
    for (const cleanup of this.cleanups.splice(0).reverse()) {
      try { cleanup(); } catch (error) { errors.push(error); }
    }
    if (errors.length) console.error("System Breach cleanup failed", errors);
  }
}
