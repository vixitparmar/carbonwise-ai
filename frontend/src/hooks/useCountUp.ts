import { useEffect, useState } from 'react';

/**
 * A hook that animates a numeric value from 0 to target using requestAnimationFrame.
 * Matches screen refresh rates for premium, buttery-smooth count-ups.
 */
export function useCountUp(target: number, durationMs: number = 400, decimals: number = 0) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let frameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / durationMs, 1);
      
      // Easing function: easeOutQuad
      const easeProgress = progress * (2 - progress);
      
      setCount(easeProgress * target);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };

    frameId = window.requestAnimationFrame(step);
    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [target, durationMs]);

  return parseFloat(count.toFixed(decimals));
}
