import { describe, expect, it } from 'vitest';
import { gradeLevel, rankScores } from './api';

describe('gradeLevel', () => {
  it('maps percentages of the max score to levels', () => {
    expect(gradeLevel(9, 10)).toBe('excellent');
    expect(gradeLevel(7.5, 10)).toBe('veryGood');
    expect(gradeLevel(6.5, 10)).toBe('good');
    expect(gradeLevel(5, 10)).toBe('pass');
    expect(gradeLevel(4.9, 10)).toBe('weak');
  });
});

describe('rankScores', () => {
  it('uses competition ranking and skips empty scores', () => {
    expect(rankScores([8, null, 10, 8, 5])).toEqual([2, null, 1, 2, 4]);
  });
});
