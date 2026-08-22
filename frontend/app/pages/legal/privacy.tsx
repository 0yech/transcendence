export default function PrivacyPolicy() {
  return (
    <main className="mx-auto max-w-2xl space-y-4 p-6">
      <h1 className="text-3xl font-semibold">Privacy Policy</h1>
      <p className="text-sm">Last updated: 10.08.2026</p>

      <p>
        This policy explains what personal data NONO99 collects, why we collect
        it, how long we keep it, and what you can do about it.
      </p>

      <h2 className="pt-4 text-xl font-semibold">
        Who is responsible for your data
      </h2>
      <p>
        NONO99 is a student project built as part of the 42 Lausanne curriculum
        by 0yech, stellaaa.sh, tricaducee, miniflint. It is not a commercial
        service and there is no company behind it. The team members named above
        are jointly responsible for the data described here.
      </p>
      <p>
        You can reach us at{' '}
        <a className="underline" href="mailto:aisling.fontaine@pm.me">
          aisling.fontaine@pm.me
        </a>
        .
      </p>

      <h2 className="pt-4 text-xl font-semibold">What we collect, and why</h2>
      <p>
        We only collect what the application actually needs to work. Nothing
        here is used for advertising, profiling, or resale, and we do not sell
        or share your data with anyone for their own purposes.
      </p>

      <h3 className="pt-2 font-semibold">When you create an account</h3>
      <dl className="space-y-4">
        <div>
          <dt className="font-medium">Username</dt>
          <dd>
            Identifies your account when you log in, and is what other players
            see in lobbies, guilds and chat.
          </dd>
        </div>
        <div>
          <dt className="font-medium">Email address</dt>
          <dd>
            Identifies your account and is how we would contact you about it. It
            is never shown to other players.
          </dd>
        </div>
        <div>
          <dt className="font-medium">Password</dt>
          <dd>
            Only if you register with a password rather than through a sign-in
            provider. Stored only as a bcrypt hash; we never store or see the
            password itself.
          </dd>
        </div>
        <div>
          <dt className="font-medium">Avatar picture URL</dt>
          <dd>
            A link to a profile picture, copied from your sign-in provider when
            you first sign in.
          </dd>
        </div>
      </dl>

      <h3 className="pt-2 font-semibold">
        If you sign in with 42, Google or GitHub
      </h3>
      <p>
        We ask those providers for your email address and basic profile
        information, and nothing else. We never receive your password with them,
        and we cannot post anything on your behalf.
      </p>
      <p>
        Of what they send back, we keep three things: your email address, a
        username taken from the part of your email address before the{' '}
        <code>@</code>, and the address of your profile picture. We do not store
        an account identifier from the provider. Your account here is matched to
        theirs by email address alone.
      </p>

      <h3 className="pt-2 font-semibold">When you play</h3>
      <dl className="space-y-4">
        <div>
          <dt className="font-medium">Game records</dt>
          <dd>
            Which lobby a game belonged to, who took part and in which seat,
            whether it finished or was cancelled, who won, and when it started
            and ended.
          </dd>
        </div>
        <div>
          <dt className="font-medium">Your hand</dt>
          <dd>
            The cards you are holding are held on the server while a game is
            running, so that the game survives you closing the tab.
          </dd>
        </div>
        <div>
          <dt className="font-medium">A full replay</dt>
          <dd>
            Every action you take in a game (what you played, on which turn, in
            what order) is recorded against your account and kept after the game
            ends. The other players in that game can request the replay.
          </dd>
        </div>
        <div>
          <dt className="font-medium">Elimination</dt>
          <dd>
            If you are knocked out of a game, we record that and when it
            happened.
          </dd>
        </div>
      </dl>

      <h3 className="pt-2 font-semibold">When you join a lobby or a guild</h3>
      <dl className="space-y-4">
        <div>
          <dt className="font-medium">Lobby membership</dt>
          <dd>Which lobby you are currently in, if any.</dd>
        </div>
        <div>
          <dt className="font-medium">Private lobby passwords</dt>
          <dd>
            If you create a private lobby, the password you choose is stored so
            that we can check it when somebody tries to join. Do not reuse a
            password that matters to you.
          </dd>
        </div>
        <div>
          <dt className="font-medium">Guild membership</dt>
          <dd>
            Which guild you belong to and your role in it: member, officer or
            leader.
          </dd>
        </div>
        <div>
          <dt className="font-medium">Guild invitations</dt>
          <dd>
            Invitations you send and invitations you receive, including who the
            other person was and whether it was accepted, declined or cancelled.
            These are kept after they have been dealt with.
          </dd>
        </div>
      </dl>

      <h3 className="pt-2 font-semibold">When you chat</h3>
      <p>
        Chat happens in lobbies. There are no private messages on this service.
        Everything you type goes to a lobby channel, and anyone who is in that
        lobby can read its entire history, including messages sent before they
        joined.
      </p>
      <dl className="space-y-4">
        <div>
          <dt className="font-medium">Chat messages</dt>
          <dd>
            The content of the message, who wrote it, and when. Stored so that
            the conversation is still there when you come back.
          </dd>
        </div>
      </dl>

      <h3 className="pt-2 font-semibold">
        Automatically, when you use the site
      </h3>
      <dl className="space-y-4">
        <div>
          <dt className="font-medium">Authentication cookies</dt>
          <dd>Keep you logged in. See the cookie section below.</dd>
        </div>
        <div>
          <dt className="font-medium">Server logs</dt>
          <dd>
            IP address, request path, timestamp and user agent, used for
            operating the service, diagnosing faults, and detecting abuse.
          </dd>
        </div>
      </dl>

      <h2 className="pt-4 text-xl font-semibold">Cookies</h2>
      <p>We use cookies for one purpose only: keeping you signed in.</p>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong>Access token cookie</strong>: a short-lived token identifying
          your session.
        </li>
        <li>
          <strong>Refresh token cookie</strong>: a longer-lived token,
          restricted to our authentication path so that it is not sent with
          ordinary requests, used to issue a new access token when the old one
          expires.
        </li>
      </ul>
      <p>
        Both are set as HttpOnly (unreadable by JavaScript), Secure (sent only
        over HTTPS), and SameSite=Lax (not sent on cross-site requests).
      </p>
      <p>
        Your session itself is held in the server’s memory rather than in the
        database. Logging out deletes it immediately. Sessions expire two weeks
        after you sign in, and expired ones are cleared out every hour.
      </p>
      <p>
        We use no analytics, advertising, or third-party tracking cookies.
        Because our cookies are strictly necessary to provide a service you
        asked for, we do not show a cookie consent banner. Blocking these
        cookies will prevent you from logging in.
      </p>

      <h2 className="pt-4 text-xl font-semibold">
        Our legal basis for processing
      </h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong>Performance of a contract</strong> : account data, game data,
          lobby and guild membership, and chat. We cannot provide this service
          without the collected data.
        </li>
        <li>
          <strong>Legitimate interests</strong>: server logs and authentication
          security measures, so we can keep the service running and prevent
          abuse.
        </li>
      </ul>

      <h2 className="pt-4 text-xl font-semibold">Who else sees your data</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong>Other users</strong>: your username and avatar, the guild you
          belong to and your role in it, any message you send in a lobby you
          share with them, and the replay of any game you played together. Your
          email address is never shown to other players.
        </li>
        <li>
          <strong>Your sign-in provider</strong> (42, Google or GitHub), if you
          choose to sign in that way. Their own privacy policy governs what they
          do.
        </li>
        <li>
          <strong>Nobody else.</strong> We do not use third-party analytics,
          advertising networks, or cloud-based processors. The application and
          its database run on infrastructure operated by the team.
        </li>
      </ul>
      <p>
        We would disclose data if legally compelled to, but we will tell you if
        that happens unless we are prohibited from doing so.
      </p>

      <h2 className="pt-4 text-xl font-semibold">How long we keep it</h2>
      <p>
        We keep data indefinitely in theory; but in practice, that only means
        for the time the database is up and running. We might reset it without
        notice, as this is a students project.
      </p>

      <h2 className="pt-4 text-xl font-semibold">Your rights</h2>
      <p>You have the right to:</p>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong>Access</strong> the personal data we hold about you.
        </li>
        <li>
          <strong>Correct</strong> it if it is wrong.
        </li>
        <li>
          <strong>Delete</strong> your account and the data attached to it.
        </li>
        <li>
          <strong>Export</strong> your data in a machine-readable format.
        </li>
        <li>
          <strong>Object to or restrict</strong> certain processing.
        </li>
      </ul>
      <p>
        If you are unhappy with how we have handled your data, you can complain
        to a data protection authority. In Switzerland, the Federal Data
        Protection and Information Commissioner (FDPIC); in the EU, the
        authority in your country of residence.
      </p>

      <h2 className="pt-4 text-xl font-semibold">Security</h2>
      <p>
        Passwords are hashed with bcrypt before they are stored, so nobody
        (including us) can read them. Traffic between your browser and the site
        uses HTTPS. Session tokens are held in HttpOnly cookies, so that a
        cross-site scripting bug cannot read them.
      </p>
      <p>
        This is a students project. Please do not store anything sensitive here,
        and do not reuse a password you use anywhere else.
      </p>

      <h2 className="pt-4 text-xl font-semibold">Children</h2>
      <p>
        This service is not intended for anyone under 18. We do not knowingly
        collect data from children. If you believe a child has created an
        account, contact us and we will remove it.
      </p>

      <h2 className="pt-4 text-xl font-semibold">Changes to this policy</h2>
      <p>
        If we change how we handle your data, we will update this page and
        change the date at the top. Significant changes will be announced in the
        application.
      </p>
    </main>
  );
}
