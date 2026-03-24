# BizSheet（Web版）

フリーランス・小規模事業者向けの業務管理Webアプリ。売上・顧客・経費・契約・請求書を一元管理するダッシュボード。

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フレームワーク | Next.js 16 (App Router) |
| 言語 | TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| バックエンド | Firebase (Auth / Firestore) |
| 認証 | Google OAuth |
| グラフ | Recharts |
| フォーム | React Hook Form + Zod |
| データ取得 | SWR + Firestore リアルタイムリスナー |

## 主な機能

- **ダッシュボード** — 月間売上・経費、未払い請求書、顧客数、6ヶ月売上推移チャート
- **顧客管理** — 会社名・担当者・連絡先のCRUD
- **売上管理** — 商談 → 進行中 → 完了 → 入金のステータス追跡
- **経費管理** — カテゴリ別（交通費、消耗品、交際費、通信費、家賃、光熱費）の記録
- **契約管理** — 契約期間・顧客紐付けの管理
- **請求書管理** — 下書き → 送付 → 入金 / 延滞のワークフロー
- **AIチャット** — ビジネス相談用チャット機能
- **ダークモード** — ライト / ダーク / システム切替対応

## セットアップ

```bash
cp .env.local.example .env.local
# .env.local に Firebase の設定値を記入
npm install
npm run dev
```
