/**
 * Page furniture shared by every FIREPUMP25 report.
 *
 * Sheet 6/6 draws the same header and footer band on REPORT#01, #02 and #03, so they live
 * here rather than in any one report. Text is verbatim from the drawing — including the
 * `(TM)` marks and the Portuguese company line, which are not translated: they are the
 * issuing company's own details, not UI strings, so they do not go through i18next.
 *
 * The logo is deliberately absent. The drawing shows an Equitotal mark top-left and the
 * bundle ships no asset for it; a placeholder box would print on a document that goes to
 * the client. Drop the file in and add an <Image> here when they send it.
 */

import { StyleSheet, Text, View } from "@react-pdf/renderer";

export const COLORS = {
  text: "#111111",
  muted: "#555555",
  rule: "#999999",
  band: "#EEEEEE",
};

export const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 56,
    paddingHorizontal: 32,
    fontSize: 9,
    color: COLORS.text,
    fontFamily: "Helvetica",
  },

  headerBand: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.rule,
    paddingBottom: 6,
    marginBottom: 12,
  },
  headerTitle: { fontSize: 13, fontFamily: "Helvetica-Bold" },
  headerSub: { fontSize: 8, color: COLORS.muted, marginTop: 2 },
  headerTag: { fontSize: 9, fontFamily: "Helvetica-Bold", marginTop: 4 },

  footerBand: {
    position: "absolute",
    bottom: 20,
    left: 32,
    right: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderTopWidth: 1,
    borderTopColor: COLORS.rule,
    paddingTop: 6,
    fontSize: 7,
    color: COLORS.muted,
  },

  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  titleCentre: { fontSize: 11, fontFamily: "Helvetica-Bold" },

  tableHead: {
    flexDirection: "row",
    backgroundColor: COLORS.band,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.rule,
    paddingVertical: 4,
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#DDDDDD",
    paddingVertical: 4,
  },
  cell: { paddingHorizontal: 3 },
  empty: { marginTop: 16, fontSize: 9, color: COLORS.muted },
});

/** `[REPORT#nn]` — the drawing prints the number in the header band. */
export const ReportHeader = ({ report }: { report: string }) => (
  <View style={styles.headerBand} fixed>
    <View>
      <Text style={styles.headerTitle}>FIREPUMP25 (TM)</Text>
      <Text style={styles.headerSub}>Fire Pump Maintenance Program (Rev.02)</Text>
      <Text style={styles.headerTag}>[{report}]</Text>
    </View>
  </View>
);

export const ReportFooter = () => (
  <View style={styles.footerBand} fixed>
    <Text
      render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
    />
    <View style={{ alignItems: "flex-end" }}>
      <Text>Equitotal (TM)</Text>
      <Text>FIREPUMP25 Serviços e Equipamentos Técnico Industriais, Lda.</Text>
      <Text>Ph.: +351.212742823 PORTUGAL</Text>
      <Text>geral@equitotal.pt</Text>
    </View>
  </View>
);

/** `yyyy.mm.dd`, the format PopUp#07 and the report title lines use throughout. */
export const specDate = (date = new Date()): string =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join(".");
