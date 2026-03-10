# MyProject Frontend

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-teal)
![Status](https://img.shields.io/badge/Status-Complete-brightgreen)

Next.js 15 frontend for **MyProject** — a lightweight task management app for small teams.

---

# 📦 Tech Stack

- Next.js 15 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS v4
- Radix UI (Dialog, Label, Slot)
- Lucide React (icons)
- Sonner (toast notifications)
- Bricolage Grotesque + Epilogue (Google Fonts)

---

# 📁 Project Structure

```
frontend/
├── app/
│   ├── layout.tsx              # Root layout (fonts, providers, toaster)
│   ├── globals.css             # Design system (CSS variables, animations)
│   ├── page.tsx                # Login page
│   ├── register/
│   │   └── page.tsx            # Registration page
│   ├── dashboard/
│   │   └── page.tsx            # Organizations list
│   └── orgs/
│       └── [orgId]/
│           ├── page.tsx        # Organization page (projects + members)
│           └── projects/
│               └── [projectId]/
│                   └── page.tsx # Kanban board
├── components/
│   ├── TaskDetailModal.tsx     # Task edit/delete modal
│   └── ui/
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── label.tsx
│       └── textarea.tsx
├── contexts/
│   └── AuthContext.tsx         # Auth state (user, login, logout)
├── lib/
│   ├── api.ts                  # All API calls + TypeScript types
│   └── utils.ts                # cn() helper
├── next.config.ts
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

---

# ✅ Prerequisites

- Node.js 18 or newer
- npm (or pnpm/yarn)
- The backend API running (see [`backend/README.md`](../backend/README.md))

---

# ⚙️ Local Development Setup

## 1️⃣ Install Dependencies

From the `frontend/` folder:

```bash
npm install
```

---

## 2️⃣ Configure Environment

Create a `.env.local` file in the `frontend/` folder:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

This is the only required variable. It points to the backend API. If you leave it out, the app defaults to `http://localhost:8000` anyway.

---

## 3️⃣ Start the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

Make sure the backend is also running — without it, login and data fetching won't work.

---

# 🏗 Pages

| Route | Description |
|-------|-------------|
| `/` | Login page — split layout on desktop, centered card on mobile |
| `/register` | Registration page |
| `/dashboard` | Lists all organizations the logged-in user belongs to |
| `/orgs/[orgId]` | Organization detail — Projects and Members tabs |
| `/orgs/[orgId]/projects/[projectId]` | Kanban board with three columns |

---

# 🎨 Design System

The design uses a **warm charcoal dark theme** with a vivid orange accent.

CSS variables are defined in `app/globals.css` and exposed to Tailwind via `@theme inline`:

| Variable | Value | Purpose |
|----------|-------|---------|
| `--bg` | `#0a0a0b` | Page background |
| `--surface` | `#111115` | Card/panel backgrounds |
| `--surface-2` | `#18181e` | Elevated elements |
| `--accent` | `#f97316` | Primary action color |
| `--text` | `#ede8f5` | Main text |
| `--text-muted` | `#6b6480` | Secondary text |
| `--success` | `#22d17a` | Done status |
| `--warning` | `#fbbf24` | Warning states |
| `--destructive` | `#ef4444` | Destructive actions |

Fonts:
- **Bricolage Grotesque** — headings, labels, badges (loaded as `--font-syne` for compatibility)
- **Epilogue** — body text (loaded as `--font-epilogue`)

Helper CSS classes:
- `dot-grid` — subtle dot pattern background for auth pages
- `animate-fade-up` — entrance animation
- `delay-100` through `delay-400` — stagger offsets

---

# 🔐 Authentication

Auth state is managed by `AuthContext` (`contexts/AuthContext.tsx`). The JWT token is stored in `localStorage` under the key `access_token`.

On load, the context checks for an existing token and fetches the current user. If the token is invalid or expired, it's removed and the user is treated as logged out.

All pages redirect to `/` if the user is not authenticated.

---

# 📡 API Client

All backend communication goes through `lib/api.ts`. It exports typed functions and interfaces for every resource:

```ts
// Auth
login(email, password)
register(email, password, name)
getMe()

// Organizations
getOrgs()
createOrg(name)
getMembers(orgId)
addMember(orgId, userId, role)
removeMember(orgId, userId)

// Projects
getProjects(orgId)
createProject(orgId, name, description?)
updateProject(projectId, name, description?)
deleteProject(projectId)

// Tasks
getTasks(projectId)
createTask(projectId, title, description?)
updateTask(taskId, fields)
deleteTask(taskId)
```

Task statuses: `"todo"` | `"in_progress"` | `"done"`

---

# 🛠 Useful Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production build
npm start

# Lint
npm run lint
```

---

# 📊 Feature Status

| Feature | Status |
|---------|--------|
| Login page | ✅ Done |
| Registration page | ✅ Done |
| Auth context + JWT handling | ✅ Done |
| Dashboard (organizations list) | ✅ Done |
| Organization page (projects tab) | ✅ Done |
| Organization page (members tab) | ✅ Done |
| Kanban board | ✅ Done |
| Task create / edit / delete | ✅ Done |
| One-click task status advance | ✅ Done |
| Role-based UI (admin vs member) | ✅ Done |
