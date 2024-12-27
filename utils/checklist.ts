import { ChecklistAction } from "@/types/checklist.types";

export const groupByCodeGroup = (data: ChecklistAction[]) => {
  return data.reduce(
    (acc: Record<string, ChecklistAction[]>, item: ChecklistAction) => {
      const groupKey = item.codeGroup || "Ungrouped";
      if (!acc[groupKey]) acc[groupKey] = [];
      acc[groupKey].push(item);
      return acc;
    },
    {}
  );
};
