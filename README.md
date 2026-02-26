# MyProject – Lightweight Team Task Management SaaS

Finnish version of README-file: https://github.com/PULevo/MyProject/blob/main/README.fi.md

A lightweight SaaS-style web application designed for small teams (1–10 users) to manage projects and tasks efficiently.

This project is being built as a full-stack portfolio application using FastAPI, PostgreSQL, and React/Next.js. The goal is to demonstrate production-level backend architecture, authentication, database design, and scalable SaaS structure.

---

# Current Status

Backend foundation and authentication system are fully implemented.

Implemented:

- FastAPI backend initialized
- Project structure organized using modular architecture
- Virtual environment configured
- Development server running successfully
- API root, health, and version endpoints implemented
- PostgreSQL database integration via SQLAlchemy
- Alembic migration system configured
- User model with email, hashed password, name, and timestamps
- User registration: `POST /users/register`
- JWT-based login: `POST /auth/login`
- Secure password hashing with bcrypt

In progress:

- Protected endpoints (current user)
- Organization management
- Project management
- Task management

Planned:

- Frontend (React / Next.js)
- Cloud deployment

---

# Project Vision

The goal is to build a production-ready task management system for small teams.

Key goals:

- Clean and scalable backend architecture
- Proper database modeling and migrations
- Secure authentication and role-based access
- SaaS-ready multi-organization structure
- Production-quality codebase suitable for portfolio and real-world use

---

# MVP Scope (v1)

## Authentication

- User registration ✅
- User login ✅
- Secure password hashing (bcrypt) ✅
- JWT-based authentication ✅
- Current user endpoint (`GET /users/me`)

---

## Organization Management

- Create organization
- Join organization
- Role-based access:
  - Admin
  - Member

---

## Project Management

- Create project
- List organization projects

---

## Task Management

- Create task
- Assign task to user
- Task status:
  - TODO
  - DOING
  - DONE
- Optional due date

---

## Views

- My Tasks view
- Project task list view

---

# Future Features (v2+)

- Comments
- File attachments
- Email invitations
- Notifications
- Activity logs
- Billing and subscriptions
- Analytics dashboard
- API integrations
- AI-assisted features

---

# Backend Architecture

Structure:

```
backend/
└── app/
    ├── main.py
    ├── core/
    │   ├── config.py
    │   └── security.py
    ├── db/
    │   ├── base.py
    │   └── session.py
    ├── models/
    │   └── user.py
    ├── schemas/
    │   └── user.py
    ├── crud/
    │   └── user.py
    └── api/
        ├── users.py
        └── auth.py
```


Architecture principles:

- Modular structure
- Separation of concerns
- Scalable design
- Migration-based database management

---

# Database Schema

Implemented:

- `users` — email, password_hash, name, created_at

Planned:

- `organizations`
- `memberships` (user ↔ org with role)
- `projects`
- `tasks`

---

# API Endpoints

Auth:

POST /users/register ✅

POST /auth/login ✅

GET /users/me (planned)


Organizations:

POST /orgs
GET /orgs


Projects:

POST /projects
GET /projects


Tasks:

POST /tasks
GET /tasks
PATCH /tasks/{id}


---

# Development Roadmap

Phase 1 – Backend foundation ✅

Phase 2 – Database integration ✅

Phase 3 – Authentication system ✅

Phase 4 – Core business logic (organizations, projects, tasks)

Phase 5 – Frontend implementation

Phase 6 – Cloud deployment

Phase 7 – Production readiness

---

# Tech Stack

Backend:

- Python 3.12
- FastAPI
- SQLAlchemy
- PostgreSQL
- Alembic
- passlib (bcrypt)
- python-jose (JWT)

Frontend (planned):

- React or Next.js
- TypeScript

Infrastructure:

- Docker
- Render / Fly.io / Railway
- Vercel

---

# Purpose

This project is being developed as:

- Portfolio project
- Learning project
- Demonstration of backend engineering skills
- Potential SaaS product

---

# Author

Developer: Pekka Levo

Status: Active development
