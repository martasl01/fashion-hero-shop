import type {
  ReturnsSkuInput,
  ReturnsRecommendation,
} from "@/types/seller-dashboard";

// ───────────────────────────────────────────────────────────────────────────
// SILNIK REKOMENDACJI ZWROTOWEJ (RR) — bartek-type, PoC v2
//
// Symetryczny do silnika cenowego Doroty (lib/pricing-recommendation.ts), ale
// dźwignią jest return rate (RR), nie cena. Dla każdego SKU: sprawdź, czy RR
// odstaje w GÓRĘ od mediany podkategorii → jeśli tak, dopasuj pierwszą pasującą
// NAPRAWIALNĄ przyczynę → zaproponuj jedną akcję. Brak naprawialnej przyczyny →
// „Obserwuj" (diagnoza, bez akcji). RR w normie → KEEP (karta się nie renderuje).
//
// Charakter: prosty, deterministyczny klasyfikator regułowy. Jedna rekomendacja
// na SKU. Te same wejścia → zawsze ten sam werdykt.
//
// ZMIANA v1→v2 (po stress-teście): akcja „Wycofaj SKU" USUNIĘTA. Sztywny próg
// RR + strata/(rr·n) dawał decyzję zależną od wolumenu i wycinał naprawialne SKU
// w premium; „wytnij swój sprzedający się produkt" jest też sprzeczne z archetypem
// Bartka. PoC testuje „czy lubi rekomendacje" + „czy trafnie typuje przyczynę" —
// do tego wystarczają akcje naprawcze + „Obserwuj". (silnik-bartek-specyfikacja.md)
// ───────────────────────────────────────────────────────────────────────────

// Progi — jedno miejsce do kalibracji. Analogiczne do PRICING_THRESHOLDS Doroty,
// dobrane do testu (do strojenia po pierwszych wynikach).
export const RETURNS_THRESHOLDS = {
  DEVIATION_MIN: 0.08, // +8 pp — RR musi odstawać w górę od mediany podkategorii
  MIN_N: 20, // n ≥ 20 zamówień — inaczej RR to szum (5 zam. → 1 zwrot = 20%)
  MIN_N_PODKAT: 8, // n_podkat ≥ 8 ofert — inaczej mediana podkategorii niewiarygodna
  MIN_SHARE: 0.4, // udział powodu ≥ 0,40 — powód musi dominować, by dać akcję
} as const;

// Werdykt „poza testem": za mała próba / brak danych / dane poza zakresem.
// Odpowiednik excluded() Doroty — nie zgadujemy na śmieciowych danych.
function outOfTest(note: string): ReturnsRecommendation {
  return { status: "out_of_test", reasonCode: "out_of_test", action: "none", text: null, note };
}

// Walidacja zakresów PRZED policzeniem czegokolwiek. Brudny mock (rr=1,50,
// koszt < 0) nie ma podejmować decyzji udającej wiarygodną (naprawa P5).
function validateRanges(input: ReturnsSkuInput): string | null {
  if (!(input.rr >= 0 && input.rr <= 1)) return "rr poza [0,1]";
  if (!(input.rrMediana >= 0 && input.rrMediana <= 1)) return "rr_mediana poza [0,1]";
  if (!(input.udzialPowodu >= 0 && input.udzialPowodu <= 1)) return "udział poza [0,1]";
  if (input.kosztZwrotow < 0) return "koszt ujemny";
  return null;
}

// Czy któreś z pól liczbowych jest niepoliczalne (NaN / Infinity z brudnego mocka).
// Typ TS gwarantuje obecność pól statycznie; ten guard jest defensywny pod
// przyszłe wejście z danych runtime.
function hasIncompleteData(input: ReturnsSkuInput): boolean {
  const nums = [input.rr, input.rrMediana, input.n, input.nPodkat, input.kosztZwrotow, input.udzialPowodu];
  return nums.some((v) => !Number.isFinite(v));
}

// Główny klasyfikator. Kolejność reguł = priorytet (pierwsza pasująca wygrywa).
// Bezpiecznik KEEP jest SKUTKIEM niespełnienia warunku wejścia (odchylenie < 8 pp),
// nie osobną regułą — konstrukcyjnie nie może zjeść akcji.
export function resolveReturnsRecommendation(input: ReturnsSkuInput): ReturnsRecommendation {
  // 0. Komplet danych (defensywnie — typ wymusza pola statycznie).
  if (hasIncompleteData(input)) return outOfTest("brak danych");

  // 1. Walidacja zakresów (P5) — zanim cokolwiek policzymy.
  const rangeError = validateRanges(input);
  if (rangeError) return outOfTest(`dane poza zakresem (${rangeError})`);

  const deviation = input.rr - input.rrMediana; // dodatnie = więcej zwrotów niż rynek

  // 2. KEEP — RR w normie. Patrzymy tylko w jedną stronę: RR niższy od rynku nie
  //    jest problemem. Ostre „<" — dokładnie +8 pp wchodzi do testu (parytet z #6).
  if (deviation < RETURNS_THRESHOLDS.DEVIATION_MIN) {
    return { status: "silent", reasonCode: "rr_w_normie", action: "none", text: null, note: "RR w normie podkategorii" };
  }

  // 3. Warunek wejścia — próba wystarczająca? (odróżnione od KEEP: to „nie wiem",
  //    nie „w normie" — dwie różne informacje dla metryki pokrycia, naprawa P7.)
  if (!(input.n >= RETURNS_THRESHOLDS.MIN_N && input.nPodkat >= RETURNS_THRESHOLDS.MIN_N_PODKAT)) {
    return outOfTest("za mała próba");
  }

  // 4. Twarde dowody — pierwsza pasująca wygrywa. Tylko akcje NAPRAWCZE + „Obserwuj".
  // 4a. Zły rozmiar → tabela rozmiarów.
  if (input.powod === "rozmiar" && input.udzialPowodu >= RETURNS_THRESHOLDS.MIN_SHARE) {
    return { status: "recommended", reasonCode: "zly_rozmiar", action: "size_table", text: "Zły rozmiar" };
  }
  // 4b. Mylący wygląd → zdjęcia na modelce / realne kolory.
  if (input.powod === "wyglad" && input.udzialPowodu >= RETURNS_THRESHOLDS.MIN_SHARE) {
    return { status: "recommended", reasonCode: "mylacy_wyglad", action: "photos", text: "Mylący wygląd" };
  }
  // 4c. Wysoki RR bez naprawialnej przyczyny → diagnoza, BEZ akcji.
  //     (jakość, brak powodu, udział < 0,40, także ekstremalny RR — nie zgadujemy,
  //      nie każemy wycofać; pokazujemy sygnał i zostawiamy decyzję sellerowi.)
  return { status: "recommended", reasonCode: "obserwuj", action: "observe", text: "Wysoki RR — obserwuj" };
}
