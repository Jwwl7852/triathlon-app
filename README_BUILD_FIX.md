# Netlify build fix

Denne version retter sandsynlig Netlify build-fejl ved at forenkle dependencies.

Ændringer:
- OpenAI er fjernet helt.
- `@netlify/functions` er fjernet som dependency.
- `package.json` er gjort enkel.
- Build script er nu kun:
  `npm run build`
  som kører:
  `echo "Static site - no build step"`
- `netlify.toml` peger på publish `.` og functions `netlify/functions`.

Hvis Netlify stadig fejler, åbnes den røde Failed deploy og kopier de sidste 20-30 linjer fra deploy loggen.
