/* Generates sample Form1..Form4 bundles for testing the Action#04 import. */
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const OUT = process.argv[2] || path.join(process.env.USERPROFILE, "Downloads", "firepump-test-forms");

// rows 1-3 header block, row 6 labels, row 7 [A].. keys, data from row 9
const build = (title, page, labels, keys, rows) => {
  const aoa = [
    ["INFOLOG", "", "FIREPUMP25", "", "", "2026.08.24"],
    [title],
    [page],
    [],
    [],
    labels,
    keys,
    [],
    ...rows,
  ];
  return XLSX.utils.aoa_to_sheet(aoa);
};

const write = (name, sheet, dir) => {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, "Sheet1");
  fs.mkdirSync(dir, { recursive: true });
  XLSX.writeFile(wb, path.join(dir, name));
  console.log("wrote", path.join(dir, name));
};

const KEYS = (n) => Array.from({ length: n }, (_, i) => `[${String.fromCharCode(65 + i)}]`);

// ---------------------------------------------------------------- content
const GROUPS = [
  [1, "Inspeções Pré-ensaio (IPE)", "Pre-Test Inspections (PTI)"],
  [2, "Verificações e Ensaios (VE)", "Verifications and Tests (VT)"],
  [3, "Ensaio / Teste de caudal (T)", "Flow Test (F)"],
];

const SUBGROUPS = [
  [1, 1, "Sala de Bombas S.I.", "Pump House"],
  [1, 2, "Condição de Bombas S.I.", "Pump Conditions"],
  [2, 1, "Bombas S.I.", "Fire Fighting Pumps"],
  [2, 2, "Bomba Elétrica", "Electric unit"],
  [3, 1, "Bombas S.I.", "Fire Fighting Pumps"],
];

const ACTIONS = [
  [1, 1, 1, 2, "IPE", "PTI", "Instruções do Fabricante", "Mnfct instructions",
    "Verificação do estado de limpeza da sala e acessibilidade aos grupos de bombagem",
    "Check pump room cleanliness and access to the pump sets"],
  [1, 1, 2, 2, "IPE", "PTI", "8.2.2(1)(a/b)", "8.2.2(1)(a/b)",
    "Verificação da temperatura ambiente com as portas fechadas",
    "Check room temperature with the doors closed"],
  [1, 1, 3, 1, "IPE", "PTI", "8.2.2(1)(c)", "8.2.2(1)(c)",
    "Estado da ventilação sala e grelhas de ventilação",
    "Room ventilation and ventilation grids condition"],
  [1, 2, 1, 1, "IPE", "PTI", "8.2.2 (1) (d)", "8.2.2 (1) (d)",
    "Acumulação de excesso de água no piso", "Excess water accumulation on the floor"],
  [1, 2, 2, 1, "IPE", "PTI", "8.2.2 (1) (c)", "8.2.2 (1) (c)",
    "Proteção do acoplamento instalada", "Coupling guard installed"],
  [2, 1, 1, 1, "VE", "VT", "8.3.3.1", "8.3.3.1",
    "Ensaio de arranque automático da bomba", "Automatic pump start test"],
  [2, 1, 2, 2, "VE", "VT", "8.3.3.2", "8.3.3.2",
    "Registo da pressão de arranque e paragem", "Record start and stop pressures"],
  [2, 2, 1, 2, "VE", "VT", "Instruções do Fabricante", "Mnfct instructions",
    "Verificação da corrente absorvida do motor elétrico", "Check electric motor current draw"],
  [3, 1, 1, 1, "T", "F", "8.3.3.3", "8.3.3.3",
    "Ensaio de caudal no coletor de ensaio", "Flow test at the test header"],
];

// group / sub / action / index / PTG / ENG
const VALUES = [
  [1, 1, 2, 1, "Temperatura ambiente (°C)", "Room temperature (°C)"],
  [2, 1, 2, 1, "Pressão de arranque (bar)", "Start pressure (bar)"],
  [2, 1, 2, 2, "Pressão de paragem (bar)", "Stop pressure (bar)"],
  [2, 2, 1, 1, "Corrente L1 (A)", "Current L1 (A)"],
  [2, 2, 1, 2, "Corrente L2 (A)", "Current L2 (A)"],
  [2, 2, 1, 3, "Corrente L3 (A)", "Current L3 (A)"],
  [3, 1, 1, 1, "Caudal (l/min)", "Flow (l/min)"],
  [3, 1, 1, 2, "Pressão (bar)", "Pressure (bar)"],
];

const L1 = "PTG", L2 = "ENG";

const form1 = (checkLists, extra = []) => {
  let code = 0;
  const rows = [];
  checkLists.forEach((cl) =>
    GROUPS.forEach(([g, pt, en]) => rows.push([++code, cl, g, L1, pt, L2, en]))
  );
  extra.forEach((r) => rows.push([++code, ...r]));
  // trailing empty template rows: CODE only
  for (let i = 0; i < 3; i += 1) rows.push([++code]);
  return build(
    "TABLE OF NAMES OF GROUPS", "GROUP",
    ["CODE", "CHEKC-LIST", "GROUP", "LANG1", "NAME1", "LANG2", "NAME2"],
    KEYS(7), rows
  );
};

const form2 = (checkLists, extra = []) => {
  let code = 0;
  const rows = [];
  checkLists.forEach((cl) =>
    SUBGROUPS.forEach(([g, s, pt, en]) => rows.push([++code, cl, g, s, L1, pt, L2, en]))
  );
  extra.forEach((r) => rows.push([++code, ...r]));
  for (let i = 0; i < 3; i += 1) rows.push([++code]);
  return build(
    "TABLE OF NAMES OF SUB-GROUPS", "SUB-GROUP",
    ["CODE", "CHEKC-LIST", "GROUP", "SUB-GROUP", "LANG1", "NAME1", "LANG2", "NAME2"],
    KEYS(8), rows
  );
};

const form3 = (checkLists, extra = []) => {
  let code = 0;
  const rows = [];
  checkLists.forEach((cl) =>
    ACTIONS.forEach(([g, s, a, p, t1, t2, src1, src2, n1, n2]) =>
      rows.push([++code, cl, g, s, a, p, L1, t1, src1, n1, L2, t2, src2, n2])
    )
  );
  extra.forEach((r) => rows.push([++code, ...r]));
  for (let i = 0; i < 3; i += 1) rows.push([++code]);
  return build(
    "TABLE / NAMES OF ACTIONS", "ACTIONS",
    ["CODE", "CHECK-LIST", "GROUP", "SUB-GROUP", "ACTION", "PERIOD",
      "LANG1", "TYPE1", "SOURCE1", "NAME1", "LANG2", "TYPE2", "SOURCE2", "NAME2"],
    KEYS(14), rows
  );
};

const form4 = (checkLists, extra = []) => {
  let code = 0;
  const rows = [];
  checkLists.forEach((cl) =>
    VALUES.forEach(([g, s, a, i, pt, en]) => rows.push([++code, cl, g, s, a, i, L1, pt, L2, en]))
  );
  extra.forEach((r) => rows.push([++code, ...r]));
  for (let i = 0; i < 3; i += 1) rows.push([++code]);
  return build(
    "TABLE OF NAMES OF MEASUREMENTS", "MEASUREMENTS",
    ["CODE", "CHECK-LIST", "GROUP", "SUB-GROUP", "ACTION", "INDEX",
      "LANG1", "NAME1", "LANG2", "NAME2"],
    KEYS(10), rows
  );
};

// -------------------------------------------------------------- bundle A: valid, 1 template
const A = path.join(OUT, "A-valid");
write("Form1_Groups.xlsx", form1([1]), A);
write("Form2_Sub_Groups.xlsx", form2([1]), A);
write("Form3_Actions.xlsx", form3([1]), A);
write("Form4_Measurements.xlsx", form4([1]), A);

// -------------------------------------------------------------- bundle B: valid, 2 templates
const B = path.join(OUT, "B-two-templates");
write("Form1_Groups.xlsx", form1([1, 2]), B);
write("Form2_Sub_Groups.xlsx", form2([1, 2]), B);
write("Form3_Actions.xlsx", form3([1, 2]), B);
write("Form4_Measurements.xlsx", form4([1, 2]), B);

// -------------------------------------------------------------- bundle C: structural errors
// (duplicates + dangling references — these surface only once every row parses cleanly)
const C = path.join(OUT, "C-errors-structure");
write("Form1_Groups.xlsx", form1([1], [
  [1, 1, L1, "Duplicado do grupo 1", L2, "Duplicate of group 1"], // duplicate group 1
]), C);
write("Form2_Sub_Groups.xlsx", form2([1], [
  [1, 9, 1, L1, "Sub-grupo órfão", L2, "Orphan sub-group"],       // group 9 undefined
]), C);
write("Form3_Actions.xlsx", form3([1], [
  [1, 2, 3, 7, 1, L1, "VE", "8.9.9", "Ação em sub-grupo inexistente",
    L2, "VT", "8.9.9", "Action on a missing sub-group"],          // sub-group 2/3 undefined
]), C);
write("Form4_Measurements.xlsx", form4([1], [
  [1, 1, 1, 9, 1, L1, "Medição órfã", L2, "Orphan measurement"],  // action 1/1/9 undefined
]), C);

// -------------------------------------------------------------- bundle D: row-level errors
const D = path.join(OUT, "D-errors-rows");
write("Form1_Groups.xlsx", form1([1]), D);
write("Form2_Sub_Groups.xlsx", form2([1], [
  [1, 1, 9, L1, "", L2, ""],                    // no name in any language
  [1, null, 4, L1, "Sem grupo", L2, "No group"],// incomplete identity: GROUP blank
]), D);
write("Form3_Actions.xlsx", form3([1], [
  // NAME1 blank while LANG1 is set -> warning, row still imports with the ENG name
  [1, 1, 1, 8, 1, L1, "IPE", "8.1.1", "", L2, "PTI", "8.1.1", "Only English present"],
]), D);
write("Form4_Measurements.xlsx", form4([1]), D);
