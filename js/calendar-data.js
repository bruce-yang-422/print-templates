(function () {
  const calendarData = new Map();
  let loadPromise = null;

  // 台灣固定假期（月-日）和農曆假期定義
  const taiwanHolidays = {
    fixed: [
      { month: 1, day: 1, name: '元旦' },
      { month: 2, day: 28, name: '228事件紀念日' },
      { month: 4, day: 4, name: '兒童節及清明節' },
      { month: 10, day: 10, name: '雙十節' }
    ],
    lunar: [
      { lunarMonth: 1, lunarDay: 1, name: '春節', length: 7 }, // 除夕、初一、初二、初三（前後共7天）
      { lunarMonth: 5, lunarDay: 5, name: '端午節', length: 3 },
      { lunarMonth: 8, lunarDay: 15, name: '中秋節', length: 3 }
    ]
  };

  // 簡化的農曆轉公曆（以一些已知的年份數據為基礎）
  const lunarToSolar = {
    '2026-1-1': { month: 2, day: 17 }, // 2026年農曆正月初一
    '2027-1-1': { month: 2, day: 6 }, // 2027年農曆正月初一
    '2028-1-1': { month: 1, day: 26 }, // 2028年農曆正月初一
    '2026-5-5': { month: 6, day: 10 }, // 2026年農曆五月初五
    '2027-5-5': { month: 5, day: 31 }, // 2027年農曆五月初五
    '2028-5-5': { month: 6, day: 19 }, // 2028年農曆五月初五
    '2026-8-15': { month: 10, day: 1 }, // 2026年農曆八月十五
    '2027-8-15': { month: 9, day: 21 }, // 2027年農曆八月十五
    '2028-8-15': { month: 10, day: 9 } // 2028年農曆八月十五
  };

  function getBuiltinHoliday(year, month, day) {
    // 檢查固定假期
    for (const holiday of taiwanHolidays.fixed) {
      if (holiday.month === month && holiday.day === day) {
        return holiday.name;
      }
    }
    // 檢查農曆假期（簡化版本，只支持2026-2028）
    for (const holiday of taiwanHolidays.lunar) {
      const key = year + '-' + holiday.lunarMonth + '-' + holiday.lunarDay;
      const solar = lunarToSolar[key];
      if (solar && solar.month === month && solar.day === day) {
        return holiday.name;
      }
    }
    // 檢查農曆假期的前後天（除夕）
    if (year >= 2026 && year <= 2028) {
      const newYearKey = year + '-1-1';
      const nyStart = lunarToSolar[newYearKey];
      if (nyStart) {
        // 除夕是農曆初一前一天
        const eve = new Date(year, nyStart.month - 1, nyStart.day - 1);
        if (eve.getFullYear() === year && eve.getMonth() + 1 === month && eve.getDate() === day) {
          return '春節（除夕）';
        }
      }
    }
    return '';
  }

  function parseLocalDate(value) {
    return new Date(value + 'T00:00:00');
  }

  function toInputValue(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  }

  function dateKey(year, month, day) {
    return year + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0');
  }

  function dateKeyFromDate(date) {
    return dateKey(date.getFullYear(), date.getMonth() + 1, date.getDate());
  }

  function getMeta(value) {
    if (typeof value === 'string') return calendarData.get(value) || null;
    if (value instanceof Date) return calendarData.get(dateKeyFromDate(value)) || null;
    return null;
  }

  function getMetaParts(year, month, day) {
    let meta = calendarData.get(dateKey(year, month, day));
    // 如果沒有找到，使用內建假期規則生成基本的元數據
    if (!meta && year >= 2026) {
      const holidayName = getBuiltinHoliday(year, month, day);
      if (holidayName) {
        meta = {
          date: dateKey(year, month, day),
          is_holiday: '1',
          '假日名稱': holidayName,
          '假日類型': '國定假日'
        };
      }
    }
    return meta || null;
  }

  function getMetaPartsFromDate(date) {
    return getMetaParts(date.getFullYear(), date.getMonth() + 1, date.getDate());
  }

  function getHolidaySpan(year, month, day) {
    const meta = getMetaParts(year, month, day);
    if (!meta || meta.is_holiday !== '1') return '';
    const prevMeta = getMetaPartsFromDate(new Date(year, month - 1, day - 1));
    const nextMeta = getMetaPartsFromDate(new Date(year, month - 1, day + 1));
    const prevHoliday = prevMeta && prevMeta.is_holiday === '1';
    const nextHoliday = nextMeta && nextMeta.is_holiday === '1';
    if (prevHoliday && nextHoliday) return 'mid';
    if (prevHoliday) return 'end';
    if (nextHoliday) return 'start';
    return 'single';
  }

  const lunarFormatter = new Intl.DateTimeFormat('zh-Hant-TW-u-ca-chinese', {
    month: 'short',
    day: 'numeric'
  });

  function fallbackLunarText(date) {
    return lunarFormatter.format(date).replace(/\s/g, '').replace(/日$/, '');
  }

  function getLunarText(date, meta) {
    if (meta && meta['農曆']) return meta['農曆'];
    return fallbackLunarText(date);
  }

  function getHolidayText(meta) {
    if (!meta || meta.is_holiday !== '1') return '';
    return meta['假日名稱'] || '';
  }

  function compactHolidayText(name) {
    if (!name) return '';
    if (name === '兒童節及清明節') return '清明/兒童';
    return name.length > 4 ? name.slice(0, 4) : name;
  }

  function formatMd(date) {
    return (date.getMonth() + 1) + '/' + date.getDate();
  }

  function formatDateLabel(date, meta) {
    if (meta && meta.date) return meta.date.replace(/-/g, '/');
    return date.getFullYear() + '/' + String(date.getMonth() + 1).padStart(2, '0') + '/' + String(date.getDate()).padStart(2, '0');
  }

  function formatWeekdayLabel(date, meta) {
    if (meta && meta['星期中文']) return meta['星期中文'].replace('星期', '');
    return ['日', '一', '二', '三', '四', '五', '六'][date.getDay()];
  }

  function getWeekStart(date) {
    const current = new Date(date);
    const day = current.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    current.setDate(current.getDate() + diff);
    return current;
  }

  function getIsoWeekNumber(date) {
    const current = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const day = current.getUTCDay() || 7;
    current.setUTCDate(current.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(current.getUTCFullYear(), 0, 1));
    return Math.ceil((((current - yearStart) / 86400000) + 1) / 7);
  }

  async function load(path) {
    if (loadPromise) return loadPromise;
    loadPromise = fetch(path)
      .then((response) => {
        if (!response.ok) throw new Error('calendar json load failed');
        return response.json();
      })
      .then((rows) => {
        rows.forEach((row) => {
          if (row.date) calendarData.set(row.date, row);
        });
        return calendarData;
      })
      .catch((error) => {
        console.warn('calendar data unavailable, fallback to built-in date formatters', error);
        return calendarData;
      });
    return loadPromise;
  }

  window.TemplateCalendar = {
    load,
    parseLocalDate,
    toInputValue,
    getMeta,
    getMetaParts,
    getHolidaySpan,
    getLunarText,
    getHolidayText,
    compactHolidayText,
    formatMd,
    formatDateLabel,
    formatWeekdayLabel,
    getWeekStart,
    getIsoWeekNumber
  };
})();
