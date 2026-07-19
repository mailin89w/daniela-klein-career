# Daniela Klein — Career Website

Die deutsche und englische Website werden aus einer gemeinsamen HTML-Vorlage erzeugt.

## Inhalte bearbeiten

- Gemeinsames Layout und Markup: `src/index.template.html`
- Deutsche Texte: `locales/de.json`
- Englische Texte: `locales/en.json`
- Gemeinsame Gestaltung: `styles.css`
- Gemeinsames Verhalten: `app.js`

Nach einer Änderung an Vorlage oder Übersetzungen beide Seiten neu erzeugen:

```sh
npm run build
```

Der Build erzeugt `index.html` und `index-en.html`. Beide Dateien sind eigenständig,
suchmaschinenfreundlich und funktionieren auch ohne clientseitiges JavaScript.
