"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, CheckCircle } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { cn } from "@/lib/utils";

type Path = "A" | "B" | "C";

interface SurveyFormProps {
  wariant: "bartek" | "dorota";
}

// Skala 1–5 (wzorzec jak size-selector: useState + grid przycisków).
function ScaleInput({
  value,
  onChange,
  lowLabel,
  highLabel,
}: {
  value: number | null;
  onChange: (v: number) => void;
  lowLabel: string;
  highLabel: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="grid grid-cols-5 gap-2 max-w-[320px]">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={cn(
              "h-10 rounded-lg border text-[14px] font-semibold transition-colors",
              value === n
                ? "border-charcoal bg-charcoal text-white"
                : "border-black/15 bg-cream-light text-charcoal hover:border-charcoal",
            )}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between max-w-[320px] text-[11px] text-warm-gray">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}

// Wspólny layout pojedynczego pytania.
function Question({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-[14px] font-medium text-charcoal leading-relaxed">{label}</p>
      {children}
    </div>
  );
}

function OpenField({ label, placeholder }: { label?: string; placeholder?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="text-[13px] font-medium text-charcoal leading-relaxed">{label}</span>}
      <textarea
        placeholder={placeholder ?? "Twoja odpowiedź"}
        rows={2}
        className="w-full rounded-lg border border-black/15 bg-cream-light p-3 text-[13px] text-charcoal placeholder:text-warm-gray/70 focus:border-charcoal focus:outline-none resize-y"
      />
    </div>
  );
}

const Q0_OPTIONS: { label: string; path: Path }[] = [
  { label: "Otworzyłem/am kartę i wprowadziłem/am zmianę, którą sugerowała", path: "A" },
  { label: "Otworzyłem/am kartę, ale nie wprowadziłem/am zmiany", path: "B" },
  { label: "W zasadzie nie wchodziłem/am w tę kartę", path: "C" },
  { label: "Nie pamiętam / nie zauważyłem/am żadnej takiej karty", path: "C" },
];

const M3_AXES: { key: string; label: string }[] = [
  { key: "zrozumienie", label: "Zrozumienie — „Rozumiem, co ta rekomendacja mi proponuje i dlaczego.”" },
  { key: "trafnosc", label: "Trafność / dotyczy mnie — „Ta rekomendacja odnosi się do mojego realnego problemu.”" },
  { key: "zaufanie", label: "Zaufanie — „Ufam tej rekomendacji na tyle, żeby ją wykonać.”" },
  { key: "latwosc", label: "Łatwość wdrożenia — „Wiem, jak wykonać tę poradę, i jest to dla mnie proste.”" },
];

export function SurveyForm({ wariant }: SurveyFormProps) {
  const posthog = usePostHog();
  const [q0Index, setQ0Index] = useState<number | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const path: Path | null = q0Index === null ? null : Q0_OPTIONS[q0Index].path;

  // Routing renderowania po konkretnej opcji Q0 (nie po ścieżce — dwie opcje C różnią się):
  // 0/1 → A/B (pełny zestaw), 2 → „nie wchodziłem" (tylko diagnoza non-klikalności),
  // 3 → „nie pamiętam/nie zauważyłem" (nic poza submitem).
  const showAB = q0Index === 0 || q0Index === 1;
  const showWhyNotClicked = q0Index === 2;

  const setScore = (key: string) => (v: number) =>
    setScores((prev) => ({ ...prev, [key]: v }));

  const handleSubmit = () => {
    posthog?.capture("woz_survey_submitted", { wariant, path });
    setSubmitted(true);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (submitted) {
    return (
      <div className="p-8 max-w-3xl flex flex-col gap-6">
        <div className="flex flex-col gap-3 border border-black/10 rounded-xl bg-cream-light p-8 items-start">
          <CheckCircle size={28} className="text-charcoal" />
          <h1 className="text-[24px] font-semibold text-charcoal leading-snug">Dziękujemy!</h1>
          <p className="text-[14px] text-warm-gray leading-relaxed max-w-[60ch]">
            Twoje odpowiedzi zostały zapisane. To dla nas najcenniejszy sygnał, żeby dopracować
            „Akcję na ten tydzień” pod realne potrzeby sprzedawców.
          </p>
          <Link
            href="/seller"
            className="self-start text-[13px] font-semibold text-charcoal underline underline-offset-2 hover:opacity-70 transition-opacity"
          >
            Wróć do dashboardu →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl flex flex-col gap-10">
      <Link
        href="/seller"
        className="self-start text-[13px] text-charcoal hover:opacity-70 transition-opacity flex items-center gap-1"
      >
        <ChevronLeft size={14} />
        Wróć do dashboardu
      </Link>

      {/* Intro */}
      <div className="flex flex-col gap-3">
        <span className="self-start text-[10px] font-semibold uppercase tracking-widest text-warm-gray border border-black/10 rounded px-2 py-1 bg-cream-light">
          Ankieta · 4–6 min
        </span>
        <h1 className="text-[28px] font-semibold text-charcoal leading-snug">
          Karta „Akcja na ten tydzień” — co o niej myślisz?
        </h1>
        <p className="text-[14px] text-warm-gray leading-relaxed max-w-[65ch]">
          Dzięki, że przez ostatnie tygodnie miałeś/aś u siebie na dashboardzie kartę „Akcja na ten
          tydzień”. Chcemy zrozumieć, jak ją odebrałeś/aś — szczerze, też jeśli była bezużyteczna.
          To 4–6 minut. Nie ma dobrych odpowiedzi, interesuje nas tylko to, jak było naprawdę.
        </p>
      </div>

      {/* Q0 — bramka ścieżki */}
      <section className="flex flex-col gap-4">
        <Question label="Q0 · Która z tych sytuacji najlepiej opisuje, co zrobiłeś/aś z kartą „Akcja na ten tydzień”?">
          <div className="flex flex-col gap-2">
            {Q0_OPTIONS.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setQ0Index(i)}
                className={cn(
                  "text-left rounded-lg border p-3 text-[13px] transition-colors",
                  q0Index === i
                    ? "border-charcoal bg-charcoal/5 text-charcoal"
                    : "border-black/15 bg-cream-light text-charcoal hover:border-charcoal",
                )}
                aria-pressed={q0Index === i}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Question>
      </section>

      {/* Blok M3 — 4 osie, tylko ścieżki A/B */}
      {showAB && (
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-[17px] font-semibold text-charcoal">Jak oceniasz tę rekomendację?</h2>
          <p className="text-[13px] text-warm-gray">
            Skala: 1 = zdecydowanie nie · 3 = ani tak, ani nie · 5 = zdecydowanie tak.
          </p>
        </div>
        {M3_AXES.map((axis) => (
          <div key={axis.key} className="flex flex-col gap-2.5">
            <Question label={axis.label}>
              <ScaleInput
                value={scores[axis.key] ?? null}
                onChange={setScore(axis.key)}
                lowLabel="zdecydowanie nie"
                highLabel="zdecydowanie tak"
              />
            </Question>
            <OpenField label="Dlaczego ta ocena? (opcjonalnie)" />
          </div>
        ))}
      </section>
      )}

      {/* Blok specyficzny dla problemu — wg wariantu, tylko A/B */}
      {showAB && (
      <section className="flex flex-col gap-2.5">
        {wariant === "bartek" ? (
          <Question label="Karta pokazała Ci, ile pieniędzy i czasu kosztują Cię zwroty tego buta z powodu rozmiaru. Na ile ta liczba była dla Ciebie nowa — czyli zobaczyłeś/aś coś, czego wcześniej nie miałeś/aś przed oczami?">
            <ScaleInput
              value={scores.problemowe ?? null}
              onChange={setScore("problemowe")}
              lowLabel="wiedziałem to od dawna"
              highLabel="całkowicie nowy obraz"
            />
          </Question>
        ) : (
          <Question label="Karta pokazała, że Twoja cena odstaje w dół od mediany rynku przy stabilnym popycie. Na ile to porównanie z rynkiem było dla Ciebie nowe wobec tego, co sama/sam sprawdzasz?">
            <ScaleInput
              value={scores.problemowe ?? null}
              onChange={setScore("problemowe")}
              lowLabel="sprawdzam to regularnie"
              highLabel="nie miałam/em tego porównania"
            />
          </Question>
        )}
        <OpenField label="Co konkretnie było nowe albo czego zabrakło?" />
      </section>
      )}

      {/* Blok zależny od ścieżki — tylko A/B */}
      {showAB && (
        <section className="flex flex-col gap-5">
          <h2 className="text-[17px] font-semibold text-charcoal">Jeszcze kilka pytań</h2>
          {path === "A" && (
            <>
              <Question label="Pomyśl o momencie, gdy faktycznie wprowadzałeś/aś tę zmianę na produkcie. Co przeważyło, że to zrobiłeś/aś właśnie wtedy?">
                <OpenField placeholder="Twoja odpowiedź" />
              </Question>
              <Question label="Co w karcie sprawiło, że to było wykonalne od razu, bez dopytywania?">
                <OpenField placeholder="Twoja odpowiedź" />
              </Question>
            </>
          )}
          {path === "B" && (
            <>
              <Question label="Otworzyłeś/aś kartę, ale zmiana nie weszła. Co się wydarzyło między otwarciem a porzuceniem — utknąłeś/aś na czymś, odłożyłeś/aś, czy coś Cię zniechęciło?">
                <OpenField placeholder="Twoja odpowiedź" />
              </Question>
              <Question label="Gdy czytałeś/aś samą rekomendację — był moment, w którym pomyślałeś/aś „to nie dla mnie” albo „to nie tak”? Przy czym dokładnie?">
                <OpenField placeholder="Twoja odpowiedź" />
              </Question>
            </>
          )}
        </section>
      )}

      {/* STOP-detektor — tylko A/B */}
      {showAB && (
      <section className="flex flex-col gap-2.5">
        <Question label="Czy któraś z rad na karcie wydała Ci się ryzykowna, oderwana od Twojego biznesu albo wzięta z sufitu? Jeśli tak — która i co z nią było nie tak?">
          <OpenField />
        </Question>
      </section>
      )}

      {/* „W zasadzie nie wchodziłem w kartę" → diagnoza, dlaczego seller nie kliknął nawet w kafelek */}
      {showWhyNotClicked && (
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-[17px] font-semibold text-charcoal">Dlaczego nie kliknąłeś/aś nawet w kafelek?</h2>
          <p className="text-[13px] text-warm-gray">
            Skala: 1 = zdecydowanie nie · 3 = ani tak, ani nie · 5 = zdecydowanie tak.
          </p>
        </div>
        {[
          { key: "nc_uwaga", label: "Kafelek nie przyciągnął mojej uwagi — nie zauważyłem/am, że jest tam coś dla mnie." },
          { key: "nc_pomoc", label: "Z tego, co było widać na kaflu, treść nie wyglądała na pomocną." },
          { key: "nc_zaufanie", label: "Nie miałem/am zaufania, że ta rekomendacja jest dla mnie wiarygodna." },
          { key: "nc_dotyczy", label: "To nie wyglądało na coś, co dotyczy mojego sklepu." },
        ].map((item) => (
          <Question key={item.key} label={item.label}>
            <ScaleInput
              value={scores[item.key] ?? null}
              onChange={setScore(item.key)}
              lowLabel="zdecydowanie nie"
              highLabel="zdecydowanie tak"
            />
          </Question>
        ))}
        <OpenField label="Co jeszcze sprawiło, że nie kliknąłeś/aś? (opcjonalnie)" />
      </section>
      )}

      {/* „Nie pamiętam / nie zauważyłem" → brak pytań */}
      {q0Index === 3 && (
        <p className="text-[14px] text-warm-gray leading-relaxed max-w-[60ch]">
          Dzięki — to też cenna informacja. Możesz od razu wysłać ankietę.
        </p>
      )}

      {q0Index !== null && (
        <button
          type="button"
          onClick={handleSubmit}
          className="self-start bg-charcoal text-white text-[14px] font-semibold px-6 py-3 rounded-lg hover:bg-charcoal-light transition-colors"
        >
          Wyślij ankietę
        </button>
      )}
    </div>
  );
}
