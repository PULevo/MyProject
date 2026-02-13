# MyProject – Lightweight Team Task Management SaaS

A lightweight SaaS-style web application designed for small teams (1–10 users) to manage projects and tasks efficiently.

This project is being built as a full-stack portfolio application using FastAPI, PostgreSQL, and React/Next.js. The goal is to demonstrate production-level backend architecture, authentication, database design, and scalable SaaS structure.

---

# Current Status

Backend foundation is initialized and running.

Implemented:

- FastAPI backend initialized
- Project structure organized using modular architecture
- Virtual environment configured
- Development server running successfully
- API root and health endpoints implemented

In progress:

- Database integration (PostgreSQL)
- SQLAlchemy models
- Authentication system
- Core SaaS features

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

- User registration
- User login
- Secure password hashing
- Session or JWT-based authentication

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

backend/
app/
main.py
core/
db/
models/
schemas/
api/


Architecture principles:

- Modular structure
- Separation of concerns
- Scalable design
- Migration-based database management

---

# Database Schema (Planned)

Core tables:

- users
- organizations
- memberships
- projects
- tasks

Supports:

- Multi-organization SaaS model
- Role-based access control
- Task assignment and tracking

---

# API Endpoints (Planned)

Auth:

POST /auth/register  
POST /auth/login  

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
Phase 2 – Database integration (in progress)  
Phase 3 – Authentication system  
Phase 4 – Core business logic  
Phase 5 – Frontend implementation  
Phase 6 – Deployment  
Phase 7 – Production readiness  

---

# Tech Stack

Backend:

- Python 3.12
- FastAPI
- SQLAlchemy
- PostgreSQL
- Alembic

Frontend (planned):

- React or Next.js
- TypeScript

Infrastructure:

- Docker (planned)
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

Developer: Pekka  
Status: Active development
