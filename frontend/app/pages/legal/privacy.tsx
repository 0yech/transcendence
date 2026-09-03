export default function PrivacyPolicy() {
  return (
    <main className="mx-auto max-w-2xl space-y-4 p-6">
      <h1 className="text-3xl font-semibold">Privacy Policy</h1>
      <p className="text-sm">Last updated: 02.09.2026</p>

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
            provider. It is stored scrambled, in a form that cannot be turned
            back into your password; we never store or see the password itself.
          </dd>
        </div>
        <div>
          <dt className="font-medium">Profile picture</dt>
          <dd>
            The address of a picture, not the picture itself. We copy it from
            your sign-in provider the first time you sign in, and you can change
            it to any address you like. Whoever hosts that address sees the IP
            address of everyone who views the picture, which means a player can
            point it at a site of their own and learn who has been looking at
            them.
          </dd>
        </div>
      </dl>

      <h3 className="pt-2 font-semibold">
        If you sign in with 42, Google or GitHub
      </h3>
      <p>
        We ask those providers for your email address and basic profile
        information. Signing in with 42 also sends us your name and your phone
        number; we discard both and never store them. We never receive your
        password with them, and we cannot post anything on your behalf.
      </p>
      <p>
        Of what they send back, we keep three things: your email address, a
        username taken from the part of your email address before the{' '}
        <code>@</code>, and the address of your profile picture. We keep nothing
        else that identifies you to them: your account here is matched to theirs
        by email address alone.
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
            We keep the cards you are holding while a game is running, so that
            the game survives you closing the tab.
          </dd>
        </div>
        <div>
          <dt className="font-medium">A full replay</dt>
          <dd>
            Every action you take in a game (what you played, on which turn, in
            what order) is recorded against your account and kept after the game
            ends. Replays are public: anyone with a link to a finished game can
            watch it, whether or not they have an account.
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
            If you create a private lobby, the password you choose is stored
            exactly as you typed it, so that we can check it when somebody tries
            to join. Unlike your account password, we can read it. Do not reuse
            a password that matters to you.
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
        joined. In a public lobby, any signed-in player can read the history
        without joining at all.
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
            IP address, which page you asked for, when, which browser you used,
            and the page you came from. Used for operating the service,
            diagnosing faults, and detecting abuse.
          </dd>
        </div>
      </dl>

      <h2 className="pt-4 text-xl font-semibold">Cookies</h2>
      <p>We use cookies for one purpose only: keeping you signed in.</p>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong>Access token cookie</strong>: a short-lived one, identifying
          you while you are using the site.
        </li>
        <li>
          <strong>Refresh token cookie</strong>: a longer-lived one, which keeps
          you signed in between visits.
        </li>
      </ul>
      <p>
        Other websites cannot read either of them, and neither can scripts
        running in the page.
      </p>
      <p>
        Logging out ends your session immediately. Sessions do not last forever,
        and you may occasionally be signed out earlier than you expected; if
        that happens, simply sign in again.
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
          <strong>Performance of a contract</strong>: account data, game data,
          lobby and guild membership, and chat. We cannot provide this service
          without the collected data.
        </li>
        <li>
          <strong>Legitimate interests</strong>: server logs, and the measures
          that keep accounts secure, so we can run the service and prevent
          abuse.
        </li>
      </ul>

      <h2 className="pt-4 text-xl font-semibold">Who else sees your data</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong>Other users</strong>: your username and picture, the guild you
          belong to and your role in it, any message you send in a lobby you
          share with them, and the replay of any game you played together. Your
          email address is never shown to other players.
        </li>
        <li>
          <strong>Anyone at all</strong>, with no account needed: the list of
          open games and guilds, along with the usernames and pictures of the
          people in them, and the replay of any finished game.
        </li>
        <li>
          <strong>Google</strong>: we load a font from Google on every page,
          including the sign-in page, before you have an account. Google
          therefore sees your IP address and which browser you are using every
          time you visit.
        </li>
        <li>
          <strong>Whoever hosts a profile picture</strong>: pictures are loaded
          from wherever their address points, so that site sees the IP address
          of everyone who views the picture.
        </li>
        <li>
          <strong>Your sign-in provider</strong> (42, Google or GitHub), if you
          choose to sign in that way. Their own privacy policy governs what they
          do.
        </li>
        <li>
          <strong>Nobody else.</strong> We do not use analytics, advertising
          networks, or cloud-based processors. Apart from the font and the
          pictures described above, the application and its database run on
          infrastructure operated by the team.
        </li>
      </ul>
      <p>
        The font and many profile pictures are served by companies outside
        Switzerland and the EU, mostly in the United States. Your IP address
        reaches them whenever your browser fetches those files.
      </p>
      <p>
        We would disclose data if legally compelled to, but we will tell you if
        that happens unless we are prohibited from doing so.
      </p>

      <h2 className="pt-4 text-xl font-semibold">How long we keep it</h2>
      <p>
        We keep data indefinitely, and we never delete anything automatically.
        In practice that only means for as long as the service is running. We
        might wipe it without notice, as this is a student project.
      </p>
      <p>
        Server logs are the exception: they are short-lived, and are lost
        whenever the service restarts.
      </p>

      <h2 className="pt-4 text-xl font-semibold">Deleting your account</h2>
      <p>
        There is a <strong>Delete account</strong> button on your profile. It
        deactivates your account. It does not erase it.
      </p>
      <p>
        When you use it, you are signed out and can no longer sign in, your
        profile page disappears, and your username and email address are
        replaced with a placeholder.
      </p>
      <p>
        Everything else stays. We keep your chat messages, the record and replay
        of every game you played, the guild invitations you sent and received,
        your points, and your profile picture. Other players still see all of
        it, under the placeholder name, with your picture still beside it.
      </p>
      <p>
        What we keep stays attached to your old account. Deleting is not the
        same as becoming anonymous.
      </p>
      <p>
        Your old username and email address become free for anyone to use again.
        If you sign in again afterwards, you get a new and separate account,
        possibly under the same username, while the old one and everything on it
        remain.
      </p>
      <p>
        <strong>
          Nothing we keep is erased unless you specifically ask us to erase it.
        </strong>{' '}
        If you want your messages, games and replays actually removed, email us
        at{' '}
        <a className="underline" href="mailto:aisling.fontaine@pm.me">
          aisling.fontaine@pm.me
        </a>{' '}
        and we will delete them by hand.
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
        Only deactivating your account is a button. Everything else on that list
        we do by hand: email us at{' '}
        <a className="underline" href="mailto:aisling.fontaine@pm.me">
          aisling.fontaine@pm.me
        </a>{' '}
        and we will sort it out with you. Deleting your account is described in
        the section above.
      </p>
      <p>
        If you are unhappy with how we have handled your data, you can complain
        to a data protection authority. In Switzerland, the Federal Data
        Protection and Information Commissioner (FDPIC); in the EU, the
        authority in your country of residence.
      </p>

      <h2 className="pt-4 text-xl font-semibold">Security</h2>
      <p>
        Your account password is stored scrambled, in a form that cannot be
        turned back into the password, so nobody (including us) can read it.
        Traffic between your browser and the site uses HTTPS.
      </p>
      <p>
        The password on a private lobby is different: it is stored exactly as
        you typed it, and we can read it.
      </p>
      <p>
        This is a student project. Please do not store anything sensitive here,
        and do not reuse a password you use anywhere else.
      </p>

      <h2 className="pt-4 text-xl font-semibold">If something goes wrong</h2>
      <p>
        If we find out that personal data has been exposed, we will fix the
        cause, tell the people affected, and explain what happened. Where the
        law requires it, we will also notify the relevant authority.
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
