import { describe, it, expect } from 'vitest';
import { Wallet } from '../../src/economy/Wallet';
import { ResourceType } from '../../src/data/ResourceTypes';

describe('Wallet', () => {
  it('starts every resource at zero', () => {
    const wallet = new Wallet();
    expect(wallet.getBalance(ResourceType.Gold)).toBe(0);
  });

  it('adds to a balance and records a ledger entry', () => {
    const wallet = new Wallet();
    wallet.add(ResourceType.Gold, 50, 'idle_income');
    expect(wallet.getBalance(ResourceType.Gold)).toBe(50);
    expect(wallet.getLedger()).toHaveLength(1);
    expect(wallet.getLedger()[0]).toMatchObject({ resource: ResourceType.Gold, amount: 50, reason: 'idle_income' });
  });

  it('spends when sufficient balance exists', () => {
    const wallet = new Wallet();
    wallet.add(ResourceType.Gold, 100, 'idle_income');
    expect(wallet.spend(ResourceType.Gold, 40, 'speed_up')).toBe(true);
    expect(wallet.getBalance(ResourceType.Gold)).toBe(60);
  });

  it('refuses to spend more than the current balance', () => {
    const wallet = new Wallet();
    wallet.add(ResourceType.Gold, 10, 'idle_income');
    expect(wallet.spend(ResourceType.Gold, 40, 'speed_up')).toBe(false);
    expect(wallet.getBalance(ResourceType.Gold)).toBe(10);
  });

  it('round-trips through serialize/deserialize', () => {
    const wallet = new Wallet();
    wallet.add(ResourceType.AnkhGems, 5, 'reward');
    const restored = Wallet.deserialize(wallet.serialize());
    expect(restored.getBalance(ResourceType.AnkhGems)).toBe(5);
  });
});
