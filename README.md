# BizSheet Web

フリーランス向けの業務管理アプリ。売上・顧客・経費・請求書をFirestoreでリアルタイム同期して一画面で管理する。

元々はFlutterのモバイル版（[biz_sheet_app](https://github.com/sssyner/biz_sheet_app)）を先に作っていたが、
PCからも使いたくなったのでNext.jsでWeb版を実装した。バックエンドAPIは共通（Vercelにデプロイ済み）。

## 技術構成

- Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- Firebase Auth (Google OAuth) + Firestore
- React Hook Form + Zod でバリデーション
- Recharts でダッシュボードのグラフ描画
- ダークモード対応（system / light / dark）

データ取得はFirestoreの`onSnapshot`でリアルタイムリスナーを張る形にした（`useFirestoreCollection`フック）。
CRUD操作はクライアントからFirestoreに直接書き込み、AIチャットだけ外部APIを経由している。

## 画面

- ダッシュボード: 月間売上/経費サマリー + 6ヶ月推移チャート + 未入金一覧
- 顧客/売上/経費/契約/請求書: それぞれ一覧 + 新規作成 + 編集
- AIチャット: 売上分析や経営相談

## セットアップ

```bash
cp .env.local.example .env.local
# Firebase設定を記入
npm install
npm run dev
```

APIサーバー（biz_sheet_api）が別途必要。チャット機能を使わないなら不要。
