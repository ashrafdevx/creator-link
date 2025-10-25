// utils/finance.js
const MONTH_ABBRS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * This month spent (prefers monthly > daily fallback > last monthly)
 */
export function getThisMonthSpent(data, now = new Date()) {
  const result = { value: 0, source: "none", label: null };
  if (!data) return result;

  const monthIdx = now.getMonth();
  const monthAbbr = MONTH_ABBRS[monthIdx];
  const year = now.getFullYear();

  // 1) Try monthly[current month]
  if (Array.isArray(data.monthly)) {
    const m = data.monthly.find((x) => x?.month === monthAbbr);
    if (m && typeof m.expenses === "number") {
      return { value: m.expenses, source: "monthly", label: monthAbbr };
    }
  }

  // 2) Sum daily for current YYYY-MM
  if (Array.isArray(data.daily)) {
    const ymPrefix = `${year}-${String(monthIdx + 1).padStart(2, "0")}-`;
    const rows = data.daily.filter(
      (d) => typeof d?.date === "string" && d.date.startsWith(ymPrefix)
    );
    if (rows.length) {
      const sum = rows.reduce((acc, d) => acc + (Number(d.expenses) || 0), 0);
      return { value: sum, source: "daily", label: `${monthAbbr} ${year}` };
    }
  }

  // 3) Fallback: last monthly entry
  if (Array.isArray(data.monthly) && data.monthly.length) {
    const last = data.monthly[data.monthly.length - 1];
    if (last && typeof last.expenses === "number") {
      return {
        value: last.expenses,
        source: "fallback",
        label: last.month ?? null,
      };
    }
  }

  return result;
}

/**
 * Total spent without double counting:
 * Prefer a single granularity to avoid overlap.
 * Priority: monthly > weekly > daily
 */
export function getTotalSpent(data) {
  if (!data) return { value: 0, source: "none", label: null };

  // Use MONTHLY if present (sum unique months)
  if (Array.isArray(data.monthly) && data.monthly.length) {
    const seen = new Set();
    const sum = data.monthly.reduce((acc, m) => {
      const key = m?.month;
      if (!key || seen.has(key)) return acc;
      seen.add(key);
      return acc + (Number(m?.expenses) || 0);
    }, 0);
    return { value: sum, source: "monthly", label: `${seen.size} mo` };
  }

  // Else use WEEKLY
  if (Array.isArray(data.weekly) && data.weekly.length) {
    const seen = new Set();
    const sum = data.weekly.reduce((acc, w) => {
      const key = w?.week;
      if (!key || seen.has(key)) return acc;
      seen.add(key);
      return acc + (Number(w?.expenses) || 0);
    }, 0);
    return { value: sum, source: "weekly", label: `${seen.size} wk` };
  }

  // Else use DAILY
  if (Array.isArray(data.daily) && data.daily.length) {
    const sum = data.daily.reduce(
      (acc, d) => acc + (Number(d?.expenses) || 0),
      0
    );
    return { value: sum, source: "daily", label: `${data.daily.length} days` };
  }

  return { value: 0, source: "none", label: null };
}

/**
 * Convenience wrapper to fetch both at once
 */
export function getSpendStats(data, now = new Date()) {
  return {
    thisMonth: getThisMonthSpent(data, now),
    totalSpent: getTotalSpent(data),
  };
}
