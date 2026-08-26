# Automatisk Strava-sync og import

Denne version fjerner Strava-sync/import-knapper fra daglig brug.

## Hvad sker der nu?

Når appen åbnes:

1. Appen tjekker om Strava er forbundet.
2. Hvis ja, henter den nyeste aktiviteter i en lille og rate-limit-venlig sync.
3. Den importerer automatisk aktiviteterne ind i træningsplanen.
4. Den kører automatisk planjustering for de næste 14 dage, hvis nye data ændrer planen.

## Netlify Scheduled Functions

Der er tilføjet to scheduled functions:

```text
strava-auto-sync.js      dagligt 03:10 UTC
strava-backfill-step.js  hver 2. time
```

`strava-auto-sync` henter nyeste aktiviteter.
`strava-backfill-step` henter historik i små bidder, så gamle aktiviteter gradvist kommer med.

## Vigtigt

- Scheduled functions kører på Netlify efter UTC-tid.
- Stravas rate limit kan stadig stoppe enkelte kald, men næste scheduled run fortsætter.
- Du skal stadig forbinde Strava første gang med knappen “Forbind Strava”.
