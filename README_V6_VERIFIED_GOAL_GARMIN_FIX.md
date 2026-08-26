# v6 verified goal/Garmin fix

Rettet:
- Garmin-popup HTML var ikke kommet med i v5. Det er nu rettet.
- Garmin-knappen har nu en delegated click-handler, så den virker uanset render-timing.
- Det store IRONMAN MÅL-dashboardfelt skjules med CSS og JS.
- De tre målkort åbner prognose-popup ved klik.

Kontrol udført:
- node --check app.js
- node --check alle Netlify functions
- statiske asserts for dialoger, Garmin-knapper og popupkode
