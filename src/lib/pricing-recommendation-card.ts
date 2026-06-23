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
// drill-down. Zasada „tylko kierunek": karta podaje liczby diagnostyczne (wiek
// ceny, ruch rynku, odchylenie) i miękką sugestię, NIGDY ceny docelowej — silnik
// i prezentacja trzymają granicę MVP (nie liczymy o ile zmienić cenę).

// Priorytet typowania nagłówkowej akcji „Akcja na ten tydzień": zapomniana cena
// (najmocniejszy dowód) → za drogo → popyt. W obrębie przyczyny decyduje kolejność
// w danych. Pozostałe rekomendowane SKU trafiają do sekcji „Rekomendacje cenowe".
const REASON_PRIORITY: PricingReasonCode[] = ["forgotten_price", "too_expensive", "demand"];

export interface TopPricingSku {
  input: PricingSkuInput;
  verdict: PricingRecommendation;
}

export function pickTopPricingSku(
  inputs: PricingSkuInput[],
  salesByProductId?: Map<string, number>
): TopPricingSku | null {
  const recommended = inputs
    .map((input, idx) => ({ input, idx, verdict: resolvePricingRecommendation(input) }))
    .filter((r) => r.verdict.status === "recommended")
    // Guardrail popytu: podwyżka (zapomniana cena / popyt) bez ani jednej sprzedaży w 30 dni
    // nie jest dowodem okazji — to martwy SKU, nie zapomniana cena. Nie promujemy go na
    // nagłówkową „Akcję na ten tydzień". Brak danych sprzedaży → guardrail nieaktywny.
    .filter((r) => {
      if (!salesByProductId) return true;
      const sales30d = salesByProductId.get(r.input.productId) ?? 0;
      return !(r.verdict.direction === "raise" && sales30d === 0);
    });

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

// Treść karty szablonowana per przyczyna + kierunek. Zasada redakcyjna ze speca:
// „tylko kierunek" — karta podaje liczby DIAGNOSTYCZNE (od ilu mies. cena stoi,
// o ile odstaje od rynku) i miękką sugestię („rozważ podwyżkę"), ale NIGDY ceny
// docelowej ani „+10%". Zero narracji o tym, CZY rekomendować (rozstrzygnął silnik).
interface CardCopyArgs {
  productName: string;
  mediana: number;
  months: number; // dni_od_zmiany / 30 — wiek ceny (diagnostyczny)
  ruchPct: number; // ruch mediany w % (diagnostyczny)
  deviationPct: number; // |odchylenie| od mediany w % (diagnostyczny)
  sales30d: number; // sztuk sprzedanych w ostatnich 30 dniach (sygnał popytu)
}

// Trzeci kafel „Co mówią liczby" — sygnał per przyczyna (zastępuje dawną „cenę
// testową"). Treść diagnostyczna, nie preskryptywna.
interface ThirdTile {
  label: string;
  value: string;
  sub: string;
}

interface CardCopy {
  title: string; // nagłówek z liczbą diagnostyczną
  insightShort: string; // treść: 1 zdanie diagnozy + 1 zdanie miękkiej sugestii
  ctaLabel: string;
  contextExplanation: string;
  resultSub?: string; // podpis pod kaflem „Twoja cena" (np. wiek ceny przy zapomnianej cenie)
  thirdTile: ThirdTile;
  action: string; // miękka sugestia kierunku, bez liczby docelowej
  actionInsight: string;
  successMetric: string;
  keepRule: string;
  revertRule: string;
}

const cardCopyByReason: Record<
  "forgotten_price" | "demand" | "too_expensive",
  (a: CardCopyArgs) => CardCopy
> = {
  forgotten_price: ({ productName, mediana, months, ruchPct, sales30d }) => ({
    title: `Twoja cena stoi w miejscu od ${months} miesięcy, a konkurencja podniosła ceny o ${ruchPct}%`,
    insightShort: "Jesteś teraz najtańszy w kategorii. Rozważ podwyżkę, żeby nadgonić rynek.",
    ctaLabel: "Zobacz porównanie z rynkiem",
    contextExplanation:
      "Cena tego produktu stoi od dłuższego czasu, a mediana podkategorii w tym czasie wzrosła. To wygląda na zapomnianą cenę, nie świadomy wybór — rynek odjechał do góry, a Ty zostałaś z dawną stawką. Bycie najtańszą pozycją na rynku rzadko jest optymalne.",
    // Wiek ceny zeszedł do podpisu pod „Twoja cena"; trzeci kafel pokazuje teraz popyt —
    // dowód, że niska cena to realna okazja (produkt się sprzedaje), a nie martwy SKU.
    resultSub: `ostatnia zmiana: ${months} mies. temu`,
    thirdTile: {
      label: "Popyt",
      value: `${sales30d} szt.`,
      sub: "sprzedanych w ostatnich 30 dniach",
    },
    action: `Rozważ podwyżkę, żeby nadgonić rynek — przez ${months} mies. Twoja cena stała w miejscu, a mediana podkategorii wzrosła.`,
    actionInsight: `Masz zapas do mediany podkategorii (${mediana} zł), więc ryzyko spadku zamówień jest niewielkie.`,
    successMetric: `Utarg z ${productName} (cena × liczba zamówień), nie sama liczba zamówień`,
    keepRule: "utarg w górę → zostaw nową cenę i możesz powtórzyć na kolejnym produkcie",
    revertRule: "utarg w dół → wróć do poprzedniej ceny",
  }),
  demand: ({ productName, mediana, deviationPct }) => ({
    title: `Ten produkt schodzi szybko, mimo że jest o ${deviationPct}% tańszy od rynku`,
    insightShort:
      "To sygnał, że rynek zniósłby więcej. Przetestuj podwyżkę bez ryzyka utraty tempa sprzedaży.",
    ctaLabel: "Zobacz porównanie z rynkiem",
    contextExplanation:
      "Ten produkt schodzi szybko, choć jego cena jest poniżej mediany podkategorii. Wysoki popyt przy niskiej cenie to sygnał, że rynek zniósłby więcej — zostawiasz pieniądze na stole. Warto przetestować podwyżkę bez dużego ryzyka dla rotacji.",
    thirdTile: {
      label: "Rotacja",
      value: "Wysoka",
      sub: "schodzi mimo niższej ceny",
    },
    action:
      "Przetestuj podwyżkę — produkt schodzi szybko mimo ceny poniżej mediany, więc rynek prawdopodobnie zniósłby więcej.",
    actionInsight: `Produkt sprzedaje się dobrze poniżej mediany (${mediana} zł) — niewielka podwyżka prawdopodobnie nie zatrzyma sprzedaży.`,
    successMetric: `Utarg z ${productName} (cena × liczba zamówień), nie sama liczba zamówień`,
    keepRule: "utarg w górę → zostaw nową cenę i możesz powtórzyć na kolejnym produkcie",
    revertRule: "utarg w dół → wróć do poprzedniej ceny",
  }),
  too_expensive: ({ productName, mediana, deviationPct }) => ({
    title: `Twoja cena jest o ${deviationPct}% wyższa od rynku, a produkt zalega na magazynie`,
    insightShort: "Cena może odstraszać kupujących. Rozważ obniżkę, żeby ruszyć sprzedaż.",
    ctaLabel: "Zobacz porównanie z rynkiem",
    contextExplanation:
      "Cena tego produktu jest powyżej mediany podkategorii, a towar zalega — nie sprzedaje się. Zbyt wysoka cena może odstraszać kupujących. Obniżka w stronę mediany może odblokować sprzedaż zamrożonego stanu.",
    thirdTile: {
      label: "Stan magazynu",
      value: "Zalega",
      sub: "brak sprzedaży przy cenie powyżej mediany",
    },
    action:
      "Rozważ obniżkę w stronę mediany — produkt jest droższy od rynku i nie schodzi, więc cena może odstraszać kupujących.",
    actionInsight: `Mediana podkategorii to ${mediana} zł — zejście bliżej niej zmniejsza barierę cenową.`,
    successMetric: `Liczba sprzedanych sztuk ${productName} w oknie testu`,
    keepRule: "sprzedaż ruszyła → zostaw niższą cenę",
    revertRule: "bez zmian → wróć do poprzedniej ceny i sprawdź zdjęcia oraz opis",
  }),
};

// Składa pełną kartę „cennik" z werdyktu silnika i danych SKU. Wywoływana tylko
// dla werdyktu o statusie "recommended" (forgotten_price | demand | too_expensive).
export function buildCennikRecommendation(
  input: PricingSkuInput,
  product: Product,
  verdict: PricingRecommendation,
  sales30d: number
): SellerRecommendation {
  const reason = verdict.reasonCode as "forgotten_price" | "demand" | "too_expensive";
  const raise = verdict.direction === "raise";

  const deviationPct = Math.round((Math.abs(input.mediana - input.cena) / input.mediana) * 100);
  const months = Math.round(input.dniOdZmiany / 30);
  // taniej niż rynek → różnica ujemna; drożej → dodatnia (liczba diagnostyczna)
  const differenceStr = raise ? `−${deviationPct}%` : `+${deviationPct}%`;
  // Sygnał popytu na chipie kafla i w wierszu SKU (sztuk / 30 dni).
  const demandSignal = `${sales30d} sprzedanych / 30 dni`;

  const copy = cardCopyByReason[reason]({
    productName: product.name,
    mediana: input.mediana,
    months,
    ruchPct: input.ruchMedianyPct,
    deviationPct,
    sales30d,
  });

  const categoryLabel = categoryLabelPl[product.productCategory];
  const imageSrc = product.images[0] ?? product.colors[0]?.image ?? "";

  return {
    id: "1",
    category: "cennik",
    title: copy.title,
    insightShort: copy.insightShort, // treść: diagnoza + miękka sugestia (tylko kierunek)
    ctaLabel: copy.ctaLabel,
    primaryProduct: {
      name: product.name,
      sku: input.productId,
      imageSrc,
      category: categoryLabel,
      productSlug: product.slug,
      demandSignal,
    },
    yourResultTile: {
      label: `Twoja cena (${product.name})`,
      value: `${input.cena} zł`,
      sub: copy.resultSub,
    },
    benchmarkTile: {
      label: "Benchmark",
      value: `${input.mediana} zł`,
      sub: `Mediana z ostatnich 90 dni · ${input.n} ofert porównawczych`,
    },
    // Trzeci kafel „Co mówią liczby" — sygnał per przyczyna (zamiast ceny docelowej).
    financialEffectTile: {
      label: copy.thirdTile.label,
      value: copy.thirdTile.value,
      sub: copy.thirdTile.sub,
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
        demandSignal,
        lowDemand: sales30d === 0,
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
