import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Netlify Functions では import.meta.url が undefined になる場合があるため、
// 複数の方法でベースディレクトリを解決する
function getBaseDir() {
  // 方法1: import.meta.url が使える場合（ローカル開発環境など）
  if (typeof import.meta.url === "string") {
    return dirname(fileURLToPath(import.meta.url));
  }
  // 方法2: Netlify Lambda の実行ルートディレクトリ
  if (process.env.LAMBDA_TASK_ROOT) {
    return join(process.env.LAMBDA_TASK_ROOT, "netlify", "functions");
  }
  // 方法3: process.cwd() からの相対パス（フォールバック）
  return join(process.cwd(), "netlify", "functions");
}

// ── 赤色セル（入力可能）の完全マッピング ──────────────────────
// 条件付き書式で空白時に赤くなるセルのみ。数式セルは含まない。
const CELL_MAP = {
  // BS 資産（B=前期, C=当期）
  "bs.prev.cash":                  "B4",  "bs.curr.cash":                  "C4",
  "bs.prev.deposit":               "B5",  "bs.curr.deposit":               "C5",
  "bs.prev.notes_receivable":      "B7",  "bs.curr.notes_receivable":      "C7",
  "bs.prev.accounts_receivable":   "B8",  "bs.curr.accounts_receivable":   "C8",
  "bs.prev.securities":            "B10", "bs.curr.securities":            "C10",
  "bs.prev.inventory_wip":         "B12", "bs.curr.inventory_wip":         "C12",
  "bs.prev.raw_materials":         "B13", "bs.curr.raw_materials":         "C13",
  "bs.prev.prepaid":               "B15", "bs.curr.prepaid":               "C15",
  "bs.prev.st_loan_receivable":    "B16", "bs.curr.st_loan_receivable":    "C16",
  "bs.prev.prepaid_expense":       "B17", "bs.curr.prepaid_expense":       "C17",
  "bs.prev.other_current":         "B18", "bs.curr.other_current":         "C18",
  "bs.prev.building":              "B21", "bs.curr.building":              "C21",
  "bs.prev.machinery":             "B22", "bs.curr.machinery":             "C22",
  "bs.prev.land":                  "B23", "bs.curr.land":                  "C23",
  "bs.prev.other_tangible":        "B24", "bs.curr.other_tangible":        "C24",
  "bs.prev.software":              "B26", "bs.curr.software":              "C26",
  "bs.prev.other_intangible":      "B27", "bs.curr.other_intangible":      "C27",
  "bs.prev.investment_securities": "B29", "bs.curr.investment_securities": "C29",
  "bs.prev.equity_investment":     "B30", "bs.curr.equity_investment":     "C30",
  "bs.prev.security_deposits":     "B31", "bs.curr.security_deposits":     "C31",
  "bs.prev.lt_prepaid":            "B32", "bs.curr.lt_prepaid":            "C32",
  "bs.prev.insurance_reserve":     "B33", "bs.curr.insurance_reserve":     "C33",
  "bs.prev.other_investments":     "B34", "bs.curr.other_investments":     "C34",
  "bs.prev.deferred_assets":       "B37", "bs.curr.deferred_assets":       "C37",
  // BS 負債・純資産（F=前期, G=当期）
  "bs.prev.accounts_payable":      "F4",  "bs.curr.accounts_payable":      "G4",
  "bs.prev.accrued_payables":      "F5",  "bs.curr.accrued_payables":      "G5",
  "bs.prev.advance_received":      "F7",  "bs.curr.advance_received":      "G7",
  "bs.prev.deposits_received":     "F8",  "bs.curr.deposits_received":     "G8",
  "bs.prev.accrued_salary":        "F9",  "bs.curr.accrued_salary":        "G9",
  "bs.prev.accrued_expense":       "F10", "bs.curr.accrued_expense":       "G10",
  "bs.prev.accrued_tax":           "F11", "bs.curr.accrued_tax":           "G11",
  "bs.prev.st_loan_officer":       "F12", "bs.curr.st_loan_officer":       "G12",
  "bs.prev.st_loan_external":      "F13", "bs.curr.st_loan_external":      "G13",
  "bs.prev.other_current_liab":    "F14", "bs.curr.other_current_liab":    "G14",
  "bs.prev.lt_loan_officer":       "F17", "bs.curr.lt_loan_officer":       "G17",
  "bs.prev.lt_loan_external":      "F18", "bs.curr.lt_loan_external":      "G18",
  "bs.prev.bonds":                 "F19", "bs.curr.bonds":                 "G19",
  "bs.prev.other_lt_liab":         "F20", "bs.curr.other_lt_liab":         "G20",
  "bs.prev.capital":               "F23", "bs.curr.capital":               "G23",
  "bs.prev.capital_surplus":       "F24", "bs.curr.capital_surplus":       "G24",
  "bs.prev.retained_earnings":     "F25", "bs.curr.retained_earnings":     "G25",
  "bs.prev.treasury_stock":        "F26", "bs.curr.treasury_stock":        "G26",
  // PL（K=前期, L=当期）
  "pl.prev.sales":                 "K4",  "pl.curr.sales":                 "L4",
  "pl.prev.beg_inventory":         "K5",  "pl.curr.beg_inventory":         "L5",
  "pl.prev.purchases_subcontract": "K6",  "pl.curr.purchases_subcontract": "L6",
  "pl.prev.end_inventory":         "K7",  "pl.curr.end_inventory":         "L7",
  "pl.prev.interest_income":       "K14", "pl.curr.interest_income":       "L14",
  "pl.prev.misc_income":           "K15", "pl.curr.misc_income":           "L15",
  "pl.prev.other_non_op_income":   "K16", "pl.curr.other_non_op_income":   "L16",
  "pl.prev.interest_expense":      "K18", "pl.curr.interest_expense":      "L18",
  "pl.prev.other_non_op_expense":  "K19", "pl.curr.other_non_op_expense":  "L19",
  "pl.prev.special_net":           "K22", "pl.curr.special_net":           "L22",
  "pl.prev.income_tax":            "K24", "pl.curr.income_tax":            "L24",
  // 製造原価（K=前期, L=当期）
  "mfg.prev.material":             "K28", "mfg.curr.material":             "L28",
  "mfg.prev.labor":                "K29", "mfg.curr.labor":                "L29",
  "mfg.prev.expense":              "K30", "mfg.curr.expense":              "L30",
  "mfg.prev.subcontract":          "K31", "mfg.curr.subcontract":          "L31",
  "mfg.prev.depreciation":         "K32", "mfg.curr.depreciation":         "L32",
  // 販管費（Q=前期, R=当期）
  "sga.prev.officer_salary":       "Q4",  "sga.curr.officer_salary":       "R4",
  "sga.prev.employee_salary":      "Q5",  "sga.curr.employee_salary":      "R5",
  "sga.prev.bonus_retirement":     "Q6",  "sga.curr.bonus_retirement":     "R6",
  "sga.prev.welfare":              "Q7",  "sga.curr.welfare":              "R7",
  "sga.prev.welfare_misc":         "Q8",  "sga.curr.welfare_misc":         "R8",
  "sga.prev.commute":              "Q9",  "sga.curr.commute":              "R9",
  "sga.prev.recruitment":          "Q10", "sga.curr.recruitment":          "R10",
  "sga.prev.subcontract_sga":      "Q11", "sga.curr.subcontract_sga":      "R11",
  "sga.prev.vehicle":              "Q12", "sga.curr.vehicle":              "R12",
  "sga.prev.retirement_fund":      "Q13", "sga.curr.retirement_fund":      "R13",
  "sga.prev.freight":              "Q14", "sga.curr.freight":              "R14",
  "sga.prev.advertising":          "Q15", "sga.curr.advertising":          "R15",
  "sga.prev.entertainment":        "Q16", "sga.curr.entertainment":        "R16",
  "sga.prev.meeting":              "Q17", "sga.curr.meeting":              "R17",
  "sga.prev.travel":               "Q18", "sga.curr.travel":               "R18",
  "sga.prev.vehicle_exp":          "Q19", "sga.curr.vehicle_exp":          "R19",
  "sga.prev.promotion":            "Q20", "sga.curr.promotion":            "R20",
  "sga.prev.communication":        "Q21", "sga.curr.communication":        "R21",
  "sga.prev.consumables":          "Q22", "sga.curr.consumables":          "R22",
  "sga.prev.repairs":              "Q23", "sga.curr.repairs":              "R23",
  "sga.prev.utilities":            "Q24", "sga.curr.utilities":            "R24",
  "sga.prev.newspaper":            "Q25", "sga.curr.newspaper":            "R25",
  "sga.prev.rent":                 "Q26", "sga.curr.rent":                 "R26",
  "sga.prev.office_supplies":      "Q27", "sga.curr.office_supplies":      "R27",
  "sga.prev.tax_dues":             "Q28", "sga.curr.tax_dues":             "R28",
  "sga.prev.land_rent":            "Q29", "sga.curr.land_rent":            "R29",
  "sga.prev.depreciation":         "Q30", "sga.curr.depreciation":         "R30",
  "sga.prev.membership":           "Q31", "sga.curr.membership":           "R31",
  "sga.prev.consultant":           "Q32", "sga.curr.consultant":           "R32",
  "sga.prev.bad_debt":             "Q33", "sga.curr.bad_debt":             "R33",
  "sga.prev.insurance":            "Q34", "sga.curr.insurance":            "R34",
  "sga.prev.donation":             "Q35", "sga.curr.donation":             "R35",
  "sga.prev.mgmt_fee":             "Q36", "sga.curr.mgmt_fee":             "R36",
  "sga.prev.misc":                 "Q37", "sga.curr.misc":                 "R37",
};

// セル座標 → {row, col}
function cellToRC(addr) {
  const m = addr.match(/^([A-Z]+)(\d+)$/);
  if (!m) return null;
  let col = 0;
  for (const c of m[1]) col = col * 26 + (c.charCodeAt(0) - 64);
  return { row: parseInt(m[2]), col };
}

// ドット記法でオブジェクトから値を取得
function getVal(obj, path) {
  const v = path.split(".").reduce((o, k) => (o && o[k] !== undefined ? o[k] : null), obj);
  return (v !== null && v !== undefined) ? Number(v) || 0 : 0;
}

export const handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  try {
    const { data } = JSON.parse(event.body);

    // テンプレート読み込み
    const __dirname = getBaseDir();
    const tplPath = join(__dirname, "../../template.xlsx");
    const tplBuf = readFileSync(tplPath);

    // ExcelJSで開く
    const ExcelJS = await import("exceljs");
    const wb = new ExcelJS.default.Workbook();
    await wb.xlsx.load(tplBuf);

    // ②決算書概要シートのみを操作
    const ws = wb.getWorksheet("②決算書概要");
    if (!ws) throw new Error("シート「②決算書概要」が見つかりません");

    let writeCount = 0;
    for (const [path, addr] of Object.entries(CELL_MAP)) {
      const rc = cellToRC(addr);
      if (!rc) continue;
      const cell = ws.getCell(rc.row, rc.col);
      // 数式セルは絶対に上書きしない
      const existing = cell.value;
      if (existing && typeof existing === "object" && existing.formula) continue;
      if (typeof existing === "string" && existing.startsWith("=")) continue;
      cell.value = getVal(data, path);
      writeCount++;
    }

    const outBuf = await wb.xlsx.writeBuffer();
    const base64 = Buffer.from(outBuf).toString("base64");

    const company = (data.company || "会社").replace(/[\\/:*?"<>|]/g, "_");
    const term = (data.curr_term || "当期").replace(/[\\/:*?"<>|]/g, "_");
    const filename = `財務フィードバックシート_${company}_${term}.xlsx`;

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ success: true, filename, fileBase64: base64, writeCount }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
