# 財務フィードバックシート 自動入力アプリ

前期・当期の決算書PDFをアップロードすると、AIが数値を読み取り、
財務フィードバックシート（②決算書概要）に自動入力してダウンロードできます。

---

## ファイル構成

```
pdf2excel-app/
├── index.html                      # メインページ
├── package.json                    # 依存パッケージ（exceljs）
├── netlify.toml                    # Netlify設定
├── template.xlsx                   # 財務フィードバックシートのテンプレート
└── netlify/
    └── functions/
        ├── extract.mjs             # AI（Claude）で数値を抽出
        └── generate.mjs            # Excelに数値を書き込んで返す
```

---

## Netlifyデプロイ手順

### 1. GitHubにアップロード

GitHub のリポジトリを作成し、**フォルダ内のすべてのファイル**をアップロードします。
（`template.xlsx` を忘れずに含めること）

### 2. Netlifyで接続

1. [app.netlify.com](https://app.netlify.com) にログイン
2. **Add new site → Import an existing project → Deploy with GitHub**
3. 作成したリポジトリを選択
4. ビルド設定はそのまま → **Deploy site**

### 3. 環境変数を設定（必須）

**Site settings → Environment variables → Add a variable**

| Key | Value |
|-----|-------|
| `ANTHROPIC_API_KEY` | `sk-ant-...（あなたのAPIキー）` |

保存後、**Deploys → Trigger deploy → Deploy site** でリデプロイ。

---

## 動作の流れ

1. ブラウザでPDFのテキストを抽出（pdf.js使用）
2. テキストをNetlify Function（`/api/extract`）に送信
3. Claude APIが財務数値をJSON形式で抽出
4. `template.xlsx`のセルに数値を書き込み（`/api/generate`）
5. 入力済みExcelをブラウザにダウンロード

---

## 注意事項

- **スキャン画像のPDFは読み取れません**（テキスト埋め込み型PDFが必要）
- APIキーの費用：1回あたり約$0.01〜$0.05（数円程度）
- `template.xlsx` を変更した場合は、GitHubにpushして再デプロイが必要
