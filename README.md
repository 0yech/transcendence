# 42 Transcendence

## Description

TODO

## Instructions

TODO

## Team Information

- [0yech](https://github.com/0yech) - Product Owner - Making sure the project meets the expectations
- [stellaaash](https://github.com/stellaaash) - Project Manager - Overseeing the day to day decisions of the project
- 0yech - Tech Lead - Making technical decisions such as tool choice and design decisions
- [tricaducee](https://github.com/tricaducee) - Art Director - Creating the art used by the project and designing the web pages
- 0yech, stellaaash, tricaducee, [Miniflint](https://github.com/Miniflint) - Developers

## Project Management

GitHub Issues to know who does what

Communicate via the Discord DM Group

## Technical Stack

> Tentative stack, might change as the project evolves

- Front-end: React, ThreeJS for 3D
- Back-end: NestJS
- Database: PostgreSQL with Prisma ORM
- Tailwind CSS for styling
- TypeScript throughout the codebase
  TypeScript was chosen to make learning JavaScript simpler. It's not going to
  make life easy at first, but it will save us a lot of time in the long run,
  and will give us a better understanding of the code we're writing, as well as
  better tooling overall.

## Database Schema

TODO

## Features List

TODO

## Modules

> List of modules with headings aligned with subject PDF
> Bonus modules are between parentheses
> Justification is in italics

### 1. Web

Total points: 5

- Use a framework for the backend and the frontend (React for frontend, NestJS for backend) - Major +2
  *Using frameworks guided us in taking architectural decisions for our first web projects.*
- Real-time features using WebSockets (real-time chat) - Major +2
  *Having a chat system allows users to interact during games, using the same technology the game uses.*
- Use an ORM for the db (Prisma) - Minor +1
  *Using an ORM for interacting with the database simplified things immensely for storing and updating data.*

### 3. User Management

Total points: 4 (6)

- Standard user management and authentication - Major +2
  *Users can create accounts with a username and password, and update their information on the profile page.*
- Game stats and match history - Minor +1
  *Since this is a game, allowing users to look back on their performance and see areas of improvement, or people they struggle against, is useful.*
- OAuth 2.0 - Minor +1
  *For users that don't want to manage a password for every service, having standard OAuth providers like Google and GitHub is a plus.*
- (Organization system for guilds - Major +2)
  *Allowing users to form teams reinforces the fun part of playing a game, and creates healthy competition.*

### 6. Gaming

Total points: 7 (9)

- Complete web-based game (ONO card game) - Major +2
  *The core of the project, and what everything else revolves around.*
- Remote players - Major +2
  *Allowing players to join from anywhere adds a lot of possibilities, and allows people from the entire world to play together.*
- More than two players - Major +2
  *With a card game like this, the more, the merrier!*
- (Advanced 3D graphics with Three.js - Major +2)
  *This shows the game's state in a 3D environment, similar to if you were playing around a table with your friends.*
- Spectator mode - Minor +1
  *Allows you to watch your friends lose catastrophically! Without being able to snoop at the other's cards, of course.*

## Individual Contributions

- 0yech handled the database schema, game logic, and took care of managing GitHub issues throughout the project, assigning people according to the project's goals and priorities.
- stellaaash took care of the auth and OAuth processes, and all of its backend capabilities, while helping 0yech oversee the project and take design decisions.
- tricaducee worked on the amazing art found all over the project's front-end, and designed the web pages in tandem with Miniflint.
- Miniflint handled much of the frontend components, and added backend routes and features as the project grew.

## Resources

TODO

### Frameworks

- [NestJS Documentation](https://docs.nestjs.com)

### Authentication

- [RFC 8725 - JSON Web Token Best Current Practices](https://www.rfc-editor.org/rfc/rfc8725.html)
- [OWASP - Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)

### Data Validation

- [class-validator](https://github.com/typestack/class-validator)
