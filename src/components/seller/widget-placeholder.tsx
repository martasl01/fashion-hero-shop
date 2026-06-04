export function WidgetPlaceholder() {
  return (
    <div className="border-2 border-dashed border-black/20 rounded p-6 bg-cream-light">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] font-semibold uppercase tracking-widest bg-charcoal text-white px-2 py-0.5 rounded">
          Wkrótce
        </span>
        <span className="text-[12px] font-medium text-charcoal uppercase tracking-wide">
          Trzy akcje na ten tydzień
        </span>
      </div>
      <p className="text-[13px] text-warm-gray">
        Konkretne rekomendacje sprzedażowe pojawią się tutaj wkrótce.
      </p>
    </div>
  );
}
