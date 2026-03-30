# 🖨️ 列印模板庫 (Print Templates)

可直接用瀏覽器開啟、列印或另存 PDF 的高品質 HTML 模板專案。設計理念為「**螢幕預覽直覺，列印輸出極簡**」，所有列印模板皆針對實際紙本體驗進行最佳化調整。

**[🌐 前台網站 Live Demo](https://print-templates.tranquility-base.work)** | **[🐙 GitHub Repository](https://github.com/bruce-yang-422/print-templates)**

---

## 📖 專案概覽 (Overview)

這個專案架構劃分為兩個主要體驗層次：

- **💻 網站介面**：提供首頁與模板頁籤的操作 UI，視覺上採用受 Apple 啟發的乾淨且一致的主題風格，方便使用者挑選與預覽版型。
- **📄 列印模板**：實際輸出的紙本版面。排版維持黑白灰階，**優先考慮省墨、實體裁切、打孔與裝訂需求**。

目前共提供 **`23`** 份專屬 HTML 模板，並具備對應的即時 SVG 或高品質預覽設計。

## ✨ 設計特點與共同規則 (Features)

所有的列印模板皆導入以下共用規範，以確保最佳列印體驗：

- **邊距與裝訂留白**：
  - `A4`：左側 `15mm` 裝訂留白
  - `A5`：左側 `12mm` 裝訂留白
  - 附帶淡灰色的裝訂輔助線
- **列印友善設計**：純黑白灰階內容區，省墨且高對比
- **多尺寸支援**：支援 `A4`、`A5`、`A4裁A5` 三種尺寸模式，其中「A4裁A5」會自動判斷排版方向以利後續裁切
- **動態日曆資料**：Planner 系列共用統一的 `2026_calendar.json`，提供國曆、農曆、週數、節氣與台灣假日顯示

## 🗂️ 模板總覽 (Templates Collection)

目前已完成並可供列印的模板分類如下：

### 🎯 工作與專案 (Work)
- 工作日誌 (`work-journal`) － 包含「A日誌」與「B週總結」兩種支援多尺寸的模式
- 工作報告 (`report`)
- 每日站會 (`standup`)
- 專案簡報 (`project-brief`)

### 📅 計畫與排程 (Planner)
- 日計畫 (`daily`) － 支援日期選擇
- 週計畫 (`weekly`) － 支援日期選擇
- 月計畫 (`monthly`) － 掛載農曆與台灣假日顯示
- 季計畫 (`quarterly`)
- 年計畫 (`yearly`)
- 旅遊計畫 (`travel`)

### 🛒 電商管理 (E-Commerce)
- 商品清單 (`product-listing`)
- 促銷計畫 (`promo-plan`)
- 價格策略 (`pricing`)
- 每週營運 (`weekly-ops`)

### 📈 行銷企劃 (Marketing)
- 社群貼文排程 (`social-plan`)
- 內容日曆 (`content-calendar`)

### 🤝 會議與目標 (Meeting & Goals)
- 會議記錄 (`meeting`)
- 目標分解 (`goals`) － 適用於通用語境的目標拆解

### 📓 筆記體系 (Notes)
- 康乃爾筆記 (`cornell`)
- 主題筆記 (`topic-notes`)
- 子彈筆記索引 (`bujo-index`)
- 點陣筆記 (`dot-grid`)
- 閱讀筆記 (`reading-notes`)

---

## 🖨️ 建議列印流程 (How to Print)

為了獲得最精準的版面輸出，建議採用以下步驟：

1. 使用 **Chrome** 或 **Edge** 瀏覽器開啟目標模板頁（或從首頁進入）。
2. 在網頁側邊欄選擇您需要的 **「內容模式」**。
3. 選擇輸出的實體紙張尺寸（`A4` / `A5` / `A4裁A5`）。
4. 點擊畫面上的 **「列印 / 存 PDF」** 按鈕。
5. ⚠️ **關鍵步驟**：在瀏覽器的列印對話框中，將 **「邊界 (Margins)」** 設定為 **「無 (None)」**，以套用模板內建的精確留白。

## 🛠️ 技術結構與核心邏輯 (Engineering)

專案不依賴大型前端框架，維持原生與輕量：

- **首頁與 UI (`index.html`, `css/style.css`)**：
  處理首頁篩選、預覽卡片 rendering、網站全局 UI、page shell 及螢幕列印預覽體驗。
- **列印控制 (`js/template-size.js`)**：
  統一處理模板尺寸切換、列印前 staging 與 `@page size` 的動態注入，確保瀏覽器在觸發列印時抓取正確的頁面宣告。
- **日曆資料層 (`js/calendar-data.js`, `assets/2026_calendar.json`)**：
  抽出跨模板共用的日曆邏輯，確保 daily/weekly/monthly 等 planner 在日期格式、週次、農曆及台灣國定假日顯示上的絕對一致。
- **預覽圖 (`previews/`)**：
  首頁展示用的 `1:1` 畫布 SVG 向量檔，清晰且不失真。

## 🚀 下一步 (Roadmap)

- 🧩 逐步把各個舊模板獨立的內容區塊，抽成更穩定、可複用的「共用列印元件」(`css/style.css`)
- 📏 針對所有 23 份模板在 `A4 / A5 / A4裁A5` 三種尺寸下進行列印壓力測試，特別確認裝訂線、版心、頁尾與跨頁問題
- 📝 持續擴充 `templates/notes/` 等高頻繁使用的實體筆記模板
