'use client';

import { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatMoney, formatNumber, TIME_ZONE } from '@/lib/format';
import type { IncomePointDto } from '../api';

const dayFormat = new Intl.DateTimeFormat('ar-EG', { weekday: 'short', timeZone: TIME_ZONE });

/** Reads design tokens so the chart re-brands with tokens.css (SVG attributes can't use var()). */
function useTokenColors() {
  const [colors, setColors] = useState({ primary: '', line: '', muted: '' });
  useEffect(() => {
    const style = getComputedStyle(document.documentElement);
    const read = (name: string) => style.getPropertyValue(name).trim();
    setColors({ primary: read('--primary'), line: read('--line'), muted: read('--muted') });
  }, []);
  return colors;
}

/** 7-day income area chart. Loaded with next/dynamic (recharts stays out of the main bundle). */
export default function IncomeChart({ data }: { data: IncomePointDto[] }) {
  const colors = useTokenColors();
  if (!colors.primary) return <div className="h-64" />;

  const points = data.map((point) => ({
    ...point,
    day: dayFormat.format(new Date(`${point.date}T12:00:00Z`)),
  }));

  return (
    <div className="h-64" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <defs>
            <linearGradient id="income-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.primary} stopOpacity={0.22} />
              <stop offset="100%" stopColor={colors.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={colors.line} strokeDasharray="4 4" />
          <XAxis
            dataKey="day"
            reversed
            tickLine={false}
            axisLine={false}
            tick={{ fill: colors.muted, fontSize: 12 }}
          />
          <YAxis
            orientation="right"
            width={56}
            tickLine={false}
            axisLine={false}
            tick={{ fill: colors.muted, fontSize: 12 }}
            tickFormatter={(value: number) => formatNumber(value)}
          />
          <Tooltip
            cursor={{ stroke: colors.line }}
            formatter={(value) => [formatMoney(Number(value)), '']}
            labelStyle={{ fontWeight: 600 }}
            contentStyle={{
              borderRadius: 12,
              border: `1px solid ${colors.line}`,
              direction: 'rtl',
            }}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke={colors.primary}
            strokeWidth={2.5}
            fill="url(#income-fill)"
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
