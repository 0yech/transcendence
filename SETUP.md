# Project setup

```bash
git clone https://github.com/0yech/transcendence.git
cd transcendence
```

Rename/Fill .env files according to .env.example files

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Install dependencies for the backend

```bash
cd backend
npm install
```

Build the version you want

```bash
make up
make dev-up
```
