# Docker Compose – Angular / C# / PostgreSQL

Dieses Projekt verwendet **Docker Compose**, um eine Angular-Frontend-Applikation, ein C# (ASP.NET) Backend und eine PostgreSQL-Datenbank zu betreiben.

---

## Voraussetzungen

Auf **beiden Rechnern** (Quell- und Zielrechner) muss installiert sein:

* Docker
* Docker Compose (Plugin oder Standalone)

---

## Projektstruktur

```text
.
├── game/
│   └── Dockerfile        # Angular
├── api/
│   └── Dockerfile        # C# / ASP.NET
├── docker-compose.yml
└── README.md
```

## Images mit Docker Compose bauen

Auf dem **Quell-Rechner**:

```bash
docker compose build
```
Und 
```
docker compose pull postgres
```
um das postgres image zu pullen

Dadurch werden folgende Images erstellt:

* `game`
* `api`
* `postgres` (falls noch nicht vorhanden)

---

## Container starten

```bash
docker compose up -d
```

Stoppen:

```bash
docker compose down
```

---

## Docker Images für USB-Stick exportieren

Auf dem **Quell-Rechner**:

```bash
docker save game -o game.tar
docker save api -o api.tar
docker save postgres -o postgres.tar
```
Oder in eine Datei
```
docker save game api postgres -o all-images.tar
```

Diese `.tar` Dateien auf den **USB-Stick kopieren**.

---

## Images auf dem Ziel-Rechner importieren

USB-Stick einstecken und im Zielverzeichnis ausführen:

```bash
docker load -i game.tar
docker load -i api.tar
docker load -i postgres.tar
```
Oder
```
docker load -i all-images.tar
```

Prüfen:

```bash
docker images
```

---

## Container auf dem Ziel-Rechner starten (offline)

Auf dem Ziel-Rechner muss sich **dieselbe `docker-compose.yml`** befinden.

```bash
docker compose up -d
```

---

## Wichtige Hinweise

* Die `image:` Namen in der `docker-compose.yml` **müssen exakt** mit den exportierten Images übereinstimmen
* Bei Code-Änderungen:

  1. `docker compose build`
  2. Images neu exportieren
  3. Auf Ziel-Rechner erneut `docker load`
 
---

## Ports
- Angular: localhost:80
- API: localhost:5077
- PostgreSQL: localhost:5432

---

## Troubleshooting

**Container startet nicht**

```bash
docker compose logs
```

**Port bereits belegt**

* Ports in der `docker-compose.yml` ändern (z. B. `4201:80`)

