# MyProject – Lightweight Team Task Management

![Backend](https://img.shields.io/badge/Backend-FastAPI-green)
![Frontend](https://img.shields.io/badge/Frontend-Next.js%2015-black)
![Database](https://img.shields.io/badge/Database-PostgreSQL%2016-blue)
![Auth](https://img.shields.io/badge/Auth-JWT-orange)
![Tests](https://img.shields.io/badge/Tests-Pytest-success)
![Status](https://img.shields.io/badge/Status-Active%20Development-brightgreen)

Finnish version: [README.fi.md](./README.fi.md)

---

A lightweight SaaS-style web application for **small teams (1–10 users)** to manage projects and tasks without the overhead of enterprise tools.

Built as a **full-stack portfolio project** by Pekka Levo. The goal was to build something genuinely usable — clean architecture, proper auth, and a UI that doesn't look like it was slapped together in an afternoon.

**Stack:**
- FastAPI + PostgreSQL backend
- Next.js 15 + TypeScript frontend
- JWT authentication
- Role-based access control (admin / member)

---

## What's built

**Backend — complete**
- User registration and JWT login
- Organizations with admin/member roles
- Projects per organization
- Tasks per project with kanban statuses (`todo` / `in_progress` / `done`)
- Role-based access control throughout
- Automated tests with pytest

**Frontend — complete**
- Login and registration pages
- Dashboard with organization list
- Organization page with projects and members tabs
- Kanban board for task management (click to edit, one-click advance)

---

## What's next

- Cloud deployment (Render / Railway + Vercel)
- Production hardening (rate limiting, proper error tracking)
- Email invitations for team members

---

## Project structure

```
MyProject/
├── backend/          # FastAPI REST API
│   ├── app/
│   │   ├── api/      # Route handlers
│   │   ├── core/     # Config & security
│   │   ├── crud/     # Database operations
│   │   ├── db/       # Database session
│   │   ├── models/   # SQLAlchemy models
│   │   └── schemas/  # Pydantic schemas
│   └── tests/
├── frontend/         # Next.js 15 application
│   ├── app/          # App Router pages
│   ├── components/   # UI components
│   ├── contexts/     # React context (auth)
│   └── lib/          # API client & utilities
└── docker-compose.yml
```

See [`backend/README.md`](./backend/README.md) and [`frontend/README.md`](./frontend/README.md) for setup instructions.

---

## Tech stack

### Backend
- Python 3.12 · FastAPI · Uvicorn
- PostgreSQL 16 · SQLAlchemy · Alembic
- passlib/bcrypt · python-jose (JWT)
- pytest + httpx

### Frontend
- Next.js 15 · React 19 · TypeScript
- Tailwind CSS v4 · Radix UI primitives
- Lucide icons · Sonner toasts
- Bricolage Grotesque + Epilogue fonts

### Infrastructure
- Docker Compose (local PostgreSQL)
- Render / Railway (planned backend hosting)
- Vercel (planned frontend hosting)

---

## Database schema

| Table | Key columns |
|-------|-------------|
| `users` | id, email, password_hash, name, created_at |
| `organizations` | id, name, created_at |
| `memberships` | id, user_id, organization_id, role |
| `projects` | id, name, description, organization_id, created_by |
| `tasks` | id, title, description, status, project_id, created_by |

---

## API overview

| Resource | Endpoints |
|----------|-----------|
| Auth | `POST /users/register` · `POST /auth/login` · `GET /users/me` |
| Organizations | `GET/POST /orgs` · `/orgs/{id}/members` |
| Projects | `GET/POST /orgs/{id}/projects` · `PATCH/DELETE /projects/{id}` |
| Tasks | `GET/POST /projects/{id}/tasks` · `PATCH/DELETE /tasks/{id}` |

Full API docs available at `http://localhost:8000/docs` when running locally.

---

## Roadmap

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Backend foundation | ✅ Done |
| 2 | Database integration | ✅ Done |
| 3 | Authentication system | ✅ Done |
| 4 | Core business logic | ✅ Done |
| 5 | Frontend implementation | ✅ Done |
| 6 | Cloud deployment | Planned |
| 7 | Production hardening | Planned |

---

## Future ideas (v2+)

- Comments on tasks
- File attachments
- Email invitations
- Notifications
- Activity log
- Billing and subscriptions
- Analytics dashboard
- AI-assisted task suggestions

---

## Author

**Pekka Levo** — portfolio project, active development
