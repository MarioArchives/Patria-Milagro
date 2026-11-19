# Fin del mandato

A one-screen countdown to the end of Colombia's current presidential term, 7 August 2030.

- Big headline for the days, plus hours, minutes and seconds in old film-countdown frames. The shaded wedge in each frame is how much of that unit is left.
- A loading bar along the bottom fills from the start of the term (7 Aug 2026) to its end. A felt-puppet caricature of the president, in a suit and with a towering forehead, walks along it toward an exit door wagging one raised finger. A speech bubble cycles through "¡Firme por la patria!", "¡Miau!" and "El gato más grande de la patria"; the lines are in `LINES` at the top of `app.js`. The felt texture comes from an SVG noise filter. The percentage shows six decimals so you can watch it crawl.
- The countdown targets 00:00 on 7 August 2030, Colombia time (UTC−5). The dates are `TERM_START` and `TERM_END` at the top of `app.js`.
- Spanish and English. The page picks a language from the browser and remembers the one you choose.
- Motion stops when the visitor has reduced motion turned on.

## Run it

No build step. Open `index.html`, or serve the folder:

```sh
python3 -m http.server 8000
```

Then visit http://localhost:8000.
