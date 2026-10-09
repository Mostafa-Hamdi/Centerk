'use client';

import { CalendarPlus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ar } from '@/i18n/ar';
import type { WeeklySlotDto } from '../types';

const t = ar.groups;
/** Egyptian week starts on Saturday. */
const DAY_ORDER = [6, 0, 1, 2, 3, 4, 5] as const;

export const slotError = (slot: WeeklySlotDto) =>
  !/^\d{2}:\d{2}/.test(slot.startTime) ||
  !Number.isInteger(slot.durationMinutes) ||
  slot.durationMinutes < 15 ||
  slot.durationMinutes > 600;

/** Weekly schedule rows: day, start time, duration. Every slot uses the group's hall. */
export function ScheduleEditor({
  slots,
  onChange,
}: {
  slots: WeeklySlotDto[];
  onChange: (slots: WeeklySlotDto[]) => void;
}) {
  const update = (index: number, patch: Partial<WeeklySlotDto>) =>
    onChange(slots.map((slot, i) => (i === index ? { ...slot, ...patch } : slot)));

  return (
    <div className="flex flex-col gap-3 md:col-span-2">
      {slots.length ? (
        <ul className="flex flex-col gap-2">
          {slots.map((slot, index) => (
            <li
              key={index}
              className="grid items-end gap-2 rounded-md border border-line bg-canvas p-3 sm:grid-cols-[1fr_9rem_9rem_auto]"
            >
              <label className="flex flex-col gap-1 text-sm font-medium text-ink">
                {t.schedule.day}
                <Select
                  value={String(slot.dayOfWeek)}
                  onValueChange={(value) => update(index, { dayOfWeek: Number(value) })}
                  options={DAY_ORDER.map((day) => ({
                    value: String(day),
                    label: t.days[day],
                  }))}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium text-ink">
                {t.schedule.time}
                <Input
                  type="time"
                  dir="ltr"
                  value={slot.startTime.slice(0, 5)}
                  onChange={(event) => update(index, { startTime: event.target.value })}
                  aria-invalid={slotError(slot) || undefined}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium text-ink">
                {t.schedule.duration}
                <Input
                  inputMode="numeric"
                  dir="ltr"
                  value={String(slot.durationMinutes || '')}
                  onChange={(event) =>
                    update(index, { durationMinutes: Number(event.target.value) || 0 })
                  }
                />
              </label>
              <Button
                type="button"
                variant="ghost"
                aria-label={`${ar.common.delete} ${t.days[slot.dayOfWeek] ?? ''}`}
                iconStart={<Trash2 aria-hidden />}
                onClick={() => onChange(slots.filter((_, i) => i !== index))}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">{t.schedule.empty}</p>
      )}
      <div>
        <Button
          type="button"
          variant="info"
          iconStart={<CalendarPlus aria-hidden />}
          onClick={() =>
            onChange([
              ...slots,
              { dayOfWeek: 6, startTime: '16:00', durationMinutes: 120, hallId: null },
            ])
          }
        >
          {t.schedule.add}
        </Button>
      </div>
    </div>
  );
}
