# Netlify Blobs explicit fix

Denne version ændrer Blobs-kaldet til eksplicit objektform:

```js
getStore({
  name: "triathlon-strava",
  siteID: process.env.NETLIFY_SITE_ID,
  token: process.env.NETLIFY_AUTH_TOKEN
})
```

Brug denne, når diagnostics viser at NETLIFY_SITE_ID og NETLIFY_AUTH_TOKEN er true, men callback/status stadig giver MissingBlobsEnvironmentError.

## Opdatering

Upload hele indholdet af denne ZIP til GitHub oven i de gamle filer.
Commit ændringerne og vent på Netlify deploy.
