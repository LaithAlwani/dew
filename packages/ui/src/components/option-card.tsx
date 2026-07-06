"use client";

import * as React from "react";
import { RadioGroup, Checkbox } from "radix-ui";
import { Check } from "lucide-react";
import { cn } from "../cn";

export interface Option {
  value: string;
  label: string;
  icon?: React.ReactNode;
  hint?: string;
}

const cardBase =
  "group relative flex w-full cursor-pointer items-center gap-3 rounded-card glass p-4 text-left transition-all duration-300 ease-soft hover:shadow-float focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=checked]:shadow-glow data-[state=checked]:ring-2 data-[state=checked]:ring-purple-500";

function OptionBody({ option }: { option: Option }) {
  return (
    <>
      {option.icon && (
        <span className="shrink-0 text-purple-600">{option.icon}</span>
      )}
      <span className="flex-1">
        <span className="block text-sm font-medium text-foreground">
          {option.label}
        </span>
        {option.hint && (
          <span className="mt-0.5 block text-xs text-ink-500">{option.hint}</span>
        )}
      </span>
    </>
  );
}

/** Single-select tappable answer cards (onboarding). */
export function RadioCardGroup({
  options,
  value,
  onValueChange,
  name,
  className,
}: {
  options: Option[];
  value?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  className?: string;
}) {
  return (
    <RadioGroup.Root
      value={value}
      onValueChange={onValueChange}
      name={name}
      className={cn("flex flex-col gap-3", className)}
    >
      {options.map((option) => (
        <RadioGroup.Item key={option.value} value={option.value} className={cardBase}>
          <OptionBody option={option} />
          <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-lavender-300 group-data-[state=checked]:border-transparent group-data-[state=checked]:bg-[image:var(--gradient-primary)]">
            <RadioGroup.Indicator>
              <Check className="size-3 text-white" />
            </RadioGroup.Indicator>
          </span>
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  );
}

/** Multi-select tappable answer cards (onboarding). */
export function CheckboxCardGroup({
  options,
  value = [],
  onValueChange,
  className,
}: {
  options: Option[];
  value?: string[];
  onValueChange?: (value: string[]) => void;
  className?: string;
}) {
  const toggle = (val: string, checked: boolean) => {
    if (!onValueChange) return;
    onValueChange(
      checked ? [...value, val] : value.filter((v) => v !== val),
    );
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {options.map((option) => {
        const checked = value.includes(option.value);
        return (
          <label
            key={option.value}
            data-state={checked ? "checked" : "unchecked"}
            className={cardBase}
          >
            <OptionBody option={option} />
            <Checkbox.Root
              checked={checked}
              onCheckedChange={(c) => toggle(option.value, c === true)}
              className="flex size-5 shrink-0 items-center justify-center rounded-md border border-lavender-300 data-[state=checked]:border-transparent data-[state=checked]:bg-[image:var(--gradient-primary)]"
            >
              <Checkbox.Indicator>
                <Check className="size-3 text-white" />
              </Checkbox.Indicator>
            </Checkbox.Root>
          </label>
        );
      })}
    </div>
  );
}
