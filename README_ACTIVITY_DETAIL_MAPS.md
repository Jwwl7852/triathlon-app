# Strava aktivitetsdetaljer med kort

Denne version gør Strava-aktiviteter klikbare.

Når du klikker på en aktivitet, åbnes en detaljevisning med:

- rutekort baseret på Strava GPS-stream
- nøgledata: tid, distance, højde, puls, watt, kadence m.m.
- grafer for puls, watt, fart/pace og højde
- laps/splits i tabel

For at undgå Netlify ResponseSizeTooLarge hentes den tunge detalje kun for én aktivitet ad gangen.
Streams nedskaleres til maks. ca. 900 punkter i svaret.
