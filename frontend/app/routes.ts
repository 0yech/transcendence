import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('login', 'routes/login.tsx'),
  route('register', 'routes/register.tsx'),
  route('logout', 'routes/logout.tsx'),
  route('remove-account', 'routes/remove-account.tsx'),
  route('profile', 'routes/profile.tsx'),
  route('guilds', 'routes/guilds.tsx'),
  route('guilds/me', 'routes/my-guild.tsx'),
  route('tos', 'routes/tos.tsx'),
  route('privacy', 'routes/privacy.tsx'),
  route('game/:code', 'routes/lobby.tsx'),
  route('game/:code/play', 'routes/game.tsx'),
  route('profile/byId/:id', 'routes/public-by-id.tsx'),
  route('profile/byUser/:username', 'routes/public-by-username.tsx'),
] satisfies RouteConfig;
