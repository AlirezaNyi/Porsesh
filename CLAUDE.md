# CLAUDE.md — Porsesh Codebase Guide

This file documents the architecture, conventions, and development workflows for the **Porsesh** form-builder application. It is intended to orient AI assistants working in this repository.

---

## Project Overview

Porsesh is a **drag-and-drop form builder and analytics platform** built with:

- **Next.js 16** (App Router, React Server Components) + **React 19**
- **TypeScript**
- **Prisma ORM** with **PostgreSQL**
- **Clerk** for authentication
- **dnd-kit** for drag-and-drop
- **Tailwind CSS** + **shadcn/ui** for styling
- **React Hook Form** + **Zod** for form validation

Users can create forms, publish them via a shareable URL, and view submission analytics (visits, submissions, submission rate, bounce rate).

---

## Repository Structure

```
Porsesh/
├── app/                        # Next.js App Router pages
│   ├── layout.tsx              # Root layout: ClerkProvider, ThemeProvider, DesignerContext, Toaster
│   ├── globals.css             # Global styles
│   ├── (auth)/                 # Auth route group (unauthenticated)
│   │   ├── sign-in/            # Clerk sign-in page
│   │   └── sign-up/            # Clerk sign-up page
│   ├── (dashboard)/            # Protected route group (authenticated)
│   │   ├── layout.tsx          # Dashboard layout: navbar with Logo, ThemeSwitcher, UserButton
│   │   ├── page.tsx            # Home: stats overview + form cards list
│   │   ├── builder/[id]/       # Form builder editor page
│   │   └── forms/[id]/         # Form analytics & submissions view
│   └── submit/[formUrl]/       # Public form submission page (no auth required)
│
├── actions/
│   └── form.ts                 # All server actions (data access layer)
│
├── components/
│   ├── FormElements.tsx         # Central type definitions + element registry
│   ├── FormBuilder.tsx          # Main builder UI (DndContext wrapper)
│   ├── Designer.tsx             # Drag-and-drop canvas
│   ├── DesignerSidebar.tsx      # Sidebar: element palette or properties panel
│   ├── FormElementsSidebar.tsx  # Left panel: draggable element buttons
│   ├── PropertiesFormSidebar.tsx# Right panel: selected element properties
│   ├── FormSubmitUrl.tsx        # Public form submission component
│   ├── context/
│   │   └── DesignerContext.tsx  # Global state: form elements array + selection
│   ├── hooks/
│   │   └── useDesigner.tsx      # Hook to consume DesignerContext
│   ├── fields/                  # Individual form field implementations
│   │   ├── TextField.tsx
│   │   ├── TitleField.tsx
│   │   ├── SubTitleField.tsx
│   │   ├── ParagraphField.tsx
│   │   ├── SepratorField.tsx    # Note: typo in filename (Seprator, not Separator)
│   │   ├── SpacerField.tsx
│   │   ├── NumberField.tsx
│   │   ├── TextAreaField.tsx
│   │   ├── DateField.tsx
│   │   ├── SelectField.tsx
│   │   └── CheckBoxField.tsx
│   ├── providers/
│   │   └── ThemeProvider.tsx    # next-themes wrapper
│   └── ui/                      # shadcn/ui component library (auto-generated, do not manually edit)
│
├── lib/
│   ├── prisma.ts               # Prisma singleton (safe for dev hot-reload)
│   ├── utils.ts                # cn() utility (clsx + tailwind-merge)
│   └── idGenerator.ts          # Random ID generator for form elements
│
├── schemas/
│   └── form.ts                 # Zod schema for form creation (name, description)
│
├── prisma/
│   ├── schema.prisma           # Database schema (Form, FormSubmissions models)
│   └── migrations/             # Prisma migration history
│
├── public/                     # Static assets (paper.svg background textures)
├── middleware.ts               # Clerk auth middleware (protects all routes)
├── Dockerfile                  # Multi-stage Docker build (node:22-alpine)
├── docker-compose.yml          # App + PostgreSQL stack
├── tailwind.config.ts          # Tailwind configuration
├── components.json             # shadcn/ui CLI configuration
└── next.config.mjs             # Next.js configuration
```

---

## Database Schema

Defined in `prisma/schema.prisma`. The database URL is read from the `POSTGRES_PRISMA_URL` environment variable.

### `Form`

| Column        | Type      | Notes                                           |
|---------------|-----------|-------------------------------------------------|
| `id`          | Int (PK)  | Auto-increment                                  |
| `userId`      | String    | Clerk user ID                                   |
| `name`        | String    | Unique per user (`@@unique([name, userId])`)    |
| `description` | String    | Defaults to `""`                                |
| `content`     | Json      | Array of `FormElementInstance` (defaults `[]`) |
| `published`   | Boolean   | `false` = draft, `true` = live                  |
| `shareUrl`    | String    | UUID-based unique public URL slug               |
| `visits`      | Int       | Incremented on each public view                 |
| `submissions` | Int       | Incremented on each submission                  |
| `status`      | Int       | Soft delete: `1` = active, `3` = deleted        |
| `createdAt`   | DateTime  |                                                 |

### `FormSubmissions`

| Column      | Type     | Notes                                |
|-------------|----------|--------------------------------------|
| `id`        | Int (PK) | Auto-increment                       |
| `formId`    | Int      | FK to `Form.id`                      |
| `content`   | Json     | Key-value map of field ID → response |
| `createdAt` | DateTime |                                      |

**Soft deletes**: Forms are never physically deleted. `DeleteForm` sets `status = 3`; all queries filter by `status: 1`.

---

## Server Actions (`actions/form.ts`)

All database operations are in `"use server"` functions. Authentication is enforced by calling `currentUser()` from `@clerk/nextjs/server` and redirecting to `/sign-in` if unauthenticated.

| Function                  | Description                                                        |
|---------------------------|--------------------------------------------------------------------|
| `GetFormStats()`          | Aggregate visits/submissions for current user; compute rates       |
| `CreateForm(data)`        | Validate with Zod, create form record, return new form `id`        |
| `GetForms()`              | List all active forms for current user (ordered by `createdAt desc`)|
| `GetFormById(id)`         | Fetch a single active form by ID (user-scoped)                     |
| `UpdateFormContent(id, jsonContent)` | Persist element array as JSON to `content` field        |
| `PublishForm(id)`         | Set `published = true`                                             |
| `GetFormContentByUrl(formUrl)` | Public: fetch content + increment visit counter             |
| `SubmitForm(formUrl, jsonContent)` | Public: increment submissions + create `FormSubmissions`  |
| `GetFormWithSubmissions(id)` | Fetch form with all submissions (for analytics page)           |
| `DeleteForm(id)`          | Soft-delete: set `status = 3`                                      |

---

## Form Element Architecture

### Core Types (`components/FormElements.tsx`)

Each field type must implement the `FormElement` interface:

```typescript
type FormElement = {
  type: ElementsType;                          // Unique string key
  construct: (id: string) => FormElementInstance; // Factory function
  designerBtnElement: { icon, label };         // Sidebar palette entry
  designerComponent: React.FC<...>;            // Canvas preview (read-only)
  formComponent: React.FC<...>;               // Live submission input
  propertiesComponent: React.FC<...>;          // Properties panel editor
  validate: (element, currentValue) => boolean; // Client-side validation
};
```

### Element Registry

All elements are registered in the `FormElements` map in `components/FormElements.tsx`. To add a new field type:

1. Create `components/fields/YourField.tsx` implementing `FormElement`
2. Add the type string to the `ElementsType` union
3. Register it in the `FormElements` map

### Available Field Types

| Type            | Category    | Notes                                 |
|-----------------|-------------|---------------------------------------|
| `TextField`     | Input       | Supports `dir` (ltr/rtl) toggle       |
| `NumberField`   | Input       |                                       |
| `TextAreaField` | Input       |                                       |
| `DateField`     | Input       | Uses date picker                      |
| `SelectField`   | Input       | Configurable options list             |
| `CheckBoxField` | Input       |                                       |
| `TitleField`    | Layout      | Display-only heading                  |
| `SubTitleField` | Layout      | Display-only subheading               |
| `ParagraphField`| Layout      | Display-only text block               |
| `SepratorField` | Layout      | Visual divider (note: typo in name)   |
| `SpacerField`   | Layout      | Configurable vertical spacer          |

### Element Instance Storage Format

Form content is persisted as a JSON array in `Form.content`. Each element is:

```typescript
{
  id: string;           // Generated by idGenerator()
  type: ElementsType;
  extraAttributes?: Record<string, any>; // Field-specific config
}
```

---

## State Management

### DesignerContext (`components/context/DesignerContext.tsx`)

Global client-side state for the form builder canvas. Provided at root layout level. Contains:

- `elements: FormElementInstance[]` — ordered list of form fields
- `selectedElement: FormElementInstance | null` — currently selected for editing
- `addElement(index, element)` — insert at position
- `removeElement(id)` — delete by ID
- `updateElement(id, element)` — update field configuration
- `setElements` / `setSelectedElement` — direct state setters

Access via the `useDesigner()` hook (`components/hooks/useDesigner.tsx`).

---

## Authentication

Clerk is the authentication provider:

- **Middleware** (`middleware.ts`): `clerkMiddleware()` protects all routes matching the configured patterns
- **Server actions**: Each server action calls `currentUser()` and redirects to `/sign-in` on failure
- **Root layout**: Wrapped in `<ClerkProvider afterSignOutUrl='/sign-in'>`
- **Dashboard layout**: Renders `<UserButton />` for the account menu
- **Public routes**: `/submit/[formUrl]/*` requires no authentication (submit page)

---

## Routing & Pages

| Route                      | Description                              | Auth    |
|----------------------------|------------------------------------------|---------|
| `/`                        | Dashboard: stats + form list             | Required|
| `/builder/[id]`            | Drag-and-drop form editor                | Required|
| `/forms/[id]`              | Form analytics + submissions table       | Required|
| `/sign-in`                 | Clerk sign-in                            | Public  |
| `/sign-up`                 | Clerk sign-up                            | Public  |
| `/submit/[formUrl]`        | Public form submission                   | Public  |

---

## RTL Support

The `TextField` (and likely other fields) supports a `dir` property (`"ltr"` | `"rtl"`) stored in `extraAttributes`. The properties panel exposes an **RTL toggle switch** that maps `true → "rtl"` and `false → "ltr"`. This enables right-to-left text input for Persian/Arabic content, which is relevant to the project name "Porsesh" (پرسش = "question" in Persian).

---

## Development Workflows

### Prerequisites

- Node.js 20.9+
- PostgreSQL (or Docker)
- A `.env` file with the following variables:

```
POSTGRES_PRISMA_URL=postgresql://...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

### Local Development

```bash
npm install
npx prisma migrate dev    # Run migrations and generate client
npm run dev               # Start dev server at http://localhost:3000
```

### Docker

```bash
docker-compose up --build
```

This starts a PostgreSQL 18 container and the Next.js app. The app container runs `npx prisma migrate deploy && node server.js` on boot.

### Available Scripts

| Script           | Command           | Description                      |
|------------------|-------------------|----------------------------------|
| `npm run dev`    | `next dev`        | Development server with HMR      |
| `npm run build`  | `next build`      | Production build                 |
| `npm run start`  | `next start`      | Start production server          |
| `npm run lint`   | `next lint`       | ESLint check                     |
| `postinstall`    | `prisma generate` | Auto-runs after `npm install`    |

### Database Operations

```bash
npx prisma migrate dev           # Create and apply a new migration
npx prisma migrate deploy        # Apply pending migrations (production)
npx prisma generate              # Regenerate Prisma client
npx prisma studio                # Open GUI database browser
```

---

## Key Conventions

### Component Patterns

- **Server Components** fetch data directly using server actions (async functions in `actions/form.ts`)
- **Client Components** are marked with `"use client"` at the top; used for interactive UI (designer, form submission)
- **Error boundaries**: Each route group has `error.tsx` for error states and `loading.tsx` for Suspense fallbacks
- **Suspense**: Dashboard uses `<Suspense>` boundaries around async server components

### Styling

- Tailwind CSS utility classes throughout
- `cn()` from `lib/utils.ts` (wraps `clsx` + `tailwind-merge`) for conditional class merging
- Dark mode supported via `next-themes` with `attribute="class"` strategy
- shadcn/ui components live in `components/ui/` — **do not manually edit these files**; regenerate with the shadcn CLI if needed

### Form Validation

- **Creation form** (name/description): Zod schema in `schemas/form.ts`, used with React Hook Form via `@hookform/resolvers/zod`
- **Field-level validation**: Each `FormElement` implements a `validate()` function called on blur in `formComponent`
- **Server-side validation**: Server actions validate input and throw errors on failure

### Data Flow for Form Submission

1. Public user visits `/submit/[formUrl]`
2. `GetFormContentByUrl(formUrl)` fetches content **and increments `visits`** atomically
3. User fills out the form in `FormSubmitUrl` component
4. On submit, `SubmitForm(formUrl, jsonContent)` increments `submissions` and creates a `FormSubmissions` record
5. Submission content is stored as `{ [elementId]: value }` JSON

### Drag-and-Drop

Built with `@dnd-kit/core`. The `Designer` component:
- Uses `useDndMonitor` to handle drop events
- Supports dropping from the sidebar palette onto the canvas
- Supports reordering existing elements by dragging them within the canvas
- Top/bottom half droppable zones on each element control insertion position

---

## Known Issues / Notes

- `SepratorField.tsx` has a typo in both the filename and exported name ("Seprator" instead of "Separator") — do not rename without updating all references in `FormElements.tsx`
- The root `app/layout.tsx` has default metadata (`title: "Create Next App"`) that was never updated from the Next.js scaffold
- `DeleteForm` does not validate user ownership before setting `status = 3` — the `where` clause only filters by `id`, not `userId`
- `postinstall` runs `prisma generate` automatically, so the Prisma client is always in sync after `npm install`
