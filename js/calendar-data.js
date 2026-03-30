(function () {
  const calendarData = new Map();
  let loadPromise = null;

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
    return calendarData.get(dateKey(year, month, day)) || null;
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
