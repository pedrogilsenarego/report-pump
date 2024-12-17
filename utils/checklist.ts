import { InterventionResult } from "@/types/interventions.types";

export const groupByCodeGroup = (data: InterventionResult[]) => {
  return data.reduce(
    (acc: Record<string, InterventionResult[]>, item: InterventionResult) => {
      const groupKey = item.codeGroup || "Ungrouped";
      if (!acc[groupKey]) acc[groupKey] = [];
      acc[groupKey].push(item);
      return acc;
    },
    {}
  );
};
