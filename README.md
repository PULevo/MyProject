# 🚀 MyProject – Lightweight Team Task Management SaaS

![Backend](https://img.shields.io/badge/Backend-FastAPI-green)
![Database](https://img.shields.io/badge/Database-PostgreSQL%2016-blue)
![Auth](https://img.shields.io/badge/Auth-JWT-orange)
![Tests](https://img.shields.io/badge/Tests-Pytest-success)
![Status](https://img.shields.io/badge/Status-Active%20Development-brightgreen)

Finnish version: [README.fi.md](./README.fi.md)

---

A lightweight SaaS-style web application designed for **small teams (1–10 users)** to manage projects and tasks efficiently.

This project is built as a **full-stack portfolio application** using:

- FastAPI
- PostgreSQL
- React / Next.js (planned)

The goal is to demonstrate:

- Production-level backend architecture  
- Secure authentication  
- Proper database design  
- Scalable SaaS-ready structure  

---

# 📌 Current Status

Backend is **feature-complete for the MVP scope**.  

All core functionality — authentication, organization management, project management, and task management — has been implemented and is covered by automated tests.

---

## ✅ Implemented

- FastAPI backend with modular architecture  
- PostgreSQL integration via SQLAlchemy  
- Alembic migration system  
- User model (email, hashed password, name, timestamps)  
- User registration: `POST /users/register`  
- JWT-based login: `POST /auth/login`  
- Current user endpoint: `GET /users/me`  
- Secure password hashing (bcrypt)  
- Organization management (roles: admin / member)  
- Project management per organization  
- Task management per project  
- Role-based access control  
- Automated tests with pytest  
- Docker Compose for local PostgreSQL  

---

## 🚧 In Progress / Planned

- Frontend (React / Next.js)  
- Cloud deployment  
- Production hardening  

---

# 🎯 Project Vision

Build a **production-ready task management system** for small teams.

### Key Goals

- Clean and scalable backend architecture  
- Proper database modeling and migrations  
- Secure authentication & RBAC  
- SaaS-ready multi-organization structure  
- Production-quality codebase suitable for portfolio and real-world use  

---

# 📦 MVP Scope (v1)

## 🔐 Authentication ✅

- User registration  
- User login  
- Secure password hashing (bcrypt)  
- JWT-based authentication  
- Current user endpoint (`GET /users/me`)  

---

## 🏢 Organization Management ✅

- Create organization (creator becomes admin)  
- List own organizations  
- List organization members  
- Add member (admin only)  
- Remove member (admin only)  
- Role-based access (admin / member)  

---

## 📁 Project Management ✅

- Create project per organization (admin only)  
- List organization projects (member+)  
- Get single project (member+)  
- Update project (admin only)  
- Delete project (admin only, requires no tasks)  

---

## ✅ Task Management ✅

- Create task (member+)  
- List tasks (member+)  
- Get single task (member+)  
- Update task (member+)  
- Delete task (creator or admin)  
- Task statuses: `todo` / `doing` / `done`  
- Optional user assignment  

---

## 🖥 Views (Frontend — Planned)

- My Tasks view  
- Project task list view  

---

# 🔮 Future Features (v2+)

- Comments on tasks  
- File attachments  
- Email invitations  
- Notifications  
- Activity logs  
- Billing and subscriptions  
- Analytics dashboard  
- API integrations  
- AI-assisted features  

---

# 🏗 Backend Architecture

```
backend/
├── alembic/
│   ├── env.py
│   └── script.py.mako
├── alembic.ini
├── app/
│   ├── main.py
│   ├── api/
│   │   ├── auth.py
│   │   ├── deps.py
│   │   ├── organizations.py
│   │   ├── projects.py
│   │   └── users.py
│   ├── core/
│   │   ├── config.py
│   │   └── security.py
│   ├── crud/
│   │   ├── organization.py
│   │   ├── project.py
│   │   └── user.py
│   ├── db/
│   │   ├── base.py
│   │   └── session.py
│   ├── models/
│   │   ├── organization.py
│   │   ├── project.py
│   │   └── user.py
│   └── schemas/
│       ├── organization.py
│       ├── project.py
│       └── user.py
└── tests/
    ├── conftest.py
    ├── test_auth.py
    ├── test_organizations.py
    └── test_projects.py
```

### Architecture Principles

- Modular structure with clear separation of concerns  
- Router → Schema → CRUD → Model layering  
- Dependency injection for DB sessions & authentication  
- Migration-based database management via Alembic  

---

# 🗄 Database Schema

| Table | Columns |
|-------|----------|
| `users` | id, email, password_hash, name, created_at |
| `organizations` | id, name, created_at |
| `memberships` | id, user_id, organization_id, role, created_at |
| `projects` | id, name, description, organization_id, created_by, created_at |
| `tasks` | id, title, description, status, project_id, assigned_to, created_by, created_at, updated_at |

---

# 📡 API Endpoints

## System

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Root |
| GET | `/health` | Health check |
| GET | `/version` | Version info |

---

## Auth & Users

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/users/register` | — | Register new user |
| POST | `/auth/login` | — | Login, returns JWT |
| GET | `/users/me` | ✅ | Get current user |

---

## Organizations

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/orgs` | ✅ | Create organization |
| GET | `/orgs` | ✅ | List own organizations |
| GET | `/orgs/{org_id}/members` | ✅ member | List members |
| POST | `/orgs/{org_id}/members` | ✅ admin | Add member |
| DELETE | `/orgs/{org_id}/members/{user_id}` | ✅ admin | Remove member |

---

## Projects

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/orgs/{org_id}/projects` | ✅ admin | Create project |
| GET | `/orgs/{org_id}/projects` | ✅ member | List projects |
| GET | `/projects/{project_id}` | ✅ member | Get project |
| PATCH | `/projects/{project_id}` | ✅ admin | Update project |
| DELETE | `/projects/{project_id}` | ✅ admin | Delete project |

---

## Tasks

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/projects/{project_id}/tasks` | ✅ member | Create task |
| GET | `/projects/{project_id}/tasks` | ✅ member | List tasks |
| GET | `/tasks/{task_id}` | ✅ member | Get task |
| PATCH | `/tasks/{task_id}` | ✅ member | Update task |
| DELETE | `/tasks/{task_id}` | ✅ creator/admin | Delete task |

---

# 🗺 Development Roadmap

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Backend foundation | ✅ Done |
| 2 | Database integration | ✅ Done |
| 3 | Authentication system | ✅ Done |
| 4 | Core business logic | ✅ Done |
| 5 | Frontend implementation | Planned |
| 6 | Cloud deployment | Planned |
| 7 | Production readiness | Planned |

---

# 🧰 Tech Stack

## Backend

- Python 3.12  
- FastAPI  
- SQLAlchemy  
- PostgreSQL 16  
- Alembic  
- passlib (bcrypt)  
- python-jose (JWT)  
- pytest + httpx  

## Frontend (Planned)

- React or Next.js  
- TypeScript  

## Infrastructure

- Docker / Docker Compose  
- Render / Fly.io / Railway  
- Vercel  

---

# 🎯 Purpose

This project is developed as:

- Portfolio project  
- Learning project  
- Demonstration of backend engineering skills  
- Potential SaaS product foundation  

---

# 👤 Author

Developer: **Pekka Levo**  
Status: **Active development**