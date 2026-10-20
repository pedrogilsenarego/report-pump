/**
 * REPORT#10 — LIST OF INSTALLATIONS / CUSTOMER.
 *
 * Spec: docs/screens-flows.md (sheet 5/6). Action#30 generates, Action#31 saves (PopUp#41/#42).
 * Unlike REPORT#01-#03 it has NO drawn layout — only "All fields from table.INSTALLATION
 * with INSTALLATION:Code_Customer = CUSTOMER:Code" — so the furniture and title line follow
 * REPORT#01, the nearest sibling.
 *
 * "All fields" is read as all the fields the `installations` table actually has. The spec's
 * INSTALLATION also lists Address2 / Address3 / Language / Phone / Email; none of them were
 * ever columns, so there is nothing to print until they are added.
 *
 * Every condition is INCLUDED, Deleted (3) too — the spec's loop has no filter, and the
 * column only means something if inactive rows appear.
 */

import { Document, Page, Text, View } from "@react-pdf/renderer";

import {
  ReportFooter,
  ReportHeader,
  specDate,
  styles,
} from "./reportFurniture";

export type InstallationRow = {
  name?: string | null;
  area?: string | null;
  address?: string | null;
  responsible?: string | null;
  condition?: string | null;
};

/** p3 pre-set values / PopUp#28. Anything else prints as-is rather than lying. */
const conditionLabel = (condition?: string | null): string => {
  const code = String(condition ?? "").trim();
  if (code === "1") return "Active";
  if (code === "2") return "Exist but not Active";
  if (code === "3") return "Deleted";
  return code;
};

const COLUMNS: { key: keyof InstallationRow; head: string; width: number }[] = [
  { key: "name", head: "NAME", width: 24 },
  { key: "area", head: "AREA", width: 16 },
  { key: "address", head: "ADDRESS", width: 30 },
  { key: "responsible", head: "RESPONSABLE", width: 16 },
  { key: "condition", head: "CONDITION", width: 14 },
];

export const Report10Installations = ({
  customerName,
  installations,
  date = specDate(),
}: {
  customerName: string;
  installations: InstallationRow[];
  date?: string;
}) => (
  <Document title={`REPORT#10 — ${customerName}`}>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <ReportHeader report="REPORT#10" />

      <View style={styles.titleRow}>
        <Text>Customer: {customerName}</Text>
        <Text style={styles.titleCentre}>LIST OF INSTALLATIONS / CUSTOMER</Text>
        <Text>Date: {date}</Text>
      </View>

      <View style={styles.tableHead} fixed>
        {COLUMNS.map((column) => (
          <Text
            key={column.head}
            style={[styles.cell, { width: `${column.width}%` }]}
          >
            {column.head}
          </Text>
        ))}
      </View>

      {installations.length ? (
        installations.map((installation, index) => (
          <View key={index} style={styles.row} wrap={false}>
            {COLUMNS.map((column) => (
              <Text
                key={column.head}
                style={[styles.cell, { width: `${column.width}%` }]}
              >
                {column.key === "condition"
                  ? conditionLabel(installation.condition)
                  : installation[column.key] || ""}
              </Text>
            ))}
          </View>
        ))
      ) : (
        // PopUp#24's wording.
        <Text style={styles.empty}>
          There are no Installations defined for this Customer!
        </Text>
      )}

      <ReportFooter />
    </Page>
  </Document>
);
