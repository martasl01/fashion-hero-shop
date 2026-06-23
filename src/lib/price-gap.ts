import type {
  BenchmarkSample,
  PriceDistributionSignal,
  PriceGapData,
  PriceStagnationSignal,
} from "@/types/seller-dashboard";
import { formatBenchmarkSample } from "@/lib/utils";

// Reguły slotu „Dlaczego ta cena to luka" (prototyp WoZ — progi, nie logika
// bazodanowa). Trzymane jako stałe, nie magic numbers w komponentach.
// Sens: rozróżnić świadomy pricing od zapomnianej ceny. Świeżo zmieniona cena
// albo środek rozkładu nie są dowodem zaniedbania → sygnał pomijamy.
export const PRICE_GAP_THRESHOLDS = {
  MIN_MONTHS_STAGNATION: 6, // poniżej → cena zmieniana niedawno, to nie luka
  MIN_MEDIAN_MOVE_PCT: 3, // mediana ledwo drgnęła → stagnacja nie jest dowodem
  MAX_PERCENTILE: 25, // powyżej → środek rozkładu, nie skrajnie tania pozycja
  MIN_DISTRIBUTION_SELLERS: 8, // za mała próbka → pozycję pomijamy (spójnie z benchmarkiem)
} as const;

export interface PriceGapResolution {
  hasEvidence: boolean; // czy renderować slot w ogóle (brak → rekomendacja stonowana)
  stagnation: PriceStagnationSignal | null; // null, gdy nie przeszła progów
  distribution: PriceDistributionSignal | null; // null, gdy środek rozkładu lub za mała próbka
}

// Wyprowadza, które sygnały kwalifikują się jako dowód luki. Stagnacja jest
// dowodem tylko, gdy cena stoi długo, a mediana w tym czasie realnie się ruszyła.
// Pozycja liczy się tylko skrajnie nisko i na wystarczającej próbce (jak benchmark).
export function resolvePriceGap(data: PriceGapData): PriceGapResolution {
  const stagnation =
    data.stagnation &&
    data.stagnation.monthsSinceChange >= PRICE_GAP_THRESHOLDS.MIN_MONTHS_STAGNATION &&
    data.stagnation.categoryMedianMovePct >= PRICE_GAP_THRESHOLDS.MIN_MEDIAN_MOVE_PCT
      ? data.stagnation
      : null;

  const distribution =
    data.distribution &&
    data.distribution.percentile <= PRICE_GAP_THRESHOLDS.MAX_PERCENTILE &&
    data.distribution.sample.sellers >= PRICE_GAP_THRESHOLDS.MIN_DISTRIBUTION_SELLERS
      ? data.distribution
      : null;

  return {
    hasEvidence: !!(stagnation || distribution),
    stagnation,
    distribution,
  };
}

// „bez zmian od 14 mies. (mediana +9%)" — czyta się jako zapomniana cena, nie „inni drożej".
export function formatStagnation(s: PriceStagnationSignal): string {
  return `bez zmian od ${s.monthsSinceChange} mies. (mediana ${formatSignedPct(
    s.categoryMedianMovePct
  )})`;
}

// „najtańsze 15% w podkategorii" — jedna fraza pozycyjna zamiast wykresu rozkładu.
export function formatDistribution(d: PriceDistributionSignal): string {
  return `najtańsze ${d.percentile}% w podkategorii`;
}

// Linia źródła pod pozycją — ta sama reguła liczności/fallbacku co benchmark,
// tylko inny czasownik prowadzący ("rozkład" zamiast "mediana"). Zachowuje
// adnotację o eskalacji (policzono o poziom wyżej).
export function formatDistributionSample(sample: BenchmarkSample): string {
  return formatBenchmarkSample(sample).replace(/^mediana z/, "rozkład z");
}

// Znak przy ruchu mediany — minus „−" jak w reszcie codebase (np. „−12%").
function formatSignedPct(n: number): string {
  if (n > 0) return `+${n}%`;
  if (n < 0) return `−${Math.abs(n)}%`;
  return `${n}%`;
}
