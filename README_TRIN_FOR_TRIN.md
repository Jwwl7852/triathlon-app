# Triathlon app på Netlify med Strava

Denne pakke er klar til Netlify.

## Mappestruktur

- `index.html`, `app.js`, `styles.css` = selve appen
- `netlify/functions/` = Strava backend
- `netlify.toml` = Netlify opsætning
- `package.json` = dependency til Netlify Blobs

## Environment variables på Netlify

Du skal sætte disse i Netlify:

```text
STRAVA_CLIENT_ID=274764
STRAVA_CLIENT_SECRET=din_strava_klienthemmelighed
STRAVA_REDIRECT_URI=https://DIN-NETLIFY-SIDE.netlify.app/.netlify/functions/strava-callback
APP_PIN=valgfri_pin
```

APP_PIN er valgfri, men anbefales. Hvis du sætter den, skal du skrive samme PIN i Strava-fanen i appen.

## Strava

Når Netlify-siden er oprettet, skal Strava Authorization Callback Domain ændres til dit Netlify-domæne, fx:

```text
din-side.netlify.app
```

Kun domænet. Ikke hele URL'en.
