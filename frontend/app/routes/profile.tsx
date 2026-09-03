import { useState, useEffect } from 'react';
import type { SelfUserInterface } from '~/context/WebSocketContext';
import { UserProfile } from '~/components/userProfiles/userProfile';

export default function Profile() {
  const [user, setUser] = useState<SelfUserInterface | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((data) => data.json())
      .then((json) => setUser(json))
      .catch((e) => console.log(e));
  }, []);

  return <UserProfile user={user} />;
}
