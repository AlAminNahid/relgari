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
    │   ├── layout/        Navbar, account menu, Footer, Logo, language switch
    │   └── sections/      Page sections, one folder per feature
    │       ├── landing/   Landing page. Single-file sections sit here; a section with
    │       │              several files gets its own folder (hero/, departure-board/)
    │       ├── auth/      Login and registration popup
    │       ├── search/    Search results: the train card and the row of dates
    │       ├── seats/     Seat page: the coach map, seat buttons and the panel of held seats
    │       ├── checkout/  Checkout page and the pretend payment popup (bKash, Nagad, Rocket, card)
    │       ├── ticket/    My tickets list, the e-ticket with its QR code, and the cancel popup
    │       └── verify/    The page a QR code opens, and the check-a-ticket page (PNR box and camera scan)
    ├── services/          Every call to the API: http.ts (the fetch helper), auth.ts (login, register, logout),
    │                      auth.server.ts (who is signed in, used by the server),
    │                      stations.server.ts (the station list for the search form),
    │                      trains.server.ts (the train search),
    │                      seats.ts and seats.server.ts (the seat map and the holds),
    │                      bookings.ts and bookings.server.ts (checkout, payment, tickets and cancelling)
    ├── lib/               validations.ts (form rules), stations.ts (match a typed name to a station),
    │                      dates.ts (journey dates as YYYY-MM-DD in Bangladesh time), i18n/, utils.ts
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
│                          data.ts (reads them, gives each train its coaches and shares its seats between stations)
│                          and seed.ts (loads it all)
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
    ├── trains/            Trains, their stops, coaches and seats, and the train search
    │   ├── controllers/   trains.controller.ts (the /trains/search route)
    │   ├── services/      train-search.service.ts (which trains run between two stations on a date),
    │   │                  journey.service.ts (a train, two stations and a date, checked), seat-map.service.ts (the seats of one class, free or taken),
    │   │                  release.service.ts (how many seats are on sale yet, and when more open),
    │   │                  fare.service.ts (works out a fare from distance and class),
    │   │                  trains.service.ts (one train with its route and coaches)
    │   ├── dto/           train-search.dto.ts (the search input and result), train-detail.dto.ts
    │   └── trains.module.ts
    ├── bookings/          Checkout, the pretend payment and paid bookings
    │   ├── controllers/   bookings.controller.ts (the /bookings routes, login needed)
    │   ├── services/      bookings.service.ts (checkout, create a booking, list and read tickets, cancel and refund),
    │   │                  payment.service.ts (the pretend gateway: yes or no by fixed rules)
    │   ├── dto/           booking.dto.ts
    │   └── bookings.module.ts
    ├── holds/             Seats a person is holding while they decide
    │   ├── controllers/   holds.controller.ts (the /holds routes, login needed)
    │   ├── services/      holds.service.ts (hold, list and release a seat, with the rules)
    │   ├── dto/           hold.dto.ts
    │   └── holds.module.ts
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

| Part       | Choice                                                  |
| ---------- | ------------------------------------------------------- |
| Frontend   | Next.js, TypeScript, Tailwind CSS, shadcn/ui, next-intl |
| Backend    | NestJS, TypeScript                                      |
| Database   | PostgreSQL 17 (Docker / OrbStack)                       |
| ORM        | Prisma 7                                                |
| Validation | Zod (the same rules are in both apps)                   |

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
- **Estimated:** station codes (built from the names), distances (worked out from running times, so fares are approximate), coaches (every train gets 2 Snigdha and 3 S_Chair coaches, plus one AC coach of 7 cabins; Shovan is not sold on intercity trains) and each station's share of a train's seats (see below).
- **Corrected:** eight trains (771, 772, 774, 784, 799, 800, 809, 810) had a time in the source that ran a little backwards. Those times were moved to the neighbouring stop's time, and 810 was put back in running order starting from Burimari.
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

| Method and path                                                          | What it does                                                                                                                                                       |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `POST /auth/register`                                                    | Create an account and sign in                                                                                                                                      |
| `POST /auth/login`                                                       | Sign in                                                                                                                                                            |
| `POST /auth/logout`                                                      | End the session                                                                                                                                                    |
| `GET /auth/me`                                                           | The signed-in user, including their own NID                                                                                                                        |
| `GET /stations`                                                          | Every station (code, English name, Bangla name). Public                                                                                                            |
| `GET /trains/:number/seats?from=DAC&to=CGP&date=2026-11-20&class=schair` | The seats of one class on a train, each free or taken. Public                                                                                                      |
| `GET /holds/current`                                                     | The seats you are holding, with the seconds left on each. Login needed                                                                                             |
| `POST /holds`                                                            | Hold one seat. Login needed                                                                                                                                        |
| `DELETE /holds/:id`                                                      | Release one of your held seats. Login needed                                                                                                                       |
| `POST /bookings/checkout`                                                | Start the checkout: keeps your held seats for 10 more minutes and returns the order. Login needed                                                                  |
| `POST /bookings`                                                         | Pay for the seats you hold with the pretend gateway and get the booking. Login needed                                                                              |
| `GET /bookings/limits`                                                   | How many tickets you have bought this month and how many you may still buy. Login needed                                                                           |
| `GET /verify/:pnr`                                                       | What a scan of a ticket's QR code shows: valid or not, train, seats, and the passenger as initials. Public                                                         |
| `GET /bookings`                                                          | All your bookings with their status. Login needed                                                                                                                  |
| `GET /bookings/:id`                                                      | One of your own bookings, for the ticket page. Login needed                                                                                                        |
| `GET /bookings/:id/cancel-quote?seats=a,b`                               | What cancelling those seats would cost and refund right now. Login needed                                                                                          |
| `POST /bookings/:id/cancel`                                              | Cancel seats of a booking and record the refund. Login needed                                                                                                      |
| `GET /trains/board?station=DAC&limit=6`                                  | The next trains to leave a station (today and tomorrow), each going to the end of its line, with the seats on sale per class. Feeds the landing page board. Public |
| `GET /trains/search?from=DAC&to=CGP&date=2026-11-20`                     | Trains running between two stations on a date, with times, fares and the seats on sale per class. Public                                                           |

### How tickets go on sale

Relgari does not put every ticket on sale at once. Three rules decide what a search shows:

- **Station shares.** A train's seats are shared between the stations people board at (the `station_quotas` table). The first station gets half; the rest is split so a major station gets three times what a small one gets. These shares are estimates set in `apps/api/prisma/seed/data.ts`.
- **Batches.** Booking opens 10 days before the journey, and a new batch opens every 2 days at 5:00 PM Bangladesh time, so the last batch opens 2 days before. Each class has its own percentages: S_Chair opens 30, 25, 20, 15 and 10 percent; Snigdha, AC Seat and AC Cabin open 20 percent each time. A small share is spread in whole seats, with at least one seat kept for the last batch.
- **AC Seat and AC Cabin.** An AC coach is made of cabins with 1 or 2 sofas (7 cabins with 2, 2, 1, 1, 1, 2 and 2 sofas, from the Bangladesh Railway map). By day a sofa seats 3 people and is sold as AC Seat (33 seats a coach). By night each sofa is a berth with an upper berth above it, sold as AC Cabin: a cabin with 2 sofas sleeps 4 and a cabin with 1 sofa sleeps 2 (22 berths a coach). Which one a passenger gets depends on when the train leaves the station they board at: 6:00 AM up to 6:00 PM is day (`apps/api/src/shared/constants/ac.constants.ts`). A station is only ever in one of the two, so the same sofas are never sold twice for the same boarding.
- **Settings.** The window, the gap, the time and the percentages are in `apps/api/src/shared/constants/release.constants.ts`. The website's 10-day limit is `MAX_DAYS_AHEAD` in `apps/web/src/config/site.ts`.

Held and booked seats are taken off the seats on sale. A seat counts for the whole run of the train: it is not sold again after its passenger gets off.

### Holding seats

- **Limit.** A person holds at most 6 seats at once, all on one journey (same train, date and stations), enough for a family. Once they hold 6 they cannot hold another until they release one.
- **Timer.** Each seat has its own 5 minutes, counted from the moment it was held. A seat that runs out is free again for everyone. Both numbers are in `apps/api/src/shared/constants/hold.constants.ts`.
- **Run date.** A hold belongs to the day the train sets off, not the day the passenger boards, so a seat on an overnight train cannot be sold twice.
- **No double holds.** Holds on one run of a train go through one at a time (a database lock), and the database also refuses two holds on the same seat.
- **On sale.** A seat can only be held while the station still has seats released and not held. The seat map shows the whole coach; the count is the limit.
- **AC sofas.** An AC sofa held as seats (by day) cannot also be held as berths (by night), and the other way round. Berths are stored as seats of kind `berth` next to the day seats.

### The pretend payment

Nothing talks to a bank or a wallet and no money moves. The checkout offers bKash, Nagad, Rocket and Card; each opens a popup in that method's colours, with a "Demo" label and the test values written on it. The API checks what was typed by fixed rules (`apps/api/src/shared/constants/payment.constants.ts`):

- **Wallets:** any valid mobile number, code `12345`, PIN `1234`. PIN `0000` shows a failed payment (not enough balance).
- **Card:** `4242 4242 4242 4242` with a future expiry and any 3-digit CVC. `4000 0000 0000 0002` is declined.
- **Seats while paying:** opening the checkout keeps every held seat for at least 10 more minutes. A failed payment keeps the seats held so the person can try again.
- **After paying:** the held seats become a booking (a PNR code and a transaction id), the holds are removed, and the seats count as taken for everyone. The ticket page shows a QR code with the PNR. A service charge of ৳20 a seat is added as a demo fee.

### The QR code

The QR on an e-ticket holds a link, `/verify/<PNR>`, so any phone camera opens it. That page needs no login and shows only what a gate check needs: whether the ticket is valid (Valid, Valid for the seats left, Cancelled, or Train has left), the train, route, date, seats, and the passenger as initials. It never shows a phone number, NID or payment. `/verify` (footer link "Check a ticket") takes a typed or pasted PNR, or a link, and where the browser has a QR reader (Chrome and Android browsers) it can scan with the camera.

### Cancelling and refunds

- **My tickets** (`/tickets`, from the account menu) lists every booking under Upcoming, Past and Cancelled. A booking is Confirmed, Partly cancelled, Cancelled, or Departed once the train has left.
- **Seat by seat.** On a ticket the passenger picks the seats to give back and sees the refund before confirming.
- **Fees.** The fee is a share of the fare, set in `apps/api/src/shared/constants/cancellation.constants.ts`: 10% more than 48 hours before departure, 25% from 24 to 48 hours, 50% from 6 to 24 hours, and no cancelling inside 6 hours. The service charge is never refunded. The departure time is the one at the boarding station, in Bangladesh time. The website shows the same numbers from `apps/web/src/config/cancellation.ts`.
- **The refund** is pretend: it is recorded (a reference, the fee and the amount) and shown as sent back to the method used to pay.
- **Seats go back on sale.** A cancelled seat leaves the booking, so the seat map and search show it free again.
- **Limit.** The 4-seat limit counts seats already paid for on the same journey as well as seats being held.
- **Monthly limit.** A person can buy at most 6 tickets in one calendar month (counted in Bangladesh time), and then has to wait for the next month. Held seats count toward it, cancelled seats do not. The number is `seatsPerMonth` in `apps/api/src/shared/constants/limits.constants.ts`. My tickets shows how many have been used.

## Build order

The project is built one feature at a time. Database tables are added only when a feature needs them.

1. Landing page and login or registration (users and sessions tables) ✅
2. Stations, trains, coaches and seats (stations, trains, train_stops, coaches and seats tables) ✅
3. Train search (station_quotas table) ✅
4. Seat map and seat holds (holds table) ✅
5. Fake payment and QR tickets (bookings and booking_seats tables) ✅
6. My tickets, cancel and refund (refunds and refund_seats tables) ✅

## Deploying

Two setups, kept apart so testing never touches real data:

|                         | Database                         | API              | Website          |
| ----------------------- | -------------------------------- | ---------------- | ---------------- |
| **Local (development)** | the Docker Postgres on port 5433 | `localhost:4000` | `localhost:3000` |
| **Production**          | Neon                             | Render           | Vercel           |

Secrets live only in each service's own settings (and in a local `.env`, which git ignores). Never put a database link or a key in a committed file.

### Where each environment's settings live

| File (all ignored by git)  | Used by                                                                                 | Holds                                                   |
| -------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `apps/api/.env`            | the local API                                                                           | the local database, the NID keys, port 4000             |
| `apps/api/.env.production` | nothing runs from it: a reference copy of what Render has, plus the `db:*:prod` scripts | the Neon link, `NODE_ENV=production`, the same NID keys |
| `apps/web/.env`            | the local website                                                                       | `API_URL` for localhost                                 |
| `apps/web/.env.vercel`     | nothing runs from it: a reference copy of what Vercel has                               | `API_URL` = the Render address                          |

The local app never reads the production files, so testing cannot touch real data. To run something against production on purpose: `npm run db:deploy:prod` (apply migrations to Neon) or `npm run db:studio:prod` (browse the Neon data), both from `apps/api`. When you change a value in a production file, change it in Render or Vercel too: the dashboards are what the live site actually uses. The NID keys are the same in every environment.

### The database (Neon)

1. Create the tables with the project's migrations, using Neon's **direct** link (the host without `-pooler`), from `apps/api`:

   ```
   DATABASE_URL="<direct link>" npx prisma migrate deploy
   ```

2. Load the railway data (stations, trains, stops, coaches, cabins, seats, quotas). `npm run db:seed` works, but sends thousands of single queries and is very slow over the internet, so copy the tables from your local database instead:

   ```
   docker exec relgari-db pg_dump -U relgari -d relgari --data-only --no-owner -t public.stations -t public.trains -t public.train_stops -t public.coaches -t public.cabins -t public.seats -t public.station_quotas > railway-data.sql
   docker exec -i relgari-db psql "<neon link>" -v ON_ERROR_STOP=1 -1 < railway-data.sql
   ```

   This copies no users, bookings or holds. Run it once on an empty database.

3. Later schema changes: run `prisma migrate deploy` again with the direct link (or add `npm run db:deploy` to the Render build command).

### The API (Render)

- **Root directory:** `apps/api`
- **Build command:** `npm install && npm run build`
- **Start command:** `npm run start:prod`
- **Environment:** copy the values from `apps/api/.env.production`: `NODE_ENV`, `DATABASE_URL` (Neon's direct link), `NID_ENCRYPTION_KEY` and `NID_HASH_SECRET` (the same two secrets as local; back them up, since a lost encryption key cannot be recovered), and `PROXY_SECRET` (see below). `PORT` is set by Render.
- The build tools (`prisma`, `@nestjs/cli`, `typescript` and the type packages) are in `dependencies` on purpose: Render's production install skips `devDependencies`, and the build needs them.

### The website (Vercel)

- **Root directory:** `apps/web`
- **Environment** (see `apps/web/.env.vercel`): `API_URL` = the Render service's address (for example `https://relgari.onrender.com`), and `PROXY_SECRET`, the same value as on Render. Both are read when a request arrives, so after changing one, redeploy (or restart) so Vercel picks it up.
- The browser only talks to the Vercel address; the website (`src/proxy.ts`) forwards `/api/*` to Render. So cookies stay on one site and no CORS setting is needed.

### Rate limits behind the website (`PROXY_SECRET`)

The API limits how often one visitor can register, log in or ask for pages. But the API never meets the visitor: it only meets the website's servers (and Render's own edge in front of it). Without help it counts everyone as the same few addresses, so a handful of visitors could use up each other's limits. So the website sends each visitor's real address to the API in a header, signed with `PROXY_SECRET`, which both sides share. The API (`src/shared/utils/client-ip.ts`) believes the address only when the secret matches, so a visitor cannot fake one. With no `PROXY_SECRET` (as locally) the API counts by connection address instead. Use the same value on Render and Vercel, and make it with `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`.

- Render's free service sleeps when idle, so the first request after a quiet spell can take about a minute.
