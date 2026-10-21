import type { Category, CategoryId } from "./types";

export const categories: Category[] = [
  {
    id: "kitchen-dining",
    slug: { en: "kitchen-dining", sr: "kuhinja-i-trpezarija" },
    name: { en: "Kitchen & Dining", sr: "Kuhinja i trpezarija" },
    short: {
      en: "Storage, tools and table pieces for a calmer kitchen.",
      sr: "Posude, pribor i detalji za smireniju kuhinju.",
    },
    description: {
      en: "Clear storage, honest materials and tools that earn their place on the counter. Pieces chosen to make cooking, serving and putting away feel a little more effortless.",
      sr: "Pregledno skladištenje, prirodni materijali i pribor koji zaslužuje mjesto na radnoj površini. Predmeti birani da kuvanje, serviranje i spremanje budu jednostavniji.",
    },
    tone: "oak",
    artKind: "canisters",
  },
  {
    id: "home-organization",
    slug: { en: "home-organization", sr: "organizacija-doma" },
    name: { en: "Home Organization", sr: "Organizacija doma" },
    short: {
      en: "Baskets, boxes and organisers that bring quiet order.",
      sr: "Korpe, kutije i organizatori koji unose tihi red.",
    },
    description: {
      en: "Good storage disappears into the room and leaves only order behind. Woven baskets, drawer systems and wardrobe essentials that help every item find its place.",
      sr: "Dobro rješenje za odlaganje se uklopi u prostor i za sobom ostavi samo red. Pletene korpe, organizatori za fioke i dodaci za ormar pomažu da svaka stvar pronađe svoje mjesto.",
    },
    tone: "sand",
    artKind: "storage-basket",
  },
  {
    id: "bathroom-essentials",
    slug: { en: "bathroom-essentials", sr: "kupatilo" },
    name: { en: "Bathroom Essentials", sr: "Za kupatilo" },
    short: {
      en: "Refined everyday pieces for a spa-like routine.",
      sr: "Profinjeni svakodnevni detalji za rutinu kao u spa centru.",
    },
    description: {
      en: "Turn the most practical room in the house into a quiet retreat. Dispensers, trays and organisers in soft tones and tactile finishes.",
      sr: "Pretvorite najpraktičniju prostoriju u kući u mirno utočište. Dozeri, podmetači i organizatori u nježnim tonovima i prijatnim materijalima.",
    },
    tone: "stone",
    artKind: "soap-dispenser",
  },
  {
    id: "living-decor",
    slug: { en: "living-decor", sr: "dnevni-boravak-i-dekor" },
    name: { en: "Living & Decor", sr: "Dnevni boravak i dekor" },
    short: {
      en: "Light, texture and form for the heart of the home.",
      sr: "Svjetlost, tekstura i forma za srce doma.",
    },
    description: {
      en: "Minimal pieces with a warm presence: soft lighting, sculptural vases and considered accessories that give a living space its character.",
      sr: "Minimalistički predmeti tople prisutnosti: blago osvjetljenje, skulpturalne vaze i pažljivo birani detalji koji prostoru daju karakter.",
    },
    tone: "linen",
    artKind: "table-lamp",
  },
  {
    id: "bedroom-comfort",
    slug: { en: "bedroom-comfort", sr: "spavaca-soba" },
    name: { en: "Bedroom & Comfort", sr: "Spavaća soba i udobnost" },
    short: {
      en: "Soft textures and small comforts for better rest.",
      sr: "Meke teksture i male udobnosti za bolji odmor.",
    },
    description: {
      en: "The bedroom should ask nothing of you. Natural textiles, bedside order and gentle details that make winding down feel easy.",
      sr: "Spavaća soba treba da bude mjesto potpunog opuštanja. Prirodni tekstil, red pored kreveta i nježni detalji koji olakšavaju predah na kraju dana.",
    },
    tone: "sage",
    artKind: "linen-throw",
  },
  {
    id: "smart-home",
    slug: { en: "smart-home", sr: "pametni-dom" },
    name: { en: "Smart Home", sr: "Pametni dom" },
    short: {
      en: "Useful technology, designed to blend in.",
      sr: "Korisna tehnologija koja se nenametljivo uklapa.",
    },
    description: {
      en: "Technology that serves the home rather than dominating it. Thoughtful gadgets with clean lines, chosen for everyday usefulness.",
      sr: "Tehnologija koja služi domu, a ne dominira njime. Promišljeni uređaji čistih linija, birani zbog svakodnevne korisnosti.",
    },
    tone: "taupe",
    artKind: "diffuser",
  },
  {
    id: "cleaning-care",
    slug: { en: "cleaning-care", sr: "ciscenje-i-njega" },
    name: { en: "Cleaning & Care", sr: "Čišćenje i njega" },
    short: {
      en: "Beautiful tools that make care part of the routine.",
      sr: "Lijep pribor koji njegu doma pretvara u prijatnu rutinu.",
    },
    description: {
      en: "When the tools are beautiful, they stay out on display and the work gets easier. Natural brushes, refillable bottles and quality cloths for everyday care.",
      sr: "Kada je pribor lijep, može ostati na vidljivom mjestu, a posao postaje lakši. Prirodne četke, boce za ponovno punjenje i kvalitetne krpe za svakodnevnu njegu doma.",
    },
    tone: "ivory",
    artKind: "brush-set",
  },
];

const byId = new Map(categories.map((c) => [c.id, c]));

export function getCategory(id: CategoryId): Category {
  const c = byId.get(id);
  if (!c) throw new Error(`Unknown category ${id}`);
  return c;
}
