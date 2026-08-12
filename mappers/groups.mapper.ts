import { Group, GroupRaw, Subgroup, SubgroupRaw } from "@/types/group.types";
import { textRowsToLocalizedName } from "@/utils/specLanguage";

const mapGroup = (group: GroupRaw): Group => {
  return {
    id: group.id,
    createdAt: group.created_at,
    checklistId: group.checklist_id,
    code: group.code,
    name: textRowsToLocalizedName(group.cl_gr_text),
  };
};

export const mapGroups = (groups: GroupRaw[]): Group[] => {
  return groups.map((group) => mapGroup(group));
};

const mapSubgroup = (subgroup: SubgroupRaw): Subgroup => {
  return {
    id: subgroup.id,
    createdAt: subgroup.created_at,
    checklistId: subgroup.checklist_id,
    codeGroup: subgroup.code_gr,
    code: subgroup.code,
    name: textRowsToLocalizedName(subgroup.cl_subgr_text),
  };
};

export const mapSubgroups = (subgroups: SubgroupRaw[]): Subgroup[] => {
  return subgroups.map((subgroup) => mapSubgroup(subgroup));
};
