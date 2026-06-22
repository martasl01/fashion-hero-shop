import type {
  PricingRecommendation,
  PricingSkuInput,
} from "@/types/seller-dashboard";

// Silnik rekomendacji cenowej — wariant A (po stress-teście). Prototyp WoZ:
// progi są zgadnięte do testu i trzymane jako stałe (nie magic numbers w UI),
// do kalibracji po pierwszych wynikach. Silnik typuje PRZYCZYNĘ i KIERUNEK,
// świadomie NIE liczy o ile zmienić cenę (granica MVP).
export const PRICING_THRESHOLDS = {
  DEVIATION_MIN: 0.08, // |odchylenie| ≥ 8% — cena realnie odstaje od rynku
  MIN_OFFERS: 5, // n ≥ 5 — poniżej to szum, nie rynek
  FRESH_DAYS: 30, // ≤ 30 dni od zmiany → świeża cena, świadoma decyzja (bezpiecznik)
  STAGNATION_DAYS: 180, // ≥ 180 dni → cena stoi (Zapomniana)
  MEDIAN_MOVE_MIN_PCT: 5, // ruch mediany ≥ +5% → rynek odjechał (Zapomniana)
  CHEAPEST_MAX: 0.2, // pozycja ≤ 0,20 → realnie najtańsze (Zapomniana)
  LOW_IN_DIST_MAX: 0.3, // pozycja ≤ 0,30 → nisko w rozkładzie (Popyt)
  MID_BAND_LOW: 0.25, // 0,25–0,75 → siedzi w środku rynku (bezpiecznik)
  MID_BAND_HIGH: 0.75,
} as const;

// Teksty kart — jeden szablon na przyczynę. deliberate/no_evidence nie mają
// tekstu (cisza). Trzymane przy silniku, bo wynikają wprost z przyczyny.
const DEMAND_TEXT =
  "Schodzi szybko mimo niskiej ceny. Rynek zniósłby więcej → przetestuj podwyżkę.";
const TOO_EXPENSIVE_TEXT =
  "Powyżej mediany i nie sprzedaje się. Cena może odstraszać → rozważ obniżkę.";

// SKU poza testem (walidacja albo niespełniony warunek wejścia) — milczymy.
function excluded(): PricingRecommendation {
  return { status: "excluded", reasonCode: "out_of_test", direction: "hold", text: null };
}

// „Cena stoi od 14 mies., rynek wzrósł o 9%. Najtańsza na rynku → rozważ podwyżkę."
// Czyta się jako zapomniana cena (ktoś jej nie ruszał, a rynek odjechał), nie „inni drożej".
function forgottenPriceText(sku: PricingSkuInput): string {
  const months = Math.round(sku.dniOdZmiany / 30);
  return `Cena stoi od ${months} mies., rynek wzrósł o ${sku.ruchMedianyPct}%. Najtańsza na rynku → rozważ podwyżkę.`;
}

// Klasyfikuje SKU na jedną rekomendację. Wejście jest już kompletne (brak danych →
// SKU nie trafia tu w ogóle, nie zgadujemy). Kolejność reguł = priorytet.
export function resolvePricingRecommendation(sku: PricingSkuInput): PricingRecommendation {
  // Walidacja: „popyt wysoki" ORAZ „zalega" jednocześnie to stan niezdefiniowany
  // w specu (pola miały się wykluczać). Nie zależymy od kolejności reguł —
  // odrzucamy na wejściu (open issue #1). Do zmierzenia, jak często występuje.
  if (sku.popytWysoki && sku.zalega) {
    return excluded();
  }

  const deviation = (sku.mediana - sku.cena) / sku.mediana; // dodatnie = taniej niż rynek
  const cheaper = deviation >= PRICING_THRESHOLDS.DEVIATION_MIN;
  const pricier = deviation <= -PRICING_THRESHOLDS.DEVIATION_MIN;

  // Krok 1 — warunek wejścia: cena musi odstawać o ≥8% i mieć ≥5 ofert porównawczych.
  if (
    Math.abs(deviation) < PRICING_THRESHOLDS.DEVIATION_MIN ||
    sku.n < PRICING_THRESHOLDS.MIN_OFFERS
  ) {
    return excluded();
  }

  // Krok 2 — pierwsza pasująca przyczyna wygrywa.
  // WARIANT A: bezpiecznik „Świadomy wybór" jest NA KOŃCU, po twardych dowodach.
  // W MVP był pierwszy i zjadał reguły „Za drogo"/„Popyt" dla SKU w środku
  // rozkładu (pasmo 0,25–0,75 to połowa rynku). Twardy dowód wygrywa z „świeżą
  // ceną": świeża cena znaczy „ktoś jej dotknął", nie „dobrze wycelował".

  // 1. Zapomniana cena
  if (
    cheaper &&
    sku.dniOdZmiany >= PRICING_THRESHOLDS.STAGNATION_DAYS &&
    sku.ruchMedianyPct >= PRICING_THRESHOLDS.MEDIAN_MOVE_MIN_PCT &&
    sku.pozycja <= PRICING_THRESHOLDS.CHEAPEST_MAX
  ) {
    return {
      status: "recommended",
      reasonCode: "forgotten_price",
      direction: "raise",
      text: forgottenPriceText(sku),
    };
  }

  // 2. Popyt / wyprzedaż
  if (cheaper && sku.popytWysoki && sku.pozycja <= PRICING_THRESHOLDS.LOW_IN_DIST_MAX) {
    return {
      status: "recommended",
      reasonCode: "demand",
      direction: "raise",
      text: DEMAND_TEXT,
    };
  }

  // 3. Za drogo
  if (pricier && sku.zalega) {
    return {
      status: "recommended",
      reasonCode: "too_expensive",
      direction: "lower",
      text: TOO_EXPENSIVE_TEXT,
    };
  }

  // 4. Świadomy wybór (bezpiecznik) — świeża cena albo środek rynku.
  if (
    sku.dniOdZmiany <= PRICING_THRESHOLDS.FRESH_DAYS ||
    (sku.pozycja >= PRICING_THRESHOLDS.MID_BAND_LOW &&
      sku.pozycja <= PRICING_THRESHOLDS.MID_BAND_HIGH)
  ) {
    return { status: "silent", reasonCode: "deliberate", direction: "hold", text: null };
  }

  // Brak dowodu — odstaje, ale żadna przyczyna nie pasuje.
  return { status: "silent", reasonCode: "no_evidence", direction: "hold", text: null };
}
