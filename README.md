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
- Löscht den Crosspost, wenn das Original gelöscht wird
- Speichert eine Crosspost-Map in der Datenbank

## Offene Fragen

- Wenn im crosspost channel die message gelöscht wurde und das Forum bearbeitet wird, Post neu erstellen?
- Verhalten bei Antworten in Forum Channels
- Verhalten bei Antworten in Forum Channels, die als REPLY gestellt werden
- SuppressNotifications (@silent) oder besser auf Embeds umstellen?
