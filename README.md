# Triathlon træningsapp 2026-2027

Åbn `index.html` i din browser.

## Indeholder

- Plan fra 17. august 2026 til IRONMAN Copenhagen 22. august 2027
- Copenhagen Marathon 9. maj 2027
- Køge Jernmand 13. juni 2027
- Svøm mandag, onsdag og fredag morgen
- Svøm bygger fra 700 m til 1.500 m
- Cykling tirsdag, torsdag og søndag
- Hometrainer fra 1. oktober til ca. 24. marts
- Fredag eftermiddag og lørdag fri
- FIT-import
- CSV-import
- Backup/restore
- CSV-eksport
- AI-genberegn-pakke

## CSV-import

Klik på **Importér CSV** i toppen af appen.

Appen forsøger at læse kolonner som:

- `Dato` eller `Date`
- `Disciplin`, `Sport` eller `Activity Type`
- `Faktisk tid`, `Duration`, `Time`, `Elapsed Time` eller `Moving Time`
- `Faktisk km`, `Distance`, `Km`, `Distance (km)` eller `Distance (m)`
- `Status`
- `RPE`
- `Udstyr` eller `Equipment`
- `Noter` eller `Notes`

CSV kan være separeret med enten semikolon eller komma.

Der ligger en eksempel-skabelon i filen `csv_import_skabelon.csv`.

## Vigtigt

Data gemmes lokalt i browserens localStorage. Brug **Eksportér backup** jævnligt, især før du opdaterer til en ny version.


## Nulstilling af fejlagtigt importerede træninger

Denne version starter med en ren localStorage-nøgle, så tidligere fejlimporter ikke automatisk følger med. Hvis du alligevel ser gamle importerede/faktiske data, klik på **Nulstil importerede/faktiske data** i toppen af appen. Det bevarer selve planen og udstyrslisten, men fjerner importerede ekstra pas og rydder faktisk tid, distance, status, RPE og noter.


## Sub-12 mål
Denne version bruger IRONMAN Copenhagen under 12 timer som A-mål. Dashboardet viser en simpel prognose baseret på dine faktiske/importerede træninger. Prognosen er vejledende og bliver mere brugbar, når der er flere gennemførte pas.

## TCX- og GPX-import

Denne version kan også importere:

- `.tcx` fra fx Garmin/TrainingPeaks
- `.gpx` ruter/aktiviteter

Klik på **Importér TCX** eller **Importér GPX** i toppen af appen. Appen forsøger at finde dato, disciplin, tid, distance og puls, og matcher derefter aktiviteten mod en planlagt træning på samme dato og disciplin.

Bemærk: GPX-filer indeholder ofte ikke sportstype. Appen gætter derfor ud fra filnavn/titel og bruger ellers Løb som standard.


## Samlet import

Brug knappen **Importér træningsfil** til både `.fit`, `.csv`, `.tcx` og `.gpx`. Appen genkender filtypen automatisk og matcher træningen mod planen ud fra dato og disciplin.


## Slet/redigér enkelt træning
Klik på en træningslinje i fanen Program. Her kan du redigere faktisk tid, distance, status, RPE, udstyr og noter — eller slette netop den ene træning.


## Personlig planlogik
Denne version er tilpasset efter Jørns tidligere TrainingPeaks-succesuger: fast svøm mandag/onsdag/fredag, cykling tirsdag/torsdag/søndag, styrke/core, løb/gang-opbygning og lettere uge hver 4. uge.

## Personlige teknik- og styrkeøvelser

Denne version bruger brugerens egne links til svømmeteknik og styrketræning.

Svøm:
- 7 svømmeteknikvideoer roterer ind i svømmepassene.

Styrke:
- Træk til brystkassen
- Benpres
- Rows
- Rumænsk dødløft
- Russian twist

Styrkepassene følger brugerens tidligere model: 3 x 4 gentagelser, tungt men kontrolleret, med en vægt hvor ca. 6-7 gentagelser ville være muligt.


## Vedligeholdelse | 1.0 i kilo

Styrkeprogrammet "Vedligeholdelse | 1.0" er lagt ind under fanen Teknik og i styrkepassene.
Alle lb-vægte er omregnet til kg og afrundet til én decimal:
- 5 lb = 2,3 kg
- 8 lb = 3,6 kg
- 30 lb = 13,6 kg
- 50 lb = 22,7 kg

Programmet består af 10 min opvarmning, teknik/opvarmningsblok og superset-blok.

## Rettelse af egne mål

Denne version retter fanen Mål:
- Ny måltype: "Distance på tid" til fx 5 km under 30 min.
- Måloverblikket har fået bedre layout, så teksten til højre for progressionslinjerne ikke bliver klippet.

## Mål-layout rettet

Denne version gør fanen Mål mere overskuelig:
- Den gamle graf/tekstvisning til højre er fjernet.
- Tabellen "Dine mål" er nu hovedoversigten og viser både standardmål og manuelle mål.
- Formularen er ombygget i et pænere format.
- Måltypen "Distance på tid" understøtter fx 5 km under 30 min.

## Print ugeprogram

Denne version har en ny fane: "Print uge".
Her kan du vælge en træningsuge og printe et papirprogram med:
- dato og ugedag
- træning, intensitet, tid og distance
- udstyr/sted
- felter til håndskrevet faktisk tid, distance, RPE, status og noter

## Pulsdata og dashboard-fix

Denne version retter dashboardet, så importerede/gennemførte træninger viser faktisk tid og distance i stedet for planlagt 0 min / 0 km.

Importen er udvidet med pulsdata:
- FIT: forsøger at læse gennemsnitspuls og makspuls fra session/lap/records
- TCX: læser gennemsnitspuls og makspuls fra HeartRateBpm
- GPX: læser gennemsnitspuls og makspuls fra GPX-extensioner, når de findes
- CSV: understøtter kolonner som Gns. puls, Avg HR, Maks puls, Max HR

Puls vises nu i Program-fanen og kan redigeres manuelt på hver træning.


## Vægtknapper – direkte HTML-løsning

Denne version bruger en separat inline-script-løsning i index.html:
- knapperne har både inline onclick og document-level click fallback
- vægt gemmes direkte i localStorage under `weightData`
- genberegning bruger appens eksisterende generatePlan(), hvis den er tilgængelig


## Vægtmåldato

Vægtmodulet har nu en måldato. Standard er Copenhagen Marathon: 2027-05-09.
Genberegningen bruger nu:
- startvægt
- aktuel vægt
- målvægt
- måldato

Hvis aktuel vægt er bagud i forhold til den forventede vægtkurve mod måldatoen, bliver fremtidige løbe- og cykelpas justeret mere forsigtigt.


## Vægttabsplan

Vægtfanen er udvidet fra et simpelt mål til en egentlig vægttabsplan.
Planen indeholder:
- startvægt
- målvægt
- måldato
- aktuel vægt
- max vægttab pr. uge
- strategi: balanceret, forsigtig eller race-sikker
- automatisk delmål
- vurdering af om vægtmålet er realistisk
- vægtjusteret genberegning af fremtidige løbe- og cykelpas

Genberegning øger ikke træningen for at presse vægttabet. Hvis vægtplanen er for aggressiv, gør den i stedet progressionen mere skånsom.


## Coach-udvidelse
Ny fane: Coach med dagens anbefaling, klarhedsscore, Plan A/B/C, dagsform, årsag ved afbrudt/misset pas, ugekommentar, advarsler, statuspakke til ChatGPT og backup-påmindelse.


## Redigerbart udstyr/sted

Udstyr kan nu redigeres/omdøbes.
Når et udstyr omdøbes, opdateres alle eksisterende træninger med det nye navn, så historiske data bevares.
Udstyr, der bruges på træninger, kan ikke slettes direkte; det skal omdøbes eller flyttes først.


## Strava-integration

Ny fane: Strava.
Kræver lokal server i `strava-server`, fordi Strava Client Secret og refresh token ikke må gemmes i HTML-filen.

Flow:
1. Start `strava-server`
2. Forbind Strava
3. Synk aktiviteter
4. Importer synk til appen

Importerede aktiviteter matches på dato + disciplin og gemmes som faktisk træning.
