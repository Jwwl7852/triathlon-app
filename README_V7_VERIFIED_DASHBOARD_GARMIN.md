# V7 verified dashboard/Garmin fix

Denne version retter konkret:
- Garmin-knappen kalder nu en global `window.openGarminWorkout`, så knappen ikke fejler pga. scope.
- Garmin-popup findes i HTML og åbner preview + download .FIT / JSON.
- Mål-kortene åbner prognose-popup.
- Det store IRONMAN MÅL dashboardfelt skjules via både CSS og JS.
- Program/Træninger-adskillelsen fra v6 er bevaret.

Valideret:
- node --check app.js
- node --check på alle Netlify functions
- HTML indeholder garminWorkoutDialog og goalForecastDialog
- CSS skjuler #sub12Forecast
