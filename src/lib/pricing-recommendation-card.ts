import type { Product } from "@/types";
import type {
  PricingRecommendation,
  PricingReasonCode,
  PricingSkuInput,
  SellerRecommendation,
} from "@/types/seller-dashboard";
import { resolvePricingRecommendation } from "@/lib/pricing-recommendation";

// Warstwa PREZENTACJI silnika rekomendacji cenowej. Silnik (pricing-recommendation.ts)
// typuje przyczynę i kierunek; tutaj składamy z tego werdyktu + danych SKU bogatą
// kartę „cennik" (SellerRecommendation), tę samą, którą renderuje dashboard i
// drill-down. Cena testowa jest jawnym szablonem prezentacji (+10% / −10%), NIE
// logiką silnika — silnik trzyma granicę MVP (nie liczy o ile zmienić cenę).

// Priorytet typowania nagłówkowej akcji „Akcja na ten tydzień": zapomniana cena
// (najmocniejszy dowód) → za drogo → popyt. W obrębie przyczyny decyduje kolejność
// w danych. Pozostałe rekomendowane SKU trafiają do sekcji „Rekomendacje cenowe".
const REASON_PRIORITY: PricingReasonCode[] = ["forgotten_price", "too_expensive", "demand"];

export interface TopPricingSku {
  input: PricingSkuInput;
  verdict: PricingRecommendation;
}

export function pickTopPricingSku(inputs: PricingSkuInput[]): TopPricingSku | null {
  const recommended = inputs
    .map((input, idx) => ({ input, idx, verdict: resolvePricingRecommendation(input) }))
    .filter((r) => r.verdict.status === "recommended");

  if (recommended.length === 0) return null;

  recommended.sort((a, b) => {
    const pa = REASON_PRIORITY.indexOf(a.verdict.reasonCode);
    const pb = REASON_PRIORITY.indexOf(b.verdict.reasonCode);
    if (pa !== pb) return pa - pb;
    return a.idx - b.idx;
  });

  const top = recommended[0];
  return { input: top.input, verdict: top.verdict };
}

const categoryLabelPl: Record<Product["productCategory"], string> = {
  shoes: "Buty",
  apparel: "Odzież",
  accessories: "Akcesoria",
  socks: "Skarpety",
};

// Treść karty szablonowana per przyczyna + kierunek. Każda funkcja dostaje
// policzone liczby i zwraca teksty PL — zero ręcznej narracji o tym, CZY
// rekomendować (to już rozstrzygnął silnik).
interface CardCopyArgs {
  productName: string;
  cena: number;
  mediana: number;
  testPrice: number;
  deviationPct: number;
}

interface CardCopy {
  title: string;
  ctaLabel: string;
  contextExplanation: string;
  action: string;
  actionInsight: string;
  successMetric: string;
  keepRule: string;
  revertRule: string;
  effectSub: string;
}

const cardCopyByReason: Record<
  "forgotten_price" | "demand" | "too_expensive",
  (a: CardCopyArgs) => CardCopy
> = {
  forgotten_price: ({ productName, cena, mediana, testPrice }) => ({
    title: "Twoja cena jest poniżej mediany podkategorii",
    ctaLabel: "Podnieś cenę",
    contextExplanation:
      "Cena tego produktu stoi od dłuższego czasu, a mediana podkategorii w tym czasie wzrosła. To wygląda na zapomnianą cenę, nie świadomy wybór — rynek odjechał do góry, a Ty zostałaś z dawną stawką. Bycie najtańszą pozycją na rynku rzadko jest optymalne.",
    action: `Podnieś cenę o 10% (z ${cena} zł do ~${testPrice} zł) na 2 tygodnie i sprawdź, czy utarg wzrośnie.`,
    actionInsight: `Nawet po podwyżce zostajesz poniżej mediany podkategorii (${mediana} zł), więc ryzyko spadku zamówień jest niewielkie.`,
    successMetric: `Utarg z ${productName} (cena × liczba zamówień), nie sama liczba zamówień`,
    keepRule: "utarg w górę → zostaw cenę i możesz powtórzyć na kolejnym produkcie",
    revertRule: `utarg w dół → wróć do ${cena} zł`,
    effectSub: "+10% na 2 tygodnie",
  }),
  demand: ({ productName, cena, mediana, testPrice }) => ({
    title: "Sprzedaje się szybko mimo niskiej ceny",
    ctaLabel: "Podnieś cenę",
    contextExplanation:
      "Ten produkt schodzi szybko, choć jego cena jest poniżej mediany podkategorii. Wysoki popyt przy niskiej cenie to sygnał, że rynek zniósłby więcej — zostawiasz pieniądze na stole. Warto przetestować podwyżkę bez dużego ryzyka dla rotacji.",
    action: `Podnieś cenę o 10% (z ${cena} zł do ~${testPrice} zł) na 2 tygodnie i sprawdź, czy utarg wzrośnie mimo wysokiego popytu.`,
    actionInsight: `Produkt sprzedaje się dobrze poniżej mediany (${mediana} zł) — niewielka podwyżka prawdopodobnie nie zatrzyma sprzedaży.`,
    successMetric: `Utarg z ${productName} (cena × liczba zamówień), nie sama liczba zamówień`,
    keepRule: "utarg w górę → zostaw cenę i możesz powtórzyć na kolejnym produkcie",
    revertRule: `utarg w dół → wróć do ${cena} zł`,
    effectSub: "+10% na 2 tygodnie",
  }),
  too_expensive: ({ productName, cena, mediana, testPrice }) => ({
    title: "Twoja cena jest powyżej mediany, a produkt nie schodzi",
    ctaLabel: "Obniż cenę",
    contextExplanation:
      "Cena tego produktu jest powyżej mediany podkategorii, a towar zalega — nie sprzedaje się. Zbyt wysoka cena może odstraszać kupujących. Obniżka w stronę mediany może odblokować sprzedaż zamrożonego stanu.",
    action: `Obniż cenę o 10% (z ${cena} zł do ~${testPrice} zł) na 2 tygodnie i sprawdź, czy sprzedaż ruszy.`,
    actionInsight: `Mediana podkategorii to ${mediana} zł — zejście bliżej niej zmniejsza barierę cenową.`,
    successMetric: `Liczba sprzedanych sztuk ${productName} w oknie testu`,
    keepRule: "sprzedaż ruszyła → zostaw niższą cenę",
    revertRule: `bez zmian → wróć do ${cena} zł i sprawdź zdjęcia oraz opis`,
    effectSub: "−10% na 2 tygodnie",
  }),
};

// Składa pełną kartę „cennik" z werdyktu silnika i danych SKU. Wywoływana tylko
// dla werdyktu o statusie "recommended" (forgotten_price | demand | too_expensive).
export function buildCennikRecommendation(
  input: PricingSkuInput,
  product: Product,
  verdict: PricingRecommendation
): SellerRecommendation {
  const reason = verdict.reasonCode as "forgotten_price" | "demand" | "too_expensive";
  const raise = verdict.direction === "raise";

  const deviationPct = Math.round((Math.abs(input.mediana - input.cena) / input.mediana) * 100);
  const testPrice = Math.round(input.cena * (raise ? 1.1 : 0.9));
  // taniej niż rynek → różnica ujemna; drożej → dodatnia
  const differenceStr = raise ? `−${deviationPct}%` : `+${deviationPct}%`;

  const copy = cardCopyByReason[reason]({
    productName: product.name,
    cena: input.cena,
    mediana: input.mediana,
    testPrice,
    deviationPct,
  });

  const categoryLabel = categoryLabelPl[product.productCategory];
  const imageSrc = product.images[0] ?? product.colors[0]?.image ?? "";

  return {
    id: "1",
    category: "cennik",
    title: copy.title,
    insightShort: verdict.text ?? copy.title, // jednolinijkowiec wprost z silnika
    ctaLabel: copy.ctaLabel,
    primaryProduct: {
      name: product.name,
      sku: input.productId,
      imageSrc,
      category: categoryLabel,
      productSlug: product.slug,
    },
    yourResultTile: {
      label: `Twoja cena (${product.name})`,
      value: `${input.cena} zł`,
    },
    benchmarkTile: {
      label: "Benchmark",
      value: `${input.mediana} zł`,
      sub: `Mediana podkategorii · ${input.n} ofert porównawczych`,
    },
    financialEffectTile: {
      label: "Rekomendowana cena testowa",
      value: `${testPrice} zł`,
      sub: copy.effectSub,
    },
    contextExplanation: copy.contextExplanation,
    affectedProductRows: [
      {
        name: product.name,
        sku: input.productId,
        productSlug: product.slug,
        category: categoryLabel,
        price: `${input.cena} zł`,
        yourValue: `${input.cena} zł`,
        benchmarkValue: `${input.mediana} zł`,
        difference: differenceStr,
      },
    ],
    actionStep: {
      action: copy.action,
      actionInsight: copy.actionInsight,
      testWindow: "2 tygodnie",
      successMetric: copy.successMetric,
      keepRule: copy.keepRule,
      revertRule: copy.revertRule,
    },
  };
}
