Hyvä huomio — ja olet täysin oikeassa. Portfolioprojektissa suomenkielisen README:n pitäisi olla yhtä kattava ja ammattimainen, ei lyhyempi versio.

Alla on täysin päivitetty suomenkielinen README.fi.md, joka vastaa englanninkielistä rakennetta ja tasoa.

Voit kopioida tämän suoraan README.fi.md tiedostoon.

# MyProject – Kevyt tehtävienhallinta SaaS pienille tiimeille

Kevyt SaaS-tyylinen web-sovellus, joka on suunniteltu pienille tiimeille (1–10 käyttäjää) projektien ja tehtävien hallintaan.

Projektia kehitetään full stack -portfolioprojektina käyttäen FastAPI:a, PostgreSQL:ää ja React/Next.js:ää. Tavoitteena on toteuttaa tuotantotasoinen backend-arkkitehtuuri, autentikointijärjestelmä, tietokantarakenne ja skaalautuva SaaS-sovellus.

Projektin tarkoitus on toimia sekä portfolioprojektina että mahdollisena pohjana kaupalliselle SaaS-tuotteelle.

---

# Nykyinen tila

Backend-perusta on alustettu ja toimii.

Toteutettu:

- FastAPI backend alustettu
- Projektirakenne luotu modulaarisella arkkitehtuurilla
- Virtuaaliympäristö konfiguroitu
- Kehityspalvelin toimii
- API root- ja health-endpointit toteutettu
- Backend käynnistyy ja toimii lokaalisti

Työn alla:

- PostgreSQL-tietokantaintegraatio
- SQLAlchemy ORM -mallit
- Alembic migraatiot
- Käyttäjähallinta
- Autentikointijärjestelmä

Suunnitteilla:

- Organisaatiot
- Projektit
- Tehtävät
- Frontend-käyttöliittymä

---

# Projektin visio

Projektin tavoitteena on rakentaa tuotantotasoinen tehtävienhallintajärjestelmä pienille tiimeille.

Keskeiset tavoitteet:

- Selkeä ja skaalautuva backend-arkkitehtuuri
- Oikea tietokantasuunnittelu ja migraatiot
- Turvallinen autentikointi ja käyttöoikeuksien hallinta
- SaaS-valmis moniorganisaatiorakenne
- Tuotantokelpoinen ja laajennettava koodipohja
- Portfoliotasoinen projekti työnhakua varten

---

# MVP-laajuus (versio 1)

## Autentikointi

- Käyttäjän rekisteröinti
- Käyttäjän kirjautuminen
- Turvallinen salasanan hash
- JWT tai sessiopohjainen autentikointi

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

Ei sisälly MVP-versioon:

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

Projektirakenne:



backend/
app/
main.py
core/
db/
models/
schemas/
api/


Arkkitehtuurin periaatteet:

- Modulaarinen rakenne
- Vastuualueiden selkeä erottelu
- Skaalautuva suunnittelu
- Migraatiopohjainen tietokannan hallinta
- Tuotantotasoinen backend-rakenne

---

# Tietokantarakenne (suunniteltu)

Keskeiset taulut:

- users
- organizations
- memberships
- projects
- tasks

Mahdollistaa:

- Moniorganisaatio SaaS-mallin
- Roolipohjaisen käyttöoikeuden hallinnan
- Tehtävien osoittamisen ja seurannan
- Skaalautuvan tietorakenteen

---

# API-endpointit (suunniteltu)

Autentikointi:

POST /auth/register  
POST /auth/login  

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
Vaihe 2 – Tietokantaintegraatio (käynnissä)  
Vaihe 3 – Autentikointijärjestelmä  
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

Frontend (suunnitteilla):

- React tai Next.js
- TypeScript

Infra:

- Docker (suunnitteilla)
- Render / Fly.io / Railway
- Vercel

---

# Projektin tarkoitus

Tämä projekti toimii:

- Portfolioprojektina
- Oppimisprojektina
- Backend-osaamisen demonstraationa
- Tuotantotason arkkitehtuuriharjoituksena
- Mahdollisena SaaS-tuotteen pohjana

---

# Kehittäjä

Kehittäjä: Pekka  
Status: Aktiivisessa kehityksessä
