/**
 * REPORT#01 — LIST OF TECHNICIANS / CUSTOMER.
 *
 * Spec: docs/reports-outputs.md, sheet 6/6. Produced by Action#20 (generate) and saved by
 * Action#21; reached from Screen#09 -> MAINTENANCE TECHNICIANS -> `SF#244`.
 *
 * Title line (`SF#335`-`#337`):
 *   Customer: table.CUSTOMER:Name | LIST OF TECHNICIANS / CUSTOMER | Date: [System.Date]
 *
 * Columns (`SF#338`-`#344`):
 *   NAME | FUNCTION | PHONE | EMAIL | LANG. | CERTIFICATION | CONDITION
 *
 * Two deliberate departures from the drawing, both documented in reports-outputs.md:
 *
 *  * THE CONDITION COLUMN READS `:Condition`, NOT `:Certification`. The drawing prints
 *    `TECHNICIAN_CUST:Certification` for CONDITION, but Certification is the free-text
 *    qualification already printed in the previous column, and Action#19 soft-deletes by
 *    setting `Condition = 2`. The drawing is wrong; this follows the data model.
 *
 *  * SUSPENDED TECHNICIANS ARE INCLUDED. The pickers (PopUp#20/#21) filter on
 *    `Condition = 1`; this report does not — it prints the condition as a column, which
 *    only makes sense if inactive rows appear. Any caller must pass them in.
 *
 * `Suspended` is the display string the drawing uses, where p3's pre-set table says
 * `Inactive`; the customer menu's button is labelled *Suspend*, so the drawing wins.
 */

import { Document, Page, Text, View } from "@react-pdf/renderer";

import {
  ReportFooter,
  ReportHeader,
  specDate,
  styles,
} from "./reportFurniture";

export type TechnicianRow = {
  name?: string | null;
  function?: string | null;
  phone?: string | null;
  email?: string | null;
  language?: string | null;
  certification?: string | null;
  condition?: string | null;
};

/** `SF#345`: 1 -> Active, 2 -> Suspended. Anything else prints as-is rather than lying. */
const conditionLabel = (condition?: string | null): string => {
  if (condition == null || condition === "") return "";
  const code = String(condition).trim();
  if (code === "1") return "Active";
  if (code === "2") return "Suspended";
  return code;
};

// Widths sum to 100. NAME and EMAIL get the most room: they are the two that actually
// overflow in the real data.
const COLUMNS: { key: keyof TechnicianRow; head: string; width: number }[] = [
  { key: "name", head: "NAME", width: 20 },
  { key: "function", head: "FUNCTION", width: 14 },
  { key: "phone", head: "PHONE", width: 13 },
  { key: "email", head: "EMAIL", width: 23 },
  { key: "language", head: "LANG.", width: 7 },
  { key: "certification", head: "CERTIFICATION", width: 13 },
  { key: "condition", head: "CONDITION", width: 10 },
];

export const Report01Technicians = ({
  customerName,
  technicians,
  date = specDate(),
}: {
  customerName: string;
  technicians: TechnicianRow[];
  date?: string;
}) => (
  <Document title={`REPORT#01 — ${customerName}`}>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <ReportHeader report="REPORT#01" />

      <View style={styles.titleRow}>
        <Text>Customer: {customerName}</Text>
        <Text style={styles.titleCentre}>LIST OF TECHNICIANS / CUSTOMER</Text>
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

      {technicians.length ? (
        technicians.map((technician, index) => (
          <View key={index} style={styles.row} wrap={false}>
            {COLUMNS.map((column) => (
              <Text
                key={column.head}
                style={[styles.cell, { width: `${column.width}%` }]}
              >
                {column.key === "condition"
                  ? conditionLabel(technician.condition)
                  : technician[column.key] || ""}
              </Text>
            ))}
          </View>
        ))
      ) : (
        <Text style={styles.empty}>
          There are no Technicians defined for this Customer!
        </Text>
      )}

      <ReportFooter />
    </Page>
  </Document>
);
