import type { CheckboxAction } from "@/components/seller/checkbox-actions";

// Jedno źródło prawdy dla checklisty akcji formatek sellera. Listy żyły wcześniej
// w plikach stron (pricing-action / returns-action) i były duplikowane przez kafle
// na dashboardzie przez stałą `ACTIONS_TOTAL = 3`. Teraz licznik „Wykonano X z N"
// liczy z `.length` tych tablic — dodanie/odjęcie akcji aktualizuje liczbę wszędzie.
//
// Opisy jako template literals (backticki): zawierają polskie cudzysłowy „",
// strzałki i %, które w zwykłym stringu JS rozbiłyby parser Turbopacka na U+201D.

// Formatka Dorota (cena) — 3 akcje do checkboxów dla SKU z „zapomnianą ceną".
export const DOROTA_CENNIK_ACTIONS: CheckboxAction[] = [
  {
    id: "cena",
    label: "Zmień cenę Urban Slip-On",
    description:
      `Podnieś o ~10% (do ~208 zł), bliżej mediany 215 zł. Przy obecnym popycie (18 szt./30 dni) to ~3 zł więcej marży na sztukę bez zmiany asortymentu. Jeśli boisz się utraty wolumenu, rozłóż ruch: +5% teraz, +5% za 2 tygodnie — sprawdzasz reakcję popytu po każdym kroku, zamiast jednej większej zmiany. Przykład: „189 zł → 198 zł teraz → 208 zł za 2 tyg.".`,
  },
  {
    id: "opis",
    label: "Dopisz do opisu, co uzasadnia cenę",
    description:
      `Krótko wskaż materiał, wygodę albo trwałość, żeby wyższa cena „broniła się" sama. Przykład: „Skórzana wyściółka, podeszwa antypoślizgowa – wygodne na cały dzień".`,
  },
  {
    id: "zdjecie",
    label: "Dodaj zdjęcie detalu / jakości",
    description:
      `1–2 kadry zbliżenia (szew, materiał, wykończenie). Lepsza prezentacja zmniejsza opór przy wyższej cenie.`,
  },
];

export const DOROTA_CENNIK_INTRO =
  "Twoja cena odstaje od rynku w dół, a popyt na ten model jest stabilny. Możesz skorygować cenę bliżej mediany bez ryzyka utraty wolumenu — zacznij od ostrożnego ruchu i sprawdź wynik.";

// Formatka Bartek — 3 akcje do checkboxów (rozmiar jako dominujący powód zwrotu).
export const BARTEK_ROZMIAR_ACTIONS: CheckboxAction[] = [
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

export const BARTEK_ROZMIAR_INTRO =
  "Ten produkt wraca z powodu rozmiaru. Możesz zmniejszyć ryzyko zwrotu, dodając kupującym więcej informacji o dopasowaniu. Zacznij od jednej rzeczy – nawet krótka wskazówka może pomóc wybrać właściwy rozmiar.";
