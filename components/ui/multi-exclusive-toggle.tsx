/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { useController, Control } from "react-hook-form";

export interface ToggleOption {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface ExclusiveMultiToggleProps {
  name: string;
  control: Control<any>;
  options: ToggleOption[];
  className?: string;
  /**
   * Left undefined by default so nothing is pre-selected. This used to default to
   * `options[0].value`, which silently pre-answered every check-list action with the first
   * option — an untouched intervention saved a full set of answers nobody gave.
   */
  defaultValue?: string;
}

export function ExclusiveMultiToggleForm({
  name,
  control,
  options,
  className,
  defaultValue,
}: ExclusiveMultiToggleProps) {
  const { field } = useController({
    name,
    control,
    defaultValue,
  });

  return (
    <ToggleGroup
      type="single"
      value={field.value ?? ""}
      onValueChange={field.onChange}
      className={cn("justify-start", className)}
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          aria-label={option.label}
          className="flex items-center gap-2 px-3 py-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
        >
          {option.icon && <option.icon className="h-4 w-4" />}
          <span>{option.label}</span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
