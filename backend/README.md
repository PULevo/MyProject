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

- Python 3.12 or newer
- Git

---

## Initial setup

From the `backend/` folder:

```
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```

---

## Running the development server

```
uvicorn app.main:app --reload
```

Open Swagger UI:

```
http://127.0.0.1:8000/docs
```

---

## Available endpoints

```
GET /health
GET /version
```

---

## Configuration (environment variables)

Sensitive configuration is stored in a local `.env` file (not committed).

Use `.env.example` as a template.

Example keys:

```
DATABASE_URL=
GIT_SHA=
```

---

## Useful commands

Activate virtual environment:

```
.\.venv\Scripts\activate
```

Deactivate virtual environment:

```
deactivate
```

Update requirements:

```
pip freeze > requirements.txt
```

Run development server:

```
uvicorn app.main:app --reload
```

---

## Status

Backend foundation complete  
Database integration next
