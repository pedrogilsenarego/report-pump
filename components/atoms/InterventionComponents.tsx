/* eslint-disable @typescript-eslint/no-explicit-any */
import { periodValues } from "@/constants/actions";
import { i18n } from "@/translations/i18n";

type Props = {
  codeGroup: string | number;
  code: string | number;
};

export function InterventionGroup(props: Props) {
  return (
    <p>
      {props.codeGroup}.{props.code}
    </p>
  );
}

export function InterventionPeriod({ period }: { period: number }) {
  return (
    <div className="border p-2">
      <p>{periodValues[period]}</p>
    </div>
  );
}

export function InterventionDescription({
  description,
}: {
  description: string;
}) {
  return <p>{description}</p>;
}

export function InterventionDetailsBox({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex gap-4 w-full items-center">{children}</div>;
}

export function InterventionBox({
  children,
  key,
}: {
  children: React.ReactNode;
  key: any;
}) {
  return (
    <div
      key={key}
      className="border flex p-2 rounded-sm justify-between space-x-3 items-center"
    >
      {children}
    </div>
  );
}

export function InterventionGroupTitle({ group }: { group: string }) {
  return (
    <h2 className="text-lg font-semibold mb-2">
      {group} - {i18n.t(`checklists.groupTitle.${group}`)}
    </h2>
  );
}
