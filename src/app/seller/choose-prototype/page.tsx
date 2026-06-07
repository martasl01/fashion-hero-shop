import Link from "next/link";

export default function ChoosePrototypePage() {
  return (
    <div className="p-8 flex flex-col gap-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-charcoal">Wybierz prototyp</h1>
        <p className="text-[13px] text-warm-gray mt-0.5">
          Wybierz wariant dashboardu, który chcesz przetestować.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/seller/one-action"
          className="flex-1 border border-charcoal rounded p-6 flex flex-col gap-2 hover:bg-charcoal hover:text-white transition-colors group"
        >
          <span className="text-[11px] font-semibold uppercase tracking-widest text-warm-gray group-hover:text-white/70">
            Wariant A
          </span>
          <span className="text-[17px] font-semibold text-charcoal group-hover:text-white">
            1 akcja na ten tydzień
          </span>
          <span className="text-[13px] text-warm-gray group-hover:text-white/70">
            Jedna konkretna akcja oparta na danych Twojego sklepu.
          </span>
        </Link>

        <Link
          href="/seller/three-actions"
          className="flex-1 bg-charcoal text-white rounded p-6 flex flex-col gap-2 hover:opacity-80 transition-opacity"
        >
          <span className="text-[11px] font-semibold uppercase tracking-widest text-white/60">
            Wariant B
          </span>
          <span className="text-[17px] font-semibold">
            3 akcje na ten tydzień
          </span>
          <span className="text-[13px] text-white/70">
            Trzy konkretne akcje oparte na danych Twojego sklepu.
          </span>
        </Link>
      </div>
    </div>
  );
}
