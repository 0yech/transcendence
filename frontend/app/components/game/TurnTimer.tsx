import { useEffect, useState } from 'react';
import { UseWebSocket } from '~/context/UseWebSocket';

const TURN_DURATION_SEC = 45;

export default function TurnTimer() {
  const { gameState } = UseWebSocket();
  // now is used to trigger a re-render every second
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const deadline = gameState?.turnDeadline
    ? Date.parse(gameState.turnDeadline)
    : now;
  const remainingSeconds = Math.max(0, Math.ceil((deadline - now) / 1000));

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
