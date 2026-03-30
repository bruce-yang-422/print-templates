# SVG 預覽設計規範

本文件定義 `previews/` 目錄下所有模板預覽 SVG 的設計規範，供設計與 AI 輔助生成時使用。

---

## 1. 畫布規格

| 屬性 | 值 |
|---|---|
| `viewBox` | `0 0 300 214` |
| 長寬比 | 約 1.4:1（對應 A4 直向縮略） |
| 單位 | px（SVG 內部座標） |

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 214">
```

---

## 2. 視覺層次結構

由下到上共 4 層：

```
Layer 4 (top)  ── 標題文字區（白底 frosted bar + 中文名稱）
Layer 3        ── 裝訂線提示
Layer 2        ── 模板內容示意圖（opacity: 0.65）
Layer 1        ── 紙張卡片底層
Layer 0 (base) ── 全畫布背景
```

---

## 3. 全畫布背景

```svg
<rect width="300" height="214" fill="#f0f0f0"/>
```

---

## 4. 紙張卡片

模擬一張白紙置於灰色背景上，帶有細邊框與圓角：

```svg
<rect x="18" y="10" width="264" height="188" rx="3"
  fill="#ffffff" stroke="#d8d8d8" stroke-width="1"/>
```

| 屬性 | 值 | 說明 |
|---|---|---|
| `x, y` | `18, 10` | 左右各留 18px，上下各留 10/16px |
| `width, height` | `264, 188` | 卡片尺寸 |
| `rx` | `3` | 小圓角 |
| `fill` | `#ffffff` | 白紙 |
| `stroke` | `#d8d8d8` | 淡灰邊框 |
| `stroke-width` | `1` | 細邊框 |

---

## 5. 裝訂線

卡片左側固定位置的細灰線，模擬列印模板的裝訂留白輔助線：

```svg
<line x1="30" y1="10" x2="30" y2="198" stroke="#e8e8e8" stroke-width="0.8"/>
```

---

## 6. 分類色彩條（頂部色塊）

卡片頂部 3px 高的色條，依分類區分：

```svg
<rect x="18" y="10" width="264" height="3" rx="0" fill="<CATEGORY_COLOR>"/>
```

### 分類色票

| 分類 | 中文 | `fill` 色碼 |
|---|---|---|
| `work` | 工作與專案 | `#1a1a1a` |
| `planner` | 計畫與排程 | `#2563eb` |
| `ecommerce` | 電商管理 | `#7c3aed` |
| `marketing` | 行銷企劃 | `#db2777` |
| `business` | 商業策略 | `#ea580c` |
| `meeting` | 會議與目標 | `#059669` |
| `goals` | 目標 / 任務 | `#059669` |
| `notes` | 筆記體系 | `#0891b2` |
| `habit` | 習慣養成 | `#65a30d` |
| `health` | 健康紀錄 | `#dc2626` |

---

## 7. 內容示意圖區

用抽象幾何形狀模擬模板版面，整體套用 `opacity="0.65"`：

```svg
<g opacity="0.65">
  <!-- 示意內容 -->
</g>
```

### 可用範圍

- X: `30` ~ `270`（扣掉裝訂線與右邊距）
- Y: `16` ~ `154`（標題文字區之上）

### 常用元素語法

**標題橫條（模板名稱欄位）**
```svg
<rect x="30" y="18" width="120" height="7" rx="1" fill="#d0d0d0"/>
```

**細實線（書寫線）**
```svg
<line x1="30" y1="40" x2="270" y2="40" stroke="#e0e0e0" stroke-width="1"/>
```

**小方格（checkbox）**
```svg
<rect x="32" y="50" width="5" height="5" rx="0.5" fill="none" stroke="#c0c0c0" stroke-width="0.8"/>
```

**表格網格（橫線 + 豎線）**
```svg
<!-- 橫線 -->
<line x1="30" y1="60" x2="270" y2="60" stroke="#e8e8e8" stroke-width="0.8"/>
<!-- 欄位分隔豎線 -->
<line x1="120" y1="54" x2="120" y2="140" stroke="#e8e8e8" stroke-width="0.8"/>
```

**卡片方塊（欄位區塊）**
```svg
<rect x="30" y="50" width="78" height="60" rx="1"
  fill="#fafafa" stroke="#e4e4e4" stroke-width="0.8"/>
```

**月曆格（7 列 × N 行）**
```svg
<!-- 一個月曆格單元 -->
<rect x="30" y="50" width="34" height="24" rx="0"
  fill="none" stroke="#e4e4e4" stroke-width="0.8"/>
```

**圓點（bullet point）**
```svg
<circle cx="34" cy="60" r="2.5" fill="none" stroke="#c0c0c0" stroke-width="0.8"/>
```

**進度條**
```svg
<rect x="30" y="90" width="180" height="4" rx="2" fill="#efefef"/>
<rect x="30" y="90" width="80" height="4" rx="2" fill="#d0d0d0"/>
```

**強調色塊（深色標題欄）**
```svg
<rect x="30" y="18" width="240" height="12" rx="1" fill="#ebebeb"/>
```

---

## 8. 標題文字區（frosted footer）

固定在卡片底部，高 40px，白色半透明底，上有細分隔線：

```svg
<!-- 底部白色遮罩 -->
<rect x="18" y="158" width="264" height="40" fill="rgba(255,255,255,0.92)"/>
<!-- 分隔線 -->
<line x1="18" y1="158" x2="282" y2="158" stroke="#e0e0e0" stroke-width="0.8"/>
<!-- 中文名稱 -->
<text x="150" y="174" dominant-baseline="middle" text-anchor="middle"
  font-size="13" fill="#111111"
  font-family="'PingFang TC','Microsoft JhengHei',sans-serif"
  font-weight="600" letter-spacing="0.04em">模板名稱</text>
<!-- 英文副標 -->
<text x="150" y="191" dominant-baseline="middle" text-anchor="middle"
  font-size="8" fill="#aaaaaa"
  font-family="'PingFang TC','Microsoft JhengHei',sans-serif"
  letter-spacing="0.08em">Template Key</text>
```

---

## 9. 完整骨架範本

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 214">
  <!-- 背景 -->
  <rect width="300" height="214" fill="#f0f0f0"/>
  <!-- 紙張卡片 -->
  <rect x="18" y="10" width="264" height="188" rx="3"
    fill="#ffffff" stroke="#d8d8d8" stroke-width="1"/>
  <!-- 分類色條 -->
  <rect x="18" y="10" width="264" height="3" fill="<CATEGORY_COLOR>"/>
  <!-- 裝訂線 -->
  <line x1="30" y1="10" x2="30" y2="198" stroke="#e8e8e8" stroke-width="0.8"/>
  <!-- 內容示意圖 -->
  <g opacity="0.65">
    <!-- 依模板版面設計的抽象示意形狀 -->
  </g>
  <!-- 底部標題區 -->
  <rect x="18" y="158" width="264" height="40" fill="rgba(255,255,255,0.92)"/>
  <line x1="18" y1="158" x2="282" y2="158" stroke="#e0e0e0" stroke-width="0.8"/>
  <text x="150" y="174" dominant-baseline="middle" text-anchor="middle"
    font-size="13" fill="#111111"
    font-family="'PingFang TC','Microsoft JhengHei',sans-serif"
    font-weight="600" letter-spacing="0.04em">模板名稱</text>
  <text x="150" y="191" dominant-baseline="middle" text-anchor="middle"
    font-size="8" fill="#aaaaaa"
    font-family="'PingFang TC','Microsoft JhengHei',sans-serif"
    letter-spacing="0.08em">Template Key</text>
</svg>
```

---

## 10. 內容示意設計原則

1. **每個 SVG 需直觀傳達模板用途**，第一眼就能辨別是「月曆」還是「會議記錄」。
2. **不要放真實文字**（除了底部標題）。所有欄位以矩形色塊或橫線代替。
3. **比例保持合理**：標題欄高約 7~10px，書寫行間距約 8~10px，表格格線間距約 10~14px。
4. **最多 3 種視覺元素層次**：深色標題塊 `#d0d0d0`、中等線條 `#e0e0e0`、淺色填充 `#f2f2f2`。
5. **對齊裝訂線**：X=30 為左側可用起點，需留至少 2px 距離（`x="32"`）。
6. **保持對稱與比例**：欄與欄之間留 4~6px gap，不要過度擁擠。

---

## 11. 檔案命名規則

```
previews/<category>/<template-key>.svg
```

範例：
- `previews/planner/daily.svg`
- `previews/health/sleep-tracker.svg`
- `previews/work/work-journal.svg`（注意：work-journal 在 work/ 目錄下）

---

## 12. 各分類示意圖設計建議

| 分類 | 建議主視覺元素 |
|---|---|
| 工作與專案 | 欄位表格、橫線清單、進度方塊 |
| 計畫與排程 | 月曆格、時間軸橫條、週格 |
| 電商管理 | 商品列表行、價格欄位、數字格 |
| 行銷企劃 | 社群格子、內容日曆方格 |
| 商業策略 | 四象限方格（SWOT）、矩陣 |
| 會議與目標 | 條列方塊、agenda 橫條、checkbox 清單 |
| 筆記體系 | 點陣格、T型分欄（康乃爾）、空白寫字區 |
| 習慣養成 | 小方格矩陣（習慣追蹤）、checkbox 行 |
| 健康紀錄 | 表格行、進度圓點、數值欄位 |
