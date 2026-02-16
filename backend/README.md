# Backend – MyProject API (FastAPI)

This folder contains the backend API for **MyProject**, built using FastAPI.

---

## Tech stack

Current:

- Python 3.12
- FastAPI
- Uvicorn

Planned:

- PostgreSQL
- SQLAlchemy
- Alembic

---

## Folder structure

```
backend/
├── app/
│   ├── main.py
│   ├── core/
│   ├── db/
│   ├── models/
│   ├── schemas/
│   └── api/
├── .env.example
├── requirements.txt
└── README.md
```

---

## Prerequisites

Required:

- Python 3.12 or newer
- Git

Planned:

- PostgreSQL

---

## Initial setup

Open terminal:

```
cd backend
```

Create virtual environment:

```
python -m venv .venv
```

Activate virtual environment:

```
.\.venv\Scripts\activate
```

Install dependencies:

```
pip install -r requirements.txt
```

---

## Running the development server

Start server:

```
uvicorn app.main:app --reload
```

Open:

```
http://127.0.0.1:8000/docs
```

---

## Available endpoints

Health:

```
GET /health
```

Version:

```
GET /version
```

---

## Environment variables

Local file:

```
backend/.env
```

Template:

```
backend/.env.example
```

Example:

```
DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/myproject
GIT_SHA=local-dev
```

---

## Useful commands

Activate venv:

```
.\.venv\Scripts\activate
```

Deactivate venv:

```
deactivate
```

Update requirements:

```
pip freeze > requirements.txt
```

Run server:

```
uvicorn app.main:app --reload
```

---

## Troubleshooting

Allow scripts in PowerShell:

```
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## Status

Backend foundation complete  
Database integration next

---
