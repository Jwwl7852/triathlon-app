# Garmin structured workout export v4

Garmin-funktionen er nu pr. træning i Program-tabellen, ikke en generel kalender-eksport.

Hver fremtidig planlagt træning får en lille Garmin-knap.
Klik på knappen for at se den strukturerede workout og downloade:
- `.fit` workout-fil til Garmin-ur
- `.json` backup/fejlsøgning

Praktisk test:
1. Vælg en kort løbetræning.
2. Download `.fit`.
3. Tilslut Garmin-uret via USB.
4. Kopiér filen til `GARMIN/NewFiles`.
5. Afbryd uret korrekt og se om workouten dukker op på uret.

Bemærk:
Garmin Connect har ikke et simpelt åbent upload-flow for planlagte strukturerede workouts fra en egen app.
