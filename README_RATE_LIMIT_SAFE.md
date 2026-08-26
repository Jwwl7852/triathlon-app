# Strava rate-limit-safe sync

Denne version retter 429 Rate Limit Exceeded ved at:

- tilføje “Synk 30 dage”
- gøre 365-dages sync langsommere
- hente kun 2 aktiviteter pr. function-kald
- vente 2,5 sekunder mellem kald
- stoppe pænt hvis Strava returnerer 429
- vise at man skal vente til næste 15-minutters vindue

Anbefalet brug:
1. Start med Synk 30 dage.
2. Importer synk til app.
3. Senere kør Synk 365 dage langsomt.
4. Hvis rate limit rammes, vent 15-30 min og fortsæt.
