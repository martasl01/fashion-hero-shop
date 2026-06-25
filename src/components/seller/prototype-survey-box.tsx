"use client";
import Link from "next/link";
import { FlaskConical, ArrowRight } from "lucide-react";
import { usePostHog } from "posthog-js/react";

interface PrototypeSurveyBoxProps {
  wariant: "bartek" | "dorota";
}

export function PrototypeSurveyBox({ wariant }: PrototypeSurveyBoxProps) {
  const posthog = usePostHog();

  const handleClick = () => {
    posthog?.capture("woz_survey_click", { wariant, source: "recommendation-card" });
  };

  return (
    <div className="flex flex-col gap-3 border border-dashed border-black/25 rounded-xl bg-cream p-5">
      <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-warm-gray">
        <FlaskConical size={13} />
        Tylko na potrzeby prototypu kursowego
      </span>
      <p className="text-[13px] text-warm-gray leading-relaxed max-w-[65ch]">
        Ten element nie będzie widoczny dla sprzedawcy w wersji docelowej. Służy wyłącznie temu,
        żeby w prototypie dotrzeć do ankiety, którą wyświetlimy sprzedawcom po zakończonym teście.
      </p>
      <Link
        href={`/seller/ankieta?wariant=${wariant}`}
        onClick={handleClick}
        className="self-start flex items-center gap-1.5 bg-charcoal text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-charcoal-light transition-colors"
      >
        Zobacz ankietę
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}
