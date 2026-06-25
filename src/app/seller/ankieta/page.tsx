import type { Metadata } from "next";
import { SurveyForm } from "@/components/seller/survey-form";

export const metadata: Metadata = {
  title: "Ankieta — Akcja na ten tydzień",
};

interface PageProps {
  searchParams: Promise<{ wariant?: string }>;
}

export default async function SurveyPage({ searchParams }: PageProps) {
  const { wariant } = await searchParams;
  const arm: "bartek" | "dorota" = wariant === "bartek" ? "bartek" : "dorota";

  return <SurveyForm wariant={arm} />;
}
