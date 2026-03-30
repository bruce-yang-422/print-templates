# 模板開發規範與技術手冊

本文件供開發者與 AI 輔助工具閱讀，涵蓋本專案列印模板的 HTML 結構、CSS 系統、JavaScript 控制與語法範例。

---

## 1. 專案結構速覽

```
print-templates/
├── css/
│   └── style.css          # 全域 UI + 列印 CSS（所有模板共用）
├── js/
│   └── template-size.js   # 尺寸切換 + 列印 staging 控制器
├── assets/
│   └── 2026_calendar.json # 日曆資料（planner 系列共用）
├── templates/
│   ├── <category>/
│   │   └── <key>/
│   │       └── <key>.html # 單一模板
│   └── work-journal/
│       └── work-journal.html
├── previews/
│   └── <category>/
│       └── <key>.svg      # 首頁卡片預覽圖
├── doc/                   # 開發規範文件
└── index.html             # 首頁（模板瀏覽 + 篩選）
```

---

## 2. 模板 HTML 骨架

所有模板都使用以下標準骨架。新模板必須完整符合此結構。

```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>模板中文名稱 Template English Name</title>
<link rel="stylesheet" href="../../css/style.css">  <!-- 路徑依目錄深度調整 -->
<style>
/* 僅放本模板特有的 CSS，通用樣式不要重複定義 */
</style>
</head>
<body class="template-page">
<!-- UI 導覽列 + 工具列 -->
<div class="ui">
  <div class="ui-nav">
    <a href="../../index.html" class="back-link">
      <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
        <path d="M7 1L3 5l4 4"/>
      </svg>
      列印模板庫
    </a>
    <span class="nav-sep">/</span>
    <div class="ui-title">模板中文名稱 <small>English Name</small></div>
  </div>
  <div class="ui-toolbar">
    <!-- 可選：版面模式切換 -->
    <span class="toolbar-label">版面</span>
    <div class="mode-cards">
      <button class="card active" onclick="setMode('a')">
        <strong>A</strong> 模式說明 <span style="font-size:9px;opacity:.5">補充說明</span>
      </button>
    </div>
    <!-- 尺寸切換（必須） -->
    <span class="toolbar-label">尺寸</span>
    <div class="size-cards">
      <button type="button" class="card size-card active" data-print-size="a4">A4</button>
      <button type="button" class="card size-card" data-print-size="a5">A5</button>
      <button type="button" class="card size-card" data-print-size="cut">A4裁A5</button>
    </div>
    <div class="toolbar-right">
      <span class="hint">Chrome → 存PDF → 邊距「無」</span>
      <button class="btn-print" onclick="window.print()">列印 / 存 PDF</button>
    </div>
  </div>
</div>
<!-- 模板頁面內容 -->
<div class="pages pages-wrap">
  <div class="page-label">▸ A4 直向・版面說明</div>
  <div class="page page-port">
    <div class="pr-shell">
      <!-- 模板內容 -->
    </div>
    <div class="pr-page-num">頁碼標籤</div>
  </div>
</div>
<!-- 必須引入 -->
<script src="../../js/template-size.js"></script>
<script>
/* 列印尺寸宣告 */
let styleTag = document.createElement('style');
styleTag.textContent = '@media print { @page { size: A4 portrait; margin: 0; } }';
document.head.appendChild(styleTag);
</script>
</body>
</html>
```

---

## 3. CSS 系統說明

### 3.1 全域裝訂線（`--bind-gap`）

`css/style.css` 根據 `data-print-size` 自動設定裝訂留白變數：

```css
body.template-page[data-print-size="a4"]  .page { --bind-gap: 15mm; }
body.template-page[data-print-size="b5"]  .page { --bind-gap: 12mm; }
body.template-page[data-print-size="a5"]  .page { --bind-gap: 12mm; }
body.template-page[data-print-size="cut"] .page { --bind-gap: 10mm; }
```

**Shell 包裝類別對應的 `padding-left` 覆寫規則（`!important`）：**

| 父頁面類別 | 子 shell 類別 | `padding-left` |
|---|---|---|
| `.page-port` | `.pr-shell`, `.a-wrap`, `.b-wrap`, `.rpt-wrap`, `.inner-a4` | `var(--bind-gap) + 4mm` |
| `.page-land` | `.pr-shell`, `.b-wrap`, `.wrap` | `var(--bind-gap) + 2mm` |
| `.page-a5-port` | `.pr-shell`, `.b-wrap`, `.quick-shell` | `var(--bind-gap) + 2mm` |
| `.page-a5` | `.pr-shell`, `.b-wrap`, `.c-wrap` | `var(--bind-gap) + 2mm` |
| 全域（任意父） | `.a-header`, `.a-left`, `.a-review`, `.wk-head`, `.cal-head`, `.trk-ch`, `.trk-right` | `var(--bind-gap) + 4mm` |

> **規則**：新模板的主要內容 shell 必須使用上表中的 class 名稱，以確保裝訂線自動適配不同紙張尺寸。`pr-shell` 是最通用的選擇。

---

### 3.2 頁面尺寸類別

| 類別 | 尺寸 | 用途 |
|---|---|---|
| `.page-port` | `210mm × 297mm` | A4 直向 |
| `.page-land` | `297mm × 210mm` | A4 橫向 |
| `.page-a5-port` | `148mm × 210mm` | A5 直向 |
| `.page-a5` | `210mm × 148mm` | A5 橫向 |

---

### 3.3 `pr-*` 元件類別速查

`css/style.css` 提供一套標準化的列印模板元件，以 `pr-` 前綴統一命名：

**結構層**

```html
<!-- 主要內容包裝（自動套用 bind-gap） -->
<div class="pr-shell">...</div>

<!-- 橫向版面（A4 landscape） -->
<div class="pr-shell pr-land">...</div>

<!-- 頁碼標籤（右下角） -->
<div class="pr-page-num">A · 版面名稱</div>
```

**標頭區**

```html
<!-- 小標籤（模板分類 + 英文名） -->
<span class="pr-kicker">分類名稱 · Category</span>

<!-- 標頭帶（包含標題列 + meta 欄位） -->
<div class="pr-header-band">
  <div class="pr-title-row">
    <strong>模板主標題</strong>
    <span>副標題說明</span>
  </div>
  <!-- meta 欄位 grid（cols-2 / cols-3 / cols-4） -->
  <div class="pr-meta-grid cols-3">
    <div>
      <span class="pr-field-label">欄位標籤</span>
      <span class="pr-field-blank"></span>
    </div>
  </div>
</div>
```

**欄位元素**

```html
<!-- 欄位小標籤 -->
<span class="pr-field-label">欄位名稱</span>

<!-- 空白書寫線（較粗，用於主要資訊） -->
<span class="pr-field-blank"></span>

<!-- 書寫橫線（細，用於輔助資訊） -->
<span class="pr-line"></span>

<!-- 多行書寫線組合 -->
<div class="pr-lines">
  <span class="pr-line"></span>
  <span class="pr-line"></span>
</div>
```

**卡片區塊**

```html
<!-- 標準卡片（細邊框） -->
<div class="pr-card">
  <div class="pr-card-title">
    <span>卡片標題</span>
    <em>英文副標</em>
  </div>
  <div class="pr-lines">
    <span class="pr-line"></span>
  </div>
</div>
```

**清單元素**

```html
<!-- checkbox 行（方格 + 空白線） -->
<div class="pr-check-row">
  <span class="pr-sq"></span>
  <span class="pr-mini-line" style="flex:1"></span>
</div>

<!-- bullet 行（圓點 + 空白線） -->
<div class="pr-bullet-row">
  <span class="pr-bullet-dot"></span>
  <span class="pr-mini-line" style="flex:1"></span>
</div>
```

**表格**

```html
<table class="pr-table">
  <tr>
    <th style="width:30%">欄位一</th>
    <th style="width:40%">欄位二</th>
    <th style="width:30%">欄位三</th>
  </tr>
  <tr>
    <td><div class="pr-line"></div></td>
    <td><div class="pr-line"></div></td>
    <td><div class="pr-line"></div></td>
  </tr>
</table>
```

**網格佈局**

```html
<!-- 兩欄 grid -->
<div class="pr-grid-2">
  <div class="pr-card">...</div>
  <div class="pr-card">...</div>
</div>

<!-- 三欄 grid -->
<div class="pr-grid-3">
  <div class="pr-card">...</div>
  <div class="pr-card">...</div>
  <div class="pr-card">...</div>
</div>
```

**總結框**

```html
<!-- 加粗邊框的彙整區 -->
<div class="pr-summary-box">
  <span class="pr-field-label">總結標題</span>
  <div class="pr-bullet-row">
    <span class="pr-bullet-dot"></span>
    <span class="pr-mini-line" style="flex:1"></span>
  </div>
</div>
```

---

## 4. 多模式版面切換

### 4.1 CSS 控制

在 `<body>` 上加 `sel-a`、`sel-b` 等 class，搭配 CSS visibility 控制：

```css
.mode-a, .mode-b { display: none; }
body.sel-a .mode-a { display: block; }
body.sel-b .mode-b { display: block; }

@media print {
  .mode-a, .mode-b { display: none !important; }
  body.sel-a .mode-a { display: block !important; }
  body.sel-b .mode-b { display: block !important; }
}
```

### 4.2 HTML 結構

```html
<div class="pages pages-wrap">
  <div class="page-label mode-a">▸ 模式 A — A4 直向・說明</div>
  <div class="page page-port mode-a">
    <div class="pr-shell">...</div>
  </div>

  <div class="page-label mode-b">▸ 模式 B — A4 直向・說明</div>
  <div class="page page-port mode-b">
    <div class="pr-shell">...</div>
  </div>
</div>
```

### 4.3 JavaScript 控制函數

```javascript
const pageStyles = {
  a: 'A4 portrait',
  b: 'A4 portrait',
  c: 'A4 landscape'
};
let styleTag = document.createElement('style');
styleTag.id = 'pg-size';
document.head.appendChild(styleTag);

function setMode(mode) {
  document.body.classList.remove('sel-a', 'sel-b', 'sel-c');
  document.body.classList.add('template-page', 'sel-' + mode);
  styleTag.textContent = '@media print { @page { size: ' + pageStyles[mode] + '; margin: 0; } }';
  document.querySelectorAll('.mode-cards .card').forEach((card, index) => {
    card.classList.toggle('active', ['a', 'b', 'c'][index] === mode);
  });
}
setMode('a');
```

---

## 5. 尺寸切換系統（`template-size.js`）

`js/template-size.js` 統一管理以下行為：

- 監聽 `.size-card` 按鈕點擊，更新 `body.data-print-size`
- 根據尺寸動態切換 `--bind-gap` CSS 變數
- 切換 `.page` 的 `width` / `height`（螢幕預覽用）
- 注入 `@media print { @page { size: ...; margin: 0; } }`
- 處理 `A4裁A5` 模式的自動直/橫判斷

**引入方式（模板底部）：**

```html
<script src="../../js/template-size.js"></script>
```

> 注意：只有在使用標準 `.size-card` 按鈕時，`template-size.js` 才會自動接管。如果模板有自定義的尺寸切換邏輯，確保也更新 `body.dataset.printSize`。

---

## 6. 日曆資料層

**Planner 系列**（daily、weekly、monthly 等）使用統一的日曆資料：

```javascript
// 載入 2026 年日曆資料
fetch('../../assets/2026_calendar.json')
  .then(res => res.json())
  .then(data => { /* 渲染日曆 */ });
```

資料結構（`2026_calendar.json`）：

```json
{
  "2026-01-01": {
    "lunar": "臘月十三",
    "solarTerm": null,
    "holiday": "元旦",
    "isHoliday": true,
    "week": 1
  }
}
```

搭配 `js/calendar-data.js` 提供共用的日期格式化、週次計算等函數。

---

## 7. 列印 CSS 規則

### 7.1 標準 `@media print` 結構

```css
@media print {
  /* 隱藏 UI */
  .ui, .page-label { display: none !important; }
  /* 移除螢幕佈局 padding */
  .pages-wrap { padding: 0 !important; gap: 0 !important; }
  /* 移除陰影，設定分頁 */
  .page { box-shadow: none !important; page-break-after: always; break-after: page; }
  /* 多模式顯示控制 */
  .mode-a, .mode-b { display: none !important; }
  body.sel-a .mode-a { display: block !important; }
  body.sel-b .mode-b { display: block !important; }
}
```

### 7.2 `@page` 宣告方式

由 JavaScript 動態注入，確保正確的紙張方向：

```javascript
// 單一固定尺寸（直接在 <script> 內）
let styleTag = document.createElement('style');
styleTag.textContent = '@media print { @page { size: A4 portrait; margin: 0; } }';
document.head.appendChild(styleTag);
```

**可用 size 值：**

| 值 | 說明 |
|---|---|
| `A4 portrait` | A4 直向 |
| `A4 landscape` | A4 橫向 |
| `A5 portrait` | A5 直向 |
| `A5 landscape` | A5 橫向 |
| `B5 portrait` | B5 直向 |

---

## 8. 模板目錄與路徑規則

### 8.1 目錄結構

```
templates/
├── <category>/           # 分類資料夾
│   └── <template-key>/   # 模板資料夾（與 key 同名）
│       └── <key>.html    # 模板主檔
└── work-journal/         # 特例：頂層分類
    └── work-journal.html
```

### 8.2 相對路徑深度

標準模板（兩層深）：

```html
<link rel="stylesheet" href="../../css/style.css">
<script src="../../js/template-size.js"></script>
<a href="../../index.html">...</a>
```

頂層模板（一層深，如 `work-journal`）：

```html
<link rel="stylesheet" href="../css/style.css">
```

> **注意**：`cornell` 模板位於 `templates/cornell/cornell.html`（一層深），路徑為 `../css/style.css`。

### 8.3 `previews/` 對應規則

| 模板路徑 | SVG 預覽路徑 |
|---|---|
| `templates/planner/daily/daily.html` | `previews/planner/daily.svg` |
| `templates/work-journal/work-journal.html` | `previews/work/work-journal.svg` |
| `templates/health/sleep-tracker/sleep-tracker.html` | `previews/health/sleep-tracker.svg` |

---

## 9. index.html 模板登錄格式

新模板需在 `index.html` 的 `window.TEMPLATES` 陣列中新增一筆：

```javascript
{
  key: 'template-key',           // 唯一識別鍵（英文小寫 + 連字號）
  name: '中文名稱',               // 卡片顯示名稱
  nameEn: 'English Name',        // 英文名稱（篩選 / 搜尋用）
  desc: '一行簡短功能說明。',      // 卡片摘要文字
  cat: 'category',               // 分類 key（對應篩選標籤）
  svg: 'previews/cat/key.svg',   // 預覽 SVG 路徑
  url: 'templates/cat/key/key.html',  // 模板頁面路徑
  tags: ['tag1', 'tag2'],        // 搜尋標籤（可選）
  sizes: ['a4', 'a5', 'cut'],    // 支援尺寸
}
```

---

## 10. 開發檢查清單

新增模板前請確認以下項目：

- [ ] `<body>` 有 `class="template-page"`
- [ ] `<body>` 有初始 `data-print-size="a4"`（或由 JS 設定）
- [ ] 連結 `css/style.css`（路徑正確）
- [ ] 引入 `js/template-size.js`
- [ ] 主要內容包裝使用 `pr-shell`（或其他受 `!important` 覆寫的 shell 類別）
- [ ] 頁面 div 使用 `page-port` / `page-land` / `page-a5-port` / `page-a5` 正確類別
- [ ] `@media print` 區塊正確隱藏 `.ui` 與 `.page-label`
- [ ] 有 `@page { size: ...; margin: 0; }` 宣告
- [ ] SVG 預覽已建立於對應路徑
- [ ] 已在 `index.html` 的 `TEMPLATES` 陣列登錄

---

## 11. 命名慣例

| 類型 | 規則 | 範例 |
|---|---|---|
| 模板 key | 全小寫 + 連字號 | `sleep-tracker` |
| HTML 檔名 | 與模板 key 相同 | `sleep-tracker.html` |
| SVG 檔名 | 與模板 key 相同 | `sleep-tracker.svg` |
| 分類資料夾 | 全小寫 + 連字號 | `health/` |
| CSS class（模板自訂） | 使用有意義的描述性名稱 | `.bd-grid-3` |
| CSS class（禁止） | 不要與 `pr-*` 或 `ui-*` 系統前綴衝突 | — |

---

## 12. 設計限制與注意事項

1. **不使用 JavaScript 框架**：所有模板為純原生 HTML + CSS + 少量 Vanilla JS。
2. **不使用外部字型 CDN**：字型依賴系統字體堆疊（PingFang TC / Microsoft JhengHei / Heiti TC）。
3. **列印輸出為黑白灰階**：模板本身不使用顏色，僅使用 `#111` 到 `#fff` 的灰階值。
4. **螢幕 UI 顏色**：UI 工具列使用 `css/style.css` 的系統色（與列印內容區分）。
5. **不依賴 `<link>` 外的圖片資源**：模板內容區不引用外部圖片，純 CSS / HTML 排版。
6. **硬編碼 padding 會被覆寫**：模板 `<style>` 中對 shell/wrap 的硬編碼 `padding-left` 會被 `style.css` 的 `!important` 規則覆寫，這是預期行為。
