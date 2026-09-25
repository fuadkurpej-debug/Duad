# Duad: Fuego Clipping 🔥

Branding, vodiči i alati za YouTube kanal **Fuego Clipping** (klipovi / Shorts).

- [`docs/fuego-clipping.md`](docs/fuego-clipping.md): kako promijeniti kanal (ime, handle, slike, opis) i kako legalno raditi klipove
- [`branding/`](branding/): logo (`logo.png`, 800×800) i baner (`banner.png`, 2560×1440)

Stariji materijali za YT Kids:

- [`docs/istrazivanje.md`](docs/istrazivanje.md): koji formati skupljaju najviše pregleda i koja pravila vrijede (Made for Kids, monetizacija, copyright)
- [`docs/scenariji.md`](docs/scenariji.md): 10 gotovih scenarija za snimanje
- [`upload/upload_short.py`](upload/upload_short.py): skripta za objavu Short-a preko YouTube Data API-ja

> ⚠️ Objavljuj samo video koji si sam snimio/napravio ili klip za koji imaš dozvolu autora, uz muziku na koju imaš prava.
> Reupload tuđih videa donosi copyright strike-ove (3 = brisanje kanala).

## Postavljanje skripte za upload (jednom)

1. Otvori [Google Cloud Console](https://console.cloud.google.com/) i napravi novi projekat.
2. **APIs & Services → Library**: uključi **YouTube Data API v3**.
3. **OAuth consent screen**: tip *External*. U *Test users* dodaj svoj Gmail
   (onaj na kojem je YouTube kanal).
4. **Credentials → Create credentials → OAuth client ID → Desktop app**.
   Preuzmi JSON, preimenuj ga u `client_secret.json` i stavi u folder `upload/`.
   (Fajl je u `.gitignore`, **nikad ga ne stavljaj na GitHub**.)
5. Instaliraj zavisnosti:
   ```bash
   cd upload
   python3 -m venv .venv && source .venv/bin/activate
   pip install -r requirements.txt
   ```
6. Opcionalno instaliraj `ffmpeg` (sadrži `ffprobe`). Skripta tada sama provjeri
   je li video vertikalan i kraći od 3 minute.

## Objava Short-a

```bash
python upload_short.py moj_video.mp4 \
  --title "Plava + žuta = ? 🎨" \
  --description "Učimo boje miješanjem plastelina." \
  --tags boje zadjecu plastelin učimoboje \
  --privacy private \
  --for-kids \
  --i-own-this
```

- Pri prvom pokretanju otvara se preglednik za Google prijavu. Izaberi kanal.
- Obavezno izaberi publiku: `--for-kids` (dječiji sadržaj, COPPA) ili
  `--not-for-kids` (npr. klipovi sa streamova i podcasta).
- Podrazumijevana kategorija je 24 (Entertainment); za edukativni sadržaj dodaj `--category 27`.
- `#Shorts` se automatski dodaje u naslov.
- Podrazumijevano je `private`. Pregledaj video u YouTube Studiju pa ga tamo
  prebaci na *Public* (ili odmah koristi `--privacy public`).
- Ako video ima realistične AI-generisane scene, dodaj `--synthetic`.

> Napomena: dok Google ne verifikuje tvoju aplikaciju (API audit), videi objavljeni
> preko API-ja iz nepotvrđenog projekta mogu ostati zaključani kao *private*. Za lični
> kanal to je obično u redu: samo ih ručno objavi u YouTube Studiju.
