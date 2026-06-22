import type {
  PricingDirection,
  PricingReasonCode,
  PricingSkuInput,
} from "@/types/seller-dashboard";
import { resolvePricingRecommendation } from "@/lib/pricing-recommendation";

// Strona-piaskownica (nielinkowana w nawigacji). Weryfikuje, że silnik (wariant A)
// daje na 7 przykładach ze speca dokładnie oczekiwaną przyczynę i kierunek.
// Cel testu nr 2: „czy silnik trafnie typuje przyczynę i kierunek".

interface EngineTestCase {
  id: number;
  input: PricingSkuInput;
  expectedReason: PricingReasonCode;
  expectedDirection: PricingDirection;
  note: string;
}

// 7 przykładów z tabeli „Przykłady testowe" speca (wariant A — wszystkie przechodzą).
const CASES: EngineTestCase[] = [
  {
    id: 1,
    input: { productId: "t1", cena: 189, mediana: 215, n: 14, pozycja: 0.1, dniOdZmiany: 420, ruchMedianyPct: 9, popytWysoki: false, zalega: false },
    expectedReason: "forgotten_price",
    expectedDirection: "raise",
    note: "stoi 420 dni, rynek +9%, najtańsza",
  },
  {
    id: 2,
    input: { productId: "t2", cena: 189, mediana: 215, n: 14, pozycja: 0.15, dniOdZmiany: 60, ruchMedianyPct: 1, popytWysoki: true, zalega: false },
    expectedReason: "demand",
    expectedDirection: "raise",
    note: "taniej + wysoki popyt",
  },
  {
    id: 3,
    input: { productId: "t3", cena: 260, mediana: 215, n: 14, pozycja: 0.9, dniOdZmiany: 300, ruchMedianyPct: 0, popytWysoki: false, zalega: true },
    expectedReason: "too_expensive",
    expectedDirection: "lower",
    note: "drożej + zalega",
  },
  {
    id: 4,
    input: { productId: "t4", cena: 189, mediana: 215, n: 14, pozycja: 0.5, dniOdZmiany: 7, ruchMedianyPct: 9, popytWysoki: false, zalega: false },
    expectedReason: "deliberate",
    expectedDirection: "hold",
    note: "świeża cena (7 dni)",
  },
  {
    id: 5,
    input: { productId: "t5", cena: 189, mediana: 215, n: 14, pozycja: 0.12, dniOdZmiany: 200, ruchMedianyPct: 2, popytWysoki: false, zalega: false },
    expectedReason: "no_evidence",
    expectedDirection: "hold",
    note: "taniej, ale rynek +2% (nie odjechał)",
  },
  {
    id: 6,
    input: { productId: "t6", cena: 205, mediana: 215, n: 14, pozycja: 0.4, dniOdZmiany: 400, ruchMedianyPct: 9, popytWysoki: false, zalega: false },
    expectedReason: "out_of_test",
    expectedDirection: "hold",
    note: "odchylenie 4,6% < 8%",
  },
  {
    id: 7,
    input: { productId: "t7", cena: 150, mediana: 215, n: 3, pozycja: 0.1, dniOdZmiany: 400, ruchMedianyPct: 9, popytWysoki: false, zalega: false },
    expectedReason: "out_of_test",
    expectedDirection: "hold",
    note: "n = 3 < 5",
  },
];

const reasonLabels: Record<PricingReasonCode, string> = {
  forgotten_price: "Zapomniana cena",
  demand: "Popyt / wyprzedaż",
  too_expensive: "Za drogo",
  deliberate: "Świadomy wybór",
  no_evidence: "Brak dowodu",
  out_of_test: "Poza testem",
};

const directionSymbol: Record<PricingDirection, string> = {
  raise: "⬆",
  lower: "⬇",
  hold: "—",
};

function formatExpected(c: EngineTestCase): string {
  if (c.expectedReason === "out_of_test") return "Poza testem";
  return `${reasonLabels[c.expectedReason]} ${directionSymbol[c.expectedDirection]}`;
}

export default function PricingEngineTestPage() {
  const results = CASES.map((c) => {
    const rec = resolvePricingRecommendation(c.input);
    const match =
      rec.reasonCode === c.expectedReason && rec.direction === c.expectedDirection;
    return { c, rec, match };
  });

  const passed = results.filter((r) => r.match).length;
  const allPass = passed === results.length;

  return (
    <div className="p-8 flex flex-col gap-6 max-w-5xl">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[22px] font-semibold text-charcoal">
          Silnik rekomendacji cenowej — weryfikacja (wariant A)
        </h1>
        <p className="text-[13px] text-warm-gray max-w-[70ch]">
          7 przykładów testowych ze specyfikacji. Silnik powinien trafić każdą
          przyczynę i kierunek. Strona pomocnicza — nie jest linkowana w panelu.
        </p>
        <span
          className={
            "text-[14px] font-semibold mt-1 " +
            (allPass ? "text-green-700" : "text-red-600")
          }
        >
          {passed} / {results.length} zgodnych {allPass ? "✓" : "✗"}
        </span>
      </div>

      <div className="border border-black/10 rounded overflow-hidden bg-cream-light">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-black/10">
              <th className="text-left px-4 py-3 font-medium text-warm-gray uppercase tracking-wide text-[11px] w-10">#</th>
              <th className="text-left px-4 py-3 font-medium text-warm-gray uppercase tracking-wide text-[11px]">Wejście (skrót)</th>
              <th className="text-left px-4 py-3 font-medium text-warm-gray uppercase tracking-wide text-[11px]">Oczekiwane</th>
              <th className="text-left px-4 py-3 font-medium text-warm-gray uppercase tracking-wide text-[11px]">Werdykt silnika</th>
              <th className="text-left px-4 py-3 font-medium text-warm-gray uppercase tracking-wide text-[11px] w-12">✓/✗</th>
            </tr>
          </thead>
          <tbody>
            {results.map(({ c, rec, match }) => (
              <tr
                key={c.id}
                className="border-b border-black/10 last:border-b-0 align-top"
              >
                <td className="px-4 py-3 text-charcoal font-medium">{c.id}</td>
                <td className="px-4 py-3 text-warm-gray">
                  cena {c.input.cena} · mediana {c.input.mediana} · n {c.input.n} · poz{" "}
                  {c.input.pozycja.toFixed(2)} · {c.input.dniOdZmiany} dni · rynek{" "}
                  {c.input.ruchMedianyPct}%
                  {c.input.popytWysoki ? " · popyt" : ""}
                  {c.input.zalega ? " · zalega" : ""}
                  <span className="block text-warm-gray/70 text-[12px]">{c.note}</span>
                </td>
                <td className="px-4 py-3 text-charcoal">{formatExpected(c)}</td>
                <td className="px-4 py-3 text-charcoal">
                  {rec.status === "excluded"
                    ? "Poza testem"
                    : `${reasonLabels[rec.reasonCode]} ${directionSymbol[rec.direction]}`}
                </td>
                <td
                  className={
                    "px-4 py-3 font-semibold " +
                    (match ? "text-green-700" : "text-red-600")
                  }
                >
                  {match ? "✓" : "✗"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
