# Daniela Klein — Career Website


Die deutsche und englische Website werden aus einer gemeinsamen HTML-Vorlage erzeugt. Produkt- und Inhaltsgrundlage ist das „Daniela Klein – Personal Brand Platform PRD v1.1“ vom 6. August 2026.


## Inhalte bearbeiten


- Gemeinsames Layout und Markup: `src/index.template.html`
- Deutsche Texte: `locales/de.json`
- Englische Texte: `locales/en.json`
- Gemeinsame Gestaltung: `styles.css`
- Gemeinsames Verhalten: `app.js`
- Build und öffentliche Datenschutzregeln: `scripts/build.mjs`
- Statische Qualitätsprüfung: `scripts/check.mjs`


Nach einer Änderung an Vorlage oder Übersetzungen beide Seiten neu erzeugen:


```sh
npm run build
npm run check
```


Der Build erzeugt `index.html` und `index-en.html`. Beide Dateien sind eigenständig,
suchmaschinenfreundlich und funktionieren auch ohne clientseitiges JavaScript.


Der Build bricht ab, wenn Pflichtinhalte fehlen, Übersetzungen unvollständig sind oder gesperrte Bewerbungsinformationen im öffentlichen HTML erkannt werden. Es werden keine Analytics, Tracking-Skripte, externen Webfonts oder Credly-Embeds verwendet.

<!-- Deployment refresh: 2026-08-06 -->
