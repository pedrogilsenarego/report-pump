import { readFileSync } from "fs";
import { parseChecklistForms } from "../lib/forms/parseChecklistForms";

const root = process.argv[2];
const buf = (d: string, n: string) => {
  const b = readFileSync(`${root}/${d}/${n}`);
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer;
};
const load = (d: string) => ({
  form1: buf(d, "Form1_Groups.xlsx"),
  form2: buf(d, "Form2_Sub_Groups.xlsx"),
  form3: buf(d, "Form3_Actions.xlsx"),
  form4: buf(d, "Form4_Measurements.xlsx"),
});

for (const [dir, opts] of [
  ["A-valid", {}],
  ["B-two-templates", {}],
  ["B-two-templates", { template: 2 }],
  ["C-errors-structure", {}],
  ["D-errors-rows", {}],
] as const) {
  const r = parseChecklistForms(load(dir), opts);
  console.log(`\n===== ${dir} ${JSON.stringify(opts)} ok=${r.ok} templates=[${r.templates}]`);
  r.errors.forEach((e) => console.log(`  ERR  ${e.file} r${e.row ?? "-"}: ${e.message}`));
  r.warnings.forEach((w) => console.log(`  WARN ${w.file} r${w.row ?? "-"}: ${w.message}`));
  if (r.data) {
    const g = r.data.groups;
    console.log(`  groups=${g.length} subgroups=${g.reduce((n, x) => n + x.subGroups.length, 0)}` +
      ` actions=${g.reduce((n, x) => n + x.subGroups.reduce((m, s) => m + s.actions.length, 0), 0)}` +
      ` values=${g.reduce((n, x) => n + x.subGroups.reduce((m, s) => m + s.actions.reduce((k, a) => k + a.values.length, 0), 0), 0)}`);
    g.forEach((x) => console.log(`   group ${x.code}: ${x.texts.map((t) => `${t.language}="${t.name.slice(0, 34)}"`).join("  ")} subs=[${x.subGroups.map((s) => s.code).join(",")}]`));
  }
}
