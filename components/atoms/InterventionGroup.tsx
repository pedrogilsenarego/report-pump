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
