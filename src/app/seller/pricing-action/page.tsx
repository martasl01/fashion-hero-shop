import Link from "next/link";
import { ChevronLeft, Check, RotateCcw } from "lucide-react";
import { cennikRecommendation, dorotaProductRows } from "@/data/seller-dashboard";
import { DOROTA_CENNIK_ACTIONS, DOROTA_CENNIK_INTRO } from "@/data/seller-actions";
import { ActionPageShell } from "@/components/seller/action-page-shell";
import { PricingProductsTable } from "@/components/seller/pricing-products-table";
import { CheckboxActions } from "@/components/seller/checkbox-actions";
import { stateKeyForSku } from "@/lib/action-state-key";

export default function PricingActionPage() {
  const rec = cennikRecommendation;

  if (!rec) {
    return (
      <div className="p-8 max-w-5xl flex flex-col gap-6">
        <Link
          href="/seller"
          className="self-start text-[13px] text-charcoal hover:opacity-70 transition-opacity flex items-center gap-1"
        >
          <ChevronLeft size={14} />
          Wróć do dashboardu
        </Link>
        <p className="text-[14px] text-warm-gray">
          Wszystkie Twoje ceny są w normie podkategorii — brak rekomendacji na ten tydzień.
        </p>
      </div>
    );
  }

  const product = rec.primaryProduct;
  const stateKey = stateKeyForSku(product.sku);
  const tableRows = dorotaProductRows.filter((r) => r.sku === product.sku);

  return (
    <ActionPageShell
      categoryLabel="cennik"
      title={rec.title}
      product={product}
      surveyVariant="dorota"
      metrics={[
        { id: "result", label: rec.yourResultTile.label, value: rec.yourResultTile.value, sub: rec.yourResultTile.sub },
        { id: "benchmark", label: rec.benchmarkTile.label, value: rec.benchmarkTile.value, sub: rec.benchmarkTile.sub, sample: rec.benchmarkTile.sample },
        { id: "demand", label: rec.financialEffectTile.label, value: rec.financialEffectTile.value, sub: rec.financialEffectTile.sub },
      ]}
    >
      {/* Opis problemu — osobny background */}
      <section className="flex flex-col gap-4">
        <h2 className="text-[17px] font-semibold text-charcoal">Opis problemu</h2>
        <div className="border border-black/10 rounded-xl p-6 bg-cream-light flex flex-col gap-3">
          <p className="text-[14px] text-charcoal leading-relaxed max-w-prose">
            Twoja cena jest o −12% poniżej mediany podkategorii (189 zł vs 215 zł). Pozycja w rozkładzie: w dolnej części stawki – produkt jest tańszy niż większość porównywalnych ofert.
          </p>
          <p className="text-[13px] text-warm-gray leading-relaxed max-w-prose">
            Na podstawie 14 ofert porównawczych z 90 dni w podkategorii Buty / Klapki.
          </p>
        </div>
      </section>

      {/* Co to znaczy — osobny background */}
      <section className="flex flex-col gap-4">
        <h2 className="text-[17px] font-semibold text-charcoal">Co to znaczy</h2>
        <div className="border border-black/10 rounded-xl p-6 bg-cream-light">
          <p className="text-[14px] text-charcoal leading-relaxed max-w-prose">
            {`Ten produkt wygląda na „tańszy" w kontekście kategorii. To może być świadomy wybór cenowy albo niezamierzona luka — cena ustawiona kiedyś i nieaktualizowana od 14 miesięcy, podczas gdy podkategoria w tym czasie podrożała o ~9%. Popyt jest stabilny (18 szt./30 dni), więc nie kupują „dlatego, że tanio" — sprzedałabyś podobnie przy cenie bliższej rynkowi, a różnica zostaje na stole jako utracona marża.`}
          </p>
        </div>
      </section>

      {/* Co możesz zrobić + tabela SKU — jeden card */}
      <section className="flex flex-col gap-4">
        <h2 className="text-[17px] font-semibold text-charcoal">Co możesz zrobić</h2>
        <div className="border border-black/10 rounded-xl overflow-hidden bg-cream-light">
          <CheckboxActions
            actions={DOROTA_CENNIK_ACTIONS}
            stateKey={stateKey}
            intro={DOROTA_CENNIK_INTRO}
            sku={product.sku}
            source="pricing-action"
          />
          <div className="border-t border-black/10">
            <PricingProductsTable rows={tableRows} embedded />
          </div>
        </div>
      </section>

      {/* Jak sprawdzić zmianę */}
      <section className="flex flex-col gap-4">
        <h2 className="text-[17px] font-semibold text-charcoal">Jak sprawdzić zmianę</h2>
        <div className="border border-black/10 rounded-xl overflow-hidden bg-cream-light">
          <div className="p-5">
            <p className="text-[14px] text-charcoal leading-relaxed">
              Okno obserwacji efektu: <span className="font-semibold">{rec.actionStep.testWindow}</span>
            </p>
            <p className="text-[14px] text-charcoal leading-relaxed mt-1">
              Metryka sukcesu: {rec.actionStep.successMetric}
            </p>
          </div>
          <div className="border-t border-black/10" />
          <div className="p-5 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-warm-gray flex items-center gap-1">
                <Check size={10} />
                Zostaw
              </span>
              <p className="text-[14px] text-charcoal leading-relaxed">{rec.actionStep.keepRule}</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-warm-gray flex items-center gap-1">
                <RotateCcw size={10} />
                Wycofaj
              </span>
              <p className="text-[14px] text-charcoal leading-relaxed">{rec.actionStep.revertRule}</p>
            </div>
          </div>
        </div>
      </section>
    </ActionPageShell>
  );
}
