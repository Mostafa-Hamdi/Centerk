import { CalendarDays } from 'lucide-react';
import type { ComponentProps } from 'react';
import { Input } from './Input';

type DatePickerProps = Omit<ComponentProps<'input'>, 'type' | 'value' | 'onChange'> & {
  /** ISO date "YYYY-MM-DD" (the backend's `date` type, Cairo time — backend-spec §4). */
  value: string;
  onChange: (value: string) => void;
  /** "date" (default) or "time" for session start times. */
  mode?: 'date' | 'time';
};

/**
 * Native date/time picker styled with tokens: fully accessible, mobile-friendly, zero JS
 * cost. Pair with Zod refinements for min/max and date-order rules.
 */
export function DatePicker({ value, onChange, mode = 'date', ...props }: DatePickerProps) {
  return (
    <Input
      {...props}
      type={mode}
      dir="ltr"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      startAdornment={<CalendarDays aria-hidden />}
      className="text-end [&::-webkit-calendar-picker-indicator]:cursor-pointer"
    />
  );
}
