import type {
  ReturnsSkuInput,
  ReturnsRecommendation,
  ReturnReasonsData,
  SellerRecommendation,
} from "@/types/seller-dashboard";
import { resolveReturnsRecommendation, RETURNS_THRESHOLDS } from "@/lib/returns-recommendation";
import { resolveReturnReasons } from "@/lib/return-reasons";

// ───────────────────────────────────────────────────────────────────────────
// BUILDER KARTY zwrotowej — warstwa prezentacji nad silnikiem (mirror Doroty:
// pricing-recommendation-card.ts). Składa SellerRecommendation z werdyktu silnika
// i wybiera WARIANT copy per {podtyp}. Silnik decyduje JAKA akcja; {podtyp}
// (z return reasons) dobiera tylko TEKST — nie zmienia akcji (zasada speca).
//
// Framing kosztu: ZAWSZE strata Bartka (obniżona odsprzedaż + zamrożony towar),
// NIGDY koszt obsługi zwrotu — ten pokrywa platforma (decyzja anty-Etsy).
// ───────────────────────────────────────────────────────────────────────────

export interface TopReturnsSku {
  input: ReturnsSkuInput;
  verdict: ReturnsRecommendation;
}

// Priorytet akcji: naprawcze przed diagnozą (analog REASON_PRIORITY Doroty).
// Bez guardraila popytu — przy zwrotach sprzedaz30d nie jest warunkiem akcji.
const ACTION_PRIORITY: Record<ReturnsRecommendation["action"], number> = {
  size_table: 0,
  photos: 1,
  observe: 2,
  none: 99,
};

// Wybiera 1 SKU do chipa „Akcja na ten tydzień". Tylko REKO; sortuje wg priorytetu
// akcji, a przy remisie wg wielkości odchylenia RR (większy problem wyżej).
export function pickTopReturnsSku(inputs: ReturnsSkuInput[]): TopReturnsSku | null {
  const recommended = inputs
    .map((input) => ({ input, verdict: resolveReturnsRecommendation(input) }))
    .filter((r) => r.verdict.status === "recommended");
  if (recommended.length === 0) return null;

  recommended.sort((a, b) => {
    const pa = ACTION_PRIORITY[a.verdict.action];
    const pb = ACTION_PRIORITY[b.verdict.action];
    if (pa !== pb) return pa - pb;
    return b.input.rr - b.input.rrMediana - (a.input.rr - a.input.rrMediana);
  });
  return recommended[0];
}

// ── Warianty copy per sekcja (przepisane dosłownie z silnik-bartek-copywriting.md) ──

type CopySection = "1a" | "1b" | "1c" | "2a" | "2b" | "2c" | "3a" | "3b" | "3c";

// Pod-typ z return reasons — doprecyzowuje TEKST w obrębie tej samej akcji.
type Subtype =
  | "za_male"
  | "za_duze"
  | "kolor"
  | "kroj_material"
  | "jakosc"
  | "rozproszony"
  | "brak_danych"
  | undefined;

interface CopyArgs {
  udzialPct: string; // „58%"
  odchyleniePp: number; // 34
  rozmiarTop: string; // „S" (tylko warianty rozmiarowe)
}

interface CardCopy {
  title: string; // nagłówek (pełne zdanie z liczbą)
  body: string; // treść: diagnoza + sugestia
  short: string; // wariant krótki (gęsty listing)
}

const cardCopyBySection: Record<CopySection, (a: CopyArgs) => CardCopy> = {
  "1a": (a) => ({
    title: `${a.udzialPct} zwrotów tego produktu to zły rozmiar, a wraca o ${a.odchyleniePp} pp częściej niż podobne`,
    body: "To sygnał, że kupujące nie trafiają w rozmiar. Dodaj albo popraw tabelę rozmiarów, żeby zmniejszyć zwroty.",
    short: `${a.udzialPct} zwrotów = zły rozmiar, RR +${a.odchyleniePp} pp → dodaj tabelę rozmiarów.`,
  }),
  "1b": (a) => ({
    title: `${a.udzialPct} zwrotów tego produktu wynika z powodu niestandardowej rozmiarówki`,
    body: "Kupujące zamawiają swój rozmiar, a dostają mniejszy. Dodaj tabelę rozmiarów z wymiarami w cm, żeby brały rozmiar wyżej, zanim zwrócą.",
    short: `${a.udzialPct} zwrotów = niestandardowa rozmiarówka → tabela wymiarów w cm.`,
  }),
  "1c": (a) => ({
    title: `${a.udzialPct} zwrotów tego produktu wraca jako „za duże" — najczęściej w rozmiarze ${a.rozmiarTop}`,
    body: "Krój wychodzi obszerniej niż kupujące się spodziewają. Dodaj tabelę rozmiarów i opisz fason (oversize / regularny), żeby trafiały za pierwszym razem.",
    short: `${a.udzialPct} zwrotów „za duże" (${a.rozmiarTop}) → tabela + opis fasonu.`,
  }),
  "2a": (a) => ({
    title: `${a.udzialPct} zwrotów tego produktu to „wygląda inaczej niż na zdjęciu"`,
    body: "Kupujące spodziewają się czegoś innego niż dostają. Pokaż produkt na modelce i w realnych kolorach, żeby zmniejszyć zwroty.",
    short: `${a.udzialPct} zwrotów = „wygląda inaczej" → zdjęcia na modelce, realne kolory.`,
  }),
  "2b": (a) => ({
    title: `${a.udzialPct} zwrotów tego produktu to „kolor inny niż na zdjęciu"`,
    body: "Zdjęcia oddają kolor inaczej niż wygląda na żywo. Dodaj kadr w świetle dziennym i metkę z dokładną nazwą koloru, żeby kupujące wiedziały, co zamawiają.",
    short: `${a.udzialPct} zwrotów = „inny kolor" → kadr w świetle dziennym, nazwa koloru.`,
  }),
  "2c": (a) => ({
    title: `${a.udzialPct} zwrotów tego produktu to „krój albo materiał inny niż się spodziewałam"`,
    body: "Sam fason albo tkanina zaskakują po rozpakowaniu. Pokaż produkt na modelce z różnych stron i dopisz skład materiału, żeby oczekiwania zgadzały się z paczką.",
    short: `${a.udzialPct} zwrotów = „inny krój/materiał" → modelka z różnych stron + skład.`,
  }),
  "3a": (a) => ({
    title: `Ten produkt wraca o ${a.odchyleniePp} pp częściej niż podobne, głównie z powodu jakości`,
    body: `${a.udzialPct} zwrotów wskazuje na materiał albo wykonanie — tego nie naprawisz zdjęciem ani tabelą rozmiarów. Warto sprawdzić ten produkt u dostawcy.`,
    short: `RR +${a.odchyleniePp} pp, ${a.udzialPct} zwrotów = jakość → sprawdź u dostawcy.`,
  }),
  "3b": (a) => ({
    title: `Ten produkt wraca o ${a.odchyleniePp} pp częściej niż podobne w podkategorii`,
    body: "Powody zwrotów rozkładają się po równo, więc nie ma jednej rzeczy do poprawy. Warto mu się przyjrzeć.",
    short: `RR +${a.odchyleniePp} pp, powód rozproszony → przyjrzyj się.`,
  }),
  "3c": (a) => ({
    title: `Ten produkt wraca o ${a.odchyleniePp} pp częściej niż podobne w podkategorii`,
    body: "Nie mamy jeszcze rozbicia powodów zwrotów dla tego produktu, więc nie podpowiadamy konkretnej zmiany. Warto mu się przyjrzeć i sprawdzić, co wraca.",
    short: `RR +${a.odchyleniePp} pp, brak danych o powodzie → przyjrzyj się.`,
  }),
};

// Mapuje (akcja silnika × pod-typ) na sekcję copy. Fallback do wariantu bazowego
// (⭐) gdy pod-typ niedostępny — nigdy nie blokujemy karty REKO brakiem pod-typu.
function pickCopyVariant(reasonCode: ReturnsRecommendation["reasonCode"], subtype: Subtype): CopySection {
  switch (reasonCode) {
    case "zly_rozmiar":
      if (subtype === "za_male") return "1b";
      if (subtype === "za_duze") return "1c";
      return "1a"; // ⭐
    case "mylacy_wyglad":
      if (subtype === "kolor") return "2b";
      if (subtype === "kroj_material") return "2c";
      return "2a"; // ⭐
    case "obserwuj":
      if (subtype === "jakosc") return "3a";
      if (subtype === "brak_danych") return "3c";
      return "3b"; // ⭐
    default:
      return "3b";
  }
}

// Wyprowadza pod-typ z rozbicia powodów (return reasons). Jedyne miejsce sklejania
// dwóch enumów (powod silnika vs ReturnReasonCode resolvera) — w warstwie copy,
// nigdy w silniku.
function deriveSubtype(input: ReturnsSkuInput, reasonsData?: ReturnReasonsData): { subtype: Subtype; rozmiarTop: string } {
  if (input.powod === "rozmiar") {
    const dir = reasonsData?.sizeBreakdown?.gridDirection;
    const resolution = reasonsData ? resolveReturnReasons(reasonsData) : null;
    const topHigh = resolution?.sizeBreakdown?.rows.find((r) => r.high) ?? resolution?.sizeBreakdown?.rows[0];
    const rozmiarTop = topHigh?.size ?? "";
    // „up" = siatka leci za duża, krój mały → produkt wychodzi za mały → za_male.
    const subtype: Subtype = dir === "up" ? "za_male" : dir === "down" ? "za_duze" : undefined;
    return { subtype, rozmiarTop };
  }
  if (input.powod === "wyglad") {
    const top = reasonsData?.reasons[0]?.code;
    const subtype: Subtype = top === "kolor" ? "kolor" : top === "niezgodnosc_z_opisem" ? "kroj_material" : undefined;
    return { subtype, rozmiarTop: "" };
  }
  // obserwuj: jakość / rozproszony / brak danych
  if (input.powod === "jakosc") return { subtype: "jakosc", rozmiarTop: "" };
  if (!reasonsData) return { subtype: "brak_danych", rozmiarTop: "" };
  return { subtype: "rozproszony", rozmiarTop: "" };
}

// ── Pomocnicze formatery ──
const pct = (v: number) => `${Math.round(v * 100)}%`;
const zl = (v: number) => `${Math.round(v).toLocaleString("pl-PL").replace(/ /g, " ")} zł`;

const CTA_BY_ACTION: Record<ReturnsRecommendation["action"], string> = {
  size_table: "Zobacz powody zwrotów",
  photos: "Zobacz powody zwrotów",
  observe: "Przyjrzyj się",
  none: "Przyjrzyj się",
};

// Składa pełną kartę SellerRecommendation (kategoria „zwroty"). Renderuje się
// tylko dla statusu „recommended" — KEEP / out_of_test nie mają karty.
export function buildReturnsRecommendation(
  input: ReturnsSkuInput,
  verdict: ReturnsRecommendation,
  opts?: { reasonsData?: ReturnReasonsData; imageSrc?: string }
): SellerRecommendation | null {
  if (verdict.status !== "recommended") return null;

  const reasonsData = opts?.reasonsData;
  const odchyleniePp = Math.round((input.rr - input.rrMediana) * 100);
  const { subtype, rozmiarTop } = deriveSubtype(input, reasonsData);
  const section = pickCopyVariant(verdict.reasonCode, subtype);
  const copy = cardCopyBySection[section]({ udzialPct: pct(input.udzialPowodu), odchyleniePp, rozmiarTop });

  const isObserve = verdict.action === "observe";
  const actionStep = isObserve
    ? {
        action: "Przyjrzyj się temu produktowi. Silnik pokazuje fakt (wraca dużo, powód niejednoznaczny), decyzję zostawia Tobie.",
        testWindow: "—",
        successMetric: "Return rate produktu",
        keepRule: "RR spada po Twojej zmianie → trzymaj kierunek.",
        revertRule: "RR bez zmian → przyczyna leży poza kartą produktu.",
      }
    : {
        action: copy.body,
        testWindow: "Okno obserwacji efektu: 6 tygodni. Metryka sukcesu: Procent zwrotów na tym SKU w dół – liczony na zamówieniach sprzed minimum 30 dni.",
        successMetric: "Return rate produktu (zwroty / zamówienia)",
        keepRule: "Zwroty w dół → zostaw zmianę i powtórz na kolejnym produkcie.",
        revertRule: "Zwroty bez zmian → przyczyna nie tu, sprawdź inny powód zwrotu.",
      };

  return {
    id: input.productId,
    category: "zwroty",
    title: copy.title,
    insightShort: copy.body,
    ctaLabel: CTA_BY_ACTION[verdict.action],
    primaryProduct: {
      name: input.skuName,
      sku: input.productId,
      imageSrc: opts?.imageSrc ?? "/images/products/product-1.jpg",
      category: input.subcategory ? `Buty / ${input.subcategory}` : "",
      productSlug: "",
    },
    yourResultTile: {
      label: "Twoje zwroty na tym SKU",
      value: pct(input.rr),
      sub: `${input.n} zamówień, okno ~90 dni`,
    },
    benchmarkTile: {
      label: "Benchmark konkurencji",
      value: pct(input.rrMediana),
      sub: `${input.subcategory ? `${input.subcategory} · ` : ""}${input.nPodkat} ofert · 90 dni`,
    },
    financialEffectTile: {
      label: "Wartość zwróconego towaru",
      value: zl(input.kosztZwrotow),
      sub: `${Math.round(input.rr * input.n)} zwrotów w 90 dni, liczone po cenie sprzedaży`,
    },
    contextExplanation: copy.body,
    affectedProductRows: [
      {
        name: input.skuName,
        sku: input.productId,
        productSlug: "",
        category: input.subcategory ? `Buty / ${input.subcategory}` : "",
        price: "",
        yourValue: pct(input.rr),
        benchmarkValue: pct(input.rrMediana),
        difference: `+${odchyleniePp} pp`,
      },
    ],
    actionStep,
  };
}

// Re-eksport progów dla spójności importów (np. UI pokazujące progi w sandboxie).
export { RETURNS_THRESHOLDS };
