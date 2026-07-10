export class IdleProducer {
  private capMs: number;

  constructor(initialCapHours: number = 4) {
    this.capMs = initialCapHours * 60 * 60 * 1000;
  }

  getCapMs(): number {
    return this.capMs;
  }

  extendCapHours(additionalHours: number): void {
    this.capMs += additionalHours * 60 * 60 * 1000;
  }

  computeAccrual(ratesPerSecond: Record<string, number>, elapsedMs: number): Record<string, number> {
    const cappedMs = Math.min(elapsedMs, this.capMs);
    const seconds = cappedMs / 1000;
    const result: Record<string, number> = {};
    for (const [resource, rate] of Object.entries(ratesPerSecond)) {
      result[resource] = rate * seconds;
    }
    return result;
  }
}
