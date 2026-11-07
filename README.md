# Relgari (রেলগাড়ি)

A friendlier way to book train tickets, inspired by Bangladesh Railway. This is a personal concept project: no real tickets are sold and no real payments are taken.

## Folder layout

```
relgari/
├── apps/
│   ├── web/              Next.js frontend (what users see)
│   └── api/              NestJS backend (the server)
├── docker-compose.yml    Local PostgreSQL (shows up as "relgari" in OrbStack)
└── README.md
```

### Inside `apps/web`

```
apps/web/
├── messages/          English and Bangla text (en.json, bn.json)
└── src/
    ├── app/
    │   ├── (marketing)/   Public pages: layout.tsx (header and footer) and page.tsx (landing page)
    │   ├── layout.tsx     Root layout: fonts, language
    │   └── globals.css    Theme colors
    ├── components/
    │   ├── ui/            shadcn/ui components (Button, Input, Select...)
    │   ├── layout/        Navbar, Footer, Logo, language switch
    │   └── sections/      Page sections, one folder per feature
    │       ├── landing/   Landing page. Single-file sections sit here; a section with
    │       │              several files gets its own folder (hero/, departure-board/)
    │       └── auth/      Login and registration popup
    ├── services/          Every call to the API: http.ts (the fetch helper), auth.ts (login, register, logout),
    │                      auth.server.ts (who is signed in, used by the server)
    ├── lib/               validations.ts (form rules), i18n/, utils.ts
    ├── hooks/             Custom React hooks
    ├── types/             TypeScript types
    └── config/site.ts     Site-wide settings
```

### Inside `apps/api`

Each feature has its own folder with the same pieces: `controllers/` (the routes), `services/` (the logic), `dto/` (what comes in and goes out) and a module file at the root of the folder that wires them together. Anything used by several features lives in `shared/`.

```
apps/api/
├── prisma/                schema.prisma and the migrations (database changes, one per feature)
└── src/
    ├── auth/              Login, registration, logout, current user
    │   ├── controllers/   auth.controller.ts (the /auth routes)
    │   ├── services/      auth.service.ts (register, login, logout), password.service.ts (argon2id),
    │   │                  session.service.ts (sessions in the database),
    │   │                  session-cookie.service.ts (sets, reads and clears the cookie)
    │   ├── dto/           Input rules: login.dto.ts, register.dto.ts, auth-fields.ts
    │   └── auth.module.ts
    ├── users/             The users table
    │   ├── services/      users.service.ts (find, create, duplicate checks),
    │   │                  nid-crypto.service.ts (hashes and encrypts the NID)
    │   ├── dto/           create-user.dto.ts, auth-user.dto.ts (the user the website sees)
    │   └── users.module.ts
    ├── prisma/            Database connection
    ├── config/env.ts      Checks the .env settings when the server starts
    ├── shared/            Used by many features
    │   ├── constants/     Fixed values: session and input rules, hashing settings, rate limits
    │   ├── decorators/    @CurrentUser()
    │   ├── filters/       Turns every error into { code }
    │   ├── guards/        AuthGuard: only lets signed-in users through
    │   ├── pipes/         ZodPipe: checks a request body against a dto
    │   └── types/         Error codes and request types
    ├── app.module.ts
    └── main.ts
```

## Tech stack

| Part | Choice |
|---|---|
| Frontend | Next.js, TypeScript, Tailwind CSS, shadcn/ui, next-intl |
| Backend | NestJS, TypeScript |
| Database | PostgreSQL 17 (Docker / OrbStack) |
| ORM | Prisma 7 |
| Validation | Zod (the same rules are in both apps) |

## First-time setup

You need Node.js 22 or newer and Docker (OrbStack works).

```bash
# 1. Start the database (project "relgari", container "relgari-db", port 5433)
docker compose up -d

# 2. API: install and make your .env
cd apps/api
npm install
cp .env.example .env
```

Open `apps/api/.env` and fill in the two secrets. Make each one with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Then create the tables and install the website:

```bash
npx prisma migrate deploy
cd ../web && npm install
```

## Running the apps

Use two terminals.

Backend, at http://localhost:4000:

```bash
cd apps/api
npm run start:dev
```

Frontend, at http://localhost:3000:

```bash
cd apps/web
npm run dev
```

The website never calls the API directly. It calls `/api/...` on its own address and Next.js forwards the request to the API (see `rewrites` in `apps/web/next.config.ts`). To point at a different API address, set `API_URL` (see `apps/web/.env.example`).

### Keep the two sets of rules in step

The website checks the form before sending it, and the API checks again (it must never trust the browser). The rules live in two files that should always match:
`apps/web/src/lib/validations.ts` and `apps/api/src/auth/dto/`. The error types are in `apps/web/src/types/api.ts` and `apps/api/src/shared/types/api.types.ts`.

## Tests

There are no automated tests at the moment. `npm test` (in `apps/api`) runs Vitest and passes when it finds none. To add one, create a `*.spec.ts` file next to the code it tests.

## How login works

- **Passwords** are hashed with argon2id. The password itself is never stored or logged.
- **NID** is never stored as plain text. A keyed hash (`NID_HASH_SECRET`) is used to refuse a second account with the same NID. An encrypted copy (`NID_ENCRYPTION_KEY`, AES-256-GCM) lets the server show the NID back to its owner, and only to its owner, on `GET /auth/me`. Back up `NID_ENCRYPTION_KEY`: without it, stored NIDs cannot be read.
- **Sessions:** logging in sets an `HttpOnly` cookie holding a random token. The database stores only a hash of it, so a copy of the database cannot be used to sign in. Sessions last 30 days and end on logout.
- **Rate limits:** 5 login or registration tries per phone number and address every 15 minutes, 100 requests a minute per address overall.
- **Errors** come back as codes (`PHONE_TAKEN`, `INVALID_CREDENTIALS`...), and the website shows them in the user's language. A wrong phone number and a wrong password give the same answer.
- There is no phone verification (no SMS), so anyone can register with any valid-looking number.

### API

| Method and path | What it does |
|---|---|
| `POST /auth/register` | Create an account and sign in |
| `POST /auth/login` | Sign in |
| `POST /auth/logout` | End the session |
| `GET /auth/me` | The signed-in user, including their own NID |

## Build order

The project is built one feature at a time. Database tables are added only when a feature needs them.

1. Landing page and login or registration (users and sessions tables) ✅
2. Stations, trains, coaches and seats
3. Train search
4. Seat map and seat holds
5. Fake payment and QR tickets
6. My tickets, cancel and refund
