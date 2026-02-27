# MyProject Backend API

![Python](https://img.shields.io/badge/Python-3.12-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![Tests](https://img.shields.io/badge/Tests-Pytest-success)
![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)

Backend API for **MyProject**, built with **FastAPI**, **SQLAlchemy**, and **PostgreSQL**.

---

# Tech Stack

- Python 3.12  
- FastAPI  
- Uvicorn  
- PostgreSQL 16  
- SQLAlchemy  
- Alembic  
- passlib (bcrypt)  
- python-jose (JWT)  
- pydantic-settings  
- python-multipart  
- psycopg2-binary  
- pytest + httpx  

---

# Project Structure

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
├── tests/
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_organizations.py
│   └── test_projects.py
├── .env.example
├── pyrightconfig.json
├── requirements.txt
└── README.md
```

---

# Prerequisites

- Python 3.12 or newer  
- PostgreSQL (or Docker for local development)  
- Git  

---

# Local Development Setup

## 1️⃣ Start PostgreSQL (Docker)

From project root:

```bash
docker-compose up -d
```

Starts PostgreSQL 16 on port `5432` with database `myproject`.

---

## 2️⃣ Create Virtual Environment

From the `backend/` folder:

```bash
python -m venv venv
source venv/bin/activate
```

---

## 3️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

---

# Environment Configuration

Create a `.env` file (not committed to version control):

```bash
cp .env.example .env
```

### Example `.env`

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Security
SECRET_KEY=your_secret_key_here

# App settings
ENVIRONMENT=development

# Optional: set to current git commit hash for /version endpoint
GIT_SHA=
```

Optional settings (defaults provided):

```env
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

---

# Database Migrations

### Apply migrations

```bash
alembic upgrade head
```

### Create new migration after model changes

```bash
alembic revision --autogenerate -m "description"
```

---

# Run Development Server

```bash
uvicorn app.main:app --reload
```

Swagger UI available at:

```
http://127.0.0.1:8000/docs
```

---

# Testing

Tests use SQLite in-memory database (no PostgreSQL required).

Run tests:

```bash
pytest
```

Verbose output:

```bash
pytest -v
```

---

# API Endpoints

## System

| Method | Endpoint   | Description                              |
|--------|------------|------------------------------------------|
| GET    | `/`        | Root                                     |
| GET    | `/health`  | Health check with uptime                 |
| GET    | `/version` | Version info (includes `GIT_SHA` if set) |

---

## Auth & Users

| Method | Endpoint          | Description                     |
|--------|-------------------|---------------------------------|
| POST   | `/users/register` | Register new user               |
| POST   | `/auth/login`     | Login and receive JWT token     |
| GET    | `/users/me`       | Get current user (requires JWT) |

---

## Organizations

| Method | Endpoint                           | Description                           |
|--------|------------------------------------|---------------------------------------|
| POST   | `/orgs`                            | Create organization (creator = admin) |
| GET    | `/orgs`                            | List own organizations                |
| GET    | `/orgs/{org_id}/members`           | List members (member+)                |
| POST   | `/orgs/{org_id}/members`           | Add member (admin only)               |
| DELETE | `/orgs/{org_id}/members/{user_id}` | Remove member (admin only)            |

---

## Projects

| Method | Endpoint                  | Description                           |
|--------|---------------------------|---------------------------------------|
| POST   | `/orgs/{org_id}/projects` | Create project (admin only)           |
| GET    | `/orgs/{org_id}/projects` | List projects (member+)               |
| GET    | `/projects/{project_id}`  | Get project (member+)                 |
| PATCH  | `/projects/{project_id}`  | Update project (admin only)           |
| DELETE | `/projects/{project_id}`  | Delete project (admin only, no tasks) |

---

## Tasks

| Method | Endpoint                       | Description                    |
|--------|--------------------------------|--------------------------------|
| POST   | `/projects/{project_id}/tasks` | Create task (member+)          |
| GET    | `/projects/{project_id}/tasks` | List tasks (member+)           |
| GET    | `/tasks/{task_id}`             | Get task (member+)             |
| PATCH  | `/tasks/{task_id}`             | Update task (member+)          |
| DELETE | `/tasks/{task_id}`             | Delete task (creator or admin) |

---

# Useful Commands

```bash
# Activate virtual environment
source venv/bin/activate

# Deactivate virtual environment
deactivate

# Update requirements
pip freeze > requirements.txt

# Run tests
pytest

# Run tests (verbose)
pytest -v
```

---

# Project Status

| Feature                                         | Status  |
|-------------------------------------------------|----------|
| Backend foundation                              | ✅ Done |
| Database integration (SQLAlchemy + PostgreSQL)  | ✅ Done |
| Alembic migrations                              | ✅ Done |
| User model                                      | ✅ Done |
| User registration                               | ✅ Done |
| JWT authentication                              | ✅ Done |
| Current user endpoint                           | ✅ Done |
| Organization management                         | ✅ Done |
| Project management                              | ✅ Done |
| Task management                                 | ✅ Done |
| Automated tests                                 | ✅ Done |
| Frontend                                        | Planned |

---

# Summary

The backend is production-ready with:

- JWT authentication
- Organization & project management
- Task management
- Database migrations
- Automated test suite

Frontend implementation is planned next.
