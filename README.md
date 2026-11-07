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
    │       └── landing/   Landing page. Single-file sections sit here; a section with
    │                      several files gets its own folder (hero/, departure-board/)
    ├── lib/               utils.ts and i18n (language cookie and text loading)
    ├── hooks/             Custom React hooks
    ├── types/             TypeScript types
    └── config/site.ts     Site-wide settings
```

Folders for login, signup and the dashboard (`(auth)`, `(dashboard)`) are added when those features are built.

## Tech stack

| Part     | Choice                            |
| -------- | --------------------------------- |
| Frontend | Next.js, TypeScript, Tailwind CSS |
| Backend  | NestJS, TypeScript                |
| Database | PostgreSQL (not set up yet)       |
| ORM      | Prisma (not set up yet)           |

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
