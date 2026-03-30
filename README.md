# 列印模板庫 Print Templates

可直接用瀏覽器開啟、列印或另存 PDF 的 HTML 模板專案。

前台網站：

- [print-templates](https://bruce-yang-422.github.io/print-templates/)

原始碼倉庫：

- [GitHub Repository](https://github.com/bruce-yang-422/print-templates)

## 專案定位

這個專案分成兩層：

- 網站介面：首頁與模板頁的螢幕 UI，採統一的 Apple 風格靈感主題，由 [`css/style.css`](./css/style.css) 控制
- 列印模板：實際輸出的紙本版面，維持黑白灰階、減少大面積實底，偏向省墨與可長期列印使用

## 目前狀態

目前共有 `15` 份可直接開啟的模板，首頁預覽圖也已補齊 `15` 張 SVG。

所有模板目前共同具備：

- 左側 `10mm` 裝訂留白
- 裝訂線標示
- 列印友善的黑白灰階內容區
- 統一的模板頁 UI
- `A4 / A5 / A4裁A5` 三種尺寸選項

補充：

- [`templates/work-journal/work-journal.html`](./templates/work-journal/work-journal.html) 已整理成 `A 日誌`、`B 週總結` 兩種內容模式，且兩種模式都對應 `A4 / A5 / A4裁A5`
- [`js/template-size.js`](./js/template-size.js) 已處理螢幕預覽、列印前 staging，以及「本來就是雙 A5 裁切版型」不再被二次縮小的情況
- 已開始把筆記類常用內容區塊抽到 [`css/style.css`](./css/style.css) 的共用 `pr-*` 列印元件，減少新模板重複寫樣式

## 已完成模板

### 工作類

- [`templates/work-journal/work-journal.html`](./templates/work-journal/work-journal.html)
- [`templates/work/report/report.html`](./templates/work/report/report.html)

### 計畫類

- [`templates/planner/daily/daily.html`](./templates/planner/daily/daily.html)
- [`templates/planner/weekly/weekly.html`](./templates/planner/weekly/weekly.html)
- [`templates/planner/monthly/monthly.html`](./templates/planner/monthly/monthly.html)

### 會議類

- [`templates/meeting/meeting.html`](./templates/meeting/meeting.html)

### 目標類

- [`templates/goals/goals.html`](./templates/goals/goals.html)

### 筆記類

- [`templates/cornell/cornell.html`](./templates/cornell/cornell.html)
- [`templates/notes/topic-notes/topic-notes.html`](./templates/notes/topic-notes/topic-notes.html)

### 電商類

- [`templates/ecommerce/product-listing/product-listing.html`](./templates/ecommerce/product-listing/product-listing.html)
- [`templates/ecommerce/promo-plan/promo-plan.html`](./templates/ecommerce/promo-plan/promo-plan.html)
- [`templates/ecommerce/pricing/pricing.html`](./templates/ecommerce/pricing/pricing.html)
- [`templates/ecommerce/weekly-ops/weekly-ops.html`](./templates/ecommerce/weekly-ops/weekly-ops.html)

### 行銷類

- [`templates/marketing/social-plan/social-plan.html`](./templates/marketing/social-plan/social-plan.html)
- [`templates/marketing/content-calendar/content-calendar.html`](./templates/marketing/content-calendar/content-calendar.html)

## 設計與列印規則

### 網站 UI

- 首頁與模板頁的操作 UI 使用同一套共用樣式
- 主視覺方向是 Apple 風格靈感的灰白、深灰與藍色重點色
- 首頁卡片直接使用 `previews/**/*.svg` 作為實體預覽圖

### 紙本模板

- 模板內容維持黑白灰階
- 避免大面積黑底色塊
- 左側固定保留 `10mm` 裝訂區
- 適合列印或另存 PDF 後再打孔、裝訂、裁切

### 尺寸模式

- `A4`：單頁 A4 輸出
- `A5`：單頁 A5 輸出
- `A4裁A5`：A4 紙上排兩個 A5，方便裁切

## 技術結構

### 首頁

- [`index.html`](./index.html)
  首頁模板資料、篩選條件與模板卡片 rendering

- [`css/style.css`](./css/style.css)
  網站 UI、模板 UI、共用 page shell、尺寸預覽與部分共用列印元件
  目前也包含筆記類模板可重用的 `pr-header-band`、`pr-notes-split`、`pr-outline-card` 等區塊

### 模板

- [`templates/**/*.html`](./templates)
  各模板的實際版面內容

- [`js/template-size.js`](./js/template-size.js)
  模板尺寸切換、螢幕預覽、列印前暫存版面與 `@page size` 控制

### 預覽圖與資源

- [`previews/`](./previews)
  首頁模板卡片使用的 SVG 預覽圖

- [`assets/fonts`](./assets/fonts)
  字型資源目錄

- [`assets/images`](./assets/images)
  圖像資源目錄

- [`image/README`](./image/README)
  舊圖片資料夾的說明檔

## 使用方式

### 直接瀏覽首頁

- 開啟 [`index.html`](./index.html)

### 直接開啟單一模板

例如：

- [`templates/planner/daily/daily.html`](./templates/planner/daily/daily.html)
- [`templates/work-journal/work-journal.html`](./templates/work-journal/work-journal.html)
- [`templates/ecommerce/weekly-ops/weekly-ops.html`](./templates/ecommerce/weekly-ops/weekly-ops.html)

### 建議列印流程

1. 用 Chrome 或 Edge 開啟模板頁
2. 選擇內容模式
3. 選擇尺寸 `A4 / A5 / A4裁A5`
4. 點擊「列印 / 存 PDF」
5. 在列印對話框將邊距設為「無」

## 專案樹狀圖

```text
print-templates/
├── README.md
├── index.html
├── assets/
│   ├── fonts/
│   └── images/
├── css/
│   └── style.css
├── image/
│   └── README
├── js/
│   └── template-size.js
├── previews/
│   ├── ecommerce/
│   │   ├── pricing.svg
│   │   ├── product-listing.svg
│   │   ├── promo-plan.svg
│   │   └── weekly-ops.svg
│   ├── goals/
│   │   └── goals.svg
│   ├── marketing/
│   │   ├── content-calendar.svg
│   │   └── social-plan.svg
│   ├── meeting/
│   │   └── meeting.svg
│   ├── notes/
│   │   ├── cornell.svg
│   │   └── topic-notes.svg
│   ├── planner/
│   │   ├── daily.svg
│   │   ├── monthly.svg
│   │   └── weekly.svg
│   └── work/
│       ├── report.svg
│       └── work-journal.svg
└── templates/
    ├── cornell/
    │   └── cornell.html
    ├── ecommerce/
    │   ├── pricing/
    │   │   └── pricing.html
    │   ├── product-listing/
    │   │   └── product-listing.html
    │   ├── promo-plan/
    │   │   └── promo-plan.html
    │   └── weekly-ops/
    │       └── weekly-ops.html
    ├── goals/
    │   └── goals.html
    ├── marketing/
    │   ├── content-calendar/
    │   │   └── content-calendar.html
    │   └── social-plan/
    │       └── social-plan.html
    ├── meeting/
    │   └── meeting.html
    ├── notes/
    │   └── topic-notes/
    │       └── topic-notes.html
    ├── planner/
    │   ├── daily/
    │   │   └── daily.html
    │   ├── monthly/
    │   │   └── monthly.html
    │   └── weekly/
    │       └── weekly.html
    ├── work/
    │   └── report/
    │       └── report.html
    └── work-journal/
        └── work-journal.html
```

## 接下來可繼續做的事

- 把更多模板內容抽成更穩定的共用列印元件
- 逐步減少模板內重複的內容區塊樣式
- 擴充 `templates/notes/` 的實際模板
- 為每份模板補更一致的列印測試與尺寸驗證
