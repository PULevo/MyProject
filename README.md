# MyProject – Lightweight Team Task Management SaaS

A lightweight SaaS-style web application designed for small teams (1–10 users) to manage projects and tasks efficiently.

This project is built as a full-stack portfolio application using Python (FastAPI), PostgreSQL, and React/Next.js.

---

# Table of Contents

- [Project Vision](#project-vision)
- [MVP Scope (v1)](#mvp-scope-v1)
- [Future Features (v2+)](#future-features-v2)
- [User Roles](#user-roles)
- [User Stories](#user-stories)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [UI Structure](#ui-structure)
- [Development Roadmap](#development-roadmap)
- [Tech Stack](#tech-stack)

---

# Project Vision

The goal is to build a simple and efficient internal task management system for small teams.

Core principles:

- Simple and fast to use
- Clean and scalable backend architecture
- Secure authentication and role management
- SaaS-ready structure
- Portfolio-quality engineering

---

# MVP Scope (v1)

## Authentication

- User registration
- User login
- JWT-based authentication (session acceptable initially)

---

## Organization Management

- Create organization (team)
- Users can belong to organizations
- Roles:
  - Admin
  - Member

---

## Project Management

- Create project
- View projects within organization

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

- My Tasks view (tasks assigned to current user)
- Project task list view

---

# Future Features (v2+)

Not included in MVP:

- Comments
- File attachments
- Notifications
- Email invitations
- Chat
- Reporting / analytics
- Billing / subscriptions
- AI integrations

---

# User Roles

## Admin

Can:

- Create organization
- Create projects
- Add members
- Assign tasks

## Member

Can:

- View projects
- View assigned tasks
- Update task status

---

# User Stories

Admin:

- As an admin, I can create an organization
- As an admin, I can add members to my organization
- As an admin, I can create projects
- As an admin, I can assign tasks

Member:

- As a member, I can view projects
- As a member, I can view tasks
- As a member, I can update task status
- As a member, I can view tasks assigned to me

---

# Database Schema

## users

| column | type | notes |
|------|------|------|
| id | UUID / int | primary key |
| email | string | unique |
| password_hash | string | |
| name | string | |
| created_at | timestamp | |

---

## organizations

| column | type | notes |
|------|------|------|
| id | UUID / int | primary key |
| name | string | |
| owner_user_id | FK users | |

---

## memberships

| column | type | notes |
|------|------|------|
| id | UUID / int | primary key |
| org_id | FK organizations | |
| user_id | FK users | |
| role | string | admin / member |
| created_at | timestamp | |

Unique constraint:

(org_id, user_id)

---

## projects

| column | type | notes |
|------|------|------|
| id | UUID / int | primary key |
| org_id | FK organizations | |
| name | string | |
| description | text | |
| created_at | timestamp | |

---

## tasks

| column | type | notes |
|------|------|------|
| id | UUID / int | primary key |
| project_id | FK projects | |
| title | string | |
| description | text | |
| status | string | todo / doing / done |
| assignee_user_id | FK users | nullable |
| due_date | timestamp | nullable |
| created_at | timestamp | |
| updated_at | timestamp | |

---

# API Endpoints

## Auth

POST /auth/register  
POST /auth/login  
POST /auth/logout (optional)

---

## Organizations

POST /orgs  
GET /orgs/me  

---

## Memberships

POST /orgs/{org_id}/members  
GET /orgs/{org_id}/members  

---

## Projects

POST /orgs/{org_id}/projects  
GET /orgs/{org_id}/projects  

---

## Tasks

POST /projects/{project_id}/tasks  
GET /projects/{project_id}/tasks  
PATCH /tasks/{task_id}  
GET /tasks/my  

---

# UI Structure

## Pages

- Login page
- Organization / Project list page
- Project task list page
- My Tasks page

---

# Development Roadmap

## Phase 1 – Backend foundation

- Project setup
- Database connection
- User model
- Authentication

## Phase 2 – Core functionality

- Organizations
- Memberships
- Projects
- Tasks

## Phase 3 – Frontend MVP

- Login UI
- Project list UI
- Task list UI

## Phase 4 – Deployment

- Deploy backend
- Deploy frontend
- Connect production database

---

# Tech Stack

## Backend

- Python
- FastAPI
- PostgreSQL
- SQLAlchemy

## Frontend

- React or Next.js
- TypeScript

## Infrastructure

- Docker (optional)
- Render / Fly.io / Railway (backend)
- Vercel (frontend)

---

# Status

Planning phase (MVP specification complete)
