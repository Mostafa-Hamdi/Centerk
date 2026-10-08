import { useCallback, useEffect, useState } from 'react';

/** Seconds countdown (resend timers). `restart(n)` starts again from n. */
export function useCountdown(initialSeconds: number) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = window.setTimeout(() => {
      setSecondsLeft((value) => value - 1);
    }, 1000);
    return () => {
      window.clearTimeout(timer);
    };
  }, [secondsLeft]);

  const restart = useCallback((seconds: number) => {
    setSecondsLeft(seconds);
  }, []);

  return { secondsLeft, done: secondsLeft <= 0, restart };
}
