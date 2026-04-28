const ROW_PATTERN = /^\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|$/;

export function parseMarkdownItinerary(markdown, options = {}) {
  const year = options.year ?? new Date().getFullYear();
  const lines = String(markdown ?? "").split(/\r?\n/);
  const items = [];
  const dayMap = new Map();
  let currentDate = null;

  for (const line of lines) {
    const match = line.match(ROW_PATTERN);
    if (!match) continue;

    const [dateCell, timeCell, rawTripCell] = match.slice(1).map(cleanCell);
    if (isHeaderRow(dateCell, timeCell, rawTripCell)) continue;

    if (dateCell) {
      currentDate = normalizeDate(dateCell, year);
      if (!currentDate) continue;
    }

    if (!currentDate || !rawTripCell) continue;

    if (!dayMap.has(currentDate)) {
      dayMap.set(currentDate, {
        id: `day-${currentDate}`,
        date: currentDate,
        title: formatChineseDayTitle(currentDate),
        city: inferCity(rawTripCell)
      });
    }

    const notes = splitNotes(rawTripCell);
    const item = {
      id: `item-${items.length + 1}`,
      date: currentDate,
      startTime: parseTimeRange(timeCell).startTime,
      endTime: parseTimeRange(timeCell).endTime,
      type: inferItemType(rawTripCell),
      title: normalizeTitle(rawTripCell),
      notes,
      raw: rawTripCell
    };

    items.push(item);
  }

  return {
    days: Array.from(dayMap.values()),
    items
  };
}

function cleanCell(value) {
  return String(value ?? "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isHeaderRow(dateCell, timeCell, tripCell) {
  if (!dateCell && !timeCell && !tripCell) return true;
  if (/^-+$/.test(dateCell.replace(/\s/g, ""))) return true;
  return dateCell === "日期" && timeCell === "时间";
}

function normalizeDate(value, year) {
  const match = value.match(/(\d{1,2})[./月-](\d{1,2})/);
  if (!match) return null;
  const month = match[1].padStart(2, "0");
  const day = match[2].padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseTimeRange(value) {
  const normalized = cleanCell(value);
  if (!normalized) return { startTime: null, endTime: null };

  const rangeMatch = normalized.match(/(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})/);
  if (rangeMatch) {
    return {
      startTime: padTime(rangeMatch[1]),
      endTime: padTime(rangeMatch[2])
    };
  }

  const singleMatch = normalized.match(/(\d{1,2}:\d{2})/);
  return {
    startTime: singleMatch ? padTime(singleMatch[1]) : null,
    endTime: null
  };
}

function padTime(time) {
  const [hour, minute] = time.split(":");
  return `${hour.padStart(2, "0")}:${minute}`;
}

function inferItemType(text) {
  if (/住宿|酒店|hotel|suites|apart/i.test(text)) return "lodging";
  if (/机场|航班|TK\d+|MU\d+|巴士|大巴|minibus|uber|包车|轻轨|交通/i.test(text)) return "transport";
  if (/吃饭|点餐|餐厅/i.test(text)) return "food";
  if (/徒步|滑翔伞|游览|景点|古城|死海|卡帕/i.test(text)) return "activity";
  return "note";
}

function normalizeTitle(text) {
  const firstLine = splitNotes(text)[0] ?? "";
  return firstLine
    .replace(/^住宿\s*/u, "")
    .replace(/^酒店\s*/u, "")
    .trim();
}

function splitNotes(text) {
  return String(text)
    .replace(/<br\s*\/?>/gi, "\n")
    .split("\n")
    .map((part) => part.trim())
    .filter(Boolean);
}

function inferCity(text) {
  const cityCandidates = [
    "伊斯坦布尔",
    "伊兹密尔",
    "以弗所",
    "塞尔丘克",
    "费特希耶",
    "厄吕代尼兹",
    "安塔利亚",
    "格雷梅",
    "卡帕多奇亚"
  ];
  return cityCandidates.find((city) => text.includes(city)) ?? "";
}

function formatChineseDayTitle(date) {
  const [, month, day] = date.match(/^(\d{4})-(\d{2})-(\d{2})$/) ?? [];
  return month && day ? `${Number(month)}.${Number(day)}` : date;
}
