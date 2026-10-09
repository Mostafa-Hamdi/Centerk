import { describe, expect, it } from 'vitest';
import { allocateFifo } from './api';

describe('allocateFifo', () => {
  const charges = [
    { id: 'oct', period: '2026-10', amount: 350, createdAt: '2026-10-01' },
    { id: 'sep', period: '2026-09', amount: 300, createdAt: '2026-09-01' },
  ];

  it('pays the oldest charge first', () => {
    expect(allocateFifo(400, charges)).toEqual([
      { feeChargeId: 'sep', amount: 300 },
      { feeChargeId: 'oct', amount: 100 },
    ]);
  });

  it('never allocates more than the open charges', () => {
    expect(allocateFifo(1000, charges).reduce((sum, item) => sum + item.amount, 0)).toBe(650);
  });
});
