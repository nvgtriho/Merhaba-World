import React, { useMemo, useState } from "https://esm.sh/react@18.3.1?dev";
import { createRoot } from "https://esm.sh/react-dom@18.3.1/client?dev&deps=react@18.3.1";
import {
  AlarmClock,
  CalendarDays,
  CloudSun,
  ExternalLink,
  FileText,
  Languages,
  MapPin,
  Navigation,
  PencilLine,
  Phone,
  Plus,
  Route,
  Save,
  SearchCheck,
  ShieldCheck,
  Trash2,
  Users,
} from "https://esm.sh/lucide-react@0.468.0?dev&deps=react@18.3.1";
import { createMapLinks } from "./lib/maps.js";
import { createIndexedDbStore } from "./lib/offlineStore.js";
import { compareWeatherSources, summarizeWeather, turkeyWeatherSources } from "./lib/weather.js";
import { createSupabaseAdapter } from "./lib/supabaseAdapter.js";
import { seedTrip } from "./data/tripSeed.js";
import { turkeyPhrases } from "./data/turkishTemplate.js";

const store = createIndexedDbStore();
const supabaseAdapter = createSupabaseAdapter();

function App() {
  const [trip, setTrip] = useState(seedTrip);
  const [selectedDate, setSelectedDate] = useState(seedTrip.days[1].date);
  const [activeView, setActiveView] = useState("today");
  const [savedToast, setSavedToast] = useState("");
  const selectedDay = trip.days.find((day) => day.date === selectedDate) ?? trip.days[0];
  const dayItems = trip.items.filter((item) => item.date === selectedDay.date);
  const currentPlace = trip.places.find((place) => selectedDay.city.includes(place.city)) ?? trip.places[0];
  const weatherSummary = summarizeWeather(selectedDay.weatherSnapshots);
  const weatherReport = compareWeatherSources(selectedDay.weatherSnapshots);
  const nextTransport = dayItems.find((item) => item.type === "transport");
  const lodging = dayItems.find((item) => item.type === "lodging") ?? trip.lodgings.find((item) => item.date === selectedDay.date);

  const placesWithLinks = useMemo(
    () =>
      trip.places.map((place) => ({
        ...place,
        mapLinks: createMapLinks(place)
      })),
    [trip.places]
  );

  async function saveOffline() {
    await store.put("trips", trip);
    await Promise.all(trip.items.map((item) => store.put("itineraryItems", { ...item, tripId: trip.id })));
    await Promise.all(turkeyPhrases.map((phrase) => store.put("phrases", { ...phrase, tripId: trip.id })));
    setSavedToast("已保存到本地离线缓存");
  }

  async function syncCloud() {
    const result = await supabaseAdapter.syncTrip(trip);
    setSavedToast(result.message);
  }

  return React.createElement(
    React.Fragment,
    null,
    React.createElement("main", { className: "app-shell" },
      React.createElement(Header, { trip, syncCloud, saveOffline, savedToast }),
      React.createElement("section", { className: "phone-stage" },
        React.createElement("section", { className: "active-view", "aria-live": "polite" },
          activeView === "today" && React.createElement(React.Fragment, null,
            React.createElement(TodayPanel, {
              selectedDay,
              dayItems,
              currentPlace,
              weatherSummary,
              weatherReport,
              nextTransport,
              lodging,
              setSelectedDate,
              days: trip.days,
              setActiveView
            }),
            React.createElement(KeyTrafficPanel, { dayItems, setActiveView })
          ),
          activeView === "itinerary" && React.createElement(React.Fragment, null,
            React.createElement(PageHeader, { kicker: "ITINERARY", title: "行程安排", count: `${dayItems.length} 条` }),
            React.createElement(ItineraryEditor, { trip, selectedDay, dayItems, setTrip, places: placesWithLinks, setActiveView })
          ),
          activeView === "places" && React.createElement(React.Fragment, null,
            React.createElement(PageHeader, { kicker: "PLACES", title: "酒店与地点", count: `${placesWithLinks.length} 条` }),
            React.createElement(PlaceDirectory, { places: placesWithLinks, links: trip.links }),
            React.createElement(WeatherPanel, { selectedDay, currentPlace })
          ),
          activeView === "docs" && React.createElement(React.Fragment, null,
            React.createElement(PageHeader, { kicker: "DOCS", title: "凭证与常用", count: "离线可用" }),
            React.createElement(CollectionPanel, { trip, setTrip }),
            React.createElement(PhrasePanel, { phrases: turkeyPhrases }),
            React.createElement(CollaborationPanel, { trip, syncCloud })
          )
        )
      )
    ),
    React.createElement(BottomNav, { activeView, setActiveView })
  );
}

function Header({ trip, syncCloud, saveOffline, savedToast }) {
  return React.createElement("header", { className: "topbar" },
    React.createElement("div", { className: "brand-lockup" },
      React.createElement("img", { src: "/assets/icon.svg", alt: "", className: "brand-mark" }),
      React.createElement("div", null,
        React.createElement("p", { className: "eyebrow" }, "Short trip command PWA"),
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
  { id: "itinerary", shortLabel: "行程", icon: PencilLine },
  { id: "places", shortLabel: "地点", icon: MapPin },
  { id: "docs", shortLabel: "凭证", icon: FileText }
];

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
    weatherSummary,
    weatherReport,
    nextTransport,
    lodging,
    setSelectedDate,
    days,
    setActiveView
  } = props;
  const mapLinks = createMapLinks(currentPlace);

  return React.createElement("article", { className: "panel today-panel" },
    React.createElement("div", { className: "panel-title-row" },
      React.createElement("div", null,
        React.createElement("span", { className: "date-pill" }, `${selectedDay.title} · 今日`),
        React.createElement("h2", null, `${selectedDay.title} · ${selectedDay.city}`)
      ),
      React.createElement("button", { className: "weather-chip", onClick: () => setActiveView("places") },
        React.createElement("strong", null, weatherReport.status === "divergent" ? "复核天气" : "接入天气"),
        React.createElement("span", null, weatherReport.status === "divergent" ? "有分歧" : "已校验")
      )
    ),
    React.createElement("p", { className: "hero-copy" }, "今天是机场、国内航班和古城游览的连续动作日；转机、交通和酒店信息优先确认。"),
    React.createElement("div", { className: "day-switcher" },
      days.map((day) =>
        React.createElement("button", {
          key: day.id,
          className: day.date === selectedDay.date ? "day-chip active" : "day-chip",
          onClick: () => setSelectedDate(day.date)
        }, day.title)
      )
    ),
    React.createElement("div", { className: "mission-strip" },
      React.createElement(Metric, { icon: CloudSun, label: "天气", value: `${weatherSummary.highC}°/${weatherSummary.lowC}°`, hint: `${weatherSummary.windKmh} km/h` }),
      React.createElement(Metric, { icon: Route, label: "下一段", value: nextTransport?.title ?? "自由行动", hint: nextTransport?.startTime ?? "待定" }),
      React.createElement(Metric, { icon: ShieldCheck, label: "住宿", value: lodging?.title ?? "未绑定", hint: lodging?.address ?? "可补充" })
    ),
    React.createElement("div", { className: "quick-actions" },
      React.createElement("a", { href: mapLinks.google, target: "_blank", rel: "noreferrer", className: "action-tile" },
        React.createElement(Navigation, { size: 18 }),
        React.createElement("span", null, "导航")
      ),
      React.createElement("button", { className: "action-tile", onClick: () => setActiveView("docs") },
        React.createElement(Phone, { size: 18 }),
        React.createElement("span", null, "酒店电话")
      ),
      React.createElement("button", { className: "action-tile", onClick: () => setActiveView("docs") },
        React.createElement(FileText, { size: 18 }),
        React.createElement("span", null, "确认单")
      ),
      React.createElement("button", { className: "action-tile", onClick: () => setActiveView("itinerary") },
        React.createElement(Route, { size: 18 }),
        React.createElement("span", null, "交通")
      )
    ),
    React.createElement("div", { className: "module-jumps" },
      React.createElement("button", { onClick: () => setActiveView("places") },
        React.createElement(CloudSun, { size: 17 }),
        React.createElement("span", null, "看天气")
      ),
      React.createElement("button", { onClick: () => setActiveView("places") },
        React.createElement(Navigation, { size: 17 }),
        React.createElement("span", null, "找跳转")
      ),
      React.createElement("button", { onClick: () => setActiveView("docs") },
        React.createElement(Languages, { size: 17 }),
        React.createElement("span", null, "常用语")
      )
    ),
    React.createElement("div", { className: "next-preview" },
      React.createElement("div", { className: "next-preview-head" },
        React.createElement("strong", null, "接下来"),
        React.createElement("button", { onClick: () => setActiveView("itinerary") }, "完整行程")
      ),
      React.createElement("ol", { className: "timeline compact" },
        dayItems.slice(0, 2).map((item) => React.createElement(TimelineItem, { item, key: item.id }))
      )
    )
  );
}

function KeyTrafficPanel({ dayItems, setActiveView }) {
  const transportItems = dayItems.filter((item) => item.type === "transport");
  const visibleItems = transportItems.length ? transportItems : dayItems.slice(0, 2);

  return React.createElement("article", { className: "panel traffic-panel" },
    React.createElement("div", { className: "panel-title-row" },
      React.createElement("h3", null, "关键交通"),
      React.createElement("button", { className: "small-filter", onClick: () => setActiveView("itinerary") }, "全部")
    ),
    React.createElement("div", { className: "traffic-stack" },
      visibleItems.slice(0, 3).map((item, index) =>
        React.createElement("div", { key: item.id, className: index === 0 ? "traffic-card primary" : "traffic-card amber" },
          React.createElement("aside", null,
            React.createElement("strong", null, item.startTime ?? "--:--"),
            React.createElement("span", null, item.type === "transport" ? "航班" : "落地后")
          ),
          React.createElement("div", null,
            React.createElement("p", { className: "traffic-region" }, "伊斯坦布尔/伊兹密尔"),
            React.createElement("h3", null, item.title),
            React.createElement("p", null, item.notes[0] ?? "按实际情况确认后执行。"),
            React.createElement("div", { className: "traffic-buttons" },
              React.createElement("button", { onClick: () => setActiveView("places") }, "导航出发点"),
              React.createElement("button", { onClick: () => setActiveView("docs") }, "看凭证")
            )
          )
        )
      )
    )
  );
}

function WeatherPanel({ selectedDay, currentPlace }) {
  const sources = turkeyWeatherSources(currentPlace.city || currentPlace.name);
  const report = compareWeatherSources(selectedDay.weatherSnapshots);

  return React.createElement("article", { className: "panel weather-panel" },
    React.createElement("div", { className: "panel-title-row" },
      React.createElement("div", null,
        React.createElement("p", { className: "eyebrow" }, "Weather cross-check"),
        React.createElement("h2", null, "权威天气互校验")
      ),
      React.createElement(SearchCheck, { size: 22 })
    ),
    React.createElement("div", { className: "source-list" },
      sources.map((source) =>
        React.createElement("a", { key: source.id, href: source.url, target: "_blank", rel: "noreferrer", className: "source-card" },
          React.createElement("strong", null, source.name),
          React.createElement("span", null, source.label),
          React.createElement(ExternalLink, { size: 15 })
        )
      )
    ),
    React.createElement("div", { className: "weather-grid" },
      selectedDay.weatherSnapshots.map((snapshot) =>
        React.createElement("div", { key: snapshot.sourceId, className: "weather-source" },
          React.createElement("span", null, snapshot.sourceName),
          React.createElement("strong", null, `${snapshot.highC}° / ${snapshot.lowC}°`),
          React.createElement("small", null, `雨 ${snapshot.precipitationChance}% · 风 ${snapshot.windKmh}km/h`)
        )
      )
    ),
    React.createElement("p", { className: "weather-note" },
      report.status === "divergent"
        ? `触发差异：${report.reasons.join("、")}。出发前点开 MGM 官方源确认。`
        : "多源趋势一致，可按当前计划执行。"
    )
  );
}

function ItineraryEditor({ trip, selectedDay, dayItems, setTrip, places, setActiveView }) {
  const [draft, setDraft] = useState({ startTime: "", title: "", type: "activity", notes: "" });

  function addItem() {
    if (!draft.title.trim()) return;
    const next = {
      id: `item-${Date.now()}`,
      date: selectedDay.date,
      startTime: draft.startTime || null,
      endTime: null,
      type: draft.type,
      title: draft.title.trim(),
      notes: draft.notes ? draft.notes.split("\n").filter(Boolean) : [draft.title.trim()],
      source: "manual"
    };
    setTrip({ ...trip, items: [...trip.items, next] });
    setDraft({ startTime: "", title: "", type: "activity", notes: "" });
  }

  function removeItem(id) {
    setTrip({ ...trip, items: trip.items.filter((item) => item.id !== id) });
  }

  return React.createElement("article", { className: "panel editor-panel" },
    React.createElement(SectionHeading, { icon: PencilLine, title: "行程编辑", subtitle: `${selectedDay.title} 可直接补充` }),
    React.createElement("div", { className: "compact-form" },
      React.createElement("input", { value: draft.startTime, onChange: (event) => setDraft({ ...draft, startTime: event.target.value }), placeholder: "时间 08:30" }),
      React.createElement("select", { value: draft.type, onChange: (event) => setDraft({ ...draft, type: event.target.value }) },
        React.createElement("option", { value: "activity" }, "活动"),
        React.createElement("option", { value: "transport" }, "交通"),
        React.createElement("option", { value: "lodging" }, "住宿"),
        React.createElement("option", { value: "food" }, "点餐")
      ),
      React.createElement("input", { value: draft.title, onChange: (event) => setDraft({ ...draft, title: event.target.value }), placeholder: "标题" }),
      React.createElement("textarea", { value: draft.notes, onChange: (event) => setDraft({ ...draft, notes: event.target.value }), placeholder: "备注，可多行" }),
      React.createElement("button", { className: "primary-button", onClick: addItem },
        React.createElement(Plus, { size: 18 }),
        React.createElement("span", null, "加入当天")
      )
    ),
    React.createElement("div", { className: "editable-list" },
      dayItems.map((item) =>
        React.createElement(ItineraryActionCard, {
          item,
          key: item.id,
          places,
          setActiveView,
          onRemove: () => removeItem(item.id)
        })
      )
    )
  );
}

function ItineraryActionCard({ item, places, setActiveView, onRemove }) {
  const place = resolveItemPlace(item, places);
  const mapLinks = createMapLinks(place ?? { name: item.title, address: item.title });

  return React.createElement("div", { className: `itinerary-action-card ${item.type}` },
    React.createElement("aside", null,
      React.createElement("strong", null, item.startTime ?? "--:--"),
      React.createElement("span", null, item.type === "transport" ? "交通" : item.type === "lodging" ? "住宿" : "行动")
    ),
    React.createElement("div", null,
      React.createElement("div", { className: "card-title-row" },
        React.createElement("strong", null, item.title),
        React.createElement("button", { onClick: onRemove, title: "移除" }, React.createElement(Trash2, { size: 16 }))
      ),
      React.createElement("p", null, item.notes.join(" / ")),
      React.createElement("div", { className: "inline-actions" },
        React.createElement("a", { href: mapLinks.google, target: "_blank", rel: "noreferrer" },
          React.createElement(Navigation, { size: 16 }),
          React.createElement("span", null, "导航")
        ),
        React.createElement("button", { onClick: () => setActiveView("places") },
          React.createElement(CloudSun, { size: 16 }),
          React.createElement("span", null, "天气")
        ),
        React.createElement("button", { onClick: () => setActiveView("docs") },
          React.createElement(FileText, { size: 16 }),
          React.createElement("span", null, "凭证")
        )
      )
    )
  );
}

function PlaceDirectory({ places, links }) {
  return React.createElement("article", { className: "panel" },
    React.createElement(SectionHeading, { icon: MapPin, title: "地点资料", subtitle: "酒店、景点、官网和订单入口" }),
    React.createElement("div", { className: "link-stack" },
      places.slice(0, 5).map((place) =>
        React.createElement("div", { key: place.id, className: "jump-row" },
          React.createElement("div", null,
            React.createElement("strong", null, place.name),
            React.createElement("span", null, place.address)
          ),
          React.createElement("a", { href: place.mapLinks.google, target: "_blank", rel: "noreferrer", title: "打开地图" }, React.createElement(Navigation, { size: 18 }))
        )
      ),
      links.map((link) =>
        React.createElement("a", { key: link.id, href: link.url, target: "_blank", rel: "noreferrer", className: "plain-link" },
          React.createElement(ExternalLink, { size: 16 }),
          React.createElement("span", null, link.title)
        )
      )
    )
  );
}

function PhrasePanel({ phrases }) {
  return React.createElement("article", { className: "panel phrase-panel" },
    React.createElement(SectionHeading, { icon: Languages, title: "土耳其语速查", subtitle: "点餐、问候、交通、酒店" }),
    React.createElement("div", { className: "phrase-grid" },
      phrases.map((phrase) =>
        React.createElement("div", { key: phrase.id, className: "phrase-card" },
          React.createElement("span", null, phrase.category),
          React.createElement("strong", null, phrase.tr),
          React.createElement("small", null, phrase.zh)
        )
      )
    )
  );
}

function CollectionPanel({ trip, setTrip }) {
  const [draft, setDraft] = useState({ title: "", url: "", tag: "小红书" });

  function addLink() {
    if (!draft.title.trim()) return;
    setTrip({
      ...trip,
      links: [
        ...trip.links,
        { id: `link-${Date.now()}`, title: draft.title, url: draft.url || "#", tag: draft.tag }
      ]
    });
    setDraft({ title: "", url: "", tag: "小红书" });
  }

  return React.createElement("article", { className: "panel" },
    React.createElement(SectionHeading, { icon: CalendarDays, title: "收藏与附件", subtitle: "小红书、Booking、Agoda、交通截图手动归档" }),
    React.createElement("div", { className: "compact-form two" },
      React.createElement("input", { value: draft.title, onChange: (event) => setDraft({ ...draft, title: event.target.value }), placeholder: "收藏标题" }),
      React.createElement("input", { value: draft.url, onChange: (event) => setDraft({ ...draft, url: event.target.value }), placeholder: "链接或备注" }),
      React.createElement("button", { className: "primary-button", onClick: addLink },
        React.createElement(Plus, { size: 18 }),
        React.createElement("span", null, "添加")
      )
    ),
    React.createElement("div", { className: "tag-list" },
      trip.links.map((link) => React.createElement("span", { key: link.id }, `${link.tag ?? "链接"} · ${link.title}`))
    )
  );
}

function CollaborationPanel({ trip, syncCloud }) {
  return React.createElement("article", { className: "panel collaboration-panel" },
    React.createElement(SectionHeading, { icon: Users, title: "旅伴协作", subtitle: "成员都可编辑，最后保存生效" }),
    React.createElement("div", { className: "member-row" },
      trip.members.map((member) => React.createElement("span", { key: member.id }, member.name))
    ),
    React.createElement("p", null, "Supabase 登录、RLS 和实时同步接口已预留；未配置环境变量时使用本地演示模式。"),
    React.createElement("button", { className: "icon-button", onClick: syncCloud },
      React.createElement(Users, { size: 18 }),
      React.createElement("span", null, "测试同步状态")
    )
  );
}

function Metric({ icon: Icon, label, value, hint }) {
  return React.createElement("div", { className: "metric" },
    React.createElement(Icon, { size: 19 }),
    React.createElement("span", null, label),
    React.createElement("strong", null, value),
    React.createElement("small", null, hint)
  );
}

function TimelineItem({ item }) {
  return React.createElement("li", { className: `timeline-item ${item.type}` },
    React.createElement("time", null, item.startTime ?? "--:--"),
    React.createElement("div", null,
      React.createElement("strong", null, item.title),
      React.createElement("p", null, item.notes.join(" / "))
    )
  );
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

function statusClass(status) {
  return status === "divergent" ? "status-pill warning" : "status-pill ok";
}

function resolveItemPlace(item, places) {
  return places.find((place) => {
    const haystack = `${item.title} ${item.notes.join(" ")}`;
    return haystack.includes(place.name) || haystack.includes(place.city);
  });
}

function calendarLink(day, items) {
  const text = encodeURIComponent(`${day.title} ${day.city} 行动提醒`);
  const details = encodeURIComponent(items.map((item) => `${item.startTime ?? "--:--"} ${item.title}`).join("\n"));
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}`;
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/service-worker.js").catch(() => {});
}

createRoot(document.getElementById("root")).render(React.createElement(App));
