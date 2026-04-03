// TASK-034 FR-017: Animated number counter for CCV/ERV transitions.
// Uses requestAnimationFrame for smooth 500ms transition.

import { useState, useEffect, useRef } from 'react';

interface Props {
  value: number | null;
  formatter?: (n: number) => string;
  className?: string;
  style?: React.CSSProperties;
  nullText?: string;
}

const DURATION_MS = 500;

export function AnimatedNumber({ value, formatter, className, style, nullText = '—' }: Props) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = value;

    if (prev === null || value === null || prev === value) {
      setDisplay(value);
      return;
    }

    const start = performance.now();
    const from = prev;
    const to = value;

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / DURATION_MS, 1);
      const current = Math.round(from + (to - from) * progress);
      setDisplay(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value]);

  const text = display !== null
    ? (formatter ? formatter(display) : display.toLocaleString())
    : nullText;

  return <span className={className} style={style}>{text}</span>;
}
