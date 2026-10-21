import type { Product } from "../types";

/**
 * Kitchen & Dining — SAMPLE listings. Materials, dimensions and prices are
 * indicative and will be confirmed with the supplier before launch.
 */
export const kitchenDiningProducts: Product[] = [
  {
    id: "kd-01",
    category: "kitchen-dining",
    slug: { en: "glass-pantry-canisters", sr: "staklene-posude-za-namirnice" },
    name: { en: "Glass Pantry Canisters", sr: "Staklene posude za namirnice" },
    tagline: {
      en: "Clear glass, acacia lids, three graduated heights",
      sr: "Prozirno staklo, poklopci od akacije, tri visine",
    },
    description: {
      en: [
        "Three clear canisters in graduated heights, made for the things you reach for every day: oats, rice, pasta, coffee, sugar. The glass shows exactly what is inside and how much is left, so you can see at a glance when it is time to restock.",
        "Each lid is made from acacia wood and fitted with a soft silicone ring that sits snugly in the neck of the jar. It helps keep dry goods protected from air and dust, and lifts off with one hand when you are halfway through a recipe.",
        "Set together on an open shelf or lined up along the counter, the three heights form a calm, considered group. Borosilicate glass is light to handle and easy to wash, while the wood brings a little warmth to the stone, steel and tile around it.",
      ],
      sr: [
        "Tri prozirne posude različitih visina, za namirnice za kojima posežete svakog dana: zobene pahuljice, pirinač, tjesteninu, kafu i šećer. Kroz staklo se tačno vidi šta je unutra i koliko je ostalo, pa na prvi pogled znate kada je vrijeme za novu kupovinu.",
        "Poklopci su od drveta akacije, sa mekim silikonskim prstenom koji dobro prianja uz otvor posude. Prsten pomaže da suve namirnice ostanu zaštićene od vazduha i prašine, a poklopac se lako podiže jednom rukom, čak i kada ste usred pripreme jela.",
        "Bilo da stoje na otvorenoj polici ili u nizu duž radne površine, tri visine čine skladnu i smirenu cjelinu. Borosilikatno staklo je lagano i lako se pere, dok drvo unosi malo topline među kamen, čelik i pločice oko sebe.",
      ],
    },
    benefits: {
      en: [
        "Clear borosilicate glass shows contents and levels at a glance",
        "Acacia lids with silicone rings help keep dry goods sealed",
        "Three graduated heights that group neatly on a shelf or counter",
        "Wide openings for easy filling, pouring and washing",
      ],
      sr: [
        "Prozirno borosilikatno staklo otkriva sadržaj i količinu na prvi pogled",
        "Poklopci od akacije sa silikonskim prstenom pomažu da namirnice ostanu zatvorene",
        "Tri visine koje se skladno slažu na polici ili radnoj površini",
        "Širok otvor za lako punjenje, sipanje i pranje",
      ],
    },
    specs: [
      {
        label: { en: "Material", sr: "Materijal" },
        value: {
          en: "Borosilicate glass, acacia wood, silicone",
          sr: "Borosilikatno staklo, drvo akacije, silikon",
        },
      },
      {
        label: { en: "Dimensions", sr: "Dimenzije" },
        value: {
          en: "Ø 10 cm; heights approx. 12, 17 and 22 cm",
          sr: "Ø 10 cm; visine oko 12, 17 i 22 cm",
        },
      },
      {
        label: { en: "Capacity", sr: "Zapremina" },
        value: { en: "Approx. 0.6 L, 0.9 L and 1.25 L", sr: "Oko 0,6 l, 0,9 l i 1,25 l" },
      },
      {
        label: { en: "Care", sr: "Održavanje" },
        value: {
          en: "Wash glass by hand or in the dishwasher; wipe lids with a damp cloth and dry",
          sr: "Staklo perite ručno ili u mašini za sudove; poklopce obrišite vlažnom krpom i osušite",
        },
      },
      {
        label: { en: "Includes", sr: "Sadržaj pakovanja" },
        value: { en: "3 canisters with lids", sr: "3 posude s poklopcima" },
      },
    ],
    price: 49,
    variants: {
      name: { en: "Lid finish", sr: "Završna obrada poklopca" },
      options: [
        {
          id: "natural-acacia",
          label: { en: "Natural acacia", sr: "Prirodna akacija" },
          swatch: "#C29A6B",
        },
        {
          id: "dark-acacia",
          label: { en: "Dark acacia", sr: "Tamna akacija" },
          swatch: "#8A6544",
        },
      ],
    },
    art: { kind: "canisters", tone: "sage" },
    supplier: {
      provider: "cjdropshipping",
      productId: null,
      variantIds: { "natural-acacia": null, "dark-acacia": null },
    },
  },
  {
    id: "kd-02",
    category: "kitchen-dining",
    slug: { en: "olive-wood-utensil-set", sr: "pribor-od-maslinovog-drveta" },
    name: { en: "Olive Wood Utensil Set", sr: "Pribor od maslinovog drveta" },
    tagline: {
      en: "Spoons and spatulas in a stoneware crock",
      sr: "Varjače i špatule u keramičkoj posudi",
    },
    description: {
      en: [
        "Five cooking tools in olive wood, gathered in a stoneware crock that keeps them upright and within easy reach of the hob. Each piece carries the wood's own grain, so no two sets look quite the same: dense swirls, darker veins and a honey tone that deepens with regular oiling.",
        "Wood is gentle on non-stick and enamelled pans, and it stays comfortable in the hand when a sauce has been simmering for an hour. The set covers the everyday: a deep spoon for stirring, a slotted spoon for lifting, a flat turner, a corner spatula for scraping and a fork for serving.",
        "The crock comes in three glazes chosen to sit quietly beside wood and linen. Set it next to the cooker, on an open shelf or on the table, and the tools become part of the room rather than something to hide away in a drawer.",
      ],
      sr: [
        "Pet komada kuhinjskog pribora od maslinovog drveta, složenih u keramičku posudu koja ih drži uspravno i nadohvat ruke dok kuvate. Svaki komad ima sopstveni crtež drveta, pa nijedan set nije potpuno isti: vijugave šare, tamnije žilice i topao medeni ton koji uz redovnu njegu uljem postaje sve dublji.",
        "Drvo je blago prema tiganjima s neljepljivim premazom i emajliranom posuđu, a ostaje prijatno u ruci i kada se sos krčka već sat vremena. Set pokriva sve osnovno: duboka varjača za miješanje, kašika s prorezima za vađenje, ravna lopatica za okretanje, kosa špatula za struganje i viljuška za serviranje.",
        "Za posudu birate jednu od tri glazure, usklađene tako da se nenametljivo slažu s drvetom i lanom. Postavite je pored šporeta, na otvorenu policu ili na sto, i pribor postaje dio prostora, a ne nešto što se krije u fioci.",
      ],
    },
    benefits: {
      en: [
        "Five olive wood tools for stirring, lifting, turning and serving",
        "Gentle on non-stick and enamelled cookware",
        "Glazed stoneware crock keeps tools upright and close at hand",
        "Natural grain makes every set slightly different",
      ],
      sr: [
        "Pet komada od maslinovog drveta za miješanje, vađenje, okretanje i serviranje",
        "Blago prema neljepljivom i emajliranom posuđu",
        "Glazirana keramička posuda drži pribor uspravno i nadohvat ruke",
        "Prirodni crtež drveta čini svaki set pomalo drugačijim",
      ],
    },
    specs: [
      {
        label: { en: "Material", sr: "Materijal" },
        value: { en: "Olive wood; glazed stoneware", sr: "Maslinovo drvo; glazirana kamenina" },
      },
      {
        label: { en: "Dimensions", sr: "Dimenzije" },
        value: {
          en: "Utensils approx. 30 cm long; crock Ø 11 × 15 cm",
          sr: "Pribor dužine oko 30 cm; posuda Ø 11 × 15 cm",
        },
      },
      {
        label: { en: "Includes", sr: "Sadržaj pakovanja" },
        value: {
          en: "Spoon, slotted spoon, turner, corner spatula, serving fork, crock",
          sr: "Varjača, kašika s prorezima, lopatica, kosa špatula, viljuška za serviranje, posuda",
        },
      },
      {
        label: { en: "Finish", sr: "Završna obrada" },
        value: { en: "Oiled wood; satin glaze", sr: "Nauljeno drvo; satenska glazura" },
      },
      {
        label: { en: "Care", sr: "Održavanje" },
        value: {
          en: "Wash utensils by hand and dry at once; oil now and then with a little mineral oil",
          sr: "Pribor perite ručno i odmah osušite; povremeno ga premažite s malo mineralnog ulja",
        },
      },
    ],
    price: 59,
    variants: {
      name: { en: "Crock colour", sr: "Boja posude" },
      options: [
        { id: "sage", label: { en: "Sage", sr: "Zelena žalfija" }, swatch: "#9AA591" },
        { id: "clay", label: { en: "Clay", sr: "Terakota" }, swatch: "#C08A6E" },
        { id: "graphite", label: { en: "Graphite", sr: "Grafit" }, swatch: "#57524C" },
      ],
    },
    art: { kind: "utensil-crock", tone: "sand" },
    featured: true,
    supplier: {
      provider: "cjdropshipping",
      productId: null,
      variantIds: { sage: null, clay: null, graphite: null },
    },
  },
  {
    id: "kd-03",
    category: "kitchen-dining",
    slug: { en: "oak-serving-board", sr: "hrastova-daska-za-serviranje" },
    name: { en: "Oak Serving Board", sr: "Hrastova daska za serviranje" },
    tagline: {
      en: "For bread, cheese and unhurried evenings at the table",
      sr: "Za hljeb, sir i opuštene večeri za stolom",
    },
    description: {
      en: [
        "A generous board cut from solid oak, with a rounded handle and a leather loop for hanging. It moves from counter to table without a second thought: slicing bread in the morning, carrying cheese and figs out to guests in the evening.",
        "Oak is dense and even-grained, with a pale, warm colour that suits both a rustic loaf and a carefully arranged platter. The surface is finished with oil rather than lacquer, so it feels like wood under the hand and can be refreshed at home whenever it starts to look dry.",
        "When it is not in use, hang it by the loop or lean it against the wall behind the counter. A wooden board left out in view softens a kitchen full of hard surfaces, and it is always ready for the next meal, whether breakfast or dinner with friends.",
      ],
      sr: [
        "Prostrana daska od punog hrasta, sa zaobljenom drškom i kožnom omčom za vješanje. To je predmet koji bez razmišljanja prelazi s radne površine na sto: ujutru za sječenje hljeba, a uveče za sir i smokve koje iznosite pred goste.",
        "Hrast je gust i ujednačenih vlakana, svijetle i tople boje koja jednako pristaje domaćem hljebu i pažljivo složenoj plati. Površina je zaštićena uljem, a ne lakom, pa se pod rukom osjeća kao pravo drvo, a kada počne da djeluje suvo, lako ćete je osvježiti kod kuće.",
        "Kada je ne koristite, objesite je pomoću kožne omče ili je naslonite na zid iza radne površine. Drvena daska ostavljena na vidiku omekšava kuhinju punu tvrdih površina, a pritom je uvijek spremna za sljedeći obrok, bio to doručak ili večera s prijateljima.",
      ],
    },
    benefits: {
      en: [
        "Solid oak with a rounded handle for carrying to the table",
        "Oiled, not lacquered, so it can be refreshed at home",
        "Leather loop for hanging on a hook or rail",
        "Large enough for a whole loaf or a shared cheese course",
      ],
      sr: [
        "Puni hrast sa zaobljenom drškom za lako nošenje do stola",
        "Zaštićena uljem, a ne lakom, pa je lako osvježiti kod kuće",
        "Kožna omča za vješanje o kuku ili šipku",
        "Dovoljno velika za cijeli hljeb ili zajedničku platu sireva",
      ],
    },
    specs: [
      {
        label: { en: "Material", sr: "Materijal" },
        value: { en: "Solid oak; leather loop", sr: "Puno hrastovo drvo; kožna omča" },
      },
      {
        label: { en: "Dimensions", sr: "Dimenzije" },
        value: {
          en: "Approx. 50 × 24 × 2 cm, including handle",
          sr: "Oko 50 × 24 × 2 cm, sa drškom",
        },
      },
      {
        label: { en: "Finish", sr: "Završna obrada" },
        value: { en: "Natural oil", sr: "Prirodno ulje" },
      },
      {
        label: { en: "Care", sr: "Održavanje" },
        value: {
          en: "Hand wash and dry upright; re-oil when the wood looks dry. Not for the dishwasher",
          sr: "Perite ručno i sušite uspravno; nauljite kada drvo djeluje suvo. Ne perite u mašini za sudove",
        },
      },
      {
        label: { en: "Includes", sr: "Sadržaj pakovanja" },
        value: { en: "1 board", sr: "1 daska" },
      },
    ],
    price: 39,
    art: { kind: "serving-board", tone: "stone" },
    supplier: {
      provider: "cjdropshipping",
      productId: null,
      variantIds: { default: null },
    },
  },
  {
    id: "kd-04",
    category: "kitchen-dining",
    slug: { en: "two-tier-spice-shelf", sr: "stalak-za-zacine-na-dva-nivoa" },
    name: { en: "Two-Tier Spice Shelf", sr: "Stalak za začine na dva nivoa" },
    tagline: {
      en: "Ten glass jars, every spice in plain sight",
      sr: "Deset staklenih teglica, svaki začin na vidiku",
    },
    description: {
      en: [
        "A compact bamboo stand with two stepped tiers, so the jars at the back sit higher than those in front and every label stays readable. It brings the spices out of the cupboard and onto the counter, where the cooking actually happens, without adding clutter.",
        "Ten matching glass jars come with it, each with a bamboo lid and a silicone seal, along with blank labels to write on in your own hand. Refill from larger packets, keep only what you use, and the shelf can stay as tidy as the day you set it up.",
        "Bamboo is light and naturally pale, so the stand sits easily beside wooden boards and ceramic jars. Place it by the hob, inside a deep cupboard or on an open shelf; it works wherever you like to reach for a pinch of something.",
      ],
      sr: [
        "Kompaktan stalak od bambusa s dva stepenasta nivoa, tako da teglice pozadi stoje više od onih naprijed i svaka etiketa ostaje čitljiva. Začini izlaze iz ormarića na radnu površinu, tamo gdje se zaista kuva, a da pritom ne stvaraju nered.",
        "Uz stalak dobijate deset istih staklenih teglica, svaku s poklopcem od bambusa i silikonskim zaptivačem, kao i prazne etikete na koje možete pisati svojim rukopisom. Teglice dopunjavajte iz većih pakovanja, čuvajte samo ono što koristite i polica može ostati uredna kao prvog dana.",
        "Bambus je lagan i prirodno svijetle boje, pa se stalak lako uklapa uz drvene daske i keramičke posude. Postavite ga pored šporeta, u dublji ormarić ili na otvorenu policu; dobro će poslužiti svuda gdje volite da posegnete za prstohvatom začina.",
      ],
    },
    benefits: {
      en: [
        "Stepped tiers keep every jar and label in view",
        "Ten glass jars with bamboo lids and silicone seals included",
        "Blank labels to write on, so the system fits your kitchen",
        "Compact footprint for a counter, shelf or deep cupboard",
      ],
      sr: [
        "Stepenasti nivoi drže svaku teglicu i etiketu na vidiku",
        "U kompletu deset staklenih teglica s poklopcima od bambusa i zaptivačima",
        "Prazne etikete za ispisivanje, kako bi raspored odgovarao vašoj kuhinji",
        "Kompaktne dimenzije za radnu površinu, policu ili dubok ormarić",
      ],
    },
    specs: [
      {
        label: { en: "Material", sr: "Materijal" },
        value: {
          en: "Bamboo; glass jars with bamboo lids and silicone seals",
          sr: "Bambus; staklene teglice s poklopcima od bambusa i silikonskim zaptivačima",
        },
      },
      {
        label: { en: "Dimensions", sr: "Dimenzije" },
        value: {
          en: "Stand approx. 26 × 12 × 9 cm; jars Ø 4.5 × 10 cm",
          sr: "Stalak oko 26 × 12 × 9 cm; teglice Ø 4,5 × 10 cm",
        },
      },
      {
        label: { en: "Capacity", sr: "Zapremina" },
        value: { en: "Approx. 120 ml per jar", sr: "Oko 120 ml po teglici" },
      },
      {
        label: { en: "Finish", sr: "Završna obrada" },
        value: { en: "Clear matte lacquer", sr: "Providni mat lak" },
      },
      {
        label: { en: "Care", sr: "Održavanje" },
        value: {
          en: "Wipe the stand with a damp cloth; wash jars by hand",
          sr: "Stalak obrišite vlažnom krpom; teglice perite ručno",
        },
      },
      {
        label: { en: "Includes", sr: "Sadržaj pakovanja" },
        value: {
          en: "Stand, 10 jars with lids, blank labels",
          sr: "Stalak, 10 teglica s poklopcima, prazne etikete",
        },
      },
    ],
    price: 45,
    art: { kind: "spice-rack", tone: "ivory" },
    supplier: {
      provider: "cjdropshipping",
      productId: null,
      variantIds: { default: null },
    },
  },
];
