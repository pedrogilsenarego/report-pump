/**
 * REPORT#02 — LIST OF PUMP GROUPS BY CUSTOMER.
 *
 * Spec: docs/reports-outputs.md, sheet 6/6. Produced by Action#26 (generate) and saved by
 * Action#27; reached from Screen#09 -> PUMP GROUPS -> *List of Groups (pdf)*.
 *
 * Two nested loops — every installation of the customer, then every pump group of that
 * installation — each group printing its own header line (`SF#491`-`#493`):
 *   Customer: CUSTOMER:Name | Installation: INSTALLATION:Name | Date: [System.Date]
 * followed by the six equipment blocks. COUPLING / GEARBOX / VT PUMPS print only when their
 * brand (or `Column_Lenght`) is non-empty, so a group is not a fixed-height form.
 *
 * Departures from the drawing, all deliberate:
 *
 *  * The title reads "BY" where the drawing has "POR" — Portuguese for "by", left in an
 *    otherwise English title.
 *
 *  * Cond. prints "Inactive" for both `0` and `2`. The report says Inactive = `0`, p3 says
 *    `2`; the client has not resolved it, and either way the row is not active.
 *
 *  * The CONTROLLER block has no S/N. The spec's PUMP_GROUP lists `Ctrl_TAG` twice and
 *    no `Ctrl_SN`; there is no column to print until the client confirms.
 *
 *  * Inactive groups are INCLUDED: the loop has no condition filter, and the report
 *    prints Cond. as a field, which only makes sense if they appear.
 *
 * REPORT#03 prints these same six blocks above its check-list body, so PumpGroupBlocks is
 * exported for it.
 */

import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import { PUMP_SUB_TYPES } from "@/constants/pumpGroup";
import {
  COLORS,
  ReportFooter,
  ReportHeader,
  specDate,
  styles,
} from "./reportFurniture";

export type PumpGroupRow = {
  type?: string | null;
  subType?: string | null;
  condition?: string | null;
  pumpTag?: string | null;
  pumpBrand?: string | null;
  pumpModel?: string | null;
  pumpSn?: string | null;
  motorTag?: string | null;
  motorBrand?: string | null;
  motorModel?: string | null;
  motorSn?: string | null;
  ctrlTag?: string | null;
  ctrlBrand?: string | null;
  ctrlModel?: string | null;
  ctrlType?: string | null;
  couplingBrand?: string | null;
  couplingModel?: string | null;
  couplingSn?: string | null;
  gearbBrand?: string | null;
  gearbModel?: string | null;
  gearbSn?: string | null;
  columnLength?: string | null;
  nrStages?: number | string | null;
};

export type InstallationPumpGroups = {
  installationName: string;
  pumpGroups: PumpGroupRow[];
};

/**
 * Printed in English like the rest of the report — these are the p3 pre-set meanings, the
 * same strings the UI's EN locale shows (`pumpGroup.subTypeValue`).
 */
const SUB_TYPE_LABEL: Record<(typeof PUMP_SUB_TYPES)[number], string> = {
  "H-ES": "Horizontal End-Suction",
  "H-SC": "Horizontal Split Case",
  VT: "Vertical",
  "V-IL": "Vertical In-Line",
  "VT-MS": "Vertical Multi-Stage",
};

const subTypeLabel = (code?: string | null): string =>
  code ? SUB_TYPE_LABEL[code as keyof typeof SUB_TYPE_LABEL] ?? code : "";

const conditionLabel = (condition?: string | null): string => {
  if (condition == null || condition === "") return "";
  const code = String(condition).trim();
  if (code === "1") return "Active";
  if (code === "0" || code === "2") return "Inactive";
  return code;
};

const local = StyleSheet.create({
  group: {
    marginBottom: 14,
    borderWidth: 0.5,
    borderColor: COLORS.rule,
  },
  groupHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: COLORS.band,
    paddingVertical: 4,
    paddingHorizontal: 6,
    fontFamily: "Helvetica-Bold",
  },
  block: {
    flexDirection: "row",
    borderTopWidth: 0.5,
    borderTopColor: "#DDDDDD",
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  blockTitle: { width: "16%", fontFamily: "Helvetica-Bold" },
  blockFields: { width: "84%", flexDirection: "row", flexWrap: "wrap" },
  field: { width: "25%", paddingRight: 4, marginBottom: 2 },
  label: { fontSize: 7, color: COLORS.muted },
});

type Field = { label: string; value?: string | number | null };

const Block = ({ title, fields }: { title: string; fields: Field[] }) => (
  <View style={local.block} wrap={false}>
    <Text style={local.blockTitle}>{title}</Text>
    <View style={local.blockFields}>
      {fields.map((field) => (
        <View key={field.label} style={local.field}>
          <Text style={local.label}>{field.label}</Text>
          <Text>{field.value ?? ""}</Text>
        </View>
      ))}
    </View>
  </View>
);

/** The six equipment blocks, `SF#495`-`#532` (REPORT#03 renumbers them `#560`-`#597`). */
export const PumpGroupBlocks = ({ group }: { group: PumpGroupRow }) => (
  <>
    <Block
      title="PUMP"
      fields={[
        { label: "Type (J/E/D)", value: group.type },
        { label: "Sub_Type", value: subTypeLabel(group.subType) },
        { label: "TAG", value: group.pumpTag },
        { label: "Cond.", value: conditionLabel(group.condition) },
        { label: "Brand", value: group.pumpBrand },
        { label: "Model", value: group.pumpModel },
        { label: "S/N", value: group.pumpSn },
      ]}
    />
    <Block
      title="MOTOR / ENGINE"
      fields={[
        { label: "Brand", value: group.motorBrand },
        { label: "Model", value: group.motorModel },
        { label: "TAG", value: group.motorTag },
        { label: "S/N", value: group.motorSn },
      ]}
    />
    <Block
      title="CONTROLLER"
      fields={[
        { label: "Brand", value: group.ctrlBrand },
        { label: "Model", value: group.ctrlModel },
        { label: "TYPE", value: group.ctrlType },
        { label: "TAG", value: group.ctrlTag },
      ]}
    />
    {group.couplingBrand ? (
      <Block
        title="COUPLING"
        fields={[
          { label: "Brand", value: group.couplingBrand },
          { label: "Model", value: group.couplingModel },
          { label: "S/N", value: group.couplingSn },
        ]}
      />
    ) : null}
    {group.gearbBrand ? (
      <Block
        title="GEARBOX"
        fields={[
          { label: "Brand", value: group.gearbBrand },
          { label: "Model", value: group.gearbModel },
          { label: "SN", value: group.gearbSn },
        ]}
      />
    ) : null}
    {group.columnLength ? (
      <Block
        title="VT PUMPS"
        fields={[
          { label: "Column Lenght", value: group.columnLength },
          { label: "Nr. of Stages", value: group.nrStages },
        ]}
      />
    ) : null}
  </>
);

export const Report02PumpGroups = ({
  customerName,
  installations,
  date = specDate(),
}: {
  customerName: string;
  installations: InstallationPumpGroups[];
  date?: string;
}) => {
  const hasAny = installations.some((i) => i.pumpGroups.length);

  return (
    <Document title={`REPORT#02 — ${customerName}`}>
      <Page size="A4" style={styles.page}>
        <ReportHeader report="REPORT#02" />

        <View style={styles.titleRow}>
          <Text style={styles.titleCentre}>
            LIST OF PUMP GROUPS BY CUSTOMER
          </Text>
        </View>

        {hasAny ? (
          installations.flatMap((installation) =>
            installation.pumpGroups.map((group, index) => (
              <View
                key={`${installation.installationName}-${index}`}
                style={local.group}
                wrap={false}
              >
                <View style={local.groupHead}>
                  <Text>Customer: {customerName}</Text>
                  <Text>Installation: {installation.installationName}</Text>
                  <Text>Date: {date}</Text>
                </View>
                <PumpGroupBlocks group={group} />
              </View>
            ))
          )
        ) : (
          <Text style={styles.empty}>
            There are no Pump Groups defined for this Customer!
          </Text>
        )}

        <ReportFooter />
      </Page>
    </Document>
  );
};
