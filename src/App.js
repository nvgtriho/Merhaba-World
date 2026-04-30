import React, { useEffect, useMemo, useState } from "https://esm.sh/react@18.3.1?dev";
import { createRoot } from "https://esm.sh/react-dom@18.3.1/client?dev&deps=react@18.3.1";
import {
  AlarmClock,
  CalendarDays,
  Camera,
  CloudSun,
  Copy,
  ExternalLink,
  FileText,
  Languages,
  Link2,
  MapPin,
  Navigation,
  Moon,
  Palette,
  PencilLine,
  Phone,
  Plus,
  Save,
  SearchCheck,
  Sparkles,
  Trash2,
  Utensils,
  Users,
  X,
} from "https://esm.sh/lucide-react@0.468.0?dev&deps=react@18.3.1";
import {
  createDirectionsLink,
  createGoogleMapsSearchUrl,
  createMapLinks,
  createStaticMapUrl,
  inferCuisineInfo,
  normalizeGoogleMapsPlace
} from "./lib/maps.js";
import { createFoodPlaceQuery, createRestaurantPlaceQuery, fetchPlacePreview } from "./lib/places.js";
import { createAssistantLinks, createClockReminderLink, createClockReminderNote } from "./lib/assistantLinks.js";
import { createIndexedDbStore } from "./lib/offlineStore.js";
import {
  compareWeatherSources,
  fetchOpenMeteoForecast,
  getNearestTripDate,
  summarizeWeather,
  turkeyWeatherSources
} from "./lib/weather.js";
import { createLocationFallbackSnapshots, getDayWeatherLocations, weatherCacheKey } from "./lib/weatherLocations.js";
import { createSupabaseAdapter, SUPABASE_ANON_KEY_STORAGE_KEY, SUPABASE_URL_STORAGE_KEY } from "./lib/supabaseAdapter.js";
import { seedTrip } from "./data/tripSeed.js";
import { turkeyPhrases } from "./data/turkishTemplate.js";

const store = createIndexedDbStore();
const supabaseAdapter = createSupabaseAdapter();
const WEATHER_CHART_WIDTH = 260;
const WEATHER_CHART_HEIGHT = 92;
const WEATHER_CHART_PADDING_X = 14;
const SHORT_PLACE_LABELS = new Map([
  ["伊斯坦布尔机场 IST", "IST"],
  ["伊兹密尔 阿德楠曼德列斯机场 ADB", "ADB"],
  ["内夫谢希尔 卡帕多奇亚机场 NAV", "NAV"],
  ["Saint John Hotel", "Saint John"],
  ["Salonika Suites", "Salonika"],
  ["King Apart Goreme", "King Apart"],
  ["Oludeniz Beach", "Oludeniz"],
  ["Lycian Way Start Point", "Lycian Way"],
  ["Göreme Otogarı", "Göreme 车站"],
  ["安塔利亚 Otogar", "安塔利亚车站"],
  ["Göreme Sunset View Point", "日落点"]
]);

function App() {
  const [trip, setTrip] = useState(seedTrip);
  const [selectedDate, setSelectedDate] = useState(() => getNearestTripDate(seedTrip.days, new Date()));
  const [activeView, setActiveView] = useState("today");
  const [savedToast, setSavedToast] = useState("");
  const [externalWeather, setExternalWeather] = useState({});
  const [syncEditor, setSyncEditor] = useState(() => {
    if (typeof localStorage === "undefined") return seedTrip.members[0]?.name ?? "旅伴";
    return localStorage.getItem("short-trip-sync-editor") ?? seedTrip.members[0]?.name ?? "旅伴";
  });
  const [syncState, setSyncState] = useState({
    status: supabaseAdapter.mode === "supabase" ? "ready" : "demo",
    version: 0,
    dirty: false,
    updatedAt: "",
    updatedBy: "",
    message: supabaseAdapter.mode === "supabase" ? "可推送云端" : "本地演示云端"
  });
  const [hasLoadedCloud, setHasLoadedCloud] = useState(false);
  const selectedDay = trip.days.find((day) => day.date === selectedDate) ?? trip.days[0];
  const dayItems = trip.items.filter((item) => item.date === selectedDay.date);
  const currentPlace = trip.places.find((place) => selectedDay.city.includes(place.city)) ?? trip.places[0];
  const dayWeatherLocations = getDayWeatherLocations(selectedDay, dayItems, trip.places, currentPlace);
  const weatherLocationSignature = dayWeatherLocations.map((location) => `${location.key}:${location.latitude},${location.longitude}`).join("|");
  const selectedWeather = externalWeather[weatherCacheKey(selectedDay.date, dayWeatherLocations[0]?.key ?? "primary")];
  const selectedWeatherSnapshots = selectedWeather?.snapshot
    ? [selectedWeather.snapshot, ...selectedDay.weatherSnapshots]
    : selectedDay.weatherSnapshots;
  const selectedHourlyForecast = selectedWeather?.hourlyForecast?.length
    ? selectedWeather.hourlyForecast
    : selectedDay.hourlyForecast;
  const weatherStatus = createWeatherStatus(selectedWeather, selectedDay);
  const weatherReport = compareWeatherSources(selectedWeatherSnapshots);
  const weatherLocationReports = dayWeatherLocations.map((location, index) => {
    const liveWeather = externalWeather[weatherCacheKey(selectedDay.date, location.key)];
    const snapshots = liveWeather?.snapshot
      ? [liveWeather.snapshot]
      : index === 0
        ? selectedDay.weatherSnapshots
        : createLocationFallbackSnapshots(location, selectedDay.weatherSnapshots);
    const summary = summarizeWeather(snapshots);
    return {
      location,
      weather: liveWeather,
      snapshots,
      summary,
      hourlyForecast: liveWeather?.hourlyForecast?.length ? liveWeather.hourlyForecast : selectedDay.hourlyForecast
    };
  });

  const placesWithLinks = useMemo(
    () =>
      trip.places.map((place) => ({
        ...place,
        mapLinks: createMapLinks(place)
      })),
    [trip.places]
  );

  useEffect(() => {
    let cancelled = false;

    if (!dayWeatherLocations.length) {
      return () => {
        cancelled = true;
      };
    }

    Promise.all(dayWeatherLocations.map((location) =>
      fetchOpenMeteoForecast(location, selectedDay.date)
        .then((weather) => ({ location, weather: weather ?? { source: "fallback", sourceLabel: "本地兜底" } }))
        .catch(() => ({ location, weather: { source: "fallback", sourceLabel: "本地兜底" } }))
    )).then((results) => {
      if (cancelled) return;
      setExternalWeather((current) => {
        const next = { ...current };
        for (const result of results) {
          next[weatherCacheKey(selectedDay.date, result.location.key)] = result.weather;
        }
        return next;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [selectedDay.date, weatherLocationSignature]);

  useEffect(() => {
    let cancelled = false;
    pullLatestCloud({ silent: true, isCancelled: () => cancelled });
    return () => {
      cancelled = true;
    };
  }, []);

  async function saveOffline() {
    await store.put("trips", trip);
    await Promise.all(trip.items.map((item) => store.put("itineraryItems", { ...item, tripId: trip.id })));
    await Promise.all(turkeyPhrases.map((phrase) => store.put("phrases", { ...phrase, tripId: trip.id })));
    setSavedToast("已保存到本地离线缓存");
  }

  function updateTrip(nextTrip) {
    setTrip((current) => typeof nextTrip === "function" ? nextTrip(current) : nextTrip);
    setSyncState((current) => ({ ...current, dirty: true, status: current.status === "demo" ? "demo" : "dirty", message: "有本地修改未推送" }));
  }

  async function pushCloud() {
    if (typeof localStorage !== "undefined") localStorage.setItem("short-trip-sync-editor", syncEditor);
    setSyncState((current) => ({ ...current, status: "syncing", message: "正在推送全行程" }));
    const result = await supabaseAdapter.pushTrip(trip, {
      baseVersion: syncState.version,
      updatedBy: syncEditor.trim() || "旅伴"
    });
    if (result.ok) {
      setSyncState({
        status: supabaseAdapter.mode === "supabase" ? "synced" : "demo",
        version: result.version,
        dirty: false,
        updatedAt: result.updatedAt,
        updatedBy: result.updatedBy,
        message: result.message
      });
    } else {
      setSyncState((current) => ({
        ...current,
        status: result.conflict ? "conflict" : "error",
        message: result.message,
        version: result.remoteVersion ?? current.version
      }));
    }
    setSavedToast(result.message);
  }

  async function pullLatestCloud(options = {}) {
    if (typeof localStorage !== "undefined") localStorage.setItem("short-trip-sync-editor", syncEditor);
    if (!options.silent) setSyncState((current) => ({ ...current, status: "syncing", message: "正在拉取全行程" }));
    const result = await supabaseAdapter.pullTrip(trip.id);
    if (options.isCancelled?.()) return result;
    if (result.ok) {
      setTrip(result.trip);
      setSyncState({
        status: supabaseAdapter.mode === "supabase" ? "synced" : "demo",
        version: result.version,
        dirty: false,
        updatedAt: result.updatedAt,
        updatedBy: result.updatedBy,
        message: result.message
      });
      setHasLoadedCloud(true);
    } else {
      setSyncState((current) => {
        const missingMessage = current.version
          ? `未发现新版本，仍显示第 ${current.version} 版`
          : result.cleared
            ? result.message
            : "云端暂无可拉取版本，可先推送当前";
        return {
          ...current,
          status: result.missing ? current.status : "error",
          message: result.missing ? (options.silent ? current.message : missingMessage) : result.message
        };
      });
    }
    if (!options.silent) setSavedToast(result.message);
    return result;
  }

  async function pullCloud() {
    return pullLatestCloud({ silent: false });
  }

  async function clearCloud() {
    if (typeof localStorage !== "undefined") localStorage.setItem("short-trip-sync-editor", syncEditor);
    const editor = syncEditor.trim() || "旅伴";
    setSyncState((current) => ({ ...current, status: "syncing", message: "正在清空云端" }));
    const result = await supabaseAdapter.clearTrip(trip.id, { updatedBy: editor });
    if (result.ok) {
      setSyncState({
        status: supabaseAdapter.mode === "supabase" ? "dirty" : "demo",
        version: 0,
        dirty: true,
        updatedAt: "",
        updatedBy: editor,
        message: "云端已清空，本机当前行程不会删除"
      });
    } else {
      setSyncState((current) => ({
        ...current,
        status: "error",
        message: result.message
      }));
    }
    setSavedToast(result.ok ? "云端已清空，本机当前行程不会删除" : result.message);
    return result;
  }

  return React.createElement(
    React.Fragment,
    null,
    React.createElement("main", { className: "app-shell" },
      React.createElement(Header, { trip, syncCloud: pushCloud, saveOffline, savedToast }),
      React.createElement("section", { className: "phone-stage" },
        React.createElement("section", { className: "active-view", "aria-live": "polite" },
          activeView === "today" && React.createElement(React.Fragment, null,
            React.createElement(TodayPanel, {
              selectedDay,
              dayItems,
              currentPlace,
              trip,
              weatherReport,
              setSelectedDate,
              days: trip.days,
              setActiveView
            }),
            React.createElement(HomeMiniWidgets, {
              selectedDay,
              weatherReport,
              weatherSnapshots: selectedWeatherSnapshots,
              hourlyForecast: selectedHourlyForecast,
              weatherStatus,
              setActiveView,
              phrases: turkeyPhrases
            }),
            React.createElement(DayActionPanel, { selectedDay, dayItems, places: placesWithLinks, trip, setTrip: updateTrip, setActiveView })
          ),
          activeView === "places" && React.createElement(React.Fragment, null,
            React.createElement(PageHeader, { kicker: "PLACES", title: "当天地点", count: `${dayItems.length} 项` }),
            React.createElement(DayPlaceDirectory, { selectedDay, dayItems, places: placesWithLinks, links: trip.links, days: trip.days, trip, setTrip: updateTrip, setSelectedDate }),
          ),
          activeView === "weather" && React.createElement(React.Fragment, null,
            React.createElement(PageHeader, { kicker: "WEATHER", title: "天气复核", count: selectedDay.title }),
            React.createElement(WeatherPanel, {
              selectedDay,
              currentPlace,
              weatherSnapshots: selectedWeatherSnapshots,
              hourlyForecast: selectedHourlyForecast,
              weatherStatus,
              weatherLocationReports,
              trip,
              setTrip: updateTrip,
              setSavedToast
            })
          ),
          activeView === "food" && React.createElement(React.Fragment, null,
            React.createElement(PageHeader, { kicker: "FOOD", title: "当地美食", count: selectedDay.title }),
            React.createElement(FoodPanel, { trip, setTrip: updateTrip, selectedDay })
          ),
          activeView === "docs" && React.createElement(React.Fragment, null,
            React.createElement(PageHeader, { kicker: "DOCS", title: "凭证与常用", count: "离线可用" }),
            React.createElement(CollectionPanel, { trip, setTrip: updateTrip, selectedDay }),
            React.createElement(PhraseLauncher, { phrases: turkeyPhrases }),
            React.createElement(CollaborationPanel, { trip, syncState, syncEditor, setSyncEditor, pushCloud, pullCloud, clearCloud })
          ),
          activeView === "mystic" && React.createElement(React.Fragment, null,
            React.createElement(PageHeader, { kicker: "LUCK", title: "玄学提示", count: selectedDay.title }),
            React.createElement(MysticPanel, { selectedDay, trip, setTrip: updateTrip })
          )
        )
      )
    ),
    React.createElement(BottomNav, { activeView, setActiveView })
  );
}

function createWeatherStatus(selectedWeather, selectedDay) {
  if (selectedWeather?.source === "open-meteo") {
    const isMatchedDay = selectedWeather.matchedDate === selectedDay.date;
    return {
      tone: "live",
      label: isMatchedDay ? (selectedWeather.sourceLabel ?? "Open-Meteo 实时") : `Open-Meteo 最近日 ${formatShortDate(selectedWeather.matchedDate)}`
    };
  }
  if (selectedWeather?.source === "fallback") {
    return { tone: "fallback", label: "本地兜底" };
  }
  return { tone: "loading", label: "读取中" };
}

function formatShortDate(date) {
  return typeof date === "string" ? date.slice(5).replace("-", ".") : "";
}

function Header({ trip, syncCloud, saveOffline, savedToast }) {
  return React.createElement("header", { className: "topbar" },
    React.createElement("div", { className: "brand-lockup" },
      React.createElement("img", { src: "/assets/icon.svg", alt: "", className: "brand-mark" }),
      React.createElement("div", null,
        React.createElement("p", { className: "eyebrow" }, "Merhaba-World"),
        React.createElement("h1", null, trip.name)
      )
    ),
    React.createElement("div", { className: "top-actions" },
      React.createElement("button", { className: "icon-button", onClick: saveOffline, title: "保存离线缓存" },
        React.createElement(Save, { size: 18 }),
        React.createElement("span", null, "离线")
      ),
      React.createElement("button", { className: "primary-button", onClick: syncCloud },
        React.createElement(Users, { size: 18 }),
        React.createElement("span", null, "同步旅伴")
      )
    ),
    savedToast && React.createElement("div", { className: "toast", role: "status" }, savedToast)
  );
}

function BottomNav({ activeView, setActiveView }) {
  return React.createElement("nav", { className: "bottom-nav", "aria-label": "底部模块导航" },
    viewItems.map((item) =>
      React.createElement("button", {
        key: item.id,
        className: activeView === item.id ? "bottom-nav-item active" : "bottom-nav-item",
        onClick: () => setActiveView(item.id)
      },
        React.createElement(item.icon, { size: 19 }),
        React.createElement("span", null, item.shortLabel)
      )
    )
  );
}

const viewItems = [
  { id: "today", shortLabel: "今天", icon: CalendarDays },
  { id: "weather", shortLabel: "天气", icon: CloudSun },
  { id: "food", shortLabel: "美食", icon: Utensils },
  { id: "places", shortLabel: "地点", icon: MapPin },
  { id: "docs", shortLabel: "凭证", icon: FileText }
];

const dayHeroCopy = {
  "2026-04-30": {
    title: "启程，飞向\n伊斯坦布尔",
    copy: "今天重点是值机、转机和落地衔接；把航班、护照、酒店确认单放在最顺手的位置。"
  },
  "2026-05-01": {
    title: "抵达土耳其\n转进以弗所",
    copy: "今天是机场、国内航班和古城游览的连续动作日；转机、交通和酒店信息优先确认。"
  },
  "2026-05-02": {
    title: "转入海边\n落脚厄吕代尼兹",
    copy: "今天交通时间长，落地后再安排海边和滑翔伞预约；风、雨和酒店位置优先复核。"
  },
  "2026-05-03": {
    title: "滑翔伞\n利西亚徒步",
    copy: "今天的核心变量是风和能见度；出发前看官方天气，再决定徒步距离和夜巴节奏。"
  },
  "2026-05-04": {
    title: "抵达格雷梅\n看卡帕多奇亚",
    copy: "今天从夜巴恢复体力，确认酒店、热气球天气和格雷梅周边导航。"
  },
  "2026-05-05": {
    title: "卡帕多奇亚\n机动日",
    copy: "今天留给热气球、红线绿线或小镇休整；按天气和体力决定当天节奏。"
  },
  "2026-05-06": {
    title: "返程转场\n飞回伊斯坦布尔",
    copy: "今天重点是 NAV 到 IST 的航班、机场交通和后续衔接；提前确认行李和登机口。"
  }
};

function PageHeader({ kicker, title, count }) {
  return React.createElement("div", { className: "page-heading" },
    React.createElement("div", null,
      React.createElement("p", { className: "eyebrow" }, kicker),
      React.createElement("h2", null, title)
    ),
    count && React.createElement("span", null, count)
  );
}

function TodayPanel(props) {
  const {
    selectedDay,
    dayItems,
    currentPlace,
    trip,
    setSelectedDate,
    days,
    setActiveView
  } = props;
  const dayQuickActions = getDayQuickActions({ selectedDay, dayItems, trip, currentPlace });
  const hero = dayHeroCopy[selectedDay.date] ?? {
    title: selectedDay.city,
    copy: "把今天最关键的交通、住宿、天气和凭证入口集中在这里。"
  };

  async function handleQuickAction(action) {
    if (action.copyText) {
      try {
        await navigator.clipboard?.writeText(action.copyText);
      } catch {
        // Clipboard access can be denied in some in-app browsers; keep the action non-fatal.
      }
      props.setSavedToast?.("已复制提醒内容，打开系统闹钟后粘贴即可");
      return;
    }
    if (action.view) setActiveView(action.view);
  }

  return React.createElement(React.Fragment, null,
    React.createElement("article", { className: "panel today-panel", style: backgroundImageStyle(selectedDay.heroImageUrl, "--hero-image") },
      React.createElement("div", { className: "panel-title-row" },
        React.createElement("div", null,
          React.createElement("span", { className: "date-pill" }, `${selectedDay.title} · 今日`),
          React.createElement("h2", null, hero.title)
        )
      ),
      React.createElement("p", { className: "hero-copy" }, hero.copy),
      React.createElement("div", { className: "day-switcher" },
        days.map((day) =>
          React.createElement("button", {
            key: day.id,
            className: day.date === selectedDay.date ? "day-chip active" : "day-chip",
            style: backgroundImageStyle(day.heroImageUrl, "--day-image"),
            onClick: () => setSelectedDate(day.date)
          }, day.title)
        )
      )
    ),
    React.createElement("div", { className: "quick-actions utility-rail", "aria-label": "今日工具" },
      dayQuickActions.map((action) => {
        const content = React.createElement(React.Fragment, null,
          React.createElement(action.icon, { size: 18 }),
          React.createElement("span", { className: "action-tooltip" }, action.label)
        );
        if (action.href) {
          return React.createElement("a", {
            key: action.id,
            href: action.href,
            target: action.external ? "_blank" : undefined,
            rel: action.external ? "noreferrer" : undefined,
            "aria-label": action.label,
            title: action.label,
            className: "action-tile"
          }, content);
        }
        return React.createElement("button", {
          key: action.id,
          className: "action-tile",
          "aria-label": action.label,
          title: action.label,
          onClick: () => handleQuickAction(action)
        }, content);
      })
    )
  );
}

function HomeMiniWidgets({ selectedDay, weatherReport, weatherSnapshots, hourlyForecast, weatherStatus, setActiveView, phrases }) {
  const weatherSummary = summarizeWeather(weatherSnapshots ?? selectedDay.weatherSnapshots);
  const nextWeatherPoint = hourlyForecast?.[0];
  const weatherLine = `${weatherSummary.lowC}°-${weatherSummary.highC}° · 雨${weatherSummary.precipitationChance}%`;
  const windLine = `${weatherStatus?.label ?? "本地兜底"} · 风 ${nextWeatherPoint?.windKmh ?? weatherSummary.windKmh}km/h · ${weatherReport.status === "divergent" ? "需复核" : "已校验"}`;
  const mystic = selectedDay.mystic;

  return React.createElement("section", { className: "home-mini-widgets", "aria-label": "今日精巧提示" },
    React.createElement("button", { className: "home-widget-button weather-mini-widget", onClick: () => setActiveView("weather") },
      React.createElement(CloudSun, { size: 18 }),
      React.createElement("span", null, "天气"),
      React.createElement("strong", null, weatherLine),
      React.createElement("small", null, windLine)
    ),
    mystic && React.createElement("button", { className: "home-widget-button mystic-mini-widget", onClick: () => setActiveView("mystic") },
      React.createElement(Sparkles, { size: 18 }),
      React.createElement("span", null, "玄学"),
      React.createElement("strong", null, mystic.summary),
      React.createElement("small", null, `${mystic.luckyColor ?? "今日色"} · ${mystic.focus ?? selectedDay.city}`)
    ),
    React.createElement(PhraseLauncher, { phrases, variant: "mini" })
  );
}

function DayActionPanel({ selectedDay, dayItems, places, trip, setTrip, setActiveView }) {
  const [draft, setDraft] = useState({ title: "", note: "" });
  const visibleItems = dayItems.length ? dayItems : [{
    id: `empty-${selectedDay.date}`,
    date: selectedDay.date,
    startTime: null,
    type: "note",
    title: "当天行程待补充",
    notes: ["可以先看地点、天气和凭证，再补充具体行动。"]
  }];

  function updateItem(itemId, patch) {
    setTrip({
      ...trip,
      items: trip.items.map((item) => item.id === itemId ? { ...item, ...patch } : item)
    });
  }

  function updateItemNote(item, note) {
    updateItem(item.id, { notes: [note, ...(item.notes ?? []).slice(1)] });
  }

  function removeItem(itemId) {
    setTrip({ ...trip, items: trip.items.filter((item) => item.id !== itemId) });
  }

  function addItem() {
    if (!draft.title.trim()) return;
    setTrip({
      ...trip,
      items: [
        ...trip.items,
        {
          id: `item-${Date.now()}`,
          date: selectedDay.date,
          startTime: null,
          endTime: null,
          type: "note",
          title: draft.title.trim(),
          notes: draft.note.trim() ? [draft.note.trim()] : []
        }
      ]
    });
    setDraft({ title: "", note: "" });
  }

  return React.createElement("article", { className: "panel traffic-panel" },
    React.createElement("div", { className: "panel-title-row" },
      React.createElement("h3", null, "今日行动"),
      React.createElement("span", { className: "small-filter" }, `${selectedDay.title} · ${visibleItems.length}项`)
    ),
    React.createElement("div", { className: "day-action-stack" },
      visibleItems.map((item) =>
        React.createElement(ItineraryActionCard, {
          item,
          key: item.id,
          places,
          assets: trip.assets ?? [],
          setActiveView
        })
      )
    ),
    React.createElement(EditDrawer, { label: "编辑行动" },
      React.createElement("div", { className: "compact-form two" },
        React.createElement("input", { value: draft.title, onChange: (event) => setDraft({ ...draft, title: event.target.value }), placeholder: "新增行动标题" }),
        React.createElement("input", { value: draft.note, onChange: (event) => setDraft({ ...draft, note: event.target.value }), placeholder: "一句有用说明" }),
        React.createElement("button", { className: "primary-button", onClick: addItem },
          React.createElement(Plus, { size: 18 }),
          React.createElement("span", null, "添加行动")
        )
      ),
      React.createElement("div", { className: "edit-list" },
        dayItems.map((item) =>
          React.createElement("div", { key: `edit-${item.id}`, className: "action-edit-grid" },
            React.createElement("input", { value: item.title, onChange: (event) => updateItem(item.id, { title: event.target.value }), "aria-label": "行动标题" }),
            React.createElement("select", { value: item.type ?? "note", onChange: (event) => updateItem(item.id, { type: event.target.value }), "aria-label": "行动类型" },
              ["transport", "activity", "lodging", "food", "note"].map((type) =>
                React.createElement("option", { key: type, value: type }, type)
              )
            ),
            React.createElement("input", { value: item.startTime ?? "", onChange: (event) => updateItem(item.id, { startTime: event.target.value || null }), placeholder: "开始时间", "aria-label": "开始时间" }),
            React.createElement("input", { value: item.endTime ?? "", onChange: (event) => updateItem(item.id, { endTime: event.target.value || null }), placeholder: "结束时间", "aria-label": "结束时间" }),
            React.createElement("select", { value: item.primaryPlaceId ?? "", onChange: (event) => updateItem(item.id, { primaryPlaceId: event.target.value || null }), "aria-label": "地点" },
              React.createElement("option", { value: "" }, "未绑定地点"),
              places.map((place) => React.createElement("option", { key: place.id, value: place.id }, place.name))
            ),
            React.createElement("select", { value: item.destinationPlaceId ?? "", onChange: (event) => updateItem(item.id, { destinationPlaceId: event.target.value || null }), "aria-label": "目的地" },
              React.createElement("option", { value: "" }, "无目的地"),
              places.map((place) => React.createElement("option", { key: place.id, value: place.id }, place.name))
            ),
            React.createElement("input", { value: item.address ?? "", onChange: (event) => updateItem(item.id, { address: event.target.value }), placeholder: "行动地址", "aria-label": "行动地址" }),
            React.createElement("select", { className: "asset-picker", value: item.assetIds?.[0] ?? "", onChange: (event) => updateItem(item.id, { assetIds: event.target.value ? [event.target.value] : [] }), "aria-label": "关联凭证" },
              React.createElement("option", { value: "" }, "未绑定凭证"),
              (trip.assets ?? []).map((asset) => React.createElement("option", { key: asset.id, value: asset.id }, asset.title))
            ),
            React.createElement("input", { value: item.notes?.[0] ?? "", onChange: (event) => updateItemNote(item, event.target.value), "aria-label": "行动说明" }),
            React.createElement("button", { onClick: () => removeItem(item.id), title: "删除行动" }, React.createElement(Trash2, { size: 15 }))
          )
        )
      )
    )
  );
}

function WeatherPanel({ selectedDay, currentPlace, weatherSnapshots, hourlyForecast, weatherStatus, weatherLocationReports, trip, setTrip }) {
  const [draft, setDraft] = useState({ sourceName: "", highC: "", lowC: "", precipitationChance: "", windKmh: "" });
  const sources = turkeyWeatherSources(currentPlace.city || currentPlace.name);
  const report = compareWeatherSources(weatherSnapshots ?? selectedDay.weatherSnapshots);
  const summary = summarizeWeather(weatherSnapshots ?? selectedDay.weatherSnapshots);
  const visual = createWeatherVisual(summary, report);

  function updateSelectedDayWeather(nextSnapshots) {
    setTrip({
      ...trip,
      days: trip.days.map((day) => day.date === selectedDay.date ? { ...day, weatherSnapshots: nextSnapshots } : day)
    });
  }

  function updateWeatherSnapshot(sourceId, patch) {
    updateSelectedDayWeather((selectedDay.weatherSnapshots ?? []).map((snapshot) =>
      snapshot.sourceId === sourceId ? { ...snapshot, ...patch } : snapshot
    ));
  }

  function removeWeatherSnapshot(sourceId) {
    updateSelectedDayWeather((selectedDay.weatherSnapshots ?? []).filter((snapshot) => snapshot.sourceId !== sourceId));
  }

  function addWeatherSnapshot() {
    if (!draft.sourceName.trim()) return;
    updateSelectedDayWeather([
      ...(selectedDay.weatherSnapshots ?? []),
      {
        sourceId: `custom-${Date.now()}`,
        sourceName: draft.sourceName.trim(),
        highC: Number(draft.highC) || 0,
        lowC: Number(draft.lowC) || 0,
        precipitationChance: Number(draft.precipitationChance) || 0,
        windKmh: Number(draft.windKmh) || 0
      }
    ]);
    setDraft({ sourceName: "", highC: "", lowC: "", precipitationChance: "", windKmh: "" });
  }

  return React.createElement("article", { className: "panel weather-panel" },
    React.createElement("div", { className: "panel-title-row" },
      React.createElement("div", null,
        React.createElement("p", { className: "eyebrow" }, "Weather cross-check"),
        React.createElement("h2", null, "权威天气互校验")
      ),
      React.createElement(SearchCheck, { size: 22 })
    ),
    React.createElement("div", { className: `weather-story-card ${visual.tone}` },
      React.createElement("div", null,
        React.createElement("span", { className: "weather-kicker" }, `${selectedDay.title} · ${currentPlace.city || currentPlace.name}`),
        React.createElement("span", { className: `weather-live-status ${weatherStatus?.tone ?? "fallback"}` }, weatherStatus?.label ?? "本地兜底"),
        React.createElement("strong", null, visual.title),
        React.createElement("p", null, visual.copy)
      ),
      React.createElement("div", { className: "weather-numbers" },
        React.createElement("span", null, `${summary.highC}°`),
        React.createElement("small", null, `低 ${summary.lowC}° · 风 ${summary.windKmh} km/h`)
      )
    ),
    React.createElement("div", { className: "weather-meter" },
      React.createElement("div", null,
        React.createElement("span", null, "降雨"),
        React.createElement("strong", null, `${summary.precipitationChance ?? 0}%`),
        React.createElement("i", { style: { width: `${Math.min(summary.precipitationChance ?? 0, 100)}%` } })
      ),
      React.createElement("div", null,
        React.createElement("span", null, "风感"),
        React.createElement("strong", null, `${summary.windKmh ?? 0}km/h`),
        React.createElement("i", { style: { width: `${Math.min(((summary.windKmh ?? 0) / 60) * 100, 100)}%` } })
      ),
      React.createElement("div", null,
        React.createElement("span", null, "来源"),
        React.createElement("strong", null, `${report.sourceCount} 个`),
        React.createElement("i", { style: { width: `${Math.min(report.sourceCount * 30, 100)}%` } })
      )
    ),
    React.createElement("div", { className: "weather-location-grid" },
      weatherLocationReports.map((report) =>
        React.createElement(WeatherLocationCard, { key: report.location.key, report })
      )
    ),
    React.createElement(HourlyWeatherChart, { forecast: hourlyForecast ?? selectedDay.hourlyForecast ?? [], summary }),
    React.createElement("div", { className: "source-list" },
      sources.map((source) =>
        React.createElement("a", { key: source.id, href: source.url, target: "_blank", rel: "noreferrer", className: "source-card" },
          React.createElement("strong", null, source.name),
          React.createElement("span", null, `${source.label} · 当前唯一保留外链`),
          React.createElement(ExternalLink, { size: 15 })
        )
      )
    ),
    React.createElement("div", { className: "weather-grid" },
      (weatherSnapshots ?? selectedDay.weatherSnapshots).map((snapshot) =>
        React.createElement("div", { key: snapshot.sourceId, className: "weather-source" },
          React.createElement("span", null, snapshot.sourceName),
          React.createElement("strong", null, `${snapshot.highC}° / ${snapshot.lowC}°`),
          React.createElement("small", null, `雨 ${snapshot.precipitationChance}% · 风 ${snapshot.windKmh}km/h`)
        )
      )
    ),
    React.createElement("p", { className: "weather-note" },
      report.status === "divergent"
        ? `触发差异：${report.reasons.join("、")}。出发前点开 Open-Meteo 复核。`
        : "当前趋势平稳，可按计划执行。"
    ),
    React.createElement(EditDrawer, { label: "编辑天气" },
      React.createElement("div", { className: "compact-form two" },
        React.createElement("input", { value: draft.sourceName, onChange: (event) => setDraft({ ...draft, sourceName: event.target.value }), placeholder: "来源名称" }),
        React.createElement("input", { value: draft.highC, onChange: (event) => setDraft({ ...draft, highC: event.target.value }), placeholder: "最高温" }),
        React.createElement("input", { value: draft.lowC, onChange: (event) => setDraft({ ...draft, lowC: event.target.value }), placeholder: "最低温" }),
        React.createElement("input", { value: draft.precipitationChance, onChange: (event) => setDraft({ ...draft, precipitationChance: event.target.value }), placeholder: "降雨%" }),
        React.createElement("input", { value: draft.windKmh, onChange: (event) => setDraft({ ...draft, windKmh: event.target.value }), placeholder: "风 km/h" }),
        React.createElement("button", { className: "primary-button", onClick: addWeatherSnapshot },
          React.createElement(Plus, { size: 18 }),
          React.createElement("span", null, "添加来源")
        )
      ),
      React.createElement("div", { className: "edit-list" },
        (selectedDay.weatherSnapshots ?? []).map((snapshot) =>
          React.createElement("div", { key: `edit-${snapshot.sourceId}`, className: "edit-row" },
            React.createElement("input", { value: snapshot.sourceName, onChange: (event) => updateWeatherSnapshot(snapshot.sourceId, { sourceName: event.target.value }), "aria-label": "天气来源" }),
            React.createElement("input", { value: `${snapshot.highC}/${snapshot.lowC} 雨${snapshot.precipitationChance}% 风${snapshot.windKmh}`, readOnly: true, "aria-label": "天气摘要" }),
            React.createElement("button", { onClick: () => removeWeatherSnapshot(snapshot.sourceId), title: "删除天气来源" }, React.createElement(Trash2, { size: 15 }))
          )
        )
      )
    )
  );
}

function WeatherLocationCard({ report }) {
  const { location, summary, weather } = report;
  return React.createElement("article", { className: "weather-location-card" },
    React.createElement("span", null, location.shortLabel ?? location.name),
    React.createElement("strong", null, `${summary.lowC}°-${summary.highC}°`),
    React.createElement("small", null, `${weather?.sourceLabel ?? "本地兜底"} · 雨${summary.precipitationChance}% · 风${summary.windKmh}km/h`)
  );
}

function HourlyWeatherChart({ forecast, summary }) {
  const points = forecast.length ? forecast : createFallbackHourlyForecast(summary);
  const temps = points.map((point) => point.tempC);
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const range = Math.max(max - min, 1);
  const chartTop = 18;
  const chartBottom = WEATHER_CHART_HEIGHT - 14;
  const chartWidth = WEATHER_CHART_WIDTH - WEATHER_CHART_PADDING_X * 2;
  const chartPoints = points.map((point, index) => {
    const x = points.length === 1
      ? WEATHER_CHART_WIDTH / 2
      : WEATHER_CHART_PADDING_X + (index / (points.length - 1)) * chartWidth;
    const y = chartBottom - ((point.tempC - min) / range) * (chartBottom - chartTop);
    return { point, x, y };
  });
  const linePoints = chartPoints.map(({ x, y }) => `${x},${y}`).join(" ");

  return React.createElement("section", { className: "weather-timeline-chart wide-weather-chart", "aria-label": "小时级天气时序图" },
    React.createElement("div", { className: "chart-heading" },
      React.createElement("strong", null, "小时趋势"),
      React.createElement("span", null, "温度 / 降雨 / 风")
    ),
    React.createElement("div", { className: "hourly-scroller" },
      React.createElement("div", { className: "hourly-track" },
        React.createElement("svg", { viewBox: `0 0 ${WEATHER_CHART_WIDTH} ${WEATHER_CHART_HEIGHT}`, role: "img", "aria-label": "小时温度曲线" },
          React.createElement("polyline", { points: linePoints, fill: "none", stroke: "currentColor", strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" }),
          chartPoints.map(({ point, x, y }) =>
            React.createElement("circle", { key: `${point.time}-dot`, cx: x, cy: y, r: 2.6 })
          )
        ),
        React.createElement("div", { className: "hourly-row", style: { gridTemplateColumns: `repeat(${points.length}, minmax(64px, 1fr))` } },
          points.map((point) =>
            React.createElement("div", { key: point.time },
              React.createElement("span", null, point.time),
              React.createElement("strong", null, `${point.tempC}°`),
              React.createElement("small", null, `雨${point.precipitationChance}% · 风${point.windKmh}`)
            )
          )
        )
      )
    )
  );
}

function ItineraryActionCard({ item, places, assets = [], setActiveView, onRemove }) {
  const place = resolveItemPlace(item, places);
  const destinationPlace = resolveDestinationPlace(item, places);
  const placeMapLinks = place ? createMapLinks(place) : null;
  const directionsLink = place && destinationPlace ? createDirectionsLink(place, destinationPlace) : "";
  const relatedAssets = getItemCredentialAssets(item, assets);
  const trafficSummary = getTrafficSummary(item, place, destinationPlace);
  const visibleNotes = getVisibleActionNotes(item);
  const displayTitle = getActionDisplayTitle(item, place, destinationPlace);
  const hasRoute = place && destinationPlace && destinationPlace.id !== place.id;
  const typeLabel = item.type === "transport" ? "交通" : item.type === "lodging" ? "住宿" : item.type === "food" ? "点餐" : item.type === "note" ? "备注" : "行动";

  return React.createElement("div", { className: `itinerary-action-card ${item.type}` },
    React.createElement("aside", null,
      React.createElement("strong", null, item.startTime ?? "--:--"),
      React.createElement("span", null, typeLabel)
    ),
      React.createElement("div", null,
      React.createElement("div", { className: "card-title-row" },
        React.createElement("strong", null, displayTitle),
        item.endTime && React.createElement("span", { className: "time-range" }, `至 ${item.endTime}`),
        onRemove && React.createElement("button", { onClick: onRemove, title: "移除" }, "移除")
      ),
      hasRoute && React.createElement("a", { className: "route-journey", href: directionsLink, target: "_blank", rel: "noreferrer", title: "打开路线导航" },
        React.createElement("span", { className: "route-node" }, shortPlaceName(place.name)),
        React.createElement("span", { className: "route-line" },
          React.createElement(Navigation, { size: 14 }),
          React.createElement("i", null, "路线")
        ),
        React.createElement("span", { className: "route-node" }, shortPlaceName(destinationPlace.name))
      ),
      React.createElement("div", { className: "action-card-meta" },
        place && !hasRoute && React.createElement("a", { className: "place-map-chip", href: placeMapLinks.google, target: "_blank", rel: "noreferrer", title: "打开地图" },
          React.createElement(MapPin, { size: 14 }),
          React.createElement("span", null, place.name)
        ),
        trafficSummary && !hasRoute && React.createElement("span", { className: "traffic-summary" },
          React.createElement(Navigation, { size: 14 }),
          React.createElement("span", null, trafficSummary)
        ),
        relatedAssets.length > 0 && React.createElement("button", { className: "credential-pill", onClick: () => setActiveView("docs"), title: "查看相关凭证" },
          React.createElement(FileText, { size: 14 }),
          React.createElement("span", null, getCredentialLabel(relatedAssets))
        )
      ),
      visibleNotes.length > 0 && React.createElement("ul", { className: "action-note-strip" },
        visibleNotes.map((note) => React.createElement("li", { key: note }, note))
      )
    )
  );
}

function DayPlaceDirectory({ selectedDay, dayItems, places, links, days, trip, setTrip, setSelectedDate }) {
  const dailyPlaces = createDailyPlaces(dayItems, places);
  const [placeDraft, setPlaceDraft] = useState("");

  function updatePlace(placeId, patch) {
    setTrip({
      ...trip,
      places: trip.places.map((place) => place.id === placeId ? { ...place, ...patch } : place)
    });
  }

  function importGooglePlace() {
    const normalized = normalizeGoogleMapsPlace(placeDraft);
    if (!placeDraft.trim()) return;
    setTrip({
      ...trip,
      places: [
        ...trip.places,
        {
          id: `place-google-${Date.now()}`,
          name: normalized.title,
          kind: "place",
          city: selectedDay.city.split(/[ /]+/).find(Boolean) ?? selectedDay.city,
          address: normalized.query,
          latitude: normalized.latitude,
          longitude: normalized.longitude,
          externalUrl: normalized.href,
          externalLabel: "Google Maps",
          googleMapsMeta: normalized
        }
      ]
    });
    setPlaceDraft("");
  }

  return React.createElement("article", { className: "panel" },
    React.createElement(SectionHeading, { icon: MapPin, title: "当天地点", subtitle: `${selectedDay.title} · ${selectedDay.city}` }),
    React.createElement("div", { className: "day-switcher light" },
      days.map((day) =>
        React.createElement("button", {
          key: day.id,
          className: day.date === selectedDay.date ? "day-chip active" : "day-chip",
          style: backgroundImageStyle(day.heroImageUrl, "--day-image"),
          onClick: () => setSelectedDate(day.date)
        }, day.title)
      )
    ),
    React.createElement("div", { className: "daily-place-stack" },
      dailyPlaces.map((entry) =>
        React.createElement(PlaceInsightCard, { key: entry.key, entry })
      ),
      links.filter((link) => link.tag !== "天气").map((link) =>
        React.createElement("a", { key: link.id, href: link.url, target: "_blank", rel: "noreferrer", className: "plain-link" },
          React.createElement(ExternalLink, { size: 16 }),
          React.createElement("span", null, link.title)
        )
      )
    ),
    React.createElement(EditDrawer, { label: "编辑地点" },
      React.createElement("div", { className: "place-google-import" },
        React.createElement("input", { value: placeDraft, onChange: (event) => setPlaceDraft(event.target.value), placeholder: "粘贴 Google Maps 地点链接或地点名" }),
        React.createElement("button", { className: "primary-button", onClick: importGooglePlace },
          React.createElement(Plus, { size: 18 }),
          React.createElement("span", null, "导入地点")
        )
      ),
      React.createElement("div", { className: "edit-list" },
        dailyPlaces.filter((entry) => entry.place.id && !entry.place.id.startsWith("item-place-")).map((entry) =>
          React.createElement("div", { key: `edit-${entry.key}`, className: "edit-row" },
            React.createElement("input", { value: entry.place.name, onChange: (event) => updatePlace(entry.place.id, { name: event.target.value }), "aria-label": "地点名称" }),
            React.createElement("input", { value: entry.place.address ?? "", onChange: (event) => updatePlace(entry.place.id, { address: event.target.value }), "aria-label": "地点地址" }),
            React.createElement("span", null, entry.typeLabel)
          )
        )
      )
    )
  );
}

function PlaceInsightCard({ entry }) {
  const { place, mapLinks } = entry;
  const guide = place.guide;

  return React.createElement("div", { className: `daily-place-card ${place.kind ?? "place"}` },
    place.imageUrl && React.createElement("img", { className: "place-photo", src: place.imageUrl, alt: place.name, loading: "lazy" }),
    !place.imageUrl && React.createElement(MapThumbnail, { subject: place, label: place.city || entry.typeLabel }),
    React.createElement("span", null, `${entry.time} · ${entry.typeLabel}`),
    React.createElement("strong", null, place.name),
    place.imageCredit && React.createElement("small", { className: "place-credit" }, place.imageCredit),
    React.createElement("small", null, place.address || entry.item.title),
    guide && React.createElement("details", { className: "place-guide-card" },
      React.createElement("summary", null, "地点资料"),
      React.createElement("p", null, guide.summary),
      React.createElement("ul", null,
        guide.facts.map((fact) => React.createElement("li", { key: fact }, fact))
      ),
      React.createElement("div", { className: "guide-source-list" },
        guide.sources.map((source) =>
          React.createElement("a", { key: source.url, href: source.url, target: "_blank", rel: "noreferrer", className: "guide-source-link" },
            React.createElement(ExternalLink, { size: 13 }),
            React.createElement("span", null, source.title)
          )
        )
      )
    ),
    React.createElement("div", { className: "place-action-row" }, renderPlaceActions(place, mapLinks))
  );
}

function MapThumbnail({ subject, label, className = "", markerLabel = "M" }) {
  const [hasImageError, setHasImageError] = useState(false);
  const staticMapImageUrl = createStaticMapUrl(subject, { markerLabel });
  const title = subject?.name ?? subject?.title ?? subject?.googleMapsMeta?.title ?? "地图";
  const fallbackLabel = label || subject?.city || "附近";

  return React.createElement("div", { className: `map-thumbnail-card ${className}`.trim() },
    staticMapImageUrl && !hasImageError
      ? React.createElement("img", {
          className: "google-static-map",
          src: staticMapImageUrl,
          alt: `${title} 地图缩略图`,
          loading: "lazy",
          referrerPolicy: "no-referrer",
          onError: () => setHasImageError(true)
        })
      : React.createElement("div", { className: "offline-map-fallback" },
          React.createElement(MapPin, { size: 18 }),
          React.createElement("strong", null, "离线地图预览"),
          React.createElement("span", null, title)
        ),
    React.createElement("span", { className: "map-thumbnail-label" }, fallbackLabel)
  );
}

function renderPlaceActions(place, mapLinks) {
  const actions = [];
  if (place.kind === "hotel" && place.externalUrl) {
    actions.push(React.createElement("a", { key: "hotel", href: place.externalUrl, target: "_blank", rel: "noreferrer", className: "hotel-jump-link" },
      React.createElement(ExternalLink, { size: 15 }),
      React.createElement("span", null, place.externalLabel ?? "酒店页")
    ));
  }
  actions.push(React.createElement("a", { key: "map", href: mapLinks.google, target: "_blank", rel: "noreferrer", className: "place-map-secondary" },
    React.createElement(Navigation, { size: 15 }),
    React.createElement("span", null, "位置")
  ));
  return actions;
}

function FoodPanel({ trip, setTrip, selectedDay }) {
  const [draft, setDraft] = useState({ title: "", url: "" });
  const [foodPreviewById, setFoodPreviewById] = useState({});
  const [placesPreviewById, setPlacesPreviewById] = useState({});
  const foods = getDailyFoodRecommendations(trip, selectedDay);
  const restaurants = getDailyRestaurantLinks(trip, selectedDay);
  const foodPreviewSignature = foods.map((food) => `${food.id}:${food.title}:${food.googleQuery}:${food.city}`).join("|");
  const restaurantPreviewSignature = restaurants.map((restaurant) => `${restaurant.id}:${restaurant.title}:${restaurant.url}`).join("|");

  useEffect(() => {
    let cancelled = false;
    if (!foods.length) return () => {
      cancelled = true;
    };

    Promise.all(foods.map(async (food) => {
      const preview = await fetchPlacePreview(createFoodPlaceQuery(food));
      return [food.id, preview];
    })).then((entries) => {
      if (cancelled) return;
      setFoodPreviewById((current) => {
        const next = { ...current };
        for (const [id, preview] of entries) {
          if (preview) next[id] = preview;
        }
        return next;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [foodPreviewSignature]);

  useEffect(() => {
    let cancelled = false;
    if (!restaurants.length) return () => {
      cancelled = true;
    };

    Promise.all(restaurants.map(async (restaurant) => {
      const meta = restaurant.googleMapsMeta ?? normalizeGoogleMapsPlace(restaurant.url || restaurant.title);
      const preview = await fetchPlacePreview(createRestaurantPlaceQuery({ ...restaurant, googleMapsMeta: meta }));
      return [restaurant.id, preview];
    })).then((entries) => {
      if (cancelled) return;
      setPlacesPreviewById((current) => {
        const next = { ...current };
        for (const [id, preview] of entries) {
          if (preview) next[id] = preview;
        }
        return next;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [restaurantPreviewSignature]);

  function addRestaurant() {
    const normalized = normalizeGoogleMapsPlace(draft.url || draft.title);
    const title = draft.title.trim() || normalized.title;
    if (!title) return;
    setTrip({
      ...trip,
      restaurantLinks: [
        ...restaurants,
        {
          id: `restaurant-${Date.now()}`,
          title,
          date: selectedDay.date,
          city: selectedDay.city,
          url: normalized.href,
          googleMapsMeta: normalized,
          source: "google"
        }
      ]
    });
    setDraft({ title: "", url: "" });
  }

  function updateFood(foodId, patch) {
    setTrip({
      ...trip,
      foodRecommendations: (trip.foodRecommendations ?? []).map((food) =>
        food.id === foodId ? { ...food, ...patch } : food
      )
    });
  }

  function removeFood(foodId) {
    setTrip({
      ...trip,
      foodRecommendations: (trip.foodRecommendations ?? []).filter((food) => food.id !== foodId)
    });
  }

  function removeRestaurant(restaurantId) {
    setTrip({
      ...trip,
      restaurantLinks: (trip.restaurantLinks ?? []).filter((restaurant) => restaurant.id !== restaurantId)
    });
  }

  return React.createElement("article", { className: "panel food-panel" },
    React.createElement(SectionHeading, { icon: Utensils, title: "当地美食推荐", subtitle: "按当天城市筛选，也可从 Google Maps 粘贴餐厅" }),
    React.createElement("div", { className: "food-grid" },
      foods.map((food) =>
        React.createElement(FoodRecommendationCard, { key: food.id, food, placePreview: foodPreviewById[food.id] })
      )
    ),
    React.createElement("div", { className: "restaurant-stack" },
      restaurants.map((restaurant) =>
        React.createElement(RestaurantCard, { key: restaurant.id, restaurant, placePreview: placesPreviewById[restaurant.id] })
      )
    ),
    React.createElement(EditDrawer, { label: "编辑美食" },
      React.createElement("div", { className: "compact-form two" },
        React.createElement("input", { value: draft.title, onChange: (event) => setDraft({ ...draft, title: event.target.value }), placeholder: "餐厅名或美食名" }),
        React.createElement("input", { value: draft.url, onChange: (event) => setDraft({ ...draft, url: event.target.value }), placeholder: "Google Maps 链接或分享文案" }),
        React.createElement("button", { className: "primary-button", onClick: addRestaurant },
          React.createElement(Plus, { size: 18 }),
          React.createElement("span", null, "Google 导入餐厅")
        )
      ),
      React.createElement("div", { className: "edit-list" },
        foods.map((food) =>
          React.createElement("div", { key: `edit-${food.id}`, className: "edit-row" },
            React.createElement("input", { value: food.title, onChange: (event) => updateFood(food.id, { title: event.target.value }), "aria-label": "美食标题" }),
            React.createElement("input", { value: food.description, onChange: (event) => updateFood(food.id, { description: event.target.value }), "aria-label": "美食说明" }),
            React.createElement("button", { onClick: () => removeFood(food.id), title: "删除美食" }, React.createElement(Trash2, { size: 15 }))
          )
        ),
        restaurants.map((restaurant) =>
          React.createElement("div", { key: `edit-${restaurant.id}`, className: "edit-row compact" },
            React.createElement("span", null, restaurant.title),
            React.createElement("button", { onClick: () => removeRestaurant(restaurant.id), title: "删除餐厅链接" }, React.createElement(Trash2, { size: 15 }))
          )
        )
      )
    )
  );
}

function FoodRecommendationCard({ food, placePreview }) {
  const cuisineInfo = inferCuisineInfo(food);

  return React.createElement("article", { className: "food-card" },
    React.createElement(FoodImage, { food, cuisineInfo, placePreview }),
    React.createElement("span", null, food.city),
    React.createElement("strong", null, food.title),
    React.createElement("p", null, food.description),
    React.createElement(CuisineChipList, { cuisineInfo }),
    React.createElement("a", { href: createGoogleMapsSearchUrl(food.googleQuery), target: "_blank", rel: "noreferrer" },
      React.createElement(Navigation, { size: 15 }),
      React.createElement("span", null, "搜附近")
    )
  );
}

function FoodImage({ food, cuisineInfo, placePreview }) {
  const imageUrl = placePreview?.photoUrl || food.imageUrl || getCuisineFallbackImage(cuisineInfo);
  const caption = placePreview?.photoAttribution
    ? `Google Places · ${placePreview.photoAttribution}`
    : food.imageCredit;
  return React.createElement("figure", { className: "food-photo" },
    React.createElement("img", { src: imageUrl, alt: food.title, loading: "lazy" }),
    caption && React.createElement("figcaption", null, caption)
  );
}

function RestaurantCard({ restaurant, placePreview }) {
  const meta = restaurant.googleMapsMeta ?? normalizeGoogleMapsPlace(restaurant.url || restaurant.title);
  const cuisineInfo = inferCuisineInfo({ ...restaurant, googleMapsMeta: meta });
  const displayTitle = placePreview?.name || restaurant.title || meta.title;
  const displayHref = placePreview?.googleMapsUri || restaurant.url || meta.href;
  const detailChips = [
    placePreview?.typeLabel,
    placePreview?.ratingLabel && `评分 ${placePreview.ratingLabel}`,
    placePreview?.priceLabel,
    ...(placePreview?.serviceChips ?? [])
  ].filter(Boolean);

  return React.createElement("article", { className: "restaurant-card" },
    React.createElement(RestaurantPhoto, { placePreview, cuisineInfo, title: displayTitle }),
    React.createElement("header", null,
      React.createElement(MapPin, { size: 17 }),
      React.createElement("div", null,
        React.createElement("strong", null, displayTitle),
        React.createElement("span", null, restaurant.city ?? meta.query ?? "Google Maps")
      ),
      React.createElement("a", { href: displayHref, target: "_blank", rel: "noreferrer", title: "打开 Google Maps" },
        React.createElement(ExternalLink, { size: 15 })
      )
    ),
    React.createElement("div", { className: "restaurant-meta-grid" },
      React.createElement("span", null, placePreview ? "Google Places" : "Google Maps"),
      detailChips.length
        ? React.createElement("span", null, detailChips.join(" · "))
        : meta.latitude && meta.longitude
        ? React.createElement("span", null, `${meta.latitude.toFixed(4)}, ${meta.longitude.toFixed(4)}`)
        : React.createElement("span", null, "无 key 链接解析"),
      React.createElement("span", null, meta.query || restaurant.title)
    ),
    React.createElement("div", { className: "restaurant-cuisine-panel" },
      React.createElement("span", null, "大概菜式"),
      React.createElement("p", null, placePreview?.editorialSummary || cuisineInfo.summary),
      React.createElement(CuisineChipList, { cuisineInfo })
    )
  );
}

function RestaurantPhoto({ placePreview, cuisineInfo, title }) {
  const imageUrl = placePreview?.photoUrl || getCuisineFallbackImage(cuisineInfo);
  return React.createElement("figure", { className: "restaurant-place-photo" },
    React.createElement("img", { src: imageUrl, alt: title, loading: "lazy" }),
    placePreview?.photoAttribution && React.createElement("figcaption", { className: "place-photo-attribution" },
      `Google Places · ${placePreview.photoAttribution}`
    ),
    placePreview?.googleMapsUri && React.createElement("a", { className: "restaurant-google-detail", href: placePreview.googleMapsUri, target: "_blank", rel: "noreferrer" },
      React.createElement(ExternalLink, { size: 13 }),
      React.createElement("span", null, "Google 详情")
    )
  );
}

function CuisineChipList({ cuisineInfo }) {
  return React.createElement("div", { className: "cuisine-chip-list" },
    cuisineInfo.chips.map((chip) => React.createElement("span", { key: chip }, chip))
  );
}

function getCuisineFallbackImage(cuisineInfo) {
  const chips = cuisineInfo.chips.join(" ");
  if (/海鲜|meze|烤鱼/.test(chips)) return "https://commons.wikimedia.org/wiki/Special:FilePath/Turkish%20Meze%20Plate.jpg?width=960";
  if (/早餐|Menemen/.test(chips)) return "https://commons.wikimedia.org/wiki/Special:FilePath/Turkish%20breakfast.jpg?width=960";
  if (/Gözleme|Pide/.test(chips)) return "https://commons.wikimedia.org/wiki/Special:FilePath/Gozleme%20at%20Manning%20Market.jpg?width=960";
  if (/Kumru/.test(chips)) return "https://commons.wikimedia.org/wiki/Special:FilePath/Izmir%20kumru%20sandwich%201.jpg?width=960";
  return "https://commons.wikimedia.org/wiki/Special:FilePath/TestiKebabGoreme.jpg?width=960";
}

function EditDrawer({ label = "编辑", children }) {
  const [isOpen, setIsOpen] = useState(false);

  return React.createElement("div", { className: "edit-drawer" },
    React.createElement("button", { className: "module-edit-button", onClick: () => setIsOpen((value) => !value) },
      React.createElement(PencilLine, { size: 14 }),
      React.createElement("span", null, label)
    ),
    isOpen && React.createElement("div", { className: "edit-drawer-panel" }, children)
  );
}

function MysticPanel({ selectedDay, trip, setTrip }) {
  const [draft, setDraft] = useState({ title: "", url: "" });
  const baseLinks = selectedDay.mystic?.links ?? [];
  const savedLinks = (trip.mysticLinks ?? []).filter((link) => !link.date || link.date === selectedDay.date);
  const links = [...baseLinks, ...savedLinks];
  const moonInfo = getMoonPhaseInfo(selectedDay.date);
  const mysticCopy = createMysticCopy(selectedDay, moonInfo);

  function addMysticLink() {
    const normalized = normalizeExternalLink(draft.url || draft.title);
    const title = draft.title.trim() || normalized.title;
    if (!title) return;
    setTrip({
      ...trip,
      mysticLinks: [
        ...(trip.mysticLinks ?? []),
        { id: `mystic-link-${Date.now()}`, title, url: normalized.href, date: selectedDay.date }
      ]
    });
    setDraft({ title: "", url: "" });
  }

  return React.createElement("article", { className: "panel mystic-panel" },
    React.createElement(SectionHeading, { icon: Sparkles, title: "今日玄学", subtitle: `${selectedDay.title} · ${selectedDay.city}` }),
    React.createElement("div", { className: "mystic-detail-card" },
      React.createElement("span", null, selectedDay.mystic?.luckyColor ?? "今日色彩"),
      React.createElement("strong", null, selectedDay.mystic?.summary ?? "今天宜稳住节奏。"),
      React.createElement("p", null, `关注：${selectedDay.mystic?.focus ?? selectedDay.city}`)
    ),
    React.createElement("div", { className: "mystic-oracle-grid" },
      React.createElement("div", { className: "mystic-oracle-card feature" },
        React.createElement("div", { className: "mystic-symbol star-map", "aria-hidden": "true" },
          React.createElement(Sparkles, { size: 24 })
        ),
        React.createElement("span", null, "今日签"),
        React.createElement("strong", null, mysticCopy.title),
        React.createElement("p", null, mysticCopy.body)
      ),
      React.createElement("div", { className: "mystic-oracle-card" },
        React.createElement("div", { className: "mystic-symbol moon-arc", style: { "--moon-fill": `${moonInfo.illumination}%` }, "aria-hidden": "true" },
          React.createElement(Moon, { size: 21 })
        ),
        React.createElement("span", null, "月相"),
        React.createElement("strong", null, moonInfo.label),
        React.createElement("p", null, `照明约 ${moonInfo.illumination}%：${moonInfo.advice}`)
      ),
      React.createElement("div", { className: "mystic-oracle-card" },
        React.createElement("div", { className: "mystic-symbol color-orb", "aria-hidden": "true" },
          React.createElement(Palette, { size: 21 })
        ),
        React.createElement("span", null, "幸运色"),
        React.createElement("strong", null, selectedDay.mystic?.luckyColor ?? "今日色彩"),
        React.createElement("p", null, "把它当作当天穿搭、壁纸或背包识别色。")
      )
    ),
    React.createElement("div", { className: "moon-phase-summary" },
      React.createElement("span", null, "Moon"),
      React.createElement("strong", null, moonInfo.label),
      React.createElement("small", null, `照明约 ${moonInfo.illumination}% · ${moonInfo.advice}`)
    ),
    React.createElement("div", { className: "mystic-link-deck" },
      links.map((link) => {
        const meta = getMysticLinkMeta(link);
        return React.createElement("a", { key: link.id, className: `mystic-source-card ${meta.tone}`, href: link.url, target: "_blank", rel: "noreferrer" },
          React.createElement("span", null, meta.kicker),
          React.createElement("strong", null, meta.title),
          React.createElement("small", null, meta.copy),
          React.createElement(ExternalLink, { size: 14 })
        );
      })
    ),
    React.createElement(EditDrawer, { label: "编辑玄学" },
      React.createElement("div", { className: "compact-form two" },
        React.createElement("input", { value: draft.title, onChange: (event) => setDraft({ ...draft, title: event.target.value }), placeholder: "外链标题" }),
        React.createElement("input", { value: draft.url, onChange: (event) => setDraft({ ...draft, url: event.target.value }), placeholder: "星座/运势链接或分享文案" }),
        React.createElement("button", { className: "primary-button", onClick: addMysticLink },
          React.createElement(Plus, { size: 18 }),
          React.createElement("span", null, "添加外链")
        )
      )
    )
  );
}

function createMysticCopy(selectedDay, moonInfo) {
  const focus = selectedDay.mystic?.focus ?? selectedDay.city;
  const summary = selectedDay.mystic?.summary ?? "今天宜稳住节奏。";
  const city = selectedDay.city?.split(" / ")[0] ?? selectedDay.city;
  return {
    title: `${city} 行动签`,
    body: `${summary} 把“${focus}”当作今天的主线：先确认不可逆的交通和凭证，再给临场兴致留一点空间。${moonInfo.advice}。`
  };
}

function getMysticLinkMeta(link) {
  const title = link.title ?? "外部参考";
  const url = String(link.url ?? "");
  if (url.includes("timeanddate.com")) {
    return { tone: "moon", kicker: "MOON", title, copy: "月相、月出月落和当地天象时间" };
  }
  if (url.includes("astrology.com")) {
    return { tone: "astro", kicker: "ASTRO", title: "每日星座", copy: "英文星座日运，适合快速对照当天节奏" };
  }
  if (url.includes("astro-seek.com")) {
    return { tone: "daily", kicker: "TRANSIT", title: "Astro-Seek", copy: "行星相位和当日天象，比泛泛运势更有参考感" };
  }
  if (url.includes("cafeastrology.com")) {
    return { tone: "daily", kicker: "CAFE", title: "Cafe Astrology", copy: "英文日运入口，文字质量相对稳定" };
  }
  return { tone: "custom", kicker: "LINK", title, copy: "自定义玄学参考" };
}

function getMoonPhaseInfo(date) {
  const synodicMonth = 29.53058867;
  const referenceNewMoon = Date.UTC(2000, 0, 6, 18, 14);
  const current = Date.parse(`${date}T12:00:00Z`);
  const age = ((((current - referenceNewMoon) / 86400000) % synodicMonth) + synodicMonth) % synodicMonth;
  const illumination = Math.round(((1 - Math.cos((2 * Math.PI * age) / synodicMonth)) / 2) * 100);
  const label = age < 1.85 ? "新月附近"
    : age < 7.38 ? "娥眉月"
      : age < 9.23 ? "上弦月"
        : age < 14.77 ? "盈凸月"
          : age < 16.62 ? "满月附近"
            : age < 22.15 ? "亏凸月"
              : age < 24 ? "下弦月"
                : "残月";
  const advice = illumination >= 85 ? "适合把重点事项提前确认" : illumination <= 20 ? "适合轻装和留白" : "适合按计划推进";
  return { label, illumination, advice };
}

function PhraseLauncher({ phrases, variant = "card" }) {
  const [isPhraseOpen, setIsPhraseOpen] = useState(false);
  const [copiedAssistantPrompt, setCopiedAssistantPrompt] = useState(false);
  const isMini = variant === "mini";
  const launcherClassName = isMini ? "home-widget-button phrase-mini-widget" : "phrase-launcher-card";
  const aiPrompt = createAiTranslatorPrompt();
  const assistantLinks = createAssistantLinks(aiPrompt, navigator.userAgent);

  async function copyAssistantPrompt() {
    try {
      await navigator.clipboard?.writeText(aiPrompt);
    } catch {
      // The prompt remains visible above the buttons if clipboard permission is blocked.
    }
    setCopiedAssistantPrompt(true);
  }

  async function openAssistantLink(link) {
    try {
      await navigator.clipboard?.writeText(link.prompt ?? aiPrompt);
    } catch {
      // Opening the assistant is more important than clipboard success.
    }
    setCopiedAssistantPrompt(true);
    window.location.href = link.href;
  }

  return React.createElement(React.Fragment, null,
    React.createElement("button", { className: launcherClassName, onClick: () => setIsPhraseOpen(true) },
      React.createElement(Languages, { size: isMini ? 18 : 20 }),
      React.createElement("span", null, isMini ? "语言" : "土耳其语速查"),
      React.createElement("strong", null, isMini ? "土耳其语" : ""),
      React.createElement("small", null, isMini ? "点餐 / 交通 / 酒店" : "点开看点餐、交通、酒店常用句")
    ),
    isPhraseOpen && React.createElement("div", { className: "phrase-modal", role: "dialog", "aria-modal": "true", "aria-label": "土耳其语速查" },
      React.createElement("button", { className: "phrase-modal-backdrop", onClick: () => setIsPhraseOpen(false), "aria-label": "关闭土耳其语速查" }),
      React.createElement("article", { className: "phrase-modal-panel" },
        React.createElement("header", { className: "phrase-modal-header" },
          React.createElement("div", null,
            React.createElement("p", { className: "eyebrow" }, "TURKISH"),
            React.createElement("h3", null, "土耳其语速查")
          ),
          React.createElement("button", { className: "icon-button", onClick: () => setIsPhraseOpen(false), title: "关闭" },
            React.createElement(X, { size: 18 })
          )
        ),
        React.createElement("div", { className: "ai-language-links" },
          React.createElement("small", null, aiPrompt),
          React.createElement("div", { className: "ai-language-actions" },
            assistantLinks.map((link) => link.kind === "copy"
              ? React.createElement("button", { key: link.id, type: "button", onClick: copyAssistantPrompt },
                React.createElement(Copy, { size: 15 }),
                React.createElement("span", null, copiedAssistantPrompt ? "已复制" : link.label)
              )
              : React.createElement("button", {
                key: link.id,
                type: "button",
                onClick: () => openAssistantLink(link)
              },
                React.createElement(Sparkles, { size: 15 }),
                React.createElement("span", null, link.label)
              )
            )
          )
        ),
        React.createElement("div", { className: "phrase-grid" },
          phrases.map((phrase) =>
            React.createElement("div", { key: phrase.id, className: "phrase-card" },
              React.createElement("span", null, phrase.category),
              React.createElement("strong", null, phrase.tr),
              React.createElement("small", null, phrase.zh)
            )
          )
        )
      )
    )
  );
}

function createAiTranslatorPrompt() {
  return "帮我把中文自然翻成土耳其语，语气礼貌简短；如果是和司机、酒店或餐厅沟通，请直接给可复制句子。";
}

function CollectionPanel({ trip, setTrip, selectedDay }) {
  const [draft, setDraft] = useState({ title: "", url: "", tag: "小红书" });
  const [copiedId, setCopiedId] = useState("");
  const credentialGroups = getCredentialGroups(trip, selectedDay);
  const visibleLinks = (trip.links ?? []).filter((link) => link.tag !== "天气");

  function addLink() {
    if (!draft.title.trim()) return;
    const normalized = normalizeCollectionUrl(draft.url);
    setTrip({
      ...trip,
      links: [
        ...trip.links,
        { id: `link-${Date.now()}`, title: draft.title.trim(), url: normalized.href, tag: normalized.tag, kind: normalized.kind }
      ]
    });
    setDraft({ title: "", url: "", tag: "小红书" });
  }

  function addScreenshot(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setTrip({
        ...trip,
        assets: [
          ...(trip.assets ?? []),
          {
            id: `asset-${Date.now()}`,
            type: "image",
            title: file.name,
            src: reader.result,
            tag: "当天凭证",
            scope: "date",
            date: selectedDay.date
          }
        ]
      });
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  async function copyLink(link) {
    await navigator.clipboard?.writeText(link.url);
    setCopiedId(link.id);
  }

  return React.createElement("article", { className: "panel" },
    React.createElement(SectionHeading, { icon: CalendarDays, title: "当天与全部凭证", subtitle: "当前日期优先；云端拉取到的其他日期也会一起显示" }),
    credentialGroups.map((group) =>
      React.createElement("section", { key: group.id, className: `credential-section ${group.kind ?? ""}`.trim() },
        React.createElement("header", null,
          React.createElement("strong", null, group.title),
          React.createElement("span", null, `${group.assets.length} 项`)
        ),
        group.assets.length
          ? React.createElement("div", { className: "credential-gallery" },
              group.assets.map((asset) => React.createElement(CredentialCard, { key: asset.id, asset }))
            )
          : React.createElement("p", { className: "empty-note" }, group.emptyMessage ?? "这一天暂时没有单独凭证。")
      )
    ),
    visibleLinks.length > 0 && React.createElement("div", { className: "collection-stack" },
      visibleLinks.map((link) => {
        const normalized = normalizeCollectionUrl(link.url);
        return React.createElement("article", { key: link.id, className: "collection-card" },
          React.createElement("header", null,
            React.createElement(Link2, { size: 17 }),
            React.createElement("div", null,
              React.createElement("strong", null, link.title),
              React.createElement("span", null, `${link.tag ?? normalized.tag} · ${normalized.openLabel}`)
            )
          ),
          React.createElement("div", { className: "collection-actions" },
            normalized.href !== "#"
              ? React.createElement("a", { href: normalized.href, target: "_blank", rel: "noreferrer" }, normalized.openLabel)
              : React.createElement("span", null, "仅备注"),
            normalized.href !== "#" && React.createElement("button", { onClick: () => copyLink(link) },
              React.createElement(Copy, { size: 15 }),
              React.createElement("span", null, copiedId === link.id ? "已复制" : "复制")
            )
          )
        );
      })
    ),
    React.createElement(EditDrawer, { label: "编辑凭证" },
      React.createElement("div", { className: "compact-form two" },
        React.createElement("input", { value: draft.title, onChange: (event) => setDraft({ ...draft, title: event.target.value }), placeholder: "收藏标题" }),
        React.createElement("input", { value: draft.url, onChange: (event) => setDraft({ ...draft, url: event.target.value }), placeholder: "链接或备注" }),
        React.createElement("button", { className: "primary-button", onClick: addLink },
          React.createElement(Plus, { size: 18 }),
          React.createElement("span", null, "添加")
        )
      ),
      React.createElement("label", { className: "screenshot-upload" },
        React.createElement(Camera, { size: 18 }),
        React.createElement("span", null, "添加截图凭证"),
        React.createElement("input", { type: "file", accept: "image/*", onChange: addScreenshot })
      )
    )
  );
}

function CredentialCard({ asset }) {
  const meta = `${asset.tag ?? "凭证"}${asset.date ? ` · ${asset.date.slice(5)}` : ""}`;
  if (asset.type === "image") {
    return React.createElement("a", { className: "credential-thumb", href: asset.src, target: "_blank", rel: "noreferrer" },
      React.createElement("img", { className: "credential-document-image", src: asset.src, alt: asset.title, loading: "lazy" }),
      React.createElement("span", null, asset.title),
      React.createElement("small", null, meta)
    );
  }
  return React.createElement("article", { className: "credential-thumb note" },
    React.createElement(FileText, { size: 22 }),
    React.createElement("span", null, asset.title),
    React.createElement("small", null, asset.notes?.join(" / ") ?? meta)
  );
}

function CollaborationPanel({ trip, syncState, syncEditor, setSyncEditor, pushCloud, pullCloud, clearCloud }) {
  const [cloudConfig, setCloudConfig] = useState(() => readSavedCloudConfig());
  const isLocalDemo = supabaseAdapter.mode !== "supabase";
  const diagnosticItems = formatSyncDiagnosticItems(trip, syncState, supabaseAdapter.mode);
  const statusText = syncState.dirty
    ? "本地有改动"
    : syncState.version
      ? `第 ${syncState.version} 版`
      : "尚未推送";
  const updatedText = syncState.updatedBy
    ? `${syncState.updatedBy} · ${formatSyncTime(syncState.updatedAt)}`
    : syncState.message;

  function saveCloudConfig() {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(SUPABASE_URL_STORAGE_KEY, cloudConfig.url.trim());
    localStorage.setItem(SUPABASE_ANON_KEY_STORAGE_KEY, cloudConfig.anonKey.trim());
    window.location.reload();
  }

  return React.createElement("article", { className: "panel collaboration-panel" },
    React.createElement(SectionHeading, { icon: Users, title: "旅伴协作", subtitle: "两个人共用一份云端快照" }),
    React.createElement("div", { className: "member-row" },
      trip.members.map((member) => React.createElement("span", { key: member.id }, member.name))
    ),
    React.createElement("div", { className: `sync-status-card ${syncState.status}` },
      React.createElement("span", null, supabaseAdapter.mode === "supabase" ? "Supabase" : "本地演示"),
      React.createElement("strong", null, statusText),
      React.createElement("small", null, updatedText)
    ),
    React.createElement("div", { className: "sync-diagnostics", "aria-label": "同步诊断" },
      diagnosticItems.map((item) => React.createElement("span", { key: item.label },
        React.createElement("b", null, item.label),
        React.createElement("em", null, item.value)
      ))
    ),
    React.createElement("label", { className: "sync-editor-input" },
      React.createElement("span", null, "我的昵称"),
      React.createElement("input", {
        value: syncEditor,
        onChange: (event) => setSyncEditor(event.target.value),
        placeholder: "旅伴 A"
      })
    ),
    React.createElement("div", { className: "sync-action-row" },
      React.createElement("button", { className: "icon-button", onClick: pullCloud },
        React.createElement(CloudSun, { size: 18 }),
        React.createElement("span", null, "拉取全行程")
      ),
      React.createElement("button", { className: "primary-button", onClick: pushCloud },
        React.createElement(Users, { size: 18 }),
        React.createElement("span", null, "推送全行程")
      ),
      React.createElement("button", { className: "sync-clear-button", onClick: clearCloud },
        React.createElement(Trash2, { size: 18 }),
        React.createElement("span", null, "清空云端")
      )
    ),
    React.createElement("p", { className: "sync-scope-note" }, "拉取和推送都按全部日期同步；清空云端只重置服务器快照，本机当前行程不会删除。"),
    isLocalDemo && React.createElement("div", { className: "sync-help-card" },
      React.createElement("strong", null, "本机演示不会跨手机同步"),
      React.createElement("p", null, "先在两台手机填同一组 Supabase 配置，刷新后由一台手机点“推送全行程”，另一台手机点“拉取全行程”。"),
      React.createElement("label", null,
        React.createElement("span", null, "Supabase URL"),
        React.createElement("input", {
          value: cloudConfig.url,
          onChange: (event) => setCloudConfig({ ...cloudConfig, url: event.target.value }),
          placeholder: "https://xxxx.supabase.co",
          autoCapitalize: "none",
          spellCheck: false
        })
      ),
      React.createElement("label", null,
        React.createElement("span", null, "anon key"),
        React.createElement("input", {
          value: cloudConfig.anonKey,
          onChange: (event) => setCloudConfig({ ...cloudConfig, anonKey: event.target.value }),
          placeholder: "public anon key",
          autoCapitalize: "none",
          spellCheck: false
        })
      ),
      React.createElement("button", { className: "primary-button", onClick: saveCloudConfig },
        React.createElement(Save, { size: 18 }),
        React.createElement("span", null, "保存配置并刷新")
      )
    )
  );
}

function formatSyncDiagnosticItems(trip, syncState, mode) {
  return [
    { label: "模式", value: mode === "supabase" ? "Supabase" : "本地演示" },
    { label: "行程 ID", value: trip.id },
    { label: "云端", value: syncState.version ? `第 ${syncState.version} 版` : "尚未确认" },
    { label: "最后", value: syncState.updatedBy || "未拉取" }
  ];
}

function readSavedCloudConfig() {
  if (typeof localStorage === "undefined") return { url: "", anonKey: "" };
  return {
    url: localStorage.getItem(SUPABASE_URL_STORAGE_KEY) ?? "",
    anonKey: localStorage.getItem(SUPABASE_ANON_KEY_STORAGE_KEY) ?? ""
  };
}

function formatSyncTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getMonth() + 1}.${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function SectionHeading({ icon: Icon, title, subtitle }) {
  return React.createElement("div", { className: "section-heading" },
    React.createElement(Icon, { size: 20 }),
    React.createElement("div", null,
      React.createElement("h3", null, title),
      React.createElement("p", null, subtitle)
    )
  );
}

function backgroundImageStyle(imageUrl, propertyName) {
  return imageUrl ? { [propertyName]: `url("${imageUrl}")` } : undefined;
}

function statusClass(status) {
  return status === "divergent" ? "status-pill warning" : "status-pill ok";
}

function createWeatherVisual(summary, report) {
  if (report.status === "divergent") {
    return {
      tone: "warning",
      title: "天气来源有分歧",
      copy: "温度、降雨或风力出现差异，出门前点开 Open-Meteo 再确认。"
    };
  }
  if ((summary.gustKmh ?? 0) >= 45 || (summary.windKmh ?? 0) >= 25) {
    return {
      tone: "wind",
      title: "风感需要留意",
      copy: "海边、滑翔伞和徒步安排留一点弹性，优先看阵风和能见度。"
    };
  }
  if ((summary.precipitationChance ?? 0) >= 45) {
    return {
      tone: "rain",
      title: "可能有雨，节奏放松",
      copy: "户外段和交通衔接留缓冲，随身带轻便雨具。"
    };
  }
  return {
    tone: "calm",
    title: "天气节奏平稳",
    copy: "当前趋势平稳，可以按行动安排推进。"
  };
}

function createFallbackHourlyForecast(summary = {}) {
  const high = summary.highC ?? 20;
  const low = summary.lowC ?? high - 6;
  const rain = summary.precipitationChance ?? 0;
  const wind = summary.windKmh ?? 0;
  return [
    { time: "06:00", tempC: low, precipitationChance: Math.max(rain - 8, 0), windKmh: Math.max(wind - 4, 0) },
    { time: "09:00", tempC: Math.round((low + high) / 2), precipitationChance: rain, windKmh: wind },
    { time: "12:00", tempC: high, precipitationChance: Math.min(rain + 6, 100), windKmh: wind + 2 },
    { time: "15:00", tempC: high - 1, precipitationChance: Math.min(rain + 4, 100), windKmh: wind + 3 },
    { time: "18:00", tempC: Math.round((low + high) / 2), precipitationChance: rain, windKmh: wind },
    { time: "21:00", tempC: low + 1, precipitationChance: Math.max(rain - 6, 0), windKmh: Math.max(wind - 2, 0) }
  ];
}

function getCredentialGroups(trip, selectedDay) {
  const assets = trip.assets ?? [];
  const currentAssets = assets.filter((asset) => asset.date === selectedDay.date);
  const otherAssets = assets.filter((asset) => asset.date !== selectedDay.date);
  return [
    {
      id: `current-${selectedDay.date}`,
      kind: "current",
      title: `${selectedDay.title} 当天凭证`,
      assets: currentAssets,
      emptyMessage: otherAssets.length
        ? "这一天暂时没有单独凭证；下面是云端同步到的其他日期凭证。"
        : "这一天暂时没有单独凭证。"
    },
    ...groupCredentialAssetsByDate(otherAssets)
  ];
}

function groupCredentialAssetsByDate(assets = []) {
  const groups = new Map();
  for (const asset of assets) {
    const key = asset.date || "undated";
    groups.set(key, [...(groups.get(key) ?? []), asset]);
  }
  return Array.from(groups.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, groupedAssets]) => ({
      id: `other-${date}`,
      kind: "secondary",
      title: date === "undated" ? "未标日期凭证" : `${formatCredentialDateLabel(date)} 凭证`,
      assets: groupedAssets
    }));
}

function formatCredentialDateLabel(date) {
  const match = String(date ?? "").match(/^\d{4}-(\d{2})-(\d{2})$/);
  if (!match) return String(date ?? "其他日期");
  return `${Number(match[1])}.${Number(match[2])}`;
}

function normalizeCollectionUrl(raw) {
  const trimmed = extractFirstUrl(raw) || String(raw ?? "").trim();
  if (!trimmed) return { href: "#", kind: "note", openLabel: "仅备注", tag: "备注" };
  const href = /^[a-z][a-z\d+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const isXhs = /xiaohongshu\.com|xhslink\.com|xhs\.cn/i.test(href);
  return {
    href,
    kind: isXhs ? "xiaohongshu" : "web",
    openLabel: isXhs ? "打开小红书" : "打开网页",
    tag: isXhs ? "小红书" : "链接"
  };
}

function normalizeExternalLink(raw) {
  const trimmed = extractFirstUrl(raw) || String(raw ?? "").trim();
  if (!trimmed) return { href: "#", title: "外链" };
  const href = /^[a-z][a-z\d+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return { href, title: readableHost(href) };
}

function extractFirstUrl(raw) {
  return String(raw ?? "").match(/https?:\/\/[^\s，。)）]+/i)?.[0] ?? "";
}

function readableHost(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "外链";
  }
}

function getDailyFoodRecommendations(trip, selectedDay) {
  const foods = trip.foodRecommendations ?? [];
  const matched = foods.filter((food) => (food.dates ?? []).includes(selectedDay.date));
  if (matched.length) return matched;
  return getFoodRecommendations(trip, selectedDay);
}

function getDailyRestaurantLinks(trip, selectedDay) {
  const restaurants = trip.restaurantLinks ?? [];
  const dateMatched = restaurants.filter((restaurant) => restaurant.date === selectedDay.date);
  if (dateMatched.length) return dateMatched;
  return restaurants.filter((restaurant) => cityMatches(selectedDay.city, restaurant.city));
}

function getFoodRecommendations(trip, selectedDay) {
  const foods = trip.foodRecommendations ?? [];
  const matched = foods.filter((food) => cityMatches(selectedDay.city, food.city));
  return matched.length ? matched : foods.slice(0, 4);
}

function cityMatches(dayCity, foodCity) {
  return String(foodCity ?? "")
    .split(/[ /]+/)
    .some((part) => part && String(dayCity ?? "").includes(part));
}

function getDayQuickActions({ selectedDay, dayItems, trip, currentPlace }) {
  const firstItem = dayItems[0];
  const firstPlace = resolveItemPlace(firstItem ?? {}, trip.places) ?? currentPlace;
  const lodging = trip.lodgings.find((entry) => entry.date === selectedDay.date);
  const hasAssets = dayItems.some((item) => (item.assetIds ?? []).length > 0) || (trip.assets ?? []).some((asset) => asset.date === selectedDay.date);
  const userAgent = typeof navigator === "undefined" ? "" : navigator.userAgent;
  const alarmHref = createClockReminderLink(selectedDay, dayItems, userAgent);
  const actions = [
    {
      id: "day-map",
      label: firstPlace ? `去 ${shortPlaceName(firstPlace.name)}` : "当天导航",
      icon: Navigation,
      href: createMapLinks(firstPlace ?? currentPlace).google,
      external: true
    }
  ];

  if (hasAssets) {
    actions.push({ id: "day-docs", label: "当天凭证", icon: FileText, view: "docs" });
  }

  if (lodging?.phone) {
    actions.push({ id: "day-phone", label: "酒店电话", icon: Phone, href: `tel:${lodging.phone.replace(/\s/g, "")}` });
  } else if (lodging) {
    actions.push({
      id: "day-lodging-map",
      label: "住宿地址",
      icon: MapPin,
      href: createMapLinks({ name: lodging.title, address: lodging.address }).google,
      external: true
    });
  }

  actions.push({
    id: "day-reminder",
    label: alarmHref ? "打开闹钟" : "复制提醒",
    icon: AlarmClock,
    href: alarmHref,
    copyText: alarmHref ? "" : createClockReminderNote(selectedDay, dayItems)
  });

  return actions.slice(0, 4);
}

function shortPlaceName(name) {
  const cleanName = String(name ?? "").trim();
  if (SHORT_PLACE_LABELS.has(cleanName)) return SHORT_PLACE_LABELS.get(cleanName);
  const airportCode = cleanName.match(/\b[A-Z]{3}\b$/);
  if (airportCode) return airportCode[0];
  return cleanName.slice(0, 8);
}

function resolveItemPlace(item, places) {
  if (item?.primaryPlaceId) return places.find((place) => place.id === item.primaryPlaceId);
  if (item?.placeId) return places.find((place) => place.id === item.placeId);
  return places.find((place) => {
    const haystack = `${item.title ?? ""} ${(item.notes ?? []).join(" ")}`;
    return haystack.includes(place.name) || haystack.includes(place.city);
  });
}

function resolveDestinationPlace(item, places) {
  if (!item?.destinationPlaceId) return null;
  return places.find((place) => place.id === item.destinationPlaceId) ?? null;
}

function getItemCredentialAssets(item, assets) {
  const ids = new Set(item.assetIds ?? []);
  if (!ids.size) return [];
  return assets.filter((asset) => ids.has(asset.id));
}

function getCredentialLabel(assets = []) {
  const tags = assets.map((asset) => asset.tag).filter(Boolean);
  if (!tags.length) return "相关文件";
  const uniqueTags = [...new Set(tags)];
  return uniqueTags.length === 1 ? uniqueTags[0] : "相关文件";
}

function getActionDisplayTitle(item, place, destinationPlace) {
  const title = String(item.title ?? "").trim();
  if (item.type === "transport") return getTransportDisplayTitle(title);
  const places = [place, destinationPlace].filter(Boolean);
  const stripped = stripRepeatedPlaces(title, places);
  if (stripped && !isTitleMostlyPlace(title, places)) {
    return compactActionText(stripped);
  }
  return getActionFallbackTitle(item, title);
}

function getTransportDisplayTitle(title) {
  const flight = String(title).match(/\b[A-Z]{2}\d{3,4}\b/);
  if (flight) return `${flight[0]} 航班`;
  if (/夜巴|巴士|大巴|bus|kimil|kamil/i.test(title)) return "夜巴转场";
  if (/包车/.test(title)) return "包车转场";
  if (/机场|airport/i.test(title)) return "机场衔接";
  if (/到达|抵达/.test(title)) return "抵达衔接";
  if (/→|->|-/.test(title)) return "路线衔接";
  return "交通衔接";
}

function stripRepeatedPlaces(title, places = []) {
  const labels = places
    .flatMap((place) => [place.name, shortPlaceName(place.name), place.city])
    .filter((label) => label && String(label).trim().length > 1)
    .map((label) => String(label).trim())
    .sort((a, b) => b.length - a.length);

  return labels.reduce((current, label) =>
    current.replace(new RegExp(escapeRegExp(label), "gi"), " ")
  , String(title ?? ""))
    .replace(/\s*(→|->|-|—|–)\s*/g, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/^[\s,，.。:：/|·+＋]+|[\s,，.。:：/|·+＋]+$/g, "")
    .trim();
}

function isTitleMostlyPlace(title, places = []) {
  const original = String(title ?? "").replace(/\s+/g, "");
  if (!original || !places.length) return false;
  const stripped = stripRepeatedPlaces(title, places).replace(/\s+/g, "");
  return stripped.length <= 2 || stripped.length / original.length < 0.35;
}

function getActionFallbackTitle(item, title) {
  if (item.type === "transport") {
    if (/航班|机场|flight|airport/i.test(title)) return "航班衔接";
    if (/夜巴|巴士|大巴|bus/i.test(title)) return "城际交通";
    return "路线衔接";
  }
  if (item.type === "lodging") return "办理入住";
  if (item.type === "food") return "用餐安排";
  if (item.type === "note") return "当日提醒";
  if (/滑翔伞/.test(title)) return "滑翔伞安排";
  if (/徒步/.test(title)) return "徒步安排";
  if (/古城|博物馆|教堂|遗址/.test(title)) return "参观安排";
  return compactActionText(title) || "行动安排";
}

function getVisibleActionNotes(item) {
  return (item.notes ?? [])
    .map((note) => compactActionText(note, 58))
    .filter((note) => note && !/截图识别|订单号|Booking|Agoda|PNR|总价/.test(note))
    .slice(0, 3);
}

function compactActionText(text, limit = 34) {
  const normalized = String(text).replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  return normalized.length > limit ? `${normalized.slice(0, limit)}…` : normalized;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getTrafficSummary(item, place, destinationPlace) {
  if (item.type !== "transport" && !destinationPlace) return "";
  if (place && destinationPlace) return `${shortPlaceName(place.name)} → ${shortPlaceName(destinationPlace.name)}`;
  if (destinationPlace) return `前往 ${shortPlaceName(destinationPlace.name)}`;
  return "按当天交通节奏预留缓冲";
}

function createDailyPlaces(dayItems, places) {
  const seen = new Set();
  return dayItems.map((item) => {
    const resolved = resolveItemPlace(item, places);
    const place = resolved ?? {
      id: `item-place-${item.id}`,
      name: item.address ? item.title : inferPlaceName(item),
      address: item.address ?? item.title
    };
    const key = place.id ?? place.name;
    if (seen.has(key)) return null;
    seen.add(key);
    return {
      key,
      item,
      place,
      mapLinks: createMapLinks(place),
      time: item.startTime ?? "全天",
      typeLabel: item.type === "transport" ? "交通" : item.type === "lodging" ? "住宿" : item.type === "food" ? "餐饮" : "行动"
    };
  }).filter(Boolean);
}

function inferPlaceName(item) {
  const routeParts = item.title.split(/\s*[→-]\s*/);
  if (routeParts.length > 1) return routeParts[0].trim();
  return item.title;
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/service-worker.js").catch(() => {});
}

createRoot(document.getElementById("root")).render(React.createElement(App));
