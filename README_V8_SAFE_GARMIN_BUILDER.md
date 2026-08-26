# V8 Safe Garmin Builder

Denne version fjerner den ugyldige .FIT-workout eksport.

Årsag:
Fenix 7 afviste den håndbyggede .FIT-fil. Derfor skal appen ikke længere give en fil, der ser korrekt ud, men ikke virker.

Ny Garmin-knap:
- åbner en Garmin workout-builder popup
- viser step-by-step træningen
- downloader:
  - .txt trin-for-trin
  - .csv steps
  - .json API payload til senere Garmin Training API-integration

Den rigtige automatiske TrainingPeaks-lignende løsning kræver Garmin Training API-adgang.
