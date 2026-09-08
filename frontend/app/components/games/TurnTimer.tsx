import { useEffect, useState } from 'react';

const turnDurationSec = 20;

export default function TurnTimer() {
  const [remainingSeconds, setRemainingSeconds] = useState(turnDurationSec);

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

  return <li>Time left: {remainingSeconds}s</li>;
}
