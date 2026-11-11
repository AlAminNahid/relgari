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
    │                      auth.server.ts (who is signed in, used by the server),
    │                      stations.server.ts (the station list for the search form)
    ├── lib/               validations.ts (form rules), stations.ts (match a typed name to a station), i18n/, utils.ts
    ├── hooks/             Custom React hooks
    ├── types/             TypeScript types
    └── config/site.ts     Site-wide settings
```

### Inside `apps/api`

Each feature has its own folder with the same pieces: `controllers/` (the routes), `services/` (the logic), `dto/` (what comes in and goes out) and a module file at the root of the folder that wires them together. Anything used by several features lives in `shared/`.

```
apps/api/
├── prisma/                schema.prisma and the migrations (database changes, one per feature)
│   └── seed/              Railway data: stations.json and trains.json (the real stations, stops, times and off days),
│                          data.ts (reads them and gives each train its coaches) and seed.ts (loads it all)
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
    ├── stations/          The stations table
    │   ├── controllers/   stations.controller.ts (the /stations route)
    │   ├── services/      stations.service.ts (lists every station)
    │   ├── dto/           station.dto.ts (the station the website sees)
    │   └── stations.module.ts
    ├── trains/            Trains, their stops, coaches and seats (no routes yet: search comes next)
    │   ├── services/      trains.service.ts (one train with its route and coaches),
    │   │                  fare.service.ts (works out a fare from distance and class)
    │   ├── dto/           train-detail.dto.ts (what a train is loaded with)
    │   └── trains.module.ts
    ├── prisma/            Database connection
    ├── config/env.ts      Checks the .env settings when the server starts
    ├── shared/            Used by many features
    │   ├── constants/     Fixed values: session and input rules, hashing settings, rate limits, fare rates
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

Then create the tables, load the sample railway data and install the website:

```bash
npx prisma migrate deploy
npm run db:seed
cd ../web && npm install
```

`npm run db:seed` loads 225 stations and 122 intercity trains (numbers 701 to 828) with their stops, coaches and seats. It takes about a minute and is safe to run again: rows are updated, not duplicated, and anything no longer in the data files is removed.

Where the data comes from:

- **Real:** train numbers, stops, arrival and departure times and weekly off days, as published by the Bangladesh Railway e-ticket service in November 2026. They live in `apps/api/prisma/seed/stations.json` and `trains.json`. Timetables change, so treat them as a snapshot.
- **Estimated:** station codes (built from the names), distances (worked out from running times, so fares are approximate) and coaches (every train gets the same set, plus an AC coach on overnight trains).
- **Written by hand:** the Bangla station and train names.

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
| `GET /stations` | Every station (code, English name, Bangla name). Public |

## Build order

The project is built one feature at a time. Database tables are added only when a feature needs them.

1. Landing page and login or registration (users and sessions tables) ✅
2. Stations, trains, coaches and seats (stations, trains, train_stops, coaches and seats tables) ✅
3. Train search
4. Seat map and seat holds
5. Fake payment and QR tickets
6. My tickets, cancel and refund
