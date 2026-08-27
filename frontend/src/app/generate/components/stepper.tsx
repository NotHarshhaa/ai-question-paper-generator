import React from "react";
import { Separator } from "@/components/ui/separator";

interface StepperProps {
  currentStep: number;
}

const steps = [
  { id: 1, label: "Subject" },
  { id: 2, label: "Syllabus" },
  { id: 3, label: "Pattern" },
  { id: 4, label: "Settings" },
  { id: 5, label: "Generate" },
];

export const Stepper: React.FC<StepperProps> = ({ currentStep }) => {
  return (
    <div className="flex items-center gap-1 mb-6 overflow-x-auto">
      {steps.map((s) => (
        <div key={s.id} className="flex items-center gap-1 flex-1 min-w-0">
          <div
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
              currentStep >= s.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {s.id}
          </div>
          <span className="text-xs font-medium hidden sm:inline truncate">
            {s.label}
          </span>
          {s.id < steps.length && <Separator className="flex-1 min-w-4" />}
        </div>
      ))}
    </div>
  );
};
