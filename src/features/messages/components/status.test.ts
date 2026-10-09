import { describe, expect, it } from 'vitest';
import { messageStatus } from './status';

describe('messageStatus', () => {
  it('maps known statuses to tone + Arabic label', () => {
    expect(messageStatus('Failed')).toEqual({ tone: 'danger', label: 'فشلت' });
    expect(messageStatus('Delivered').tone).toBe('success');
    expect(messageStatus('Draft').tone).toBe('neutral');
  });

  it('passes unknown statuses through with the info tone', () => {
    expect(messageStatus('Throttled')).toEqual({ tone: 'info', label: 'Throttled' });
  });
});
