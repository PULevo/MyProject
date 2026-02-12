# MyProject – Kevyt tehtävienhallinta SaaS pienille tiimeille

Kevyt SaaS-tyylinen web-sovellus, joka on suunniteltu pienille tiimeille (1–10 käyttäjää) projektien ja tehtävien hallintaan.

Projekti toteutetaan full stack -sovelluksena käyttäen Pythonia (FastAPI), PostgreSQL-tietokantaa sekä React/Next.js frontendia.

Projektin tarkoitus on toimia sekä portfolioprojektina että pohjana mahdollisesti kaupallistettavalle tuotteelle.

---

# Sisällysluettelo

- [Projektin tavoite](#projektin-tavoite)
- [MVP-laajuus (v1)](#mvp-laajuus-v1)
- [Tulevat ominaisuudet (v2+)](#tulevat-ominaisuudet-v2)
- [Käyttäjäroolit](#käyttäjäroolit)
- [Käyttäjätarinat](#käyttäjätarinat)
- [Tietokantarakenne](#tietokantarakenne)
- [API-endpointit](#api-endpointit)
- [Käyttöliittymän rakenne](#käyttöliittymän-rakenne)
- [Kehityssuunnitelma](#kehityssuunnitelma)
- [Teknologiat](#teknologiat)

---

# Projektin tavoite

Projektin tavoitteena on rakentaa yksinkertainen, selkeä ja laajennettava tehtävienhallintajärjestelmä pienille tiimeille.

Keskeiset periaatteet:

- Helppokäyttöinen ja nopea
- Selkeä ja skaalautuva backend-arkkitehtuuri
- Turvallinen autentikointi ja käyttöoikeuksien hallinta
- SaaS-valmis rakenne
- Ammattitasoinen portfolioprojekti

---

# MVP-laajuus (v1)

## Autentikointi

- Käyttäjän rekisteröinti
- Käyttäjän kirjautuminen
- JWT-pohjainen autentikointi (tai aluksi sessiopohjainen ratkaisu)

---

## Organisaation hallinta

- Organisaation (tiimin) luonti
- Käyttäjät voivat kuulua organisaatioihin
- Käyttäjäroolit:
  - Admin (ylläpitäjä)
  - Member (jäsen)

---

## Projektien hallinta

- Projektin luonti
- Organisaation projektien listaus

---

## Tehtävien hallinta

- Tehtävän luonti
- Tehtävän osoittaminen käyttäjälle
- Tehtävän tilat:
  - TODO
  - DOING
  - DONE
- Valinnainen määräpäivä (due date)

---

## Näkymät

- "Omat tehtävät" -näkymä
- Projektikohtainen tehtävälista

---

# Tulevat ominaisuudet (v2+)

Ei sisälly MVP-versioon:

- Kommentit
- Tiedostoliitteet
- Ilmoitukset
- Sähköpostikutsut
- Chat-toiminto
- Raportointi ja analytiikka
- Maksulliset tilaukset
- AI-integraatiot

---

# Käyttäjäroolit

## Admin

Voi:

- Luoda organisaation
- Luoda projekteja
- Lisätä käyttäjiä organisaatioon
- Osoittaa tehtäviä käyttäjille

---

## Member

Voi:

- Tarkastella projekteja
- Tarkastella tehtäviä
- Päivittää tehtävän tilaa
- Tarkastella omia tehtäviään

---

# Käyttäjätarinat

Admin:

- Adminina voin luoda organisaation
- Adminina voin lisätä käyttäjiä organisaatioon
- Adminina voin luoda projekteja
- Adminina voin osoittaa tehtäviä käyttäjille

Member:

- Jäsenenä voin tarkastella projekteja
- Jäsenenä voin tarkastella tehtäviä
- Jäsenenä voin päivittää tehtävän tilaa
- Jäsenenä voin nähdä minulle osoitetut tehtävät

Kun nämä toimivat, MVP on valmis.

---

# Tietokantarakenne

## users

| sarake | tyyppi | kuvaus |
|------|------|------|
| id | UUID / int | pääavain |
| email | string | uniikki |
| password_hash | string | salattu salasana |
| name | string | käyttäjän nimi |
| created_at | timestamp | luontiaika |

---

## organizations

| sarake | tyyppi | kuvaus |
|------|------|------|
| id | UUID / int | pääavain |
| name | string | organisaation nimi |
| owner_user_id | FK users | omistaja |

---

## memberships

| sarake | tyyppi | kuvaus |
|------|------|------|
| id | UUID / int | pääavain |
| org_id | FK organizations | organisaatio |
| user_id | FK users | käyttäjä |
| role | string | admin / member |
| created_at | timestamp | luontiaika |

Uniikki rajoite:

(org_id, user_id)

---

## projects

| sarake | tyyppi | kuvaus |
|------|------|------|
| id | UUID / int | pääavain |
| org_id | FK organizations | organisaatio |
| name | string | projektin nimi |
| description | text | kuvaus |
| created_at | timestamp | luontiaika |

---

## tasks

| sarake | tyyppi | kuvaus |
|------|------|------|
| id | UUID / int | pääavain |
| project_id | FK projects | projekti |
| title | string | tehtävän nimi |
| description | text | kuvaus |
| status | string | todo / doing / done |
| assignee_user_id | FK users | vastuuhenkilö |
| due_date | timestamp | määräpäivä |
| created_at | timestamp | luontiaika |
| updated_at | timestamp | päivitysaika |

---

# API-endpointit

## Autentikointi

POST /auth/register  
POST /auth/login  
POST /auth/logout (valinnainen)  

---

## Organisaatiot

POST /orgs  
GET /orgs/me  

---

## Jäsenyydet

POST /orgs/{org_id}/members  
GET /orgs/{org_id}/members  

---

## Projektit

POST /orgs/{org_id}/projects  
GET /orgs/{org_id}/projects  

---

## Tehtävät

POST /projects/{project_id}/tasks  
GET /projects/{project_id}/tasks  
PATCH /tasks/{task_id}  
GET /tasks/my  

---

# Käyttöliittymän rakenne

## Sivut

- Kirjautumissivu
- Organisaatio- ja projektinäkymä
- Projektin tehtävälista
- Omat tehtävät -näkymä

---

# Kehityssuunnitelma

## Vaihe 1 – Backend-perusta

- Projektin alustus
- Tietokantayhteys
- User-malli
- Autentikointi

---

## Vaihe 2 – Ydinominaisuudet

- Organisaatiot
- Jäsenyydet
- Projektit
- Tehtävät

---

## Vaihe 3 – Frontend MVP

- Kirjautumisnäkymä
- Projektinäkymä
- Tehtävänäkymä

---

## Vaihe 4 – Julkaisu

- Backendin deploy
- Frontendin deploy
- Tuotantotietokanta

---

# Teknologiat

## Backend

- Python
- FastAPI
- PostgreSQL
- SQLAlchemy

---

## Frontend

- React tai Next.js
- TypeScript

---

## Infra

- Docker (valinnainen)
- Render / Fly.io / Railway (backend)
- Vercel (frontend)

---

# Projektin tila

Suunnitteluvaihe valmis  
Seuraava vaihe: backendin toteutus
