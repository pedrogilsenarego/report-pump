import { readFileSync } from "fs";
import { parseChecklistForms } from "../lib/forms/parseChecklistForms";

const A = "./app/assets/";
const buf = (n: string) => {
  const b = readFileSync(A + n);
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer;
};
const files = {
  form1: buf("Form1_Groups.xlsx"),
  form2: buf("Form2_Sub_Groups.xlsx"),
  form3: buf("Form3_Actions.xlsx"),
  form4: buf("Form4_Measurements.xlsx"),
};

for (const template of [undefined, 1, 2] as const) {
  const r = parseChecklistForms(files, template ? { template } : {});
  console.log(`\n===== template=${template ?? "(unspecified)"} ok=${r.ok} templates=[${r.templates}]`);
  console.log(`errors=${r.errors.length} warnings=${r.warnings.length}`);
  r.errors.slice(0, 6).forEach((e) => console.log(`  ERR  ${e.file} r${e.row ?? "-"}: ${e.message}`));
  if (r.errors.length > 6) console.log(`  ... ${r.errors.length - 6} more`);
  r.warnings.slice(0, 4).forEach((w) => console.log(`  WARN ${w.file} r${w.row ?? "-"}: ${w.message}`));
  if (r.data) {
    const g = r.data.groups;
    console.log(`  groups=${g.length} subgroups=${g.reduce((n, x) => n + x.subGroups.length, 0)}` +
      ` actions=${g.reduce((n, x) => n + x.subGroups.reduce((m, s) => m + s.actions.length, 0), 0)}` +
      ` values=${g.reduce((n, x) => n + x.subGroups.reduce((m, s) => m + s.actions.reduce((k, a) => k + a.values.length, 0), 0), 0)}`);
    g.forEach((x) => console.log(`   group ${x.code}: ${x.texts.map((t) => t.language + '="' + t.name.slice(0, 42) + '"').join("  ")}`));
  }
}
