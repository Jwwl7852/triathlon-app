# Version uden OpenAI API

Denne version bruger ikke OpenAI API og kræver derfor ikke `OPENAI_API_KEY`.

Beholdt:
- Automatisk Strava-sync/import
- Strava aktivitetsdetaljer i sidepanel
- Regelbaseret automatisk genberegning
- Vægt, mål, coach, program og print

Fjernet/deaktiveret:
- Ægte AI-vurdering via OpenAI API
- `ai-plan-evaluate` Netlify Function
- OpenAI dependency i package.json

Du kan altid senere genaktivere OpenAI-versionen igen.
