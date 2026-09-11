import { useEffect, useState } from 'react';

const TURN_DURATION_SEC = 20;

/** Compte à rebours du tour, remonté à chaque changement de turnNumber par sa key. */
export default function TurnTimer() {
  const [remainingSeconds, setRemainingSeconds] = useState(TURN_DURATION_SEC);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setRemainingSeconds((previous) => {
        if (previous <= 1) {
          window.clearInterval(interval);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const ratio = remainingSeconds / TURN_DURATION_SEC;
  const urgent = ratio <= 0.25;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-mid-gray text-xs tracking-wider uppercase">
          Time left
        </span>
        <span className={urgent ? 'text-danger font-medium' : 'font-medium'}>
          {remainingSeconds}s
        </span>
      </div>
      <div className="bg-dark-blue/40 h-1 w-full overflow-hidden rounded-full">
        <div
          className={`h-full rounded-full bg-linear-to-r transition-[width] duration-1000 ease-linear ${
            urgent ? 'from-mid-dark-orange to-danger' : 'from-blue to-pink'
          }`}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
}
