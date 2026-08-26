# Rettelse: Netlify Blobs crash

Denne version retter fejlen:

MissingBlobsEnvironmentError

Ændringen er, at Netlify Blobs ikke længere åbnes ved import/top-level, men først inde i selve function-kaldet.

## Sådan opdaterer du

1. Pak ZIP-filen ud.
2. Upload/erstat filerne i dit GitHub repository.
3. Commit ændringerne.
4. Netlify deployer automatisk igen.

## Hvis Blobs stadig fejler

Tilføj også disse Environment Variables i Netlify:

- NETLIFY_SITE_ID
- NETLIFY_AUTH_TOKEN

Det burde normalt ikke være nødvendigt, men koden understøtter det nu.

## Test

Åbn:

https://triatlon-app.netlify.app/.netlify/functions/strava-diagnostics

Hvis du satte APP_PIN:

https://triatlon-app.netlify.app/.netlify/functions/strava-diagnostics?pin=DIN_PIN
