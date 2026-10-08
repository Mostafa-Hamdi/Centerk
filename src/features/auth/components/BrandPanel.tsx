'use client';

import {
  AnimatePresence,
  m,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { Check } from 'lucide-react';
import { useEffect, useState, type PointerEvent } from 'react';
import { Logo } from '@/components/ui/Logo';
import { ar } from '@/i18n/ar';
import { cn } from '@/lib/cn';

const copy = ar.auth.brand;

interface Shape {
  /** position + size (outer, parallax layer) */
  frame: string;
  /** look (inner, floating layer) */
  look: string;
  depth: number;
  float: number;
  duration: number;
}

const shapes: Shape[] = [
  {
    frame: '-end-16 -top-16 size-72',
    look: 'rounded-full bg-cyan/35',
    depth: 0.5,
    float: 14,
    duration: 11,
  },
  {
    frame: 'end-[18%] top-[30%] size-24',
    look: 'rounded-[28px] bg-primary-hover rotate-12',
    depth: 1.1,
    float: 18,
    duration: 8,
  },
  {
    frame: '-start-10 top-[42%] size-44',
    look: 'rounded-full border-[14px] border-primary-soft/35',
    depth: 0.8,
    float: 12,
    duration: 10,
  },
  {
    frame: 'start-[30%] -bottom-20 size-64',
    look: 'rounded-full bg-primary-hover/70',
    depth: 0.4,
    float: 10,
    duration: 12,
  },
  {
    frame: 'end-[12%] bottom-[22%] size-10',
    look: 'rounded-full bg-cyan-light',
    depth: 1.6,
    float: 22,
    duration: 6,
  },
  {
    frame: 'start-[14%] top-[16%] size-6',
    look: 'rounded-md bg-cyan-light/80 rotate-45',
    depth: 1.9,
    float: 16,
    duration: 7,
  },
];

function FloatingShape({
  shape,
  x,
  y,
}: {
  shape: Shape;
  x: MotionValue<number>;
  y: MotionValue<number>;
}) {
  const shiftX = useTransform(x, (value) => value * shape.depth * -48);
  const shiftY = useTransform(y, (value) => value * shape.depth * -48);
  return (
    <m.span
      aria-hidden
      className={cn('pointer-events-none absolute', shape.frame)}
      style={{ x: shiftX, y: shiftY }}
    >
      <m.span
        className={cn('block size-full', shape.look)}
        animate={{ y: [0, -shape.float, 0] }}
        transition={{ duration: shape.duration, repeat: Infinity, ease: 'easeInOut' }}
      />
    </m.span>
  );
}

function RotatingFeatures() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const timer = window.setInterval(() => {
      setIndex((value) => (value + 1) % copy.features.length);
    }, 4000);
    return () => {
      window.clearInterval(timer);
    };
  }, [reduce]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative h-8 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <m.p
            key={index}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0 flex items-center gap-2 text-lg font-medium text-primary-ink"
          >
            <span className="flex size-6 items-center justify-center rounded-full bg-cyan-light text-ink">
              <Check className="size-4" strokeWidth={3} aria-hidden />
            </span>
            {copy.features[index]}
          </m.p>
        </AnimatePresence>
      </div>
      <div className="flex gap-1.5" aria-hidden>
        {copy.features.map((feature, dot) => (
          <span
            key={feature}
            className={cn(
              'h-1.5 rounded-full bg-primary-ink transition-all duration-500 ease-brand',
              dot === index ? 'w-8 opacity-100' : 'w-1.5 opacity-40',
            )}
          />
        ))}
      </div>
    </div>
  );
}

/** Blue brand side of the auth layout: floating shapes with mouse parallax + rotating feature lines. */
export function BrandPanel() {
  const reduce = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const x = useSpring(pointerX, { stiffness: 50, damping: 18 });
  const y = useSpring(pointerY, { stiffness: 50, damping: 18 });

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (reduce || event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <aside
      onPointerMove={onPointerMove}
      onPointerLeave={() => {
        pointerX.set(0);
        pointerY.set(0);
      }}
      className="relative hidden h-[calc(100dvh-2*var(--shell-gap))] overflow-hidden rounded-xl bg-primary p-10 text-primary-ink lg:sticky lg:top-(--shell-gap) lg:flex lg:flex-col lg:justify-between xl:p-14"
    >
      {shapes.map((shape) => (
        <FloatingShape key={shape.frame} shape={shape} x={x} y={y} />
      ))}

      <Logo tone="inverse" className="relative" />

      <div className="relative flex max-w-lg flex-col gap-6">
        <h2 className="font-display text-4xl leading-tight font-bold xl:text-5xl xl:leading-tight">
          {copy.headline}
        </h2>
        <p className="text-lg text-primary-ink/85">{copy.sub}</p>
        <RotatingFeatures />
      </div>

      <div className="relative flex w-fit items-center gap-3 rounded-lg border border-primary-ink/20 bg-primary-ink/10 px-4 py-3 backdrop-blur-md">
        <span className="relative flex size-3" aria-hidden>
          <span className="absolute inset-0 animate-ping rounded-full bg-cyan-light opacity-75" />
          <span className="relative size-3 rounded-full bg-cyan-light" />
        </span>
        <div className="flex flex-col">
          <span className="text-sm font-semibold">{copy.liveTitle}</span>
          <span className="text-xs text-primary-ink/80">
            {copy.liveGroup} · {copy.liveCount}
          </span>
        </div>
      </div>
    </aside>
  );
}
