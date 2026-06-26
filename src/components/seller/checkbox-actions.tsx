"use client";
import { Check } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { useCheckboxState } from "@/hooks/use-checkbox-state";

export interface CheckboxAction {
  id: string;
  label: string;
  description: string;
}

interface CheckboxActionsProps {
  actions: CheckboxAction[];
  stateKey: string;
  intro: string;
  sku: string;
  source?: string;
}

export function CheckboxActions({
  actions,
  stateKey,
  intro,
  sku,
  source = "returns-action",
}: CheckboxActionsProps) {
  const { checked, toggle } = useCheckboxState(stateKey);
  const posthog = usePostHog();

  const handleToggle = (id: string) => {
    const wasChecked = checked.has(id);
    toggle(id);
    posthog?.capture("reko_checkbox_toggled", {
      sku,
      action_id: id,
      checked: !wasChecked,
      source,
    });
  };

  return (
    <div className="p-6 flex flex-col gap-5">
      <p className="text-[14px] text-charcoal leading-relaxed max-w-prose">{intro}</p>
      <div className="flex flex-col gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-warm-gray">
          Checklist
        </span>
        <div className="flex flex-col gap-4">
          {actions.map((action) => {
            const isChecked = checked.has(action.id);
            return (
              <button
                key={action.id}
                onClick={() => handleToggle(action.id)}
                className="flex items-start gap-3 text-left group"
              >
                <div
                  className={`mt-0.5 w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center transition-colors ${
                    isChecked
                      ? "bg-[#16a34a]"
                      : "bg-white border border-black/20 group-hover:border-charcoal"
                  }`}
                >
                  {isChecked && <Check size={12} className="text-white" strokeWidth={2.5} />}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[14px] font-semibold text-charcoal leading-snug">
                    {action.label}
                  </span>
                  <p className="text-[13px] text-warm-gray leading-relaxed">{action.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
