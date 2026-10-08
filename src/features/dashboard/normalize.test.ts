import { describe, expect, it, vi } from 'vitest';
import { normalizeSummary, normalizeTodaySessions } from './normalize';

describe('normalizeSummary', () => {
  it('reads the spec shape', () => {
    const summary = normalizeSummary({
      incomeToday: 100,
      incomeYesterday: 80,
      sessionsToday: { total: 3, live: 1, upcoming: 1, done: 1, cancelled: 0 },
      monthlyAttendanceRate: 0.9,
      openDues: { total: 500, count: 4 },
      activeStudents: 20,
    });
    expect(summary.openDues).toEqual({ total: 500, count: 4 });
    expect(summary.sessionsToday.live).toBe(1);
  });

  it('never throws on an unexpected shape (the live API crash)', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const summary = normalizeSummary({ incomeToday: 50, something: 'else' });
    expect(summary.incomeToday).toBe(50);
    expect(summary.openDues).toEqual({ total: null, count: null });
    expect(summary.monthlyAttendanceRate).toBeNull();
  });

  it('accepts flat aliases and percentages', () => {
    const summary = normalizeSummary({
      openDuesTotal: '1200',
      openDuesCount: 7,
      attendanceRate: 87,
    });
    expect(summary.openDues).toEqual({ total: 1200, count: 7 });
    expect(summary.monthlyAttendanceRate).toBeCloseTo(0.87);
  });
});

describe('normalizeTodaySessions', () => {
  it('accepts arrays or {items} and maps aliases', () => {
    const [session] = normalizeTodaySessions({
      items: [
        {
          sessionId: 's1',
          group: { name: 'كيمياء' },
          startsAt: '2026-10-08T15:00:00',
          status: 'InProgress',
        },
      ],
    });
    expect(session).toMatchObject({
      id: 's1',
      groupName: 'كيمياء',
      startTime: '15:00',
      status: 'Live',
    });
  });

  it('returns [] for anything that is not a list', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(normalizeTodaySessions(null)).toEqual([]);
  });
});
