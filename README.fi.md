# MyProject – Kevyt tehtävienhallinta SaaS pienille tiimeille

![Backend](https://img.shields.io/badge/Backend-FastAPI-green)
![Tietokanta](https://img.shields.io/badge/Database-PostgreSQL%2016-blue)
![Autentikointi](https://img.shields.io/badge/Auth-JWT-orange)
![Testit](https://img.shields.io/badge/Tests-Pytest-success)
![Tila](https://img.shields.io/badge/Status-Aktiivinen%20kehitys-brightgreen)

English version: [README.md](./README.md)

---

Kevyt SaaS-tyylinen web-sovellus, joka on suunniteltu **pienille tiimeille (1–10 käyttäjää)** projektien ja tehtävien hallintaan.

Projektia kehitetään **full stack -portfolioprojektina** käyttäen:

- FastAPI
- PostgreSQL
- React / Next.js (suunnitteilla)

Tavoitteena on toteuttaa:

- Tuotantotasoinen backend-arkkitehtuuri  
- Turvallinen autentikointijärjestelmä  
- Oikein mallinnettu tietokantarakenne  
- Skaalautuva ja SaaS-valmis sovellus  

---

# Nykyinen tila

Backend on **MVP-laajuudeltaan valmis**.

Kaikki ydintoiminnot — autentikointi, organisaatiohallinta, projektinhallinta ja tehtävienhallinta — on toteutettu ja katettu automaattisilla testeillä.

---

## Toteutettu

- FastAPI-backend modulaarisella arkkitehtuurilla  
- PostgreSQL-integraatio SQLAlchemyn kautta  
- Alembic-migraatiojärjestelmä  
- User-malli (sähköposti, salasanatiiviste, nimi, aikaleimat)  
- Käyttäjän rekisteröinti: `POST /users/register`  
- JWT-pohjainen kirjautuminen: `POST /auth/login`  
- Kirjautuneen käyttäjän endpoint: `GET /users/me`  
- Turvallinen salasanan hajautus (bcrypt)  
- Organisaatioiden hallinta (admin / member -roolit)  
- Projektien hallinta organisaatiokohtaisesti  
- Tehtävien hallinta projektikohtaisesti  
- Roolipohjainen käyttöoikeuksien hallinta  
- Automaattiset testit pytestillä  
- Docker Compose paikallista PostgreSQL-kehitystä varten  

---

## Työn alla / Suunnitteilla

- Frontend (React / Next.js)  
- Pilvijulkaisu  
- Tuotantovalmiuden viimeistely  

---

# Projektin visio

Rakentaa **tuotantotasoinen tehtävienhallintajärjestelmä pienille tiimeille**.

### Keskeiset tavoitteet

- Selkeä ja skaalautuva backend-arkkitehtuuri  
- Oikea tietokantasuunnittelu ja migraatiot  
- Turvallinen autentikointi ja roolipohjainen käyttöoikeus  
- SaaS-valmis moniorganisaatiorakenne  
- Tuotantokelpoinen ja laajennettava koodipohja  

---

# MVP-laajuus (v1)

## Autentikointi 

- Käyttäjän rekisteröinti  
- Käyttäjän kirjautuminen  
- Turvallinen salasanan hajautus (bcrypt)  
- JWT-pohjainen autentikointi  
- Kirjautuneen käyttäjän endpoint (`GET /users/me`)  

---

## Organisaatioiden hallinta 

- Organisaation luonti (luoja saa admin-roolin)  
- Omien organisaatioiden listaus  
- Organisaation jäsenten listaus  
- Jäsenen lisääminen (admin)  
- Jäsenen poistaminen (admin)  
- Roolipohjainen käyttöoikeus (admin / member)  

---

## Projektien hallinta 

- Projektin luonti organisaatioon (admin)  
- Organisaation projektien listaus (member+)  
- Yksittäisen projektin haku (member+)  
- Projektin muokkaus (admin)  
- Projektin poistaminen (admin, ei tehtäviä)  

---

## Tehtävien hallinta 

- Tehtävän luonti (member+)  
- Tehtävien listaus (member+)  
- Yksittäisen tehtävän haku (member+)  
- Tehtävän päivitys (member+)  
- Tehtävän poisto (luoja tai admin)  
- Tehtävän tilat: `todo` / `doing` / `done`  
- Valinnainen käyttäjäkohtainen tehtävänanto  

---

## Käyttönäkymät (Frontend — Suunnitteilla)

- Omat tehtävät -näkymä  
- Projektikohtainen tehtävälista  

---

# Tulevat ominaisuudet (v2+)

- Kommentit tehtäviin  
- Tiedostoliitteet  
- Sähköpostikutsut  
- Ilmoitukset  
- Aktiviteettiloki  
- Maksulliset tilaukset  
- Raportointi ja analytiikka  
- API-integraatiot  
- AI-avusteiset ominaisuudet  

---

# Backend-arkkitehtuuri

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

### Arkkitehtuurin periaatteet

- Modulaarinen rakenne ja selkeä vastuualueiden erottelu  
- Router → Schema → CRUD → Model -kerrosrakenne  
- Riippuvuusinjektio tietokantasessioille ja autentikoinnille  
- Migraatiopohjainen tietokannan hallinta Alembicin avulla  

---

# Tietokantarakenne

| Taulu | Sarakkeet |
|-------|-----------|
| `users` | id, email, password_hash, name, created_at |
| `organizations` | id, name, created_at |
| `memberships` | id, user_id, organization_id, role, created_at |
| `projects` | id, name, description, organization_id, created_by, created_at |
| `tasks` | id, title, description, status, project_id, assigned_to, created_by, created_at, updated_at |

---

# API-endpointit

## Järjestelmä

| Metodi | Polku | Kuvaus |
|--------|-------|--------|
| GET | `/` | Juuri |
| GET | `/health` | Tilantarkistus |
| GET | `/version` | Versiotiedot |

---

## Autentikointi ja käyttäjät

| Metodi | Polku | Auth | Kuvaus |
|--------|-------|------|--------|
| POST | `/users/register` | — | Rekisteröidy |
| POST | `/auth/login` | — | Kirjaudu sisään |
| GET | `/users/me` | ✅ | Kirjautunut käyttäjä |

---

## Organisaatiot

| Metodi | Polku | Auth | Kuvaus |
|--------|-------|------|--------|
| POST | `/orgs` | ✅ | Luo organisaatio |
| GET | `/orgs` | ✅ | Listaa omat organisaatiot |
| GET | `/orgs/{org_id}/members` | ✅ member | Listaa jäsenet |
| POST | `/orgs/{org_id}/members` | ✅ admin | Lisää jäsen |
| DELETE | `/orgs/{org_id}/members/{user_id}` | ✅ admin | Poista jäsen |

---

## Projektit

| Metodi | Polku | Auth | Kuvaus |
|--------|-------|------|--------|
| POST | `/orgs/{org_id}/projects` | ✅ admin | Luo projekti |
| GET | `/orgs/{org_id}/projects` | ✅ member | Listaa projektit |
| GET | `/projects/{project_id}` | ✅ member | Hae projekti |
| PATCH | `/projects/{project_id}` | ✅ admin | Muokkaa projektia |
| DELETE | `/projects/{project_id}` | ✅ admin | Poista projekti |

---

## Tehtävät

| Metodi | Polku | Auth | Kuvaus |
|--------|-------|------|--------|
| POST | `/projects/{project_id}/tasks` | ✅ member | Luo tehtävä |
| GET | `/projects/{project_id}/tasks` | ✅ member | Listaa tehtävät |
| GET | `/tasks/{task_id}` | ✅ member | Hae tehtävä |
| PATCH | `/tasks/{task_id}` | ✅ member | Muokkaa tehtävää |
| DELETE | `/tasks/{task_id}` | ✅ luoja/admin | Poista tehtävä |

---

# Kehityssuunnitelma

| Vaihe | Kuvaus | Tila |
|-------|--------|------|
| 1 | Backend-perusta | ✅ Valmis |
| 2 | Tietokantaintegraatio | ✅ Valmis |
| 3 | Autentikointijärjestelmä | ✅ Valmis |
| 4 | Ydintoiminnot | ✅ Valmis |
| 5 | Frontend | Suunnitteilla |
| 6 | Pilvijulkaisu | Suunnitteilla |
| 7 | Tuotantovalmius | Suunnitteilla |

---

# Teknologiat

## Backend

- Python 3.12  
- FastAPI  
- SQLAlchemy  
- PostgreSQL 16  
- Alembic  
- passlib (bcrypt)  
- python-jose (JWT)  
- pytest + httpx  

## Frontend (suunnitteilla)

- React tai Next.js  
- TypeScript  

## Infra

- Docker / Docker Compose  
- Render / Fly.io / Railway  
- Vercel  

---

# Projektin tarkoitus

Tämä projekti toimii:

- Portfolioprojektina  
- Oppimisprojektina  
- Backend-osaamisen demonstraationa  
- Mahdollisena SaaS-tuotteen pohjana  

---

# Kehittäjä

**Pekka Levo**  
Status: **Aktiivisessa kehityksessä**
