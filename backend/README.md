# Backend – MyProject API (FastAPI)

This folder contains the backend API for **MyProject**.

Tech highlights:
- Python 3.12
- FastAPI
- Uvicorn (dev server)
- (Planned) PostgreSQL + SQLAlchemy + Alembic

---

## Folder Structure

backend/
app/
main.py
core/ # config (planned)
db/ # db session, migrations (planned)
models/ # SQLAlchemy models (planned)
schemas/ # Pydantic schemas (planned)
api/ # routers/endpoints (planned)
.env.example
requirements.txt


---

## Prerequisites

- Python 3.12+
- Git
- (Later) PostgreSQL

---

## Setup (first time)

Open a terminal in the `backend/` folder:

```powershell
cd C:\Users\pekka\MyProject\backend

Create a virtual environment:

python -m venv .venv

Activate the virtual environment:

.\.venv\Scripts\activate

Install dependencies:

pip install -r requirements.txt

Running the development server

Make sure your venv is active (you should see (.venv) in terminal).

Start the server:

uvicorn app.main:app --reload

Open in browser:

    Swagger UI: http://127.0.0.1:8000/docs

    Health check: http://127.0.0.1:8000/health

    Version: http://127.0.0.1:8000/version

Environment variables

We keep sensitive settings out of Git.

    backend/.env (local only, NOT committed)

    backend/.env.example (committed template)

Example:

# Planned for DB step:
DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/myproject

# Optional for /version endpoint:
GIT_SHA=local-dev

Useful commands
Update requirements.txt (after installing new packages)

pip freeze > requirements.txt

Deactivate virtual environment

deactivate

Troubleshooting
PowerShell: "running scripts is disabled"

Allow venv activation scripts for current user:

Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

uvicorn command not found

Either venv is not active or package missing:

.\.venv\Scripts\activate
pip install uvicorn[standard]

/version shows git_sha as null

Set the env variable before running:

PowerShell (temporary for the terminal session):

$env:GIT_SHA="local-dev"
uvicorn app.main:app --reload

Notes

This backend is built as a portfolio-quality codebase:

    clean structure

    scalable architecture

    good documentation

    SaaS-ready approach

