# Compact Strava response fix

Denne version retter fejlen:

```text
Function.ResponseSizeTooLarge
Response payload size exceeded maximum allowed payload size
```

Årsag:
`strava-activities` sendte alle gemte Strava-data tilbage til browseren, inkl. tunge streams/GPS/rådata.

Rettelse:
- `strava-activities` sender nu som standard kun en kompakt liste.
- Streams og rådata bliver stadig gemt i Netlify Blobs.
- En ny function `strava-activity-detail?id=...` kan hente én fuld aktivitet senere, hvis vi får brug for dyb analyse.

Upload hele pakken til GitHub og lad Netlify deploye igen.
