# Backend – MyProject API (FastAPI)

This folder contains the backend API for **MyProject**, built using FastAPI.

---

## Tech stack

- Python 3.12
- FastAPI
- Uvicorn
- PostgreSQL
- SQLAlchemy
- Alembic
- passlib (bcrypt)
- python-jose (JWT)
- pydantic-settings
- python-multipart
- psycopg2-binary

---

## Folder structure

backend/
├── alembic/
│ ├── env.py
│ └── script.py.mako
├── app/
│ ├── main.py
│ ├── core/
│ │ ├── config.py
│ │ └── security.py
│ ├── db/
│ │ ├── base.py
│ │ └── session.py
│ ├── models/
│ │ └── user.py
│ ├── schemas/
│ │ └── user.py
│ ├── crud/
│ │ └── user.py
│ └── api/
│ ├── auth.py
│ └── users.py
├── alembic.ini
├── .env.example
├── requirements.txt
└── README.md


---

## Prerequisites

- Python 3.12 or newer
- PostgreSQL
- Git

---

## Initial setup

From the `backend/` folder:

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

Configuration

Sensitive configuration is stored in a local .env file (not committed to version control).

Use .env.example as a template:

DATABASE_URL=postgresql://user:password@localhost/myproject
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
GIT_SHA=

Database migrations

Apply existing migrations:

alembic upgrade head

Create a new migration after model changes:

alembic revision --autogenerate -m "description"

Running the development server

uvicorn app.main:app --reload

Open Swagger UI:

http://127.0.0.1:8000/docs

Available endpoints

GET   /            Root
GET   /health      Health check
GET   /version     Version info

POST  /users/register   Register new user
POST  /auth/login       Login and receive JWT token

Useful commands

Activate virtual environment:

source venv/bin/activate

Deactivate virtual environment:

deactivate

Update requirements:

pip freeze > requirements.txt

Status

    Backend foundation ✅
    Database integration (SQLAlchemy + PostgreSQL) ✅
    Alembic migrations ✅
    User model ✅
    User registration ✅
    JWT authentication ✅
    Organization, project, and task management — in progress

