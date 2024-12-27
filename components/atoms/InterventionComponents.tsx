import { periodValues } from "@/constants/actions";

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
