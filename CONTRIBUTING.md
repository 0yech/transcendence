# Contributing to Transcendence

## Run Project

For development, use `make dev-up`. This will run the development servers for
both the frontend and backend.

We still have to set up the compose file for production,
this will come later on.

## Set up tools

### Prettier
Prettier is a formatter that allows us to have a consistent syntax style across the entire project, front and backend.

The configuration is already provided as a `.prettierrc` file in the `frontend/` and `backend/` directories.

Once installed in your editor, it should pick up on that configuration. Refer to your editor's specific configuration if any issues surface ([VSCode](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)).
Make sure to enable **format on save** for the best experience.

**Please do not edit the prettier configuration without submitting it to the repo in a dedicated pull request; we do not want differing code styles accross the codebase.**

### ESLint

ESLint is a linter for Typescript and many other languages; it tells you when you have code that might not make sense, like unused variables, or incorrect casing on names.

This way, you don't have to worry about the casing of your variables; the choice has already been made for the entire codebase (at least, the Typescript part).

The configuration has already been provided in the form of a `eslint.config.mjs` file found in `frontend/` and `backend/` directories.

Same as with Prettier, once installed in your editor, everything should work.
