const fs = require('fs');
const path = require('path');

// --- Helper Functions to draw primitive SVGs ---
const h = {
  rect: (x, y, w, h, fill='none', stroke='#ccc', sw=1.5, rx=0) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" rx="${rx}" />`,
  line: (x1, y1, x2, y2, stroke='#ccc', sw=1.5, dash='') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}" stroke-dasharray="${dash}" />`,
  circle: (cx, cy, r, fill='none', stroke='#ccc', sw=1.5) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" />`,
  lines: (startX, startY, width, count, spacing, color='#eaeaea', sw=1.5) => Array.from({length: count}).map((_, i) => h.line(startX, startY + i*spacing, startX+width, startY + i*spacing, color, sw)).join(''),
  checks: (startX, startY, width, count, spacing) => Array.from({length: count}).map((_, i) => 
    h.circle(startX + 6, startY + i*spacing, 4, 'none', '#ccc', 1.2) + 
    h.line(startX + 18, startY + i*spacing, startX+width, startY + i*spacing, '#eee', 1.5)
  ).join('')
};

// --- Unique Template Renderers ---

const tpl = {
  'daily-plan': () => h.rect(40,40,90,120) + h.lines(50,55,70,8,12) + h.rect(140,40,120,60) + h.checks(140,48,120,4,12) + h.rect(140,110,120,50),
  
  'weekly-plan': () => {
    let s = h.rect(40,35,80,8, '#d2d2d2', 'none');
    for(let i=0; i<4; i++) s += h.rect(40+i*57, 50, 48, 48);
    for(let i=0; i<3; i++) s += h.rect(40+i*57, 108, 48, 48);
    s += h.rect(40+3*57, 108, 48, 48, '#f5f5f5', '#eaeaea'); // Notes box
    return s;
  },
  
  'monthly-plan': () => {
    let s = h.rect(40,30,80,6, '#d2d2d2', 'none') + h.rect(205,30,55,120, 'none', '#eaeaea');
    for(let r=0; r<5; r++) for(let c=0; c<7; c++) s += h.rect(40+c*22, 45+r*20, 20, 18);
    return s;
  },

  'quarterly-plan': () => {
    let s = '';
    for(let i=0; i<4; i++) {
       let x = 40 + (i%2)*115; let y = 40 + Math.floor(i/2)*60;
       s += h.rect(x, y, 105, 50) + h.rect(x, y, 105, 12, '#f0f0f0', '#ccc') + h.lines(x+6, y+24, 90, 2, 12);
    }
    return s;
  },

  'yearly-plan': () => {
    let s = '';
    for(let r=0; r<3; r++) for(let c=0; c<4; c++) {
      let x = 40+c*55; let y = 35+r*42;
      s += h.rect(x, y, 48, 35) + h.rect(x+4, y+4, 12, 4, '#ccc', 'none') + h.lines(x+4, y+14, 40, 3, 6);
    }
    return s;
  },

  'habit-tracker': () => {
    let s = h.rect(40, 30, 90, 8, '#d2d2d2', 'none');
    for (let r = 0; r < 5; r++) {
      s += h.rect(40, 48 + r * 20, 54, 16, '#fafafa', '#ddd');
      for (let c = 0; c < 10; c++) s += h.rect(100 + c * 16, 48 + r * 20, 12, 16, 'none', '#e6e6e6', 1);
    }
    return s;
  },

  'weekly-habit-tracker': () => {
    let s = h.rect(40, 30, 120, 8, '#d2d2d2', 'none');
    for (let c = 0; c < 7; c++) s += h.rect(72 + c * 27, 48, 22, 16, '#f5f5f5', '#ddd');
    for (let r = 0; r < 5; r++) {
      s += h.rect(40, 66 + r * 18, 26, 14, '#fafafa', '#ddd');
      for (let c = 0; c < 7; c++) s += h.circle(83 + c * 27, 73 + r * 18, 4, 'none', '#c8c8c8', 1.2);
    }
    return s;
  },

  'monthly-habit-tracker': () => {
    let s = h.rect(40, 30, 100, 8, '#d2d2d2', 'none');
    for (let r = 0; r < 4; r++) {
      s += h.rect(40, 48 + r * 24, 38, 18, '#fafafa', '#ddd');
      for (let c = 0; c < 12; c++) s += h.rect(84 + c * 14, 48 + r * 24, 10, 18, 'none', '#e7e7e7', 1);
    }
    s += h.lines(40, 152, 220, 2, 10);
    return s;
  },

  'routine-planner': () => h.rect(40, 30, 100, 8, '#d2d2d2', 'none') + h.line(74, 52, 74, 154, '#ddd', 2) + h.circle(74, 68, 5, '#fff', '#999', 1.5) + h.circle(74, 102, 5, '#fff', '#999', 1.5) + h.circle(74, 136, 5, '#fff', '#999', 1.5) + h.rect(88, 56, 162, 24, '#fafafa', '#ddd') + h.rect(88, 90, 162, 24, '#fafafa', '#ddd') + h.rect(88, 124, 162, 24, '#fafafa', '#ddd'),

  'goal-tracker': () => h.rect(40, 30, 90, 8, '#d2d2d2', 'none') + h.rect(40, 48, 220, 30, 'none', '#ccc') + h.rect(50, 60, 150, 8, '#d7d7d7', 'none', 0, 4) + h.rect(40, 90, 68, 56, 'none', '#ddd') + h.rect(116, 90, 68, 56, 'none', '#ddd') + h.rect(192, 90, 68, 56, 'none', '#ddd'),

  'daily-check-in': () => h.rect(40, 30, 92, 8, '#d2d2d2', 'none') + h.circle(78, 66, 12, 'none', '#ccc', 1.5) + h.circle(128, 66, 12, 'none', '#ccc', 1.5) + h.circle(178, 66, 12, 'none', '#ccc', 1.5) + h.lines(40, 96, 220, 3, 14) + h.rect(40, 142, 105, 24, 'none', '#ddd') + h.rect(155, 142, 105, 24, 'none', '#ddd'),

  'travel-itinerary': () => {
    let s = h.rect(40,35,50,8, '#d2d2d2', 'none') + h.rect(180,35,80,40, 'none', '#ccc', 1.5, 6) + h.line(180,55,260,55, '#ccc', 1.5, '4,4'); // Boarding pass
    s += h.line(60, 50, 60, 150, '#ccc', 2); // Timeline
    [60,95,130].forEach(y => s += h.circle(60, y, 4, '#fff', '#888', 2) + h.rect(75, y-8, 90, 24, '#f9f9f9', '#eaeaea'));
    return s;
  },

  'work-journal': () => h.rect(40,35,80,8, '#d2d2d2', 'none') + h.rect(40, 55, 140, 100) + h.rect(190, 55, 70, 45) + h.rect(190, 110, 70, 45),

  'work-report': () => h.rect(40,35,80,10, '#d2d2d2', 'none') + h.rect(200,35,30,10, '#eaeaea', 'none', 0, 4) + h.circle(80, 85, 25, 'none', '#ccc', 8) + h.lines(130, 70, 130, 4, 12) + h.rect(40, 130, 220, 30),

  'project-brief': () => h.rect(40,35,120,12, '#d2d2d2', 'none') + h.rect(40,60,105,30, '#fafafa', '#ccc') + h.rect(155,60,105,30, '#fafafa', '#ccc') + h.rect(40,100,220,60, 'none', '#ccc'),

  'storyboard': () => {
    let s = '';
    for(let i=0;i<3;i++) {
      let x = 40 + i*76;
      s += h.rect(x, 40, 68, 38, '#f5f5f5') + h.line(x,40,x+68,78,'#eaeaea') + h.line(x+68,40,x,78,'#eaeaea'); // Image X
      s += h.lines(x, 90, 68, 4, 10);
    }
    return s;
  },

  'standup': () => h.rect(40,35,80,8, '#d2d2d2', 'none') + h.rect(40,55,70,100) + h.rect(115,55,70,100) + h.rect(190,55,70,100) + h.rect(40,55,70,15,'#f0f0f0','#ccc') + h.rect(115,55,70,15,'#f0f0f0','#ccc') + h.rect(190,55,70,15,'#f0f0f0','#ccc') + h.lines(45, 80, 50, 3, 15) + h.lines(120, 80, 50, 2, 15),

  'meeting': () => h.rect(40,35,100,8, '#d2d2d2', 'none') + h.rect(40, 50, 220, 25, '#fafafa', '#eaeaea') + h.lines(40, 90, 220, 3, 15) + h.checks(40, 140, 200, 2, 15),

  'daily-ops': () => h.rect(40,40,65,30) + h.rect(115,40,65,30) + h.rect(190,40,65,30) + h.rect(40,80,215,75, 'none', '#ccc') + h.lines(50, 95, 190, 4, 15),

  'project-meeting': () => { // Gantt / blocks
    let s = h.rect(40,35,80,8, '#d2d2d2', 'none');
    for(let i=0; i<4; i++) s += h.line(100+i*40, 50, 100+i*40, 150, '#eaeaea', 1, '2,2');
    s += h.rect(100, 60, 60, 12, '#d2d2d2', 'none', 0, 4) + h.rect(140, 85, 80, 12, '#a0a0a0', 'none', 0, 4) + h.rect(60, 110, 40, 12, '#e0e0e0', 'none', 0, 4);
    return s;
  },

  'creative-meeting': () => h.circle(150, 90, 20, '#e0e0e0', 'none') + h.circle(100, 60, 12) + h.circle(200, 60, 12) + h.circle(100, 130, 12) + h.circle(200, 130, 12) + h.line(135, 75, 110, 65) + h.line(165, 75, 190, 65) + h.line(110, 120, 135, 105) + h.line(190, 120, 165, 105) + h.rect(40, 40, 25, 25, '#f5f5f5', '#ccc') + h.rect(235, 120, 25, 25, '#f5f5f5', '#ccc'),

  'goals': () => h.rect(130, 35, 40, 20) + h.line(150, 55, 150, 80) + h.line(90, 80, 210, 80) + h.rect(70, 80, 40, 20) + h.rect(130, 80, 40, 20) + h.rect(190, 80, 40, 20) + h.line(90, 100, 90, 120) + h.rect(70, 120, 40, 20),

  'cornell': () => h.rect(40,30,80,8, '#d2d2d2', 'none') + h.rect(40, 45, 60, 95) + h.rect(110, 45, 150, 95) + h.rect(40, 150, 220, 20) + h.lines(120, 55, 130, 4, 15),

  'topic-notes': () => h.rect(40, 35, 220, 20, '#fafafa', '#ccc') + h.rect(40, 65, 220, 90) + h.lines(40, 80, 220, 4, 16, '#eaeaea'),

  'lecture-notes': () => h.rect(40, 30, 104, 8, '#d2d2d2', 'none') + h.rect(40, 46, 56, 108, 'none', '#ddd') + h.rect(104, 46, 156, 74, 'none', '#ddd') + h.rect(104, 128, 156, 26, 'none', '#ddd') + h.lines(112, 58, 138, 3, 16),

  'bujo-index': () => h.rect(40,30,80,8, '#d2d2d2', 'none') + h.rect(40, 50, 220, 100, 'none', '#eaeaea') + h.line(220, 50, 220, 150, '#eaeaea') + h.lines(40, 70, 220, 4, 20, '#eaeaea') + h.circle(50, 60, 3) + h.circle(50, 80, 3) + h.circle(50, 100, 3),

  'reading-notes': () => h.rect(40,30,80,8, '#d2d2d2', 'none') + h.rect(40, 50, 45, 65) + h.rect(100, 50, 160, 65) + h.lines(40, 135, 220, 2, 15) + h.circle(110, 100, 4, '#ccc', 'none') + h.circle(125, 100, 4, '#ccc', 'none') + h.circle(140, 100, 4, '#ccc', 'none'),

  'dot-grid': () => {
    let s = '';
    for(let r=0; r<6; r++) for(let c=0; c<12; c++) s += h.circle(45+c*19, 45+r*19, 1.5, '#bbb', 'none');
    return s;
  },

  'product-listing': () => h.rect(40, 40, 70, 70, '#f9f9f9', '#ccc') + h.line(40,40,110,110,'#eaeaea') + h.line(110,40,40,110,'#eaeaea') + h.lines(130, 50, 130, 4, 16) + h.checks(40, 130, 200, 2, 16),

  'promo-plan': () => h.rect(40,40,220,30) + h.line(113,40,113,70,'#ccc') + h.line(186,40,186,70,'#ccc') + h.rect(40,90,105,60, 'none', '#ccc', 1.5, 0) + h.rect(155,90,105,60, 'none', '#ccc', 1.5, 0) + h.line(40,110,145,110,'#eaeaea') + h.line(40,130,145,130,'#eaeaea'),

  'pricing': () => {
    let s = h.rect(40, 35, 220, 16, '#f0f0f0', 'none');
    for(let i=0; i<6; i++) s += h.rect(40, 55+i*16, 220, 16) + h.line(120, 55, 120, 150, '#eaeaea') + h.line(190, 55, 190, 150, '#eaeaea');
    s += h.rect(40, 55+6*16, 220, 16, '#fafafa'); // Total row
    return s;
  },

  'weekly-ops': () => h.rect(40,40,105,50) + h.rect(155,40,105,50) + h.rect(40,100,105,50) + h.rect(155,100,105,50) + h.rect(155,100,105,12,'#f0f0f0','none') + h.rect(40,40,105,12,'#f0f0f0','none'),

  'social-plan': () => h.rect(50, 35, 60, 110, '#fff', '#ccc', 2, 8) + h.rect(55, 45, 50, 50) + h.lines(55, 105, 50, 3, 10) + h.lines(140, 55, 110, 4, 15) + h.checks(140, 125, 90, 1, 15),

  'content-calendar': () => {
    let s = h.rect(40,30,80,6, '#d2d2d2', 'none');
    for(let r=0; r<4; r++) for(let c=0; c<6; c++) s += h.rect(40+c*38, 45+r*26, 32, 20) + h.rect(42+c*38, 47+r*26, 12, 12, '#eaeaea', 'none');
    return s;
  },

  'exercise-log': () => h.rect(40, 30, 92, 8, '#d2d2d2', 'none') + h.rect(40, 48, 220, 26, 'none', '#ddd') + h.rect(40, 84, 220, 70, 'none', '#ddd') + h.line(110, 84, 110, 154, '#e7e7e7') + h.line(176, 84, 176, 154, '#e7e7e7') + h.lines(40, 102, 220, 3, 16),

  'meal-log': () => h.rect(40, 30, 82, 8, '#d2d2d2', 'none') + h.rect(40, 48, 105, 46, 'none', '#ddd') + h.rect(155, 48, 105, 46, 'none', '#ddd') + h.rect(40, 104, 105, 46, 'none', '#ddd') + h.rect(155, 104, 105, 46, 'none', '#ddd'),

  'sleep-tracker': () => h.rect(40, 30, 92, 8, '#d2d2d2', 'none') + h.rect(40, 48, 220, 24, 'none', '#ddd') + h.line(94, 48, 94, 72, '#e7e7e7') + h.line(148, 48, 148, 72, '#e7e7e7') + h.line(202, 48, 202, 72, '#e7e7e7') + h.lines(40, 92, 220, 4, 14) + h.circle(224, 62, 12, 'none', '#ccc', 1.5),

  'body-metrics': () => h.rect(40, 30, 112, 8, '#d2d2d2', 'none') + h.rect(40, 48, 130, 102, 'none', '#ddd') + h.line(72, 48, 72, 150, '#e7e7e7') + h.line(104, 48, 104, 150, '#e7e7e7') + h.line(136, 48, 136, 150, '#e7e7e7') + h.rect(182, 48, 78, 22, '#fafafa', '#ddd') + h.rect(182, 78, 78, 22, '#fafafa', '#ddd') + h.rect(182, 108, 78, 42, 'none', '#ddd'),

  'blood-pressure': () => h.rect(40, 30, 92, 8, '#d2d2d2', 'none') + h.rect(40, 48, 220, 26, 'none', '#ddd') + h.line(95, 48, 95, 74, '#e7e7e7') + h.line(150, 48, 150, 74, '#e7e7e7') + h.line(205, 48, 205, 74, '#e7e7e7') + h.rect(40, 86, 128, 64, 'none', '#ddd') + h.rect(178, 86, 82, 64, 'none', '#ddd'),

  'swot-analysis': () => h.rect(40, 30, 84, 8, '#d2d2d2', 'none') + h.rect(40, 48, 105, 48, 'none', '#ccc') + h.rect(155, 48, 105, 48, 'none', '#ccc') + h.rect(40, 106, 105, 48, 'none', '#ccc') + h.rect(155, 106, 105, 48, 'none', '#ccc')
};

const templates = [
  { id: 'daily-plan', preview: 'previews/planner/daily.svg', name: '日計畫' },
  { id: 'weekly-plan', preview: 'previews/planner/weekly.svg', name: '週計畫' },
  { id: 'monthly-plan', preview: 'previews/planner/monthly.svg', name: '月計畫' },
  { id: 'quarterly-plan', preview: 'previews/planner/quarterly.svg', name: '季計畫' },
  { id: 'yearly-plan', preview: 'previews/planner/yearly.svg', name: '年計畫' },
  { id: 'habit-tracker', preview: 'previews/habit/habit-tracker.svg', name: '習慣追蹤表' },
  { id: 'weekly-habit-tracker', preview: 'previews/habit/weekly-habit-tracker.svg', name: '每週習慣追蹤表' },
  { id: 'monthly-habit-tracker', preview: 'previews/habit/monthly-habit-tracker.svg', name: '每月習慣追蹤表' },
  { id: 'routine-planner', preview: 'previews/habit/routine-planner.svg', name: '日常流程規劃表' },
  { id: 'goal-tracker', preview: 'previews/habit/goal-tracker.svg', name: '目標追蹤表' },
  { id: 'daily-check-in', preview: 'previews/habit/daily-check-in.svg', name: '每日檢視表' },
  { id: 'travel-itinerary', preview: 'previews/planner/travel.svg', name: '旅行行程表' },
  { id: 'exercise-log', preview: 'previews/health/exercise-log.svg', name: '運動紀錄表' },
  { id: 'meal-log', preview: 'previews/health/meal-log.svg', name: '飲食紀錄表' },
  { id: 'sleep-tracker', preview: 'previews/health/sleep-tracker.svg', name: '睡眠追蹤表' },
  { id: 'body-metrics', preview: 'previews/health/body-metrics.svg', name: '體重／身體數據追蹤' },
  { id: 'blood-pressure', preview: 'previews/health/blood-pressure.svg', name: '血壓紀錄表' },
  { id: 'work-journal', preview: 'previews/work/work-journal.svg', name: '工作日誌' },
  { id: 'work-report', preview: 'previews/work/report.svg', name: '工作報告' },
  { id: 'project-brief', preview: 'previews/work/project-brief.svg', name: '專案簡報' },
  { id: 'storyboard', preview: 'previews/work/storyboard.svg', name: '手繪分鏡圖' },
  { id: 'standup', preview: 'previews/work/standup.svg', name: '站會紀錄' },
  { id: 'meeting', preview: 'previews/meeting/meeting.svg', name: '會議記錄' },
  { id: 'daily-ops', preview: 'previews/meeting/daily-ops.svg', name: '日常營運會議' },
  { id: 'project-meeting', preview: 'previews/meeting/project.svg', name: '專案與決策會議' },
  { id: 'creative-meeting', preview: 'previews/meeting/creative.svg', name: '創意與產品會議' },
  { id: 'goals', preview: 'previews/goals/goals.svg', name: '目標分解' },
  { id: 'cornell', preview: 'previews/notes/cornell.svg', name: '康奈爾筆記' },
  { id: 'topic-notes', preview: 'previews/notes/topic-notes.svg', name: '主題筆記' },
  { id: 'lecture-notes', preview: 'previews/notes/lecture-notes.svg', name: '課堂／聽講筆記' },
  { id: 'bujo-index', preview: 'previews/notes/bujo-index.svg', name: '子彈筆記索引' },
  { id: 'reading-notes', preview: 'previews/notes/reading-notes.svg', name: '讀書筆記' },
  { id: 'dot-grid', preview: 'previews/notes/dot-grid.svg', name: '方格/點陣/橫線' },
  { id: 'product-listing', preview: 'previews/ecommerce/product-listing.svg', name: '商品上架檢查表' },
  { id: 'promo-plan', preview: 'previews/ecommerce/promo-plan.svg', name: '優惠活動企劃表' },
  { id: 'pricing', preview: 'previews/ecommerce/pricing.svg', name: '商品定價試算表' },
  { id: 'weekly-ops', preview: 'previews/ecommerce/weekly-ops.svg', name: '電商週營運摘要' },
  { id: 'social-plan', preview: 'previews/marketing/social-plan.svg', name: '社群發文計畫表' },
  { id: 'content-calendar', preview: 'previews/marketing/content-calendar.svg', name: '內容行事曆' },
  { id: 'swot-analysis', preview: 'previews/business/swot.svg', name: 'SWOT 分析' }
];

const basePath = 'D:/Tools/print-templates';

templates.forEach(t => {
  const fullPath = path.join(basePath, t.preview);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  
  const layoutContent = tpl[t.id] ? tpl[t.id]() : tpl['topic-notes']();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 214">
  <rect width="100%" height="100%" fill="#ffffff" />
  <rect x="24" y="16" width="252" height="182" fill="#ffffff" stroke="#e1e1e1" stroke-width="1.5" rx="6" />
  <g opacity="0.6">
    ${layoutContent}
  </g>
  <rect x="24" y="158" width="252" height="40" fill="rgba(255,255,255,0.85)" />
  <path d="M 24 158 L 276 158" stroke="rgba(0,0,0,0.05)" stroke-width="1" />
  <text x="150" y="178" dominant-baseline="middle" text-anchor="middle" font-size="13" fill="#111" font-family="'PingFang TC', sans-serif" font-weight="600" letter-spacing="0.05em">${t.name}</text>
</svg>`;
  
  fs.writeFileSync(fullPath, svg, 'utf8');
  console.log('Created distinctive layout for ' + t.id);
});
