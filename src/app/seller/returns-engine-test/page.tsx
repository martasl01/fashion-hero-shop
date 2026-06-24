import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { ReturnsSkuInput, ReturnsRecommendation } from "@/types/seller-dashboard";
import { resolveReturnsRecommendation } from "@/lib/returns-recommendation";

// ───────────────────────────────────────────────────────────────────────────
// SANDBOX testowy silnika zwrotów (nielinkowany w nawigacji).
// 10 przypadków z silnik-bartek-engine.py (__main__) — weryfikuje, że silnik
// trafia STATUS + REASON CODE. Nie sprawdza copy (to robi builder). Gate przed
// integracją UI: musi być 10/10 zgodnych.
// ───────────────────────────────────────────────────────────────────────────

interface EngineTestCase {
  id: number;
  input: ReturnsSkuInput;
  expectedStatus: ReturnsRecommendation["status"];
  expectedReason: ReturnsRecommendation["reasonCode"];
  note: string;
}

// productId/skuName syntetyczne — silnik ich nie używa, są tylko dla kompletu typu.
function sku(partial: Omit<ReturnsSkuInput, "productId" | "skuName" | "sprzedaz30d">): ReturnsSkuInput {
  return { productId: "test", skuName: "test", sprzedaz30d: 0, ...partial };
}

const CASES: EngineTestCase[] = [
  { id: 1, input: sku({ rr: 0.34, rrMediana: 0.18, n: 80, nPodkat: 11, kosztZwrotow: 1200, powod: "rozmiar", udzialPowodu: 0.55 }), expectedStatus: "recommended", expectedReason: "zly_rozmiar", note: "REKO Zły rozmiar 📏" },
  { id: 2, input: sku({ rr: 0.31, rrMediana: 0.18, n: 70, nPodkat: 11, kosztZwrotow: 900, powod: "wyglad", udzialPowodu: 0.5 }), expectedStatus: "recommended", expectedReason: "mylacy_wyglad", note: "REKO Mylący wygląd 📷" },
  { id: 3, input: sku({ rr: 0.3, rrMediana: 0.18, n: 60, nPodkat: 11, kosztZwrotow: 800, powod: null, udzialPowodu: 0 }), expectedStatus: "recommended", expectedReason: "obserwuj", note: "REKO Obserwuj —" },
  { id: 4, input: sku({ rr: 0.85, rrMediana: 0.18, n: 62, nPodkat: 11, kosztZwrotow: 5338, powod: "jakosc", udzialPowodu: 0.3 }), expectedStatus: "recommended", expectedReason: "obserwuj", note: "REKO Obserwuj (v1: Wycofaj)" },
  { id: 5, input: sku({ rr: 0.7, rrMediana: 0.18, n: 80, nPodkat: 11, kosztZwrotow: 8000, powod: "rozmiar", udzialPowodu: 0.9 }), expectedStatus: "recommended", expectedReason: "zly_rozmiar", note: "REKO Zły rozmiar (P3 zamknięte)" },
  { id: 6, input: sku({ rr: 0.2, rrMediana: 0.18, n: 90, nPodkat: 11, kosztZwrotow: 400, powod: "rozmiar", udzialPowodu: 0.6 }), expectedStatus: "silent", expectedReason: "rr_w_normie", note: "KEEP (odchylenie 2 pp < 8 pp)" },
  { id: 7, input: sku({ rr: 0.4, rrMediana: 0.18, n: 12, nPodkat: 11, kosztZwrotow: 500, powod: "rozmiar", udzialPowodu: 0.6 }), expectedStatus: "out_of_test", expectedReason: "out_of_test", note: "POZA (n=12 < 20)" },
  { id: 8, input: sku({ rr: 0.4, rrMediana: 0.18, n: 60, nPodkat: 4, kosztZwrotow: 500, powod: "rozmiar", udzialPowodu: 0.6 }), expectedStatus: "out_of_test", expectedReason: "out_of_test", note: "POZA (n_podkat=4 < 8)" },
  { id: 9, input: sku({ rr: 1.5, rrMediana: 0.18, n: 60, nPodkat: 11, kosztZwrotow: 500, powod: "rozmiar", udzialPowodu: 0.6 }), expectedStatus: "out_of_test", expectedReason: "out_of_test", note: "POZA (rr poza [0,1] — P5)" },
  { id: 10, input: sku({ rr: 0.34, rrMediana: 0.18, n: 80, nPodkat: 11, kosztZwrotow: -500, powod: "rozmiar", udzialPowodu: 0.6 }), expectedStatus: "out_of_test", expectedReason: "out_of_test", note: "POZA (koszt ujemny — P5)" },
];

export default function ReturnsEngineTestPage() {
  const results = CASES.map((c) => {
    const verdict = resolveReturnsRecommendation(c.input);
    const pass = verdict.status === c.expectedStatus && verdict.reasonCode === c.expectedReason;
    return { ...c, verdict, pass };
  });
  const passed = results.filter((r) => r.pass).length;
  const allPass = passed === results.length;

  return (
    <div className="p-8 max-w-5xl flex flex-col gap-6">
      <Link
        href="/seller"
        className="self-start text-[13px] text-charcoal hover:opacity-70 transition-opacity flex items-center gap-1"
      >
        <ChevronLeft size={14} />
        Wróć do dashboardu
      </Link>

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-charcoal">Test silnika zwrotów (RR)</h1>
        <p className="text-[13px] text-warm-gray">
          10 przypadków ze specyfikacji (silnik-bartek-engine.py). Weryfikuje status + przyczynę.
        </p>
      </div>

      <div
        className={`self-start rounded-md px-4 py-2 text-sm font-medium ${
          allPass ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}
      >
        {passed} / {results.length} zgodnych {allPass ? "✓" : "✗"}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="text-left text-warm-gray border-b border-charcoal/15">
              <th className="py-2 pr-3 font-medium">#</th>
              <th className="py-2 pr-3 font-medium">Wejście (rr / mediana / n / nPodkat / powód / udział)</th>
              <th className="py-2 pr-3 font-medium">Oczekiwane</th>
              <th className="py-2 pr-3 font-medium">Werdykt silnika</th>
              <th className="py-2 pr-3 font-medium">✓/✗</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.id} className="border-b border-charcoal/10 align-top">
                <td className="py-2 pr-3 text-charcoal">{r.id}</td>
                <td className="py-2 pr-3 text-charcoal/80 tabular-nums">
                  {r.input.rr} / {r.input.rrMediana} / {r.input.n} / {r.input.nPodkat} / {r.input.powod ?? "—"} / {r.input.udzialPowodu}
                </td>
                <td className="py-2 pr-3 text-charcoal/80">{r.note}</td>
                <td className="py-2 pr-3 text-charcoal/80">
                  {r.verdict.status} · {r.verdict.reasonCode}
                  {r.verdict.note ? ` · ${r.verdict.note}` : ""}
                </td>
                <td className={`py-2 pr-3 font-semibold ${r.pass ? "text-green-700" : "text-red-700"}`}>
                  {r.pass ? "✓" : "✗"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
