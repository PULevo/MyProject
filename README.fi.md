# MyProject – Kevyt tehtävienhallinta pienille tiimeille

![Backend](https://img.shields.io/badge/Backend-FastAPI-green)
![Frontend](https://img.shields.io/badge/Frontend-Next.js%2015-black)
![Tietokanta](https://img.shields.io/badge/Database-PostgreSQL%2016-blue)
![Autentikointi](https://img.shields.io/badge/Auth-JWT-orange)
![Testit](https://img.shields.io/badge/Tests-Pytest-success)
![Tila](https://img.shields.io/badge/Status-Aktiivinen%20kehitys-brightgreen)

English version: [README.md](./README.md)

---

Kevyt SaaS-tyylinen web-sovellus **pienille tiimeille (1–10 henkilöä)**, joka on tehty projektien ja tehtävien hallintaan ilman raskaan toimiston tason järjestelmien monimutkaisuutta.

Projekti on rakennettu **full stack -portfoliotyönä** Pekka Levon toimesta. Tavoitteena oli tehdä jotain aidosti käyttökelpoista — selkeä arkkitehtuuri, kunnollinen autentikointi ja käyttöliittymä, joka ei näytä nopealta kokeilulta.

**Teknologiat:**
- FastAPI + PostgreSQL backend
- Next.js 15 + TypeScript frontend
- JWT-autentikointi
- Roolipohjainen käyttöoikeus (admin / member)

---

## Mitä on toteutettu

**Backend — valmis**
- Käyttäjän rekisteröinti ja JWT-kirjautuminen
- Organisaatiot admin/member-roolein
- Projektit organisaatiokohtaisesti
- Tehtävät projektikohtaisesti kanban-tiloilla (`todo` / `in_progress` / `done`)
- Roolipohjainen käyttöoikeuksien hallinta kaikissa toiminnoissa
- Automaattiset testit pytestillä

**Frontend — valmis**
- Kirjautumis- ja rekisteröintisivut
- Dashboard organisaatiolistauksella
- Organisaatiosivu projektien ja jäsenten välilehdillä
- Kanban-taulu tehtävienhallintaan (klikkaa muokataksesi, siirrä yhdellä klikkauksella)

---

## Mitä tulee seuraavaksi

- Pilvijulkaisu (Render / Railway + Vercel)
- Tuotantovalmiuden viimeistely (rate limiting, virheenseuranta)
- Sähköpostikutsut tiimin jäsenille

---

## Projektirakenne

```
MyProject/
├── backend/          # FastAPI REST API
│   ├── app/
│   │   ├── api/      # Reittien käsittelijät
│   │   ├── core/     # Konfiguraatio & tietoturva
│   │   ├── crud/     # Tietokantaoperaatiot
│   │   ├── db/       # Tietokantasessio
│   │   ├── models/   # SQLAlchemy-mallit
│   │   └── schemas/  # Pydantic-skeemat
│   └── tests/
├── frontend/         # Next.js 15 -sovellus
│   ├── app/          # App Router -sivut
│   ├── components/   # UI-komponentit
│   ├── contexts/     # React-konteksti (autentikointi)
│   └── lib/          # API-asiakasohjelma ja apufunktiot
└── docker-compose.yml
```

Kehitysympäristön asennusohjeet: [`backend/README.md`](./backend/README.md) ja [`frontend/README.md`](./frontend/README.md).

---

## Teknologiat

### Backend
- Python 3.12 · FastAPI · Uvicorn
- PostgreSQL 16 · SQLAlchemy · Alembic
- passlib/bcrypt · python-jose (JWT)
- pytest + httpx

### Frontend
- Next.js 15 · React 19 · TypeScript
- Tailwind CSS v4 · Radix UI -primitiivit
- Lucide-ikonit · Sonner-ilmoitukset
- Bricolage Grotesque + Epilogue -fontit

### Infrastruktuuri
- Docker Compose (paikallinen PostgreSQL)
- Render / Railway (suunniteltu backend-hosting)
- Vercel (suunniteltu frontend-hosting)

---

## Tietokantarakenne

| Taulu | Keskeiset sarakkeet |
|-------|---------------------|
| `users` | id, email, password_hash, name, created_at |
| `organizations` | id, name, created_at |
| `memberships` | id, user_id, organization_id, role |
| `projects` | id, name, description, organization_id, created_by |
| `tasks` | id, title, description, status, project_id, created_by |

---

## API lyhyesti

| Resurssi | Endpointit |
|----------|------------|
| Autentikointi | `POST /users/register` · `POST /auth/login` · `GET /users/me` |
| Organisaatiot | `GET/POST /orgs` · `/orgs/{id}/members` |
| Projektit | `GET/POST /orgs/{id}/projects` · `PATCH/DELETE /projects/{id}` |
| Tehtävät | `GET/POST /projects/{id}/tasks` · `PATCH/DELETE /tasks/{id}` |

Kaikki API-endpointit selityksineen löytyvät osoitteesta `http://localhost:8000/docs` kun sovellus on käynnissä paikallisesti.

---

## Kehityssuunnitelma

| Vaihe | Kuvaus | Tila |
|-------|--------|------|
| 1 | Backend-perusta | ✅ Valmis |
| 2 | Tietokantaintegraatio | ✅ Valmis |
| 3 | Autentikointijärjestelmä | ✅ Valmis |
| 4 | Ydintoiminnot | ✅ Valmis |
| 5 | Frontend | ✅ Valmis |
| 6 | Pilvijulkaisu | Suunnitteilla |
| 7 | Tuotantovalmius | Suunnitteilla |

---

## Tulevat ominaisuudet (v2+)

- Kommentit tehtäviin
- Tiedostoliitteet
- Sähköpostikutsut
- Ilmoitukset
- Aktiviteettiloki
- Maksulliset tilaukset
- Raportointi ja analytiikka
- AI-avusteiset ominaisuudet

---

## Kehittäjä

**Pekka Levo** — portfolioprojekti, aktiivisessa kehityksessä
