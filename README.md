# Porsesh

**Porsesh** (پرسش — “question” in Persian) is a drag-and-drop form builder and analytics platform. Create forms, publish them with a shareable URL, collect submissions, and track visits and conversion metrics.

[فارسی](README.fa.md)

## Tech Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Prisma ORM** + **PostgreSQL**
- **Clerk** authentication
- **dnd-kit** drag-and-drop builder
- **Tailwind CSS** + **shadcn/ui**
- **React Hook Form** + **Zod**
- **Docker** / Docker Compose (optional)

## Features

- Drag-and-drop form designer with live preview
- Publish forms and share via a public URL (`/submit/[formUrl]`)
- Dashboard analytics: visits, submissions, submission rate, bounce rate
- Soft-delete forms (status-based; not hard-deleted)
- Dark mode and RTL support on text fields (Persian/Arabic-friendly)
- Field types:
  - **Input:** Text, Number, Text Area, Date, Select, Checkbox
  - **Layout:** Title, Subtitle, Paragraph, Separator, Spacer

## Routes

| Route | Description | Auth |
|-------|-------------|------|
| `/` | Dashboard: stats + form list | Required |
| `/builder/[id]` | Drag-and-drop form editor | Required |
| `/forms/[id]` | Form analytics & submissions | Required |
| `/sign-in` / `/sign-up` | Clerk authentication | Public |
| `/submit/[formUrl]` | Public form submission | Public |

## Getting Started

### Prerequisites

- **Node.js 18+** (Docker image uses Node 20)
- **PostgreSQL** (or use Docker Compose)
- A [Clerk](https://clerk.com) application (publishable + secret keys)

### Environment Variables

Copy the example env file and fill in values:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `POSTGRES_PRISMA_URL` | Local yes | PostgreSQL connection string for Prisma |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Docker | Used by Compose to create the DB and URL |
| `POSTGRES_PORT` / `APP_PORT` | No | Host port overrides (defaults `5432` / `3000`) |

For local development (outside Docker), set e.g.:

```env
POSTGRES_PRISMA_URL=postgresql://postgres:postgres@localhost:5432/porsesh
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### Local Development

```bash
npm install
npx prisma migrate dev   # apply migrations + generate Prisma client
npm run dev              # http://localhost:3000
```

`postinstall` runs `prisma generate` automatically after `npm install`.

### Docker

Requires Clerk keys in `.env` (Compose fails fast if they are missing):

```bash
cp .env.example .env
# Edit .env — set Clerk keys (and preferably a strong POSTGRES_PASSWORD)
docker compose up --build
```

This starts PostgreSQL 15 and the Next.js app. On boot the app container runs `prisma migrate deploy` then starts the server at [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Development server with HMR |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |

## Project Structure (overview)

```
app/            # Next.js App Router (dashboard, builder, submit, auth)
actions/        # Server actions (form CRUD, publish, submit, stats)
components/     # Builder UI, fields, shadcn/ui
lib/            # Prisma client, utilities
prisma/         # Schema and migrations
schemas/        # Zod schemas
```

## License

This project is provided as-is without a specific license.
