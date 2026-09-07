import { useEffect, useState } from 'react';

const TURN_DURATION_SECONDS = 20;

type TurnTimerProps = {
  turnNumber?: number;
  isRunning: boolean;
};

export default function TurnTimer({ turnNumber, isRunning }: TurnTimerProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(
    TURN_DURATION_SECONDS,
  );

  useEffect(() => {
    if (!isRunning || turnNumber === undefined) {
      setRemainingSeconds(0);
      return;
    }
    setRemainingSeconds(TURN_DURATION_SECONDS);

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
  }, [turnNumber, isRunning]);

  return <li>Time left: {remainingSeconds}s</li>;
}
