export const handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return {
    statusCode: 500,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ error: "ANTHROPIC_API_KEY が設定されていません" }),
  };

  try {
    const { prevText, currText } = JSON.parse(event.body);

    const system = `あなたは日本の中小企業の決算書から財務データを抽出する専門AIです。
単位は「円」のまま抽出してください（万円・千円に変換しない）。
見つからない項目は0としてください。
JSONのみ出力し、前後に説明文やコードブロック記号を付けないでください。`;

    const userMsg = `前期と当期の決算書テキストから財務データをJSON形式で抽出してください。

===前期決算書===
${prevText.substring(0, 5000)}

===当期決算書===
${currText.substring(0, 5000)}

以下のJSON構造で抽出してください（単位：円）:
{
  "company": "会社名",
  "prev_term": "前期の期名（例：第40期）",
  "curr_term": "当期の期名（例：第41期）",
  "bs": {
    "prev": {
      "cash": 0, "deposit": 0,
      "notes_receivable": 0, "accounts_receivable": 0,
      "securities": 0,
      "inventory_wip": 0, "raw_materials": 0,
      "prepaid": 0, "st_loan_receivable": 0, "prepaid_expense": 0, "other_current": 0,
      "building": 0, "machinery": 0, "land": 0, "other_tangible": 0,
      "software": 0, "other_intangible": 0,
      "investment_securities": 0, "equity_investment": 0, "security_deposits": 0,
      "lt_prepaid": 0, "insurance_reserve": 0, "other_investments": 0,
      "deferred_assets": 0,
      "accounts_payable": 0, "accrued_payables": 0,
      "advance_received": 0, "deposits_received": 0,
      "accrued_salary": 0, "accrued_expense": 0, "accrued_tax": 0,
      "st_loan_officer": 0, "st_loan_external": 0, "other_current_liab": 0,
      "lt_loan_officer": 0, "lt_loan_external": 0, "bonds": 0, "other_lt_liab": 0,
      "capital": 0, "capital_surplus": 0, "retained_earnings": 0, "treasury_stock": 0
    },
    "curr": {}
  },
  "pl": {
    "prev": {
      "sales": 0,
      "beg_inventory": 0, "purchases_subcontract": 0, "end_inventory": 0,
      "interest_income": 0, "misc_income": 0, "other_non_op_income": 0,
      "interest_expense": 0, "other_non_op_expense": 0,
      "special_net": 0,
      "income_tax": 0
    },
    "curr": {}
  },
  "mfg": {
    "prev": {
      "material": 0, "labor": 0, "expense": 0, "subcontract": 0, "depreciation": 0
    },
    "curr": {}
  },
  "sga": {
    "prev": {
      "officer_salary": 0, "employee_salary": 0, "bonus_retirement": 0,
      "welfare": 0, "welfare_misc": 0, "commute": 0, "recruitment": 0,
      "subcontract_sga": 0, "vehicle": 0, "retirement_fund": 0,
      "freight": 0, "advertising": 0, "entertainment": 0, "meeting": 0,
      "travel": 0, "vehicle_exp": 0, "promotion": 0,
      "communication": 0, "consumables": 0, "repairs": 0, "utilities": 0,
      "newspaper": 0, "rent": 0, "office_supplies": 0, "tax_dues": 0,
      "land_rent": 0, "depreciation": 0, "membership": 0, "consultant": 0,
      "bad_debt": 0, "insurance": 0, "donation": 0, "mgmt_fee": 0, "misc": 0
    },
    "curr": {}
  }
}

注意：
- 「現金・預金」が一括表示の場合、cashを0にしてdepositに合計を入れてください
- 「当期製品製造原価」はpl.mfg_costではなく、内訳をmfgに入れてください
- special_netは特別利益から特別損失を引いた純額を入れてください
- other_non_op_expenseには役員保険料等も含めてください`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        system,
        messages: [{ role: "user", content: userMsg }],
      }),
    });

    const apiData = await res.json();
    if (!res.ok) throw new Error(apiData.error?.message || "API error");

    const rawText = apiData.content[0].text.replace(/```json|```/g, "").trim();
    const extracted = JSON.parse(rawText);

    // currが空の場合prevをコピーしてゼロ埋め
    for (const section of ["bs", "pl", "mfg", "sga"]) {
      if (extracted[section] && !extracted[section].curr) {
        extracted[section].curr = Object.fromEntries(
          Object.keys(extracted[section].prev).map(k => [k, 0])
        );
      }
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ success: true, data: extracted }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
