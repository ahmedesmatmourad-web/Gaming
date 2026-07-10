import { ResourceType } from '../data/ResourceTypes';

export interface LedgerEntry {
  resource: ResourceType;
  amount: number;
  reason: string;
  timestamp: number;
}

export class Wallet {
  private balances: Map<ResourceType, number> = new Map();
  private ledger: LedgerEntry[] = [];

  getBalance(resource: ResourceType): number {
    return this.balances.get(resource) ?? 0;
  }

  add(resource: ResourceType, amount: number, reason: string): void {
    if (amount <= 0) return;
    this.balances.set(resource, this.getBalance(resource) + amount);
    this.ledger.push({ resource, amount, reason, timestamp: Date.now() });
  }

  spend(resource: ResourceType, amount: number, reason: string): boolean {
    if (amount <= 0) return false;
    const current = this.getBalance(resource);
    if (current < amount) return false;
    this.balances.set(resource, current - amount);
    this.ledger.push({ resource, amount: -amount, reason, timestamp: Date.now() });
    return true;
  }

  getLedger(): ReadonlyArray<LedgerEntry> {
    return this.ledger;
  }

  serialize(): Record<string, number> {
    const out: Record<string, number> = {};
    for (const [key, value] of this.balances.entries()) {
      out[key] = value;
    }
    return out;
  }

  static deserialize(data: Record<string, number>): Wallet {
    const wallet = new Wallet();
    for (const [key, value] of Object.entries(data)) {
      wallet.balances.set(key as ResourceType, value);
    }
    return wallet;
  }
}
