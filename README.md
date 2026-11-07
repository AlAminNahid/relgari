# Relgari (রেলগাড়ি)

A friendlier way to book train tickets, inspired by Bangladesh Railway. This is a personal concept project: no real tickets are sold and no real payments are taken.

## Folder layout

```
relgari/
├── apps/
│   ├── web/   Next.js frontend (what users see)
│   └── api/   NestJS backend (the server)
└── README.md
```

A `packages/shared` folder for types used by both apps will be added later, when it is first needed.

## Tech stack

| Part | Choice |
|---|---|
| Frontend | Next.js, TypeScript, Tailwind CSS |
| Backend | NestJS, TypeScript |
| Database | PostgreSQL (not set up yet) |
| ORM | Prisma (not set up yet) |

## Running the apps

Each app has its own dependencies and is started from its own folder. Use two terminals.

Frontend, at http://localhost:3000:

```bash
cd apps/web
npm install
npm run dev
```

Backend, at http://localhost:4000:

```bash
cd apps/api
npm install
npm run start:dev
```

The backend uses port 4000 so it does not clash with the frontend on 3000. Set `PORT` to change it.

## Build order

The project is built one feature at a time. Database tables are added only when a feature needs them.

1. Landing page and login or registration (users table)
2. Stations, trains, coaches and seats
3. Train search
4. Seat map and seat holds
5. Fake payment and QR tickets
6. My tickets, cancel and refund

## Status

Project folders are created and both apps start from their default templates. Nothing else is built yet.
