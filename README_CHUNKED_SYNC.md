# Strava chunked sync

Denne version retter 504 Inactivity Timeout ved at synkronisere Strava i små bidder.

Tidligere forsøgte appen at hente mange aktiviteter + detaljer + streams i ét langt Netlify Function-kald.
Nu bruger appen:

```text
/.netlify/functions/strava-sync-page?days=365&page=1&perPage=5
```

Appen kalder automatisk side 1, 2, 3 osv., indtil der ikke er flere aktiviteter.

## Opdatering

Upload hele indholdet af denne ZIP til GitHub, commit ændringerne og vent på Netlify deploy.
