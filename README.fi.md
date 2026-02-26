# MyProject – Kevyt tehtävienhallinta SaaS pienille tiimeille

Kevyt SaaS-tyylinen web-sovellus, joka on suunniteltu pienille tiimeille (1–10 käyttäjää) projektien ja tehtävien hallintaan.

Projektia kehitetään full stack -portfolioprojektina käyttäen FastAPI:a, PostgreSQL:ää ja React/Next.js:ää. Tavoitteena on toteuttaa tuotantotasoinen backend-arkkitehtuuri, autentikointijärjestelmä, tietokantarakenne ja skaalautuva SaaS-sovellus.

---

# Nykyinen tila

Backend-perusta ja autentikointijärjestelmä on toteutettu kokonaan.

Toteutettu:

- FastAPI backend alustettu
- Projektirakenne luotu modulaarisella arkkitehtuurilla
- Virtuaaliympäristö konfiguroitu
- Kehityspalvelin toimii
- API root-, health- ja version-endpointit toteutettu
- PostgreSQL-tietokantaintegraatio SQLAlchemyn kautta
- Alembic migraatiojärjestelmä konfiguroitu
- User-malli (sähköposti, salasanatiiviste, nimi, aikaleimat)
- Käyttäjän rekisteröinti: `POST /users/register`
- JWT-pohjainen kirjautuminen: `POST /auth/login`
- Turvallinen salasanan hajautus bcryptillä

Työn alla:

- Suojatut endpointit (kirjautunut käyttäjä)
- Organisaatioiden hallinta
- Projektien hallinta
- Tehtävien hallinta

Suunnitteilla:

- Frontend (React / Next.js)
- Pilvijulkaisu

---

# Projektin visio

Projektin tavoitteena on rakentaa tuotantotasoinen tehtävienhallintajärjestelmä pienille tiimeille.

Keskeiset tavoitteet:

- Selkeä ja skaalautuva backend-arkkitehtuuri
- Oikea tietokantasuunnittelu ja migraatiot
- Turvallinen autentikointi ja käyttöoikeuksien hallinta
- SaaS-valmis moniorganisaatiorakenne
- Tuotantokelpoinen ja laajennettava koodipohja

---

# MVP-laajuus (versio 1)

## Autentikointi

- Käyttäjän rekisteröinti ✅
- Käyttäjän kirjautuminen ✅
- Turvallinen salasanan hajautus (bcrypt) ✅
- JWT-pohjainen autentikointi ✅
- Kirjautuneen käyttäjän endpoint (`GET /users/me`)

---

## Organisaatioiden hallinta

- Organisaation luonti
- Käyttäjien liittäminen organisaatioon
- Roolipohjainen käyttöoikeus:
  - Admin
  - Member

---

## Projektien hallinta

- Projektin luonti
- Projektien listaus organisaatiokohtaisesti

---

## Tehtävien hallinta

- Tehtävän luonti
- Tehtävän osoittaminen käyttäjälle
- Tehtävän tilat:
  - TODO
  - DOING
  - DONE
- Valinnainen määräpäivä

---

## Käyttönäkymät

- Omat tehtävät -näkymä
- Projektikohtainen tehtävälista

---

# Tulevat ominaisuudet (versio 2+)

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

# Backend-arkkitehtuuri

## Projektirakenne

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


Arkkitehtuurin periaatteet:

- Modulaarinen rakenne
- Vastuualueiden selkeä erottelu
- Skaalautuva suunnittelu
- Migraatiopohjainen tietokannan hallinta

---

# Tietokantarakenne

Toteutettu:

- `users` — sähköposti, salasanatiiviste, nimi, luontiaika

Suunnitteilla:

- `organizations`
- `memberships` (user ↔ org + rooli)
- `projects`
- `tasks`

---

# API-endpointit

Autentikointi:

POST /users/register ✅

POST /auth/login ✅

GET /users/me (tulossa)


Organisaatiot:

POST /orgs

GET /orgs


Projektit:

POST /projects

GET /projects


Tehtävät:

POST /tasks

GET /tasks

PATCH /tasks/{id}


---

# Kehityssuunnitelma

Vaihe 1 – Backend-perusta ✅

Vaihe 2 – Tietokantaintegraatio ✅

Vaihe 3 – Autentikointijärjestelmä ✅

Vaihe 4 – Ydintoiminnot (organisaatiot, projektit, tehtävät)

Vaihe 5 – Frontend-toteutus

Vaihe 6 – Julkaisu pilveen

Vaihe 7 – Tuotantovalmius

---

# Teknologiat

Backend:

- Python 3.12
- FastAPI
- SQLAlchemy
- PostgreSQL
- Alembic
- passlib (bcrypt)
- python-jose (JWT)

Frontend (suunnitteilla):

- React tai Next.js
- TypeScript

Infra:

- Docker
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

Kehittäjä: Pekka Levo

Status: Aktiivisessa kehityksessä
