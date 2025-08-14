# Porsesh

Porsesh is a form builder and analytics platform built with Next.js, Prisma, and PostgreSQL. Create forms, share them, and track visits and submissions with rich statistics.

## Features
- Create, publish, and manage forms
- View metrics such as visits, submissions, submission rate, and bounce rate
- Authentication with Clerk
- Prisma ORM with PostgreSQL
- Containerized using Docker and Docker Compose

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (a Docker configuration is provided)

### Local Development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run database migrations and generate the Prisma client:
   ```bash
   npx prisma migrate dev
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000).

### Docker
Run the application and a PostgreSQL database using Docker Compose:
```bash
docker-compose up --build
```
The app will be available at [http://localhost:3000](http://localhost:3000).

## Scripts
- `npm run lint` – run ESLint
- `npm run build` – create a production build

## License
This project is provided as-is without any specific license.
