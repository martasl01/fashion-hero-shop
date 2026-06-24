import type {
  ReasonDrivenAction,
  ReturnReason,
  ReturnReasonSample,
  ReturnReasonsData,
  SizeBreakdown,
} from "@/types/seller-dashboard";

// Reguły prezentacji karty „Dlaczego ten produkt wraca" (prototyp WoZ — progi,
// nie logika bazodanowa). Trzymane jako stałe, nie magic numbers w komponentach.
export const RETURN_REASON_THRESHOLDS = {
  MIN_RETURNS_WITH_REASON: 15, // poniżej → tryb diagnostyczny (za mała próbka)
  MIN_TOP_SHARE_PCT: 35, // brak powodu z udziałem ≥35% → tryb diagnostyczny
  SIZE_HIGH_RR_PCT: 30, // RR per rozmiar powyżej tej wartości → oznacz na czerwono
} as const;

export interface SizeComparison {
  highSizes: string[]; // rozmiary z wysokim RR (np. ["S", "M"])
  lowSizes: string[]; // rozmiary w normie (np. ["L", "XL"])
  multiple: number; // ile razy częściej wracają high niż low (zaokrąglone)
}

export interface ReasonResolution {
  mode: "actionable" | "diagnostic";
  topReason: ReturnReason | null;
  reasons: ReturnReason[]; // top 1–2 do renderu
  action: ReasonDrivenAction;
  meaning: string; // „Co to znaczy" wyprowadzone z top powodu (puste w trybie diagnostycznym)
  showSizeBreakdown: boolean; // tylko gdy actionable && powód = rozmiar && są dane rozmiarowe
  sizeBreakdown?: SizeBreakdown; // wiersze posortowane po RR, oznaczone high
  sizeComparison?: SizeComparison; // wyliczone porównanie high vs low (do linii diagnozy)
  sample: ReturnReasonSample;
}

const DIAGNOSTIC_ACTION: ReasonDrivenAction = {
  kind: "diagnostic",
  title: "Nie wiemy jeszcze, dlaczego ten produkt wraca",
  insight:
    "Za mało zwrotów z podanym powodem, żeby wskazać kierunek. Zbierz powód zwrotu, zanim zmienisz kartę — inaczej zgadujesz.",
  ctaLabel: "Włącz ankietę pozwrotową",
  wozEvent: "woz_diagnostic_survey_click",
};

// Mapowanie top powodu na akcję. Każda gałąź ma własną, konkretną mikrokopię.
// jakość → QC, NIGDY edycja karty; zmiana decyzji → brak akcji naprawczej.
function actionForReason(top: ReturnReason): ReasonDrivenAction {
  switch (top.code) {
    case "rozmiar":
      return {
        kind: "fix_size_table",
        title: "Popraw tabelę rozmiarów",
        insight:
          “Realne wymiary wkładki per rozmiar, w cm. Zmierz fizycznie długość wewnętrzną każdego numeru i wstaw tabelę. Dla butów to jedyny wiarygodny sygnał — numer 38 znaczy co innego u każdego producenta.”,
        quote: “Wyraźna adnotacja o pasowaniu, na górze opisu, nie zakopana: „Model ma zaniżoną rozmiarówkę — zalecamy zamówienie o pół/jeden numer większy.” Najtańsza zmiana o największym wpływie.”,
        ctaLabel: "Popraw tabelę rozmiarów",
        wozEvent: "woz_fix_size_table_click",
      };
    case "jakosc":
      return {
        kind: "qc_batch",
        title: "Zgłoś partię do kontroli jakości",
        insight:
          "Produkt wraca głównie z powodu jakości wykonania. To nie kwestia karty produktu — zgłoś partię do QC.",
        ctaLabel: "Zgłoś partię do QC",
        wozEvent: "woz_qc_report_click",
      };
    case "kolor":
    case "niezgodnosc_z_opisem":
      return {
        kind: "fix_listing",
        title: "Popraw opis i zdjęcia",
        insight:
          "Kupujący dostają coś innego, niż się spodziewali. Popraw opis i zdjęcia, żeby karta odpowiadała realnemu produktowi.",
        ctaLabel: "Popraw opis i zdjęcia",
        wozEvent: "woz_fix_listing_click",
      };
    case "zmiana_decyzji":
      return {
        kind: "no_fix",
        title: "To naturalne zwroty — nie ma co naprawiać",
        insight:
          "Produkt wraca głównie ze zmiany decyzji kupującego, nie z wady karty czy produktu. Zmiana karty nie obniży tych zwrotów.",
      };
    case "logistyka":
    case "inne":
    default:
      // Brak sensownej akcji naprawczej na karcie — degraduj do diagnostyki.
      return DIAGNOSTIC_ACTION;
  }
}

// Wyprowadza z surowych danych powodów: top powód, tryb (akcyjny / diagnostyczny),
// akcję dopasowaną do powodu oraz czy renderować drill-down rozmiaru.
export function resolveReturnReasons(data: ReturnReasonsData): ReasonResolution {
  const reasons = [...data.reasons].sort((a, b) => b.sharePct - a.sharePct);
  const top = reasons[0] ?? null;

  const belowSampleThreshold =
    data.sample.returnsWithReason < RETURN_REASON_THRESHOLDS.MIN_RETURNS_WITH_REASON;
  const noDominantReason = !top || top.sharePct < RETURN_REASON_THRESHOLDS.MIN_TOP_SHARE_PCT;

  if (belowSampleThreshold || noDominantReason) {
    return {
      mode: "diagnostic",
      topReason: top,
      reasons: reasons.slice(0, 2),
      action: DIAGNOSTIC_ACTION,
      meaning: "",
      showSizeBreakdown: false,
      sample: data.sample,
    };
  }

  const action = actionForReason(top);
  const showSizeBreakdown =
    action.kind === "fix_size_table" && top.code === "rozmiar" && !!data.sizeBreakdown;

  let sizeBreakdown: SizeBreakdown | undefined;
  let sizeComparison: SizeComparison | undefined;
  if (showSizeBreakdown && data.sizeBreakdown) {
    const rows = [...data.sizeBreakdown.rows]
      .sort((a, b) => b.ratePct - a.ratePct) // po RR per rozmiar, NIE po liczbie zwrotów
      .map((row) => ({ ...row, high: row.ratePct > RETURN_REASON_THRESHOLDS.SIZE_HIGH_RR_PCT }));
    sizeBreakdown = { ...data.sizeBreakdown, rows };

    const high = rows.filter((r) => r.high);
    const low = rows.filter((r) => !r.high);
    if (high.length && low.length) {
      sizeComparison = {
        highSizes: high.map((r) => r.size),
        lowSizes: low.map((r) => r.size),
        multiple: Math.round(avg(high.map((r) => r.ratePct)) / avg(low.map((r) => r.ratePct))),
      };
    }
  }

  return {
    mode: "actionable",
    topReason: top,
    reasons: reasons.slice(0, 2),
    action,
    meaning: meaningForReason(top, sizeComparison?.highSizes ?? []),
    showSizeBreakdown,
    sizeBreakdown,
    sizeComparison,
    sample: data.sample,
  };
}

// „Co to znaczy" wyprowadzone z top powodu. Dla rozmiaru wplata listę rozmiarów high.
function meaningForReason(top: ReturnReason, highSizes: string[]): string {
  switch (top.code) {
    case "rozmiar": {
      const where = highSizes.length ? `, przede wszystkim w ${joinPl(highSizes)}` : "";
      return `Produkt wraca głównie z powodu rozmiaru${where}. Kupujący biorą swój zwykły rozmiar i dostają za mały. To luka do naprawienia, nie cecha produktu.`;
    }
    case "jakosc":
      return "Produkt wraca głównie z powodu jakości wykonania. To sygnał o partii albo samym produkcie, nie o karcie — dlatego kierujemy Cię do kontroli jakości, a nie do edycji opisu.";
    case "kolor":
    case "niezgodnosc_z_opisem":
      return "Produkt wraca, bo kupujący dostają coś innego, niż pokazuje karta. To luka w opisie i zdjęciach, nie wada produktu.";
    case "zmiana_decyzji":
      return "Produkt wraca głównie ze zmiany decyzji kupującego. To naturalne zwroty — zmiana karty ich nie obniży.";
    default:
      return "";
  }
}

function avg(nums: number[]): number {
  return nums.reduce((sum, n) => sum + n, 0) / nums.length;
}

// Linia źródła pod rozbiciem powodów.
// np. „Na podstawie 50 zwrotów z 90 dni. Powód z komentarzy kupujących na FashionHero (klasyfikacja automatyczna)."
export function formatReasonSample(sample: ReturnReasonSample): string {
  const { totalReturns, windowDays = 90, sourceLabel } = sample;
  return `Na podstawie ${totalReturns} ${pluralizeReturns(
    totalReturns
  )} z ${windowDays} dni. Powód z ${sourceLabel}.`;
}

// Linia źródła pod rozbiciem rozmiarów (inny kontekst niż powody — RR per rozmiar).
// np. „Na podstawie sprzedaży per rozmiar i 29 z 50 zwrotów z powodem «rozmiar», 90 dni."
export function formatSizeSampleNote(sample: ReturnReasonSample): string {
  const { windowDays = 90, sourceLabel } = sample;
  return `Na podstawie ${sourceLabel}, ${windowDays} dni.`;
}

// „41% (12/29)"
export function formatSizeRate(row: { ratePct: number; returns: number; sold: number }): string {
  return `${row.ratePct}% (${row.returns}/${row.sold})`;
}

// Złączenie listy po polsku: ["S","M"] → „S i M"; ["S","M","L"] → „S, M i L".
export function joinPl(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} i ${items[items.length - 1]}`;
}

// Odmiana „zwrot" po liczbie (PL): 1 → zwrocie, 2-4 → zwrotach, 5+ → zwrotach.
function pluralizeReturns(n: number): string {
  return n === 1 ? "zwrot" : "zwrotów";
}
