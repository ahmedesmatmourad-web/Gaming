export class LegacyMultiplier {
  private value: number = 1;

  getValue(): number {
    return this.value;
  }

  increaseBy(amount: number): void {
    this.value += amount;
  }

  applyTo(baseRate: number): number {
    return baseRate * this.value;
  }
}
