import { twMerge } from 'tailwind-merge';
import {
  cardStyle,
  textTitleStyle,
  textTitle2Style,
  textDiscretStyle,
} from '~/styles/style';

export default function PrivacyPolicy() {
  return (
    <main className="pt-30 pb-20 px-4 flex justify-center">
      <div className={twMerge(cardStyle, 'max-w-2xl space-y-4')}>
        <h1 className={twMerge(textTitleStyle, 'uppercase')}>Privacy Policy</h1>
        <p className={textDiscretStyle}>Last updated: 21.09.2026</p>

        <p>
          This policy explains what personal data NONO99 collects, why we
          collect it, how long we keep it, and what you can do about it.
        </p>

        <h2 className={twMerge(textTitle2Style, 'font-bold pt-6')}>
          Who is responsible for your data
        </h2>
        <p>
          NONO99 is a student project built as part of the 42 Lausanne
          curriculum by 0yech, stellaaa.sh, tricaducee, miniflint. It is not a
          commercial service and there is no company behind it. The team members
          named above are jointly responsible for the data described here.
        </p>
        <p>
          You can reach us at{' '}
          <a
            className="text-pink underline"
            href="mailto:aisling.fontaine@pm.me"
          >
            aisling.fontaine@pm.me
          </a>
          .
        </p>

        <h2 className={twMerge(textTitle2Style, 'font-bold pt-6')}>
          What we collect, and why
        </h2>
        <p>
          We only collect what the application actually needs to work. Nothing
          here is used for advertising, profiling, or resale, and we do not sell
          or share your data with anyone for their own purposes.
        </p>

        <h3 className="pt-4 font-bold">When you create an account</h3>
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
              Identifies your account and is how we would contact you about it.
              It is never shown to other players.
            </dd>
          </div>
          <div>
            <dt className="font-medium">Password</dt>
            <dd>
              Only if you register with a password rather than through a sign-in
              provider. It is stored scrambled, in a form that cannot be turned
              back into your password; we never store or see the password
              itself.
            </dd>
          </div>
          <div>
            <dt className="font-medium">Profile picture</dt>
            <dd>
              You can upload a picture, or give us the address of one hosted
              elsewhere. We copy an address from your sign-in provider the first
              time you sign in. A picture you upload is stored by us, and only
              signed-in players can see it. If you use an address instead, your
              browser fetches the picture from whoever hosts it, and that host
              sees the IP address of everyone who views it, which means a player
              can point it at a site of their own and learn who has been looking
              at them.
            </dd>
          </div>
        </dl>

        <h3 className="pt-4 font-bold">
          If you sign in with 42, Google or GitHub
        </h3>
        <p>
          We ask those providers for your email address and basic profile
          information. Signing in with 42 also sends us your name and your phone
          number; we discard both and never store them. We never receive your
          password with them, and we cannot post anything on your behalf.
        </p>
        <p>
          Of what they send back, we keep four things: your email address, a
          username taken from the part of your email address before the{' '}
          <code>@</code>, the address of your profile picture, and the
          identifier that provider uses for you, so that we recognise you when
          you sign in that way again.
        </p>

        <h3 className="pt-4 font-bold">When you play</h3>
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
              We keep the cards you are holding, so that the game survives you
              closing the tab. They stay on record after the game is over,
              though nobody else is shown them.
            </dd>
          </div>
          <div>
            <dt className="font-medium">A full replay</dt>
            <dd>
              Every action you take in a game (what you played, on which turn,
              in what order) is recorded against your account and kept after the
              game ends. Replays are public: anyone with a link to a finished or
              abandoned game can watch it, whether or not they have an account.
            </dd>
          </div>
          <div>
            <dt className="font-medium">Elimination</dt>
            <dd>
              If you are knocked out of a game, we record that and when it
              happened.
            </dd>
          </div>
          <div>
            <dt className="font-medium">Points</dt>
            <dd>
              The points you win in a game, your total, and what your guild has.
            </dd>
          </div>
          <div>
            <dt className="font-medium">Rating</dt>
            <dd>
              A rating that goes up when you win and down when you lose. We also
              keep the rating you had at the start of every game you play, and
              those stay on record. Other players can see your rating, and so
              can anyone watching a replay.
            </dd>
          </div>
          <div>
            <dt className="font-medium">Your record</dt>
            <dd>
              How many games you have finished, how many of them you scored in,
              and when you last played.
            </dd>
          </div>
        </dl>

        <h3 className="pt-4 font-bold">When you join a lobby or a guild</h3>
        <dl className="space-y-4">
          <div>
            <dt className="font-medium">Lobby membership</dt>
            <dd>Which lobby you are currently in, if any.</dd>
          </div>
          <div>
            <dt className="font-medium">Lobby codes</dt>
            <dd>
              Every lobby has a short code. A private lobby is kept off the
              public list, but anyone who has its code can see who is in it,
              with or without an account, and any player who has it can join.
              Only pass the code to people you want in the game.
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
              Invitations you send and invitations you receive, including who
              the other person was and whether it was accepted, declined or
              cancelled. These are kept after they have been dealt with.
            </dd>
          </div>
        </dl>

        <h3 className="pt-4 font-bold">When you add friends</h3>
        <dl className="space-y-4">
          <div>
            <dt className="font-medium">Friends</dt>
            <dd>
              Who you are friends with. Friendship is mutual: you each appear on
              the other's list.
            </dd>
          </div>
          <div>
            <dt className="font-medium">Friend invitations</dt>
            <dd>
              Invitations you send and invitations you receive, including who
              the other person was and whether it was accepted or declined.
              These are kept after they have been dealt with, and stay even if
              you stop being friends later.
            </dd>
          </div>
        </dl>
        <p>
          Your friends are shown when you are online, and can join the lobby you
          are in, a private one included. We keep no record of when you were
          online. Other players cannot follow you into a lobby that way, but any
          signed-in player can see that you are in one, and if it is a public
          lobby the list of open games shows who is in it to anyone at all.
        </p>

        <h3 className="pt-4 font-bold">When you chat</h3>
        <p>
          Chat happens in lobbies. There are no private messages on this
          service. Everything you type goes to a lobby channel, and anyone who
          is in that lobby can read its entire history, including messages sent
          before they joined. In a public lobby, any signed-in player can read
          the history without joining at all.
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

        <h3 className="pt-4 font-bold">Automatically, when you use the site</h3>
        <dl className="space-y-4">
          <div>
            <dt className="font-medium">Authentication cookies</dt>
            <dd>Keep you logged in. See the cookie section below.</dd>
          </div>
          <div>
            <dt className="font-medium">Server logs</dt>
            <dd>
              IP address, which page you asked for, when, which browser you
              used, and the page you came from. Used for operating the service,
              diagnosing faults, and detecting abuse.
            </dd>
          </div>
        </dl>

        <h2 className={twMerge(textTitle2Style, 'font-bold pt-6')}>Cookies</h2>
        <p>We use cookies for one purpose only: keeping you signed in.</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Access token cookie</strong>: a short-lived one, identifying
            you while you are using the site.
          </li>
          <li>
            <strong>Refresh token cookie</strong>: a longer-lived one, which
            keeps you signed in while you are using the site.
          </li>
        </ul>
        <p>
          Other websites cannot read either of them, and neither can scripts
          running in the page.
        </p>
        <p>
          We use no analytics, advertising, or third-party tracking cookies.
          Because our cookies are strictly necessary to provide a service you
          asked for, we do not show a cookie consent banner. Blocking these
          cookies will prevent you from logging in.
        </p>

        <h2 className={twMerge(textTitle2Style, 'font-bold pt-6')}>
          Our legal basis for processing
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Performance of a contract</strong>: account data, game data,
            lobby and guild membership, and chat. We cannot provide this service
            without the collected data.
          </li>
          <li>
            <strong>Legitimate interests</strong>: server logs, so we can keep
            the service running and look into faults and abuse.
          </li>
        </ul>

        <h2 className={twMerge(textTitle2Style, 'font-bold pt-6')}>
          Who else sees your data
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Other users</strong>, once they are signed in: your username
            and picture, the guild you belong to and your role in it, your
            points, your rating and your record, your last twenty games and how
            each one ended, the guild invitations you have sent, any message you
            send in a lobby you share with them, and the replay of any game you
            played together. Your email address is never shown to other players.
          </li>
          <li>
            <strong>Anyone at all</strong>, with no account needed: the list of
            open games and guilds, along with the usernames, pictures, points
            and ratings of the people in them, a ranking of the top guilds and
            who belongs to each, and the replay of any finished or abandoned
            game. A private lobby's code gets them the same view of who is in
            it.
          </li>
          <li>
            <strong>Google</strong>: we load a font from Google on every page,
            including the sign-in page, before you have an account. Google
            therefore sees your IP address and which browser you are using every
            time you visit.
          </li>
          <li>
            <strong>Whoever hosts a profile picture</strong>: pictures are
            loaded from wherever their address points, so that site sees the IP
            address of everyone who views the picture.
          </li>
          <li>
            <strong>Your sign-in provider</strong> (42, Google or GitHub), if
            you choose to sign in that way. Their own privacy policy governs
            what they do.
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
          We would disclose data if legally compelled to, but we will tell you
          if that happens unless we are prohibited from doing so.
        </p>

        <h2 className={twMerge(textTitle2Style, 'font-bold pt-6')}>
          How long we keep it
        </h2>
        <p>
          We keep data for as long as the service is running, and nothing is
          deleted on a timer. A few things you do erase data straight away:
          replacing or removing your profile picture, removing a friend, and
          deleting a guild you lead. We might wipe everything without notice, as
          this is a student project.
        </p>
        <p>
          A lobby closes by itself fifteen minutes after it was opened, unless a
          game is running or has just been played in it. Nothing in it is
          deleted, but its chat cannot be opened again.
        </p>
        <p>
          Server logs are the exception: they sit on the machine running the
          site, and are lost when we take the service down rather than on any
          schedule.
        </p>

        <h2 className={twMerge(textTitle2Style, 'font-bold pt-6')}>
          Deleting your account
        </h2>
        <p>
          Deleting your account deactivates it. It does not erase it. Ask us if
          you want your account deleted, and we will do it for you.
        </p>
        <p>
          If you lead a guild, you have to pass it to somebody else before your
          account can be deleted.
        </p>
        <p>
          When that happens, you are signed out and can no longer sign in; on a
          device you are still signed in on, it can take a few minutes to take
          effect. Your profile page disappears, your username and email address
          are replaced with a placeholder, and your profile picture is removed.
        </p>
        <p>
          Everything else stays. We keep your chat messages, the record and
          replay of every game you played, the guild invitations you sent and
          received, your friends and the friend invitations you sent and
          received, your points and your rating. If you were in a guild, your
          account stays on its member list. Other players still see all of it,
          under the placeholder name.
        </p>
        <p>
          What we keep stays attached to your old account. Deleting is not the
          same as becoming anonymous.
        </p>
        <p>
          Your old username and email address become free for anyone to use
          again. If you sign in again afterwards, you get a new and separate
          account, possibly under the same username, while the old one and
          everything on it remain.
        </p>
        <p>
          <strong>
            Nothing we keep is erased unless you specifically ask us to erase
            it.
          </strong>{' '}
          If you want your messages, games and replays actually removed, email
          us at{' '}
          <a
            className="text-pink underline"
            href="mailto:aisling.fontaine@pm.me"
          >
            aisling.fontaine@pm.me
          </a>{' '}
          and we will delete them by hand.
        </p>

        <h2 className={twMerge(textTitle2Style, 'font-bold pt-6')}>
          Your rights
        </h2>
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
          You can change your username, your email address, your password and
          your picture yourself, on the settings page. For anything else, email
          us at{' '}
          <a
            className="text-pink underline"
            href="mailto:aisling.fontaine@pm.me"
          >
            aisling.fontaine@pm.me
          </a>{' '}
          and we will sort it out with you. Deleting your account is described
          in the section above.
        </p>
        <p>
          If you are unhappy with how we have handled your data, you can
          complain to a data protection authority. In Switzerland, the Federal
          Data Protection and Information Commissioner (FDPIC); in the EU, the
          authority in your country of residence.
        </p>

        <h2 className={twMerge(textTitle2Style, 'font-bold pt-6')}>Security</h2>
        <p>
          Your account password is stored scrambled, in a form that cannot be
          turned back into the password, so nobody (including us) can read it.
          Traffic between your browser and the site uses HTTPS. The certificate
          is one we made ourselves rather than one bought from a recognised
          authority, so your browser will warn you the first time you visit, and
          you have to accept it to go on.
        </p>
        <p>
          This is a student project. Please do not store anything sensitive
          here, and do not reuse a password you use anywhere else.
        </p>

        <h2 className={twMerge(textTitle2Style, 'font-bold pt-6')}>
          If something goes wrong
        </h2>
        <p>
          If we find out that personal data has been exposed, we will fix the
          cause, tell the people affected, and explain what happened. Where the
          law requires it, we will also notify the relevant authority.
        </p>

        <h2 className={twMerge(textTitle2Style, 'font-bold pt-6')}>Children</h2>
        <p>
          This service is not intended for anyone under 18. We do not knowingly
          collect data from children. If you believe a child has created an
          account, contact us and we will remove it.
        </p>

        <h2 className={twMerge(textTitle2Style, 'font-bold pt-6')}>
          Changes to this policy
        </h2>
        <p>
          If we change how we handle your data, we will update this page and
          change the date at the top. Significant changes will be announced in
          the application.
        </p>
      </div>
    </main>
  );
}
