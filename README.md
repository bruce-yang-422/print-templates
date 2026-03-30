# 列印模板庫 Print Templates

可直接用瀏覽器開啟、列印或另存 PDF 的 HTML 模板專案。

前台網站：

- [https://print-templates.tranquility-base.work](https://print-templates.tranquility-base.work)

原始碼倉庫：

- [https://github.com/bruce-yang-422/print-templates](https://github.com/bruce-yang-422/print-templates)

## 專案概覽

這個專案分成兩個主要層次：

- 網站介面：首頁與模板頁的操作 UI，使用統一的 Apple 風格靈感主題
- 列印模板：實際輸出的紙本版面，維持黑白灰階，優先考慮省墨、裁切、打孔與裝訂

目前共有 `15` 份 HTML 模板，對應 `15` 張 SVG 預覽圖。

## 共同規則

目前模板頁共同具備：

- `A4` 左側 `15mm` 裝訂留白
- `A5` 左側 `12mm` 裝訂留白
- 淡灰裝訂線
- 列印友善的黑白灰階內容區
- 統一的模板頁 UI
- `A4 / A5 / A4裁A5` 三種尺寸模式

補充：

- `js/template-size.js` 統一處理尺寸切換、螢幕預覽、列印前 staging 與 `@page size`
- `A4裁A5` 會依目前版型自動判斷排版方向
- `templates/work-journal/work-journal.html` 已整理成 `A 日誌`、`B 週總結` 兩種內容模式，且都支援三種尺寸
- `css/style.css` 已承接模板頁 UI、page shell 與一部分共用列印元件

## Planner 日曆資料

`daily / weekly / monthly` 三份 planner 模板目前共用同一份日曆資料來源：

- `assets/2026_calendar.json`

這份資料目前可提供：

- 國曆日期
- 標準週數
- 中文星期
- 農曆日期
- 節氣
- 台灣假日名稱與類型

共用邏輯由 `js/calendar-data.js` 負責，讓三份 planner 在日期、週次、農曆與假日顯示上維持一致。

## 已完成模板

### 工作類

- `templates/work-journal/work-journal.html`
- `templates/work/report/report.html`

### 計畫類

- `templates/planner/daily/daily.html`
- `templates/planner/weekly/weekly.html`
- `templates/planner/monthly/monthly.html`

### 會議類

- `templates/meeting/meeting.html`

### 目標類

- `templates/goals/goals.html`

### 筆記類

- `templates/cornell/cornell.html`
- `templates/notes/topic-notes/topic-notes.html`

### 電商類

- `templates/ecommerce/product-listing/product-listing.html`
- `templates/ecommerce/promo-plan/promo-plan.html`
- `templates/ecommerce/pricing/pricing.html`
- `templates/ecommerce/weekly-ops/weekly-ops.html`

### 行銷類

- `templates/marketing/social-plan/social-plan.html`
- `templates/marketing/content-calendar/content-calendar.html`

## 目前重點進展

- 首頁已改為讀取 `previews/**/*.svg` 作為實際預覽圖
- `index.html` 的站台樣式已抽到 `css/style.css`
- 模板頁重複的 UI 樣式已集中到 `css/style.css`
- planner 三份模板已共用 `assets/2026_calendar.json`
- `月計畫` 已支援農曆與台灣假日顯示
- `日計畫`、`週計畫` 已支援日期選擇
- `目標分解` 模板文案已調整成更通用的拆解語境
- 新增筆記模板 `templates/notes/topic-notes/topic-notes.html`

## 技術結構

### 首頁與樣式

- `index.html`
  首頁模板資料、篩選條件與模板卡片 rendering

- `css/style.css`
  網站 UI、模板 UI、page shell、尺寸預覽與部分共用列印元件

### 模板與腳本

- `templates/**/*.html`
  各模板的實際版面內容

- `js/template-size.js`
  模板尺寸切換、螢幕預覽、列印前暫存版面與 `@page size` 控制

- `js/calendar-data.js`
  planner 共用日曆資料載入、日期格式化、週次、農曆與假日查詢

### 預覽與資源

- `previews/`
  首頁模板卡片使用的 SVG 預覽圖，統一為 `1:1` 畫布

- `assets/2026_calendar.json`
  planner 共用日曆資料

- `assets/fonts`
  字型資源目錄

- `assets/images`
  圖像資源目錄

- `image/README`
  舊圖片資料夾的說明檔

## 使用方式

### 直接瀏覽首頁

- 開啟 `index.html`

### 直接開啟模板

例如：

- `templates/planner/daily/daily.html`
- `templates/planner/weekly/weekly.html`
- `templates/planner/monthly/monthly.html`
- `templates/work-journal/work-journal.html`

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
│   ├── 2026_calendar.json
│   ├── fonts/
│   └── images/
├── css/
│   └── style.css
├── image/
│   └── README
├── js/
│   ├── calendar-data.js
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

## 下一步

- 逐步把舊模板內容區塊繼續抽成更穩定的共用列印元件
- 針對所有模板做一輪列印檢查，特別確認裝訂線、版心、頁尾與跨頁問題
- 持續擴充 `templates/notes/` 的實際模板
- 補齊各模板在 `A4 / A5 / A4裁A5` 三種尺寸下的實測與微調
