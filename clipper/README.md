# Fuego klipovi: Druski (i bilo koji drugi kreator)

## 1. Prvo dozvola: Druskijeva clipping kampanja

Druskijev tim **plaća clippere** da šire njegove klipove, i to preko Whop
*Content Rewards* kampanja. Clipping agencije su za njega napravile desetine miliona
pregleda. To je za tebe legalan put, a uz to i zarada.

1. Napravi nalog na **whop.com**, otvori stranicu **whop.com/druski** i
   *Content Rewards* / *Clipping* odjeljak.
2. Priključi se aktivnoj kampanji i pročitaj pravila. Obično propisuju:
   - samo klipove iz **zadnjih epizoda** koje navedu,
   - obavezan tag ili kredit (npr. `@Druski`) i ponekad određeni hashtag,
   - minimalan broj pregleda po postu da bi bio plaćen (u prošloj kampanji 10K),
   - platforme (YouTube Shorts, TikTok, Reels).
3. Izvorne snimke uzmi **odakle kampanja kaže** (link na Drive ili Druskijev zvanični
   YouTube). Ne uzimaj tuđe klipove i kompilacije: oni nisu Druskijevi i
   nisu dio kampanje.
4. Kad objaviš, predaj link u kampanji da ti se računaju pregledi.

> Nema aktivne kampanje? Onda Druski nije dao dozvolu i reupload njegovog sadržaja
> je rizičan (strike, a nema ni monetizacije). Čekaj kampanju ili klipuj kreatore koji
> ti daju dozvolu.

## 2. Kako naći najsmješniji moment

Kod Druskija najbolje prolaze:

| Serijal / tip | Šta tražiti | Primjer udice |
|---|---|---|
| **Coulda Been Records** audicije | Druski brutalno "odbije" pjevača ili reper prolupa usred pjesme | *"He really thought he could sing 😭"* |
| **Coulda Been House / Love** | svađa, neočekivan obrt, reakcija ostalih u sobi | *"Nobody expected her to say this"* |
| Druski **undercover / prank** skečevi | trenutak kad ljudi skontaju ko je on | *"They had NO idea who he was"* |
| Druski **vs. poznata osoba** | improvizacija, sirova reakcija gosta | *"Druski went too far this time"* |

**Pravilo 3 sekunde:** klip počinje **tačno** pola sekunde prije punchline-a ili
reakcije. Nema uvoda, nema "so anyway…".

**Idealna dužina:** 20–40 s. Presijeci **na smijehu**, ne poslije njega.

Brzo traženje u dugom videu: gledaj na 1.5× i zapiši vrijeme svaki put kad se
**ti** nasmiješ ili se publika u videu glasno smije. Od 5 kandidata uzmi 2 najjača.

## 3. Montaža jednom komandom

```bash
cd clipper
pip install -r requirements.txt   # + instaliraj ffmpeg ako ga nemaš

python make_clip.py epizoda.mp4 --start 12:04 --end 12:38 \
  --hook "He really thought he could sing 😭" \
  --credit "@Druski" \
  --language en \
  -o druski_klip1.mp4
```

Skripta sama:
- izreže taj dio i napravi 1080×1920 (9:16),
- stavi cijeli kadar preko zamućene pozadine (`--layout blur`, default) ili
  izreže sredinu (`--layout crop --crop-x 0.5`, 0 = lijevo, 1 = desno),
- napravi **titlove riječ po riječ** (Whisper). Trenutna riječ je u Fuego narandžastoj boji,
- stavi **udicu** u narandžastom okviru na vrh u prve 3 sekunde,
- stavi **kredit** (`@Druski`) i Fuego plamen kao vodeni žig,
- podesi glasnoću na YouTube standard (-14 LUFS).

Opcije:
- `--captions titl.srt`: tvoji titlovi umjesto automatskih (vremena iz izvornog videa)
- `--captions none`: bez titlova
- `--model medium`: tačniji titlovi (sporije). `small` je dobar kompromis.
- `--no-watermark`: bez plamena (neke kampanje to traže)

Emoji u udici se prikazuje samo ako font sistema ima emoji. Ako vidiš kvadratić, izbaci ga.

## 4. Objava

```bash
python ../upload/upload_short.py druski_klip1.mp4 \
  --title "He really thought he could sing 😭 | Coulda Been Records" \
  --description "Credit: @Druski — full episode on his channel. #druski #couldabeenrecords #shorts" \
  --tags Druski "Coulda Been Records" funny clips shorts \
  --not-for-kids --i-own-this
```

`--i-own-this` koristi samo ako si u Druskijevoj kampanji ili imaš dozvolu.

**Naslov:** udica + ime serijala. Ljudi traže "Druski" i "Coulda Been Records".
