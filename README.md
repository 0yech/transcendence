# 42 Transcendence

## Description

ONO99, by 0yech, stellaaa.sh, tricaducee, and Miniflint, is an online multiplayer card game.
Battle against your friends in a 3D environment, create guilds, and climb the ranks!

The goal for this project was to have a fun game playable by everyone. That means a simple game,
with a clear interface, and many ways to have fun. This led to the chat and friends system, the guilds
which allow you to compete in groups, as well as an immersive 3D environment where the game is played.

## Instructions

### Prerequisites

To build the project, all you need is Docker and Docker Compose installed. On linux, make sure the buildx extension is installed, as well.

### Environment Setup

The project needs a complete `.env` file, a template of which is included in `.env.example`.

- FRONTEND_ORIGIN (http://localhost:5173): the url the project will be found at, including the port if it isn't the standard http/https one.
- DOMAIN (ono.42.fr): the domain the project will be found at.
- FRONTEND_PORT (5173): set it to 443 if you want to use the standard HTTPS port. This says which port is used for the actual application.
- BACKEND_PORT (3000): can stay 3000, or any port you'd like.
- PRISMA_STUDIO_PORT (5555): for the development setup; sets the port the Prisma Studio interface is accessible at.
- POSTGRES_USER (transcendence): standard user used in the database.
- POSTGRES_PASSWORD (transcendence): password for the database's standard user.
- POSTGRES_DB (transcendence): the name of the database to be created in PostgresSQL.
- DATABASE_URL (postgresql://transcendence:transcendence@database:5432/transcendence?schema=public): used by Prisma to connect to the database. Shouldn't be changed unless you change the database port in the Docker Compose setup.
- JWT_SECRET (transcendence): set it to a strong passphrase to keep your login tokens secure.
- OAuth 2.0 CLIENT_ID and CLIENT_SECRET variables: set them to the values found in the respective providers' OAuth 2.0 panels.

### Building the Project

One command: `make` at the root of the directory. This will drop you into the Docker view of logs for all the containers, from which you can hit the `d` key on your keyboard to detach.

Here are some other relevant commands:

- `make up`: equivalent to `make`.
- `make down`: when you're done playing for now.
- `make clean`: when you're done for good; this cleans images and leftover volumes on your system. Careful, as this removes all data from the database!!
- `make dev-up`/`make dev-down`: same as `make up` and `make down`, but for the development setup, with live refresh for changes. Used for development.

## Team Information

- [0yech](https://github.com/0yech) - Product Owner
> Making sure the project meets the expectations, set the vision for the final product, and decide on modules
- [stellaaash](https://github.com/stellaaash) - Project Manager
> Overseeing the day to day decisions of the project, coordinating with the team, managing GitHub issues, and prioritizing features and issues.
- 0yech - Tech Lead
> Making technical decisions such as tool choice and design decisions, decide on the technical stack (technologies and libraries).
- [tricaducee](https://github.com/tricaducee) - Art Director
> Creating the art used by the project and designing the web pages.
- 0yech, stellaaash, tricaducee, [Miniflint](https://github.com/Miniflint) - Developers
> Adding features, refactoring code, writing documentation.

## Project Management

GitHub Issues were used to delegate individual tasks.
Most of the project organization happened directly, either in person or through the Discord DMs group.
Individual contributors talked with the entire group for every decision, ensuring transparent and efficient communications.

## Technical Stack

- Frontend: React, ThreeJS/React Three Fiber/Drei for 3D, GLSL for shaders, Motion for animations
- Backend: NestJS
- Database: PostgreSQL with Prisma ORM
- Tailwind CSS for styling
- TypeScript throughout the codebase

For the front end, React was chosen because of its extensive documentation, the many existing projects,
and the contributions on forums. Three.js is one of the leading libraries supporting 3D, and R3F enables direct integration of Three.js into React.
GLSL is the shader language used by OpenGL ES, the graphics framework on which Three.js is based.
Therefore, these technologies were chosen for the 3D environment.

For the backend, NestJS was the perfect choice for us. As it was our first web project,
having a backend framework providing structure would be a great help, and indeed, it was.
Controllers, services, all NestJS abstractions have been an amazing help to build a coherent backend.

PostgreSQL was chosen for the database for its powerful features and ease of schema generation,
as well as the Prisma ORM for its code API.

Tailwind for styling gained us a lot of time that would have been spent on designing CSS stylesheets.
Instead, Tailwind classes were used for styling, helping us keep a consistent style throughout the project.

TypeScript was chosen to make learning JavaScript simpler. It's not going to
make life easy at first, but it will save us a lot of time in the long run,
and will give us a better understanding of the code we're writing, as well as
better tooling overall.

## Database Schema

<img width="1667" height="1239" alt="image" src="https://github.com/user-attachments/assets/4a5a63c8-9378-455c-b455-b65074b84a01" />

## Features List

- A fully flegged ONO99 implementation in the backend, implementing all the rules of the base game.
The backend uses WebSockets to communicate game state updates to clients.
0yech.
- An interactive 3D client for the ONO99 game, with shaders and real-time animations.
Listens to the backend's WebSockets layer.
Allows people to play on remote networks.
tricaducee, Miniflint.
- A lobby system for allowing people to play together, and invite each other using unique codes.
Features a password system as well.
0yech, tricaducee, Miniflint.
- A chat system in lobbies, using WebSockets for communication with the backend, which stores messages in the database.
0yech, Miniflint.
- A guilds system, including a ranking system for competing between groups of players.
0yech, Miniflint.
- Rankings with points and ranks, allowing for friendly competition between users and guilds.
Miniflint.
- A login and register system, allowing users to register with an email, username, and password.
stellaaash.
- OAuth 2.0, with Google, GitHub, and 42 logins.
stellaaash.
- A profile system, where users can update their personal information, and upload a profile picture.
It also displays the player's statistics and progression through the ranks.
stellaaash, Miniflint.

## Modules

> Bonus modules are between parentheses

Total points: 17 mandatory (+ 6 bonus): 23 points

### 1. Web

Total points: 6 (8)

#### Use a framework for the backend and the frontend (React for frontend, NestJS for backend) - Major +2

Using frameworks guided us in taking architectural decisions for our first web projects.
React was chosen for its clear documentation, widespread use, and simple design.
NestJS was chosen for the structure it gave to a backend, something none of us had dealt with before.
It allowed us to keep a consistent structure, and understand backend concepts better.

0yech, stellaaash, tricaducee, Miniflint

#### (Real-time features using WebSockets (real-time chat) - Major +2)

Having a chat system allows users to interact during games, using the same technology the game uses.
Same as the game logic, the backend is where all chat inputs go. Each client connects their socket
to the backend, sends and retrieves messages from there directly.

0yech, stellaaash

#### Allow users to interact with other users - Major +2

For an online game, having friends, being able to have friendly banter with your opponents in a lobby,
all of this is part of the charm.
The chat system was implemented using WebSockets. The profile system displays information stored
in the database, with profile pictures (image or url), email, username.
The friends system was implemented using a many2many relationship in the database between users.

0yech, tricaducee, Miniflint

#### Use an ORM for the db (Prisma) - Minor +1

Using an ORM for interacting with the database simplified things immensely for storing and updating data.
Prisma was chosen for its simple, declarative system. It allowed us to use types with TypeScript, drastically limiting the error rate during development.

0yech, stellaaash, Miniflint

#### Custom-made design system with reusable components - Minor +1

To maintain a consistent style across pages and avoid rewriting Tailwind code more times than necessary,
having reusable components such as the navbar, different types of buttons, avatars, the footer, etc.,
as well as a color palette and design variables, is a real advantage.

tricaducee

### 2. Accessibility and Internationalization

Total points: 1

#### Support for additional browsers - Minor +1

We want players to be able to use their favorite browser to play our game!
The project has been following best practices for all browsers, and works flawlessly on Firefox as well as Google Chrome.

0yech, stellaaash, tricaducee, Miniflint

### 3. User Management

Total points: 4 (6)

#### Standard user management and authentication - Major +2

Users can create accounts with a username and password, and update their information on the profile page.
Instead of using a library to build our basic authentication system, we created it from scratch, learning the major concepts along the way. The system uses cookie tokens to keep track of sessions and allow access to protected backend routes.

stellaaash

#### Game stats and match history - Minor +1

Since this is a game, allowing users to look back on their performance and see areas of improvement, or people they struggle against, is useful.
Achievements and progression were implemented using ranks system when you gain points, allowing users to climb the ranks as they score more wins.

TODO implementation details and contributors (TODO : Edit when Elo is finished)

0yech, Miniflint

#### OAuth 2.0 - Minor +1

For users that don't want to manage a password for every service, having standard OAuth providers like Google and GitHub is a plus.
OAuth 2.0 was implemented with the help of the Passport library, which then plugged into our own auth system to issue tokens and create sessions.

stellaaash

#### (Organization system for guilds - Major +2)

Allowing users to form teams reinforces the fun part of playing a game, and creates healthy competition.

Guilds earn points whenever their players score points. A guild ranking is available so players can enjoy competing in pairs. (TODO : edit when elo is finished)

0yech

### 6. Gaming

Total points: 6 (8)

#### Complete web-based game (ONO card game) - Major +2

The core of the project, and what everything else revolves around.
The game logic was implemented on the backend, and the latter is always authoritative.
Essentially, the frontend only acts as an interface to the game, submitting and displaying the state to and from the backend.

0yech, tricaducee, Miniflint

#### Remote players - Major +2

Allowing players to join from anywhere adds a lot of possibilities, and allows people from the entire world to play together.
Websockets are connected to the backend, which is the authoritative source. As long as a client (the frontend) can connect
to the backend, they can play the game, from anywhere in the world.

0yech, Miniflint

#### More than two players - Major +2

With a card game like this, the more, the merrier!
The game logic takes into account multiple players, with a hard limit of 6 players.

0yech, Miniflint

#### (Advanced 3D graphics with Three.js/R3F - Major +2)

This shows the game's state in a 3D environment, similar to if you were playing around a table with your friends.
The game also features animations for discarding and drawing cards, just like in a real card game.
To play a card, simply click on it and it will be highlighted when you hover over it with the mouse,
an animation will appear if a card cannot be played.

The background also features advanced 3D effects thanks to a custom GLSL vertex and fragment shader that reacts to the cursor (color),
which greatly enhances the design and user experience.

tricaducee

## Individual Contributions

### 0yech

Implemented most game related backend elements, including:
- `Lobby system`
- `Game logic`
- `Guild system`
- `Chat system`
- `Websocket/Socket.IO usage for real-time features`

0yech is also responsible for the initial database schema with prisma. As well as bugfixing, testing and overseeing along the project to ensure the project/repository's quality.

#### Challenges

As the frontend team would join us later on for the project, one of the biggest challenges was building a reliable backend without much frontend elements. This required us to be cautious, as we had to build and envision features that could be used by the frontend team with little to no changes needed.

#### Problems Encountered

As we were building a card game, that heavily relies on luck, testing many different cases was hard. What if no one has a playable hand ? What if someone sees their hand is really bad and decides to rage-quit in a game with many players ? A strict deadline also made the project harder.

### stellaaash

Implemented the majority of user and auth related features, among other various things:
- `Standard auth with session management JWTs`
- `User account creation, updating and deletion in the backend`
- `Full friend system`
- `OAuth with Google, GitHub, and 42`
- `Management of the sessions on the front-end`
- `Legal documents`
- `This README`

stellaaash also helped coordinate with the team and prioritize features and bug fixes. They made sure the mandatory requirements were met, including input validation on both the frontend and backend.

#### Challenges

One of the biggest challenge was simply to learn the stack. stellaash had never done anything like a full-stack web app before, and the language and idioms used needed time to internalize.
Another challenge faced was how to represent a friends system in the database? The relation wasn't clear with the Prisma ORM, but in the end, a many-to-many relationship was chosen.

But really, the biggest challenge was getting used to the web development idioms and technologies. Dependencies with node, how to make the frontend and backend work together, etc.

#### Problems Encountered

A problem stellaaash encountered early on was the question of how to implement sessions. JWTs worked as an access token, but could only be sent out for a specific amount of time (15 minutes at the start
of the project), so the backend needed some other way to represent user sessions. In the end, an in-memory map of user ids to active sessions was chosen, with a separate, refresh token
used to repeatedly renew the prior access token as long as the session remained active.

Another problem was the question of how to index the users in the database. At first, users were index using their unique email address. However, this proved problematic once updating
the user's information was implemented. Since users could just change their email, any potential link to their OAuth provider would be broken. Now, the users are indexed using their
unique internal id number, instead.

### tricaducee

Implemented most of the 3D and design system, including:
- `cards and mascot design`
- `background vertex and fragment shaders`
- `design components and variables`
- `pages frontend`
- `game 3D`

Ensure that the site is visually appealing and that the user experience is the best it can be.

#### Challenges

Since I joined the project late and had never worked with the front-end technologies used before (my background was exclusively in C/C++), I faced many challenges.

I had to learn a lot on the job (React, Tailwind, R3F, GLSL, Motion, etc.) and didn’t have time to delve deeper into them; I also had to rely on AI, which was very frustrating.
Furthermore, since the backend was already very far along, I didn’t have time to create the entire design upfront, and the frontend always had to adapt to the existing backend.

Regardless of the time constraints, the amount of new knowledge required for this project is massive in any case.

#### Problems Encountered

How to animate 3D elements with R3F, how to create a 3D card with rounded edges. Understanding how React works with these hooks.

### Miniflint

Implemented connection between backend and frontend such as every fetch in the following routes:
- `/lobbies`
- `/game/:code`
- `/game/:code/play`
- `/profile`
- `/settings`
- `/profile/byId`
- `/profile/byUser`

Created the points system and attributing to the user and guild.

Helped with the CSS on the frontend.

#### Challenges

Everything related to the contextApi for the game. Had to come up with something to not lose / reconnect to websockets if a user wanted to change/refresh the page. That way they wouldn't be considered disconnected the moment they wanted to check someone's profile.

"And I must admit the little clickable avatar on lobbies were pretty hard to do since it's mostly tailwind based".

#### Problem Encountered

Did not encounter many problems in particular with their side of the work, except with tailwind and css. "It was a torture for me to learn".

## Resources

### 0yech

- [NestJS docs](https://docs.nestjs.com)
- [RFC 6455: Websocket Protocol](https://datatracker.ietf.org/doc/html/rfc6455)
- [TypeScript docs](https://www.typescriptlang.org/docs/)
- [Conventional commits](https://www.conventionalcommits.org/en/v1.0.0/#summary)
- [Insomnia](https://insomnia.rest)

### stellaaash

- [NestJS Documentation](https://docs.nestjs.com)
- [RFC 8725 - JSON Web Token Best Current Practices](https://www.rfc-editor.org/rfc/rfc8725.html)
- [OWASP - Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [class-validator](https://github.com/typestack/class-validator)

### tricaducee

- [graphicart](https://grafikart.fr/)
- [tailwind docs](https://tailwindcss.com/docs)
- [olivier larose](https://www.youtube.com/@olivierlarose1)
- [motion tuto](https://www.youtube.com/watch?v=9-fO_2xTpgY)
- [r3f tuto](https://www.youtube.com/watch?v=vTfMjI4rVSI)
- Lot of youtube tuto
- Claude for learning hard concept

### Miniflint

- [react-router](https://reactrouter.com/)
- [stackoverflow](https://stackoverflow.com)
- [graphicart](https://grafikart.fr/)
- And ai here and there for annoying bug fixes

## AI Usage

### 0yech

Used for researching and demytifying Typescript/Nest and other modern web frameworks concepts, as being not very familiar with webapps besides stock PHP and older PHP MVC frameworks. AI was also used for finding causes behind bugs and adding more robust checks around many cases within backend elements.

### stellaaash

AI was used to learn the base concepts of the technologies we were learning. It was also used to coach and guide in the implementation of some features, including OAuth and the friends system.
AI was used to build the code for the avatar upload feature.
AI was used to prune dead code at the end of the project.

### tricaducee

Learning new concepts, understanding a language’s syntax, debugging certain bugs (rarely), and providing examples of functions.
The main reason for using AI was a lack of time to build and learn, particularly for the 3D game animations and the creation of 3D cards, which were primarily generated by AI (much to my regret).
Although the style and reusable components were mostly created by hand, the implementation on a significant portion of the pages was handled by Claude due to time constraints.

### Miniflint

Mostly used for debugging random piece of code such as WebSocketProvider throwing console errors if a user disconnected from the websocket and then tried to anonymously join the game.
Used AI to explain why this would happen and tried to figure out themself how to fix it.
