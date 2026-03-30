# 列印模板庫 Print Templates

可直接用瀏覽器開啟、列印或另存 PDF 的 HTML 模板專案。

目前專案分成兩層：

- 網站介面：使用新的彩色主題色票，集中由 `css/style.css` 管理
- 模板列印頁：維持黑白灰階、左側 `10mm` 裝訂區，並支援 `A4 / A5 / A4裁A5`

---

## 目前完成狀態

目前已完成 `14` 份模板：

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

### 電商類

- `templates/ecommerce/product-listing/product-listing.html`
- `templates/ecommerce/promo-plan/promo-plan.html`
- `templates/ecommerce/pricing/pricing.html`
- `templates/ecommerce/weekly-ops/weekly-ops.html`

### 行銷類

- `templates/marketing/social-plan/social-plan.html`
- `templates/marketing/content-calendar/content-calendar.html`

---

## 最近更新

- 首頁 `index.html` 的 inline CSS 已抽出，改由 `css/style.css` 控制
- 首頁卡片改成讀取實體預覽圖 `previews/**/*.svg`
- `previews/` 已補齊 14 張 SVG 預覽圖，不再只是空資料夾
- 新增電商模板 `templates/ecommerce/weekly-ops/weekly-ops.html`
- 在共用樣式新增模板 UI 與列印元件層，供後續模板重用

---

## 設計規則

### 網站介面

- 首頁與模板頁螢幕 UI 使用同一套彩色主題
- 主要色票：
  - `Pearl Aqua` `#6dd3ce`
  - `Tea Green` `#c8e9a0`
  - `Tangerine Dream` `#f7a278`
  - `Vintage Berry` `#a13d63`
  - `Midnight Violet` `#351e29`

### 列印模板

- 模板內容維持黑白灰階
- 避免大面積黑底，較省墨
- 每頁左側保留 `10mm` 裝訂區
- 裝訂區右側有淡灰裝訂線
- 所有模板皆提供 `A4 / A5 / A4裁A5`

---

## 技術結構

### 首頁

- `index.html`
  - 模板資料與篩選邏輯
  - 讀取 `previews/**/*.svg` 作為卡片預覽

- `css/style.css`
  - 網站介面樣式
  - 模板 UI 樣式
  - 共用列印 page shell
  - 新的共用列印元件，例如 `pr-shell`、`pr-hero`、`pr-table`

### 模板頁

- `templates/**/*.html`
  - 每個模板仍可獨立維護內容版面
  - 螢幕 UI 已統一依賴共用樣式

- `js/template-size.js`
  - 列印前依目前頁面輸出 `A4 / A5 / A4裁A5`

### 預覽圖

- `previews/**/*.svg`
  - 首頁模板卡片使用的實體預覽檔
  - 目前共 `14` 張

---

## 使用方式

### 首頁瀏覽

直接開啟：

- `index.html`

### 直接開啟模板

例如：

- `templates/planner/daily/daily.html`
- `templates/ecommerce/weekly-ops/weekly-ops.html`

### 列印建議

1. 用 Chrome 或 Edge 開啟模板頁
2. 選擇版面模式
3. 選擇尺寸 `A4 / A5 / A4裁A5`
4. 點擊「列印 / 存 PDF」
5. 邊距設為「無」

---

## 專案樹狀圖

```text
print-templates/
├── README.md
├── index.html
├── css/
│   └── style.css
├── js/
│   └── template-size.js
├── assets/
│   ├── fonts/
│   └── images/
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
│   │   └── cornell.svg
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

---

## 下一步方向

- 把更多舊模板內容逐步遷移到共用列印元件
- 擴充 `templates/notes/` 實際模板
- 補更多商務與營運類模板
- 逐步把重複的內容區塊樣式再抽薄一層
