# Forum crossposter

Überwacht ein Forum und crosspostet in einen Channel.

## Setup

1. Dependencies installieren: `npm install`.
2. Beim secret management einloggen: `npx infisical login` mit https://secrets.dachstein.cloud/ als instance
   URL.
3. Lokale infisical config erstellen: `npx infisical init`.
4. Mit `npm run dev` den Bot gegen die Dev Umgebung starten. Nutze `npm start` (mit Produktionsdaten) für live
   deployments.

## Konfiguration

Umgebungsvariablen (aus Infisical):

- `DISCORD_BOT_TOKEN` - Bot Token
- `DISCORD_GUILD_ID` - Discord Server ID, auf der der Bot arbeiten soll
- `DISCORD_PROGRESS_CHANNEL_ID` - Channel, der die Crossposts erhalten soll
- `DISCORD_PROGRESS_FORUM_ID` - Forum, das überwacht werden soll
- `MONGO_URI` - MongoDB connection string für Persistenz der Crosspost Mappings
- `MONGO_REMOVE_AFTER_DAYS` - Anzahl Tage nach denen Crosspost-Records gelöscht werden (negativ: alle löschen, `0`: deaktiviert)

## Verhalten

- Wartet auf neue Forum Posts und crossposted diese dann mit einem Header in den konfigurierten Channel
- Synchronisiert Bearbeitungen an Inhalt und Titel
- Selbiges auch für Antworten in Forum Threads
- Löscht den Crosspost, wenn das Original gelöscht wird
- Speichert eine Crosspost-Map in der Datenbank
- Zusätzliche Action Queue verhindert desynchronisation
- Jeder Thread erhält eine zufällige Farbe, die alle dazugehörigen Nachrichten bekommen

## Docker

Das beigefügte Dockerfile baut ein Image mit Infisical-CLI und startet den Bot via `infisical run -- node index.js`.

Build:
```bash
docker build -t btede-bot .
```
Run (Infisical-Login/Config bereitstellen, z.B. via gemountetem ~/.infisical oder env-Variablen):
```bash
docker run --env-file .env -v $HOME/.infisical:/root/.infisical -it btede-bot
```
