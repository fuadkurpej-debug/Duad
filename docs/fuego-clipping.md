# Fuego Clipping 🔥: prelazak kanala na klipovanje

## 1. Promjena kanala (5 minuta, u YouTube Studiju)

Otvori **studio.youtube.com → Customization (Prilagođavanje)**.

### Ime i handle (tab *Basic info*)
| Polje | Vrijednost |
|---|---|
| Ime kanala | `Fuego Clipping` |
| Handle | `@FuegoClipping` (ako je zauzet: `@FuegoClips`, `@FuegoClippingBA`, `@Fuego.Clipping`) |

- Ime možeš mijenjati **2 puta u 14 dana**, handle isto.
- Ako je kanal verifikovan (kvačica), promjenom imena gubiš kvačicu.

### Opis kanala (kopiraj)
```
🔥 FUEGO CLIPPING 🔥
Najvreliji momenti sa streamova, podcasta i intervjua, izrezani, titlovani i spremni za gledanje za manje od 60 sekundi.

📌 Novi klipovi svaki dan
✂️ Klipovi se objavljuju uz dozvolu autora / kroz zvanične clipping programe
📩 Saradnja i clipping za tvoj kanal: [tvoj email]

#clips #shorts #podcastclips #streamclips
```

### Slike (tab *Branding*)
| Šta | Fajl | Dimenzije |
|---|---|---|
| Profilna slika | `branding/logo.png` | 800×800 (YouTube je sam izreže u krug) |
| Baner | `branding/banner.png` | 2560×1440 (tekst je u zoni koja se vidi na mobitelu) |
| Vodeni žig (watermark) | `branding/logo.png` | 150×150 minimum |

Klikni **Publish** gore desno. Promjene se vide za nekoliko minuta.

### Stari YT Kids videi
Ako na kanalu već imaš dječije videe, prebaci ih na *Private* ili napravi novi kanal
za klipove. Kad se miješaju "Made for Kids" videi i klipovi za odrasle, algoritam ne zna
kome da ih preporučuje, a klipovi za odrasle nikako ne smiju biti označeni kao dječiji.

## 2. Klipovanje bez copyright strike-ova

Najčešća greška početnika: uzmu tuđi podcast ili stream, izrežu ga i objave.
Poslije 3 strike-a kanal se briše, a i bez strike-ova nema monetizacije ("reused content").

**Legalni načini:**
1. **Zvanični clipping programi.** Mnogi streameri i podcasteri *plaćaju* clippere
   po pregledima (preko Discord servera ili platformi za clipping kampanje). Ti dobiješ
   dozvolu i novac, a oni doseg. Ovo je danas glavni biznis model za clippere.
2. **Pismena dozvola.** Pošalji DM ili email malim i srednjim kreatorima: "Radim
   besplatne klipove tvog sadržaja za Shorts/TikTok, uz link na tvoj kanal." Mnogi pristanu.
   Sačuvaj screenshot dozvole.
3. **Kreatori koji javno dozvoljavaju klipovanje.** Neki to napišu u opisu kanala ili
   na Discordu. Provjeri tačne uslove.
4. **Transformacija.** Komentar, analiza i tvoj glas preko snimka jačaju "fair use",
   ali to nije garancija. Oslanjaj se na 1–3.

## 3. Montaža klipa (workflow)

**Alati:** CapCut (najbrži, besplatan), DaVinci Resolve (besplatan, profesionalan),
Premiere Pro. Za automatske titlove odlično radi CapCut.

**Recept za klip koji se gleda do kraja:**
1. **Nađi moment:** smijeh, svađa, šokantna izjava, "hot take", neočekivan obrt.
   Najbolji klipovi imaju jednu misao.
2. **Udica u prvoj sekundi:** kreni *usred* rečenice koja je najjača. Bez uvoda.
   Prvi kadar ubaci i tekst: *"Nije mogao vjerovati šta je čuo…"*
3. **Format 9:16 (1080×1920):**
   - podcast sa 2 osobe: split-screen (gornja/donja polovina) ili rez na onoga ko priča,
   - stream: facecam gore, gameplay dolje.
4. **Titlovi:** krupni, 2–4 riječi odjednom, istaknuta ključna riječ (žuta/narandžasta,
   u stilu Fuego). Oko 70 % ljudi gleda bez zvuka.
5. **Tempo:** izbaci pauze, "ovaj…" i disanje (jump cut). Idealna dužina je 20–45 s.
6. **Zvuk:** normalizuj na oko −14 LUFS. Muziku ubaci tiho, samo iz YouTube Audio Library.
7. **Kraj koji vraća na početak:** presijeci na vrhuncu ili na pitanju, tako da se klip vrti u petlji.
8. **Kredit:** u opisu *"Izvor: @ImeKreatora, full video: [link]"*, a na ekranu
   kratko `@ImeKreatora`.

**Naslovi koji rade:** kratki, izazivaju radoznalost, bez lažnog clickbaita.
- *"On nije znao da je kamera upaljena 😳"*
- *"Najgori savjet koji sam ikad čuo"*
- *"Ovo je razlog zašto je dao otkaz"*

## 4. Plan za prvih 30 dana

| Sedmica | Cilj |
|---|---|
| 1 | Promijeni branding, nađi 3–5 kreatora ili clipping programa s dozvolom |
| 2 | 2 klipa dnevno; testiraj različite stilove titlova i udica |
| 3 | U YouTube Studiju gledaj *Viewed vs. swiped away*: udvostruči ono što drži >70 % |
| 4 | Objavljuj iste klipove i na TikTok/Instagram Reels (bez watermarka drugih aplikacija) |

**Objava:** svoje klipove možeš objaviti skriptom iz ovog repoa:
```bash
python upload/upload_short.py klip.mp4 --title "On nije znao da je kamera upaljena 😳" \
  --description "Izvor: @ImeKreatora" --tags clips shorts podcast \
  --not-for-kids --i-own-this
```
(`--i-own-this` koristi samo kad zaista imaš dozvolu autora.)
