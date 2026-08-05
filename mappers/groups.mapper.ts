import {
  Group,
  GroupRaw,
  Subgroup,
  SubgroupRaw,
} from "@/types/group.types";

const mapGroup = (group: GroupRaw): Group => {
  return {
    id: group.id,
    createdAt: group.created_at,
    code: group.code,
    name: group.name || {},
  };
};

export const mapGroups = (groups: GroupRaw[]): Group[] => {
  return groups.map((group) => mapGroup(group));
};

export const mapGroupToRaw = (group: Partial<Group>): Partial<GroupRaw> => {
  return {
    code: group.code,
    name: group.name,
  };
};

const mapSubgroup = (subgroup: SubgroupRaw): Subgroup => {
  return {
    id: subgroup.id,
    createdAt: subgroup.created_at,
    codeGroup: subgroup.code_group,
    code: subgroup.code,
    name: subgroup.name || {},
  };
};

export const mapSubgroups = (subgroups: SubgroupRaw[]): Subgroup[] => {
  return subgroups.map((subgroup) => mapSubgroup(subgroup));
};

export const mapSubgroupToRaw = (
  subgroup: Partial<Subgroup>
): Partial<SubgroupRaw> => {
  return {
    code_group: subgroup.codeGroup,
    code: subgroup.code,
    name: subgroup.name,
  };
};
