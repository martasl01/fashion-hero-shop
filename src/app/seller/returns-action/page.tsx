import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Check } from "lucide-react";
import { returnsRecommendation, bartekProductRow } from "@/data/seller-dashboard";
import { bartekReasonsByProductId } from "@/data/mock-sku-sales";
import { MetricTile } from "@/components/seller/metric-tile";
import { ReturnReasonsBlock } from "@/components/seller/return-reasons-block";
import { ReasonDrivenAction } from "@/components/seller/reason-driven-action";
import { ReturnsProductsTable } from "@/components/seller/returns-products-table";
import { resolveReturnReasons } from "@/lib/return-reasons";
import { PrototypeSurveyBox } from "@/components/seller/prototype-survey-box";
import { CheckboxActions, type CheckboxAction } from "@/components/seller/checkbox-actions";
import { stateKeyForSku } from "@/lib/action-state-key";

// Formatka Bartek — 3 akcje do checkboxów (rozmiar jako dominujący powód zwrotu)
const BARTEK_ROZMIAR_ACTIONS: CheckboxAction[] = [
  {
    id: "wskazowka",
    label: "Dodaj wskazówkę o rozmiarze",
    description:
      `Jeśli ten model ma niestandardową rozmiarówkę, dodaj prosty komunikat na karcie produktu. Przykłady: „Wskazówka: Wybierz rozmiar większy niż zwykle"; „Wybierz rozmiar o jeden mniejszy niż zwykle".`,
  },
  {
    id: "wkladka",
    label: "Podaj długość wkładki w centymetrach",
    description:
      `Zmierz wkładkę i uzupełnij dokładne wymiary dla dostępnych rozmiarów. To najprostszy sposób, żeby kupujący mogli porównać buty ze swoją stopą albo parą, którą już noszą. Przykład: „Rozmiar 38: długość wkładki 24,5 cm".`,
  },
  {
    id: "dopasowanie",
    label: "Dodaj informację o dopasowaniu buta",
    description:
      `Napisz, czy model jest raczej wąski, szeroki czy standardowy. Przykłady: „Model dobrze sprawdzi się przy szerszej stopie." / „Model dobrze sprawdzi się przy węższej stopie."`,
  },
];

const BARTEK_ROZMIAR_INTRO =
  "Ten produkt wraca z powodu rozmiaru. Możesz zmniejszyć ryzyko zwrotu, dodając kupującym więcej informacji o dopasowaniu. Zacznij od jednej rzeczy – nawet krótka wskazówka może pomóc wybrać właściwy rozmiar.";

export default function ReturnsActionPage() {
  const rec = returnsRecommendation;

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
          Wszystkie Twoje produkty mają zwroty w normie podkategorii — brak rekomendacji na ten tydzień.
        </p>
      </div>
    );
  }

  const product = rec.primaryProduct;
  const reasonsData = bartekReasonsByProductId[product.sku];
  const resolution = reasonsData ? resolveReturnReasons(reasonsData) : null;
  const productRow = bartekProductRow ?? {
    name: product.name,
    sku: product.sku,
    imageSrc: product.imageSrc,
    yourValue: rec.yourResultTile.value,
    benchmarkValue: rec.benchmarkTile.value,
    difference: rec.affectedProductRows[0]?.difference ?? "",
    returnsCount: 0,
    cena: 0,
    popyt: 0,
    popytTrend: "stable" as const,
  };

  const isRozmiarCase =
    resolution?.mode === "actionable" && resolution.topReason?.code === "rozmiar";
  const stateKey = stateKeyForSku(product.sku);

  return (
    <div className="p-8 max-w-5xl flex flex-col gap-10">
      {/* Wróć */}
      <Link
        href="/seller"
        className="self-start text-[13px] text-charcoal hover:opacity-70 transition-opacity flex items-center gap-1"
      >
        <ChevronLeft size={14} />
        Wróć do dashboardu
      </Link>

      {/* Kategoria + h1 + tożsamość produktu */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <span className="self-start text-[10px] font-semibold uppercase tracking-widest text-warm-gray border border-black/10 rounded px-2 py-1 bg-cream-light">
            zwroty
          </span>
          <h1 className="text-[28px] font-semibold text-charcoal leading-snug">{rec.title}</h1>
        </div>
        <div className="flex items-center gap-3.5">
          <Image
            src={product.imageSrc}
            alt={product.name}
            width={56}
            height={56}
            className="rounded-md object-cover flex-shrink-0"
          />
          <div className="flex flex-col gap-0.5">
            <span className="text-[16px] font-semibold text-charcoal">{product.name}</span>
            <div className="flex items-center gap-2 text-[13px] text-warm-gray">
              <span>SKU: {product.sku}</span>
              {product.category && (
                <>
                  <span className="text-black/20">·</span>
                  <span>{product.category}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Co mówią liczby */}
      <section className="flex flex-col gap-4">
        <h2 className="text-[17px] font-semibold text-charcoal">Co mówią liczby</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricTile metric={{ id: "result", label: rec.yourResultTile.label, value: rec.yourResultTile.value, sub: rec.yourResultTile.sub }} />
          <MetricTile metric={{ id: "benchmark", label: rec.benchmarkTile.label, value: rec.benchmarkTile.value, sub: rec.benchmarkTile.sub, sample: rec.benchmarkTile.sample }} />
          <MetricTile metric={{ id: "cost", label: rec.financialEffectTile.label, value: rec.financialEffectTile.value, sub: rec.financialEffectTile.sub }} />
        </div>
      </section>

      {/* Dlaczego ten produkt wraca — osobny background */}
      {resolution?.mode === "actionable" && (
        <div className="border border-black/10 rounded-xl p-6 bg-cream-light">
          <ReturnReasonsBlock reasons={resolution.reasons} sample={resolution.sample} />
        </div>
      )}

      {/* Co to znaczy — osobny background */}
      {isRozmiarCase ? (
        <section className="flex flex-col gap-4">
          <h2 className="text-[17px] font-semibold text-charcoal">Co to znaczy</h2>
          <div className="border border-black/10 rounded-xl p-6 bg-cream-light flex flex-col gap-4">
            <p className="text-[14px] text-charcoal leading-relaxed max-w-prose">
              Ten produkt wraca głównie z powodu niedopasowania rozmiaru. Kupujący biorą swój zwykły rozmiar i dostają za mały lub za duży.
            </p>
            <p className="text-[14px] text-charcoal leading-relaxed max-w-prose">
              Przesyłki zwrotne pokrywa FashionHero, ale każdy zwrot generuje też Twoje straty poprzez:
            </p>
            <ul className="flex flex-col gap-1.5 pl-1">
              {[
                "czas obsługi paczek",
                "koszt opakowań do przepakowania",
                "zamrożony kapitał w krążącym towarze",
                "ryzyko uszkodzenia produktu",
                "spadek w algorytmach – gorsza pozycja oferty w wyszukiwarce platformy",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-[14px] text-charcoal leading-relaxed">
                  <span className="mt-2 w-1 h-1 rounded-full bg-charcoal flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : resolution?.meaning ? (
        <section className="flex flex-col gap-4">
          <h2 className="text-[17px] font-semibold text-charcoal">Co to znaczy</h2>
          <div className="border border-black/10 rounded-xl p-6 bg-cream-light">
            <p className="text-[14px] text-charcoal leading-relaxed max-w-prose">{resolution.meaning}</p>
          </div>
        </section>
      ) : (
        <section className="flex flex-col gap-4">
          <h2 className="text-[17px] font-semibold text-charcoal">Co to znaczy</h2>
          <div className="border border-black/10 rounded-xl p-6 bg-cream-light">
            <p className="text-[14px] text-charcoal leading-relaxed max-w-prose">{rec.contextExplanation}</p>
          </div>
        </section>
      )}

      {/* Co możesz zrobić + tabela SKU — jeden card */}
      <section className="flex flex-col gap-4">
        <h2 className="text-[17px] font-semibold text-charcoal">Co możesz zrobić</h2>
        <div className="border border-black/10 rounded-xl overflow-hidden bg-cream-light">
          {isRozmiarCase ? (
            <CheckboxActions
              actions={BARTEK_ROZMIAR_ACTIONS}
              stateKey={stateKey}
              intro={BARTEK_ROZMIAR_INTRO}
              sku={product.sku}
            />
          ) : (
            resolution && (
              <div className="p-6">
                <ReasonDrivenAction action={resolution.action} product={productRow} hideProductCard />
              </div>
            )
          )}
          <div className="border-t border-black/10">
            <ReturnsProductsTable rows={[productRow]} />
          </div>
        </div>
      </section>

      {/* Jak sprawdzić zmianę */}
      <section className="flex flex-col gap-4">
        <h2 className="text-[17px] font-semibold text-charcoal">Jak sprawdzić zmianę</h2>
        <div className="border border-black/10 rounded-xl overflow-hidden bg-cream-light">
          <div className="p-5">
            <p className="text-[14px] text-charcoal leading-relaxed">{rec.actionStep.testWindow}</p>
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
                <span className="text-[10px]">↺</span>
                Szukaj innej przyczyny
              </span>
              <p className="text-[14px] text-charcoal leading-relaxed">{rec.actionStep.revertRule}</p>
            </div>
          </div>
        </div>
      </section>

      <PrototypeSurveyBox wariant="bartek" />
    </div>
  );
}
