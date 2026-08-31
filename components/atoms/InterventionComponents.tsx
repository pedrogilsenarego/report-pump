/* eslint-disable @typescript-eslint/no-explicit-any */
import { periodLabel } from "@/constants/actions";
import { LocalizedName } from "@/types/group.types";
import { localizedName } from "@/utils/localizedName";

type Props = {
  codeGroup: string | number;
  code: string | number;
};

export function InterventionGroup(props: Props) {
  return (
    <p className="whitespace-nowrap tabular-nums opacity-70">
      {props.codeGroup}.{props.code}
    </p>
  );
}

export function InterventionPeriod({ period }: { period?: number }) {
  const label = periodLabel(period);
  if (!label) return null;

  return (
    <div className="border px-2 py-1 rounded-sm text-xs whitespace-nowrap">
      <p>{label}</p>
    </div>
  );
}

/**
 * Action names come from cl_action_text (one row per language), so they resolve through
 * localizedName like group and sub-group names — not through the translation files.
 * `source` is the NFPA-25 clause the action comes from, printed alongside it on the report.
 */
export function InterventionDescription({
  description,
  source,
}: {
  description?: LocalizedName;
  source?: LocalizedName;
}) {
  const text = localizedName(description);
  const clause = localizedName(source);

  return (
    <div className="flex flex-col">
      <p>{text}</p>
      {clause ? <p className="text-xs opacity-60">{clause}</p> : null}
    </div>
  );
}

export function InterventionDetailsBox({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex gap-4 flex-1 items-center">{children}</div>;
}

export function InterventionBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="border flex p-2 rounded-sm justify-between gap-3 items-center">
      {children}
    </div>
  );
}

// `name` comes from cl_gr_text in the DB (one row per language), not from the
// translation files. Falls back to the bare code when the check-list has no import yet.
export function InterventionGroupTitle({
  group,
  name,
}: {
  group: string;
  name?: LocalizedName;
}) {
  const title = localizedName(name);

  return (
    <h2 className="text-lg font-semibold mb-2">
      {title ? `${group} - ${title}` : group}
    </h2>
  );
}

// Sub-group heading, from cl_subgr_text. Sub-group names repeat across groups
// ("Bombas S.I." is 2/1, 3/1 and 4/1), so the code stays visible alongside the name.
export function InterventionSubgroupTitle({
  group,
  subgroup,
  name,
}: {
  group: string | number;
  subgroup: string | number;
  name?: LocalizedName;
}) {
  const title = localizedName(name);
  const code = `${group}.${subgroup}`;

  return (
    <h3 className="text-base font-medium mt-3 mb-1">
      {title ? `${code} - ${title}` : code}
    </h3>
  );
}
