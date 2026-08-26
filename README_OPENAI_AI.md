# Ægte AI-vurdering via OpenAI API

Denne version tilføjer en Netlify Function:

```text
/.netlify/functions/ai-plan-evaluate
```

Den bruger OpenAI API server-side, så API-nøglen ikke ligger i HTML-filen.

## Netlify Environment Variables

Tilføj i Netlify:

```text
OPENAI_API_KEY=din_openai_api_key
```

Valgfrit:

```text
OPENAI_MODEL=gpt-5
```

Hvis du vil bruge en anden model, kan den sættes i `OPENAI_MODEL`.

## Brug

1. Deploy appen på Netlify.
2. Gå til Coach-fanen.
3. Tryk `Kør AI-vurdering`.
4. Læs vurderingen.
5. Tryk `Anvend AI-forslag på næste 14 dage`, hvis forslagene skal skrives ind i planen.

AI-vurderingen sender et sammendrag af træningsdata, vægtdata og kommende plan til OpenAI API.
