import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("keeps import tooling and quick-jump wording out of the traveler-facing app", async () => {
  const source = await readFile(new URL("../src/App.js", import.meta.url), "utf8");

  assert.equal(source.includes("ImportPanel"), false);
  assert.equal(source.includes("Markdown 导入"), false);
  assert.equal(source.includes("快速跳转"), false);
});

test("uses Merhaba-World as the visible app brand", async () => {
  const source = await readFile(new URL("../src/App.js", import.meta.url), "utf8");

  assert.equal(source.includes("Merhaba-World"), true);
  assert.equal(source.includes("Short trip command PWA"), false);
});

test("keeps map jumps on place chips instead of always-on action buttons", async () => {
  const source = await readFile(new URL("../src/App.js", import.meta.url), "utf8");
  const styles = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");

  assert.equal(source.includes("ItineraryActionCard"), true);
  assert.equal(source.includes("place-map-chip"), true);
  assert.equal(source.includes("route-journey"), true);
  assert.equal(source.includes("credential-pill"), true);
  assert.equal(source.includes("getCredentialLabel"), true);
  assert.equal(source.includes("createDirectionsLink"), true);
  assert.equal(source.includes("inline-actions"), false);
  assert.equal(source.includes("导航出发点"), false);
  assert.equal(styles.includes(".place-map-chip"), true);
  assert.equal(styles.includes(".route-journey"), true);
  assert.equal(styles.includes(".credential-pill"), true);
  assert.equal(styles.includes(".inline-actions"), false);
});

test("builds day-aware quick actions from the selected day instead of a generic block", async () => {
  const source = await readFile(new URL("../src/App.js", import.meta.url), "utf8");
  const styles = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");

  assert.equal(source.includes("getDayQuickActions"), true);
  assert.equal(source.includes("dayQuickActions.map"), true);
  assert.equal(source.includes("selectedDay, dayItems, trip"), true);
  assert.equal(source.includes("utility-rail"), true);
  assert.equal(source.includes("action-tooltip"), true);
  assert.equal(source.includes('"aria-label": action.label'), true);
  assert.equal(styles.includes(".utility-rail"), true);
  assert.equal(styles.includes(".action-tooltip"), true);
});

test("removes the separate itinerary tab and keeps the day action stream on the home view", async () => {
  const source = await readFile(new URL("../src/App.js", import.meta.url), "utf8");

  assert.equal(source.includes('activeView === "itinerary"'), false);
  assert.equal(source.includes('shortLabel: "行程"'), false);
  assert.equal(source.includes("今日行动"), true);
  assert.equal(source.includes("DayActionPanel"), true);
});

test("groups places by the selected day instead of showing one flat place list", async () => {
  const source = await readFile(new URL("../src/App.js", import.meta.url), "utf8");

  assert.equal(source.includes("DayPlaceDirectory"), true);
  assert.equal(source.includes("selectedDay, dayItems"), true);
  assert.equal(source.includes("当天地点"), true);
});

test("deduplicates daily place cards by place instead of repeating every timed item", async () => {
  const source = await readFile(new URL("../src/App.js", import.meta.url), "utf8");

  assert.equal(source.includes('const key = place.id ?? place.name;'), true);
  assert.equal(source.includes('`${place.name}-${item.startTime ?? "any"}`'), false);
});

test("keeps weather actions concentrated instead of repeating them on every itinerary card", async () => {
  const source = await readFile(new URL("../src/App.js", import.meta.url), "utf8");

  assert.equal(source.includes("weather-story-card"), true);
  assert.equal(source.includes("weather-meter"), true);
  assert.equal(source.includes('React.createElement(CloudSun, { size: 16 })'), false);
});

test("supports Xiaohongshu/web collections and local credential screenshots", async () => {
  const source = await readFile(new URL("../src/App.js", import.meta.url), "utf8");
  const styles = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");

  assert.equal(source.includes("normalizeCollectionUrl"), true);
  assert.equal(source.includes("collection-card"), true);
  assert.equal(source.includes('type: "image"'), true);
  assert.equal(source.includes('accept: "image/*"'), true);
  assert.equal(source.includes("credential-document-image"), true);
  assert.equal(styles.includes("object-fit: contain"), true);
});

test("renders place image cards for known hotels and trip locations", async () => {
  const source = await readFile(new URL("../src/App.js", import.meta.url), "utf8");
  const seed = await readFile(new URL("../src/data/tripSeed.js", import.meta.url), "utf8");

  assert.equal(source.includes("place-photo"), true);
  assert.equal(seed.includes("imageUrl"), true);
});

test("turns place cards into hotel jumps and attraction guide cards", async () => {
  const source = await readFile(new URL("../src/App.js", import.meta.url), "utf8");
  const styles = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");

  assert.equal(source.includes("PlaceInsightCard"), true);
  assert.equal(source.includes("renderPlaceActions"), true);
  assert.equal(source.includes("hotel-jump-link"), true);
  assert.equal(source.includes("place-guide-card"), true);
  assert.equal(source.includes("guide-source-link"), true);
  assert.equal(source.includes("place-map-secondary"), true);
  assert.equal(source.includes('React.createElement("span", null, "打开地图")'), false);
  assert.equal(styles.includes(".place-guide-card"), true);
  assert.equal(styles.includes(".hotel-jump-link"), true);
});

test("uses scenic date chip backgrounds instead of plain date pills", async () => {
  const source = await readFile(new URL("../src/App.js", import.meta.url), "utf8");
  const styles = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");

  assert.equal(source.includes("--day-image"), true);
  assert.equal(styles.includes("var(--day-image"), true);
});

test("renders today as actionable cards instead of a tiny brief", async () => {
  const source = await readFile(new URL("../src/App.js", import.meta.url), "utf8");
  const styles = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");

  assert.equal(source.includes("HomeSummaryPanel"), false);
  assert.equal(source.includes("React.createElement(DayActionPanel"), true);
  assert.equal(source.includes("action-card-meta"), true);
  assert.equal(source.includes("credential-pill"), true);
  assert.equal(source.includes("route-journey"), true);
  assert.equal(source.includes("action-note-strip"), true);
  assert.equal(source.includes("getVisibleActionNotes"), true);
  assert.equal(source.includes("交通节点已整理"), false);
  assert.equal(source.includes('React.createElement("summary", null, "详情")'), false);
  assert.equal(source.includes('notes[0] && React.createElement("p"'), false);
  assert.equal(source.includes("HomeMiniWidgets"), true);
  assert.equal(styles.includes(".day-action-stack"), true);
  assert.equal(styles.includes(".route-journey"), true);
  assert.equal(styles.includes(".action-note-strip"), true);
});

test("separates action titles from repeated place labels", async () => {
  const source = await readFile(new URL("../src/App.js", import.meta.url), "utf8");

  assert.equal(source.includes("getActionDisplayTitle"), true);
  assert.equal(source.includes("stripRepeatedPlaces"), true);
  assert.equal(source.includes("isTitleMostlyPlace"), true);
  assert.equal(source.includes("SHORT_PLACE_LABELS"), true);
  assert.equal(source.includes("const displayTitle = getActionDisplayTitle"), true);
  assert.equal(source.includes('React.createElement("strong", null, item.title)'), false);
});

test("shows weather mystic and Turkish as compact home widgets before details", async () => {
  const source = await readFile(new URL("../src/App.js", import.meta.url), "utf8");
  const styles = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");

  assert.equal(source.includes("HomeMiniWidgets"), true);
  assert.equal(source.includes("home-mini-widgets"), true);
  assert.equal(source.includes("weather-mini-widget"), true);
  assert.equal(source.includes("mystic-mini-widget"), true);
  assert.equal(source.includes("phrase-mini-widget"), true);
  assert.equal(source.includes("home-widget-button"), true);
  assert.equal(source.includes('setActiveView("weather")'), true);
  assert.equal(source.includes('setActiveView("mystic")'), true);
  assert.equal(styles.includes(".home-mini-widgets"), true);
  assert.equal(styles.includes(".home-widget-button"), true);
});

test("shows selected-day credentials first while keeping all synced credentials visible", async () => {
  const source = await readFile(new URL("../src/App.js", import.meta.url), "utf8");
  const styles = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");
  const seed = await readFile(new URL("../src/data/tripSeed.js", import.meta.url), "utf8");

  assert.equal(source.includes("getCredentialGroups"), true);
  assert.equal(source.includes("groupCredentialAssetsByDate"), true);
  assert.equal(source.includes('kind: "secondary"'), true);
  assert.equal(source.includes("当前日期优先"), true);
  assert.equal(source.includes("credential-section"), true);
  assert.equal(styles.includes(".credential-section.secondary"), true);
  assert.equal(source.includes('id: "common"'), false);
  assert.equal(seed.includes("asset-trip-common"), false);
  assert.equal(seed.includes("Booking / Agoda 订单截图归档"), false);
  assert.equal(source.includes('link.tag !== "天气"'), true);
  assert.equal(source.includes("只显示当前日期相关截图和票据"), false);
});

test("opens Turkish phrases in a click-triggered overlay instead of a full panel", async () => {
  const source = await readFile(new URL("../src/App.js", import.meta.url), "utf8");
  const styles = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");

  assert.equal(source.includes("PhraseLauncher"), true);
  assert.equal(source.includes("isPhraseOpen"), true);
  assert.equal(source.includes("phrase-modal"), true);
  assert.equal(source.includes("phrase-launcher-card"), true);
  assert.equal(source.includes("phrase-mini-widget"), true);
  assert.equal(styles.includes(".phrase-modal"), true);
  assert.equal(styles.includes(".phrase-launcher-card"), true);
});

test("adds food recommendations with Google Maps restaurant import and jump links", async () => {
  const source = await readFile(new URL("../src/App.js", import.meta.url), "utf8");

  assert.equal(source.includes("FoodPanel"), true);
  assert.equal(source.includes("normalizeGoogleMapsPlace"), true);
  assert.equal(source.includes("Google 导入餐厅"), true);
  assert.equal(source.includes('activeView === "food"'), true);
});

test("adds static map thumbnails and approximate cuisine notes without route thumbnails", async () => {
  const source = await readFile(new URL("../src/App.js", import.meta.url), "utf8");
  const styles = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");

  assert.equal(source.includes("MapThumbnail"), true);
  assert.equal(source.includes("createStaticMapUrl"), true);
  assert.equal(source.includes("inferCuisineInfo"), true);
  assert.equal(source.includes("map-thumbnail-card"), true);
  assert.equal(source.includes("offline-map-fallback"), true);
  assert.equal(source.includes("restaurant-cuisine-panel"), true);
  assert.equal(source.includes("cuisine-chip-list"), true);
  assert.equal(source.includes("createRouteStaticMapUrl"), false);
  assert.equal(styles.includes(".map-thumbnail-card"), true);
  assert.equal(styles.includes(".offline-map-fallback"), true);
  assert.equal(styles.includes(".restaurant-cuisine-panel"), true);
  assert.equal(styles.includes(".cuisine-chip-list"), true);
});

test("uses food photos for recommendations instead of map thumbnails", async () => {
  const source = await readFile(new URL("../src/App.js", import.meta.url), "utf8");
  const styles = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");
  const seed = await readFile(new URL("../src/data/tripSeed.js", import.meta.url), "utf8");

  assert.equal(source.includes("FoodImage"), true);
  assert.equal(source.includes("foodPreviewById"), true);
  assert.equal(source.includes("createFoodPlaceQuery"), true);
  assert.equal(source.includes("placePreview?.photoUrl"), true);
  assert.equal(source.includes("food-photo"), true);
  assert.equal(source.includes("food.imageUrl"), true);
  assert.equal(source.includes("food-map-thumbnail"), false);
  assert.equal(seed.includes("imageUrl"), true);
  assert.equal(seed.includes("imageCredit"), true);
  assert.equal(styles.includes(".food-photo"), true);
});

test("enhances Google restaurant cards with Places photos and metadata", async () => {
  const source = await readFile(new URL("../src/App.js", import.meta.url), "utf8");
  const styles = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");

  assert.equal(source.includes("fetchPlacePreview"), true);
  assert.equal(source.includes("placesPreviewById"), true);
  assert.equal(source.includes("restaurant-place-photo"), true);
  assert.equal(source.includes("place-photo-attribution"), true);
  assert.equal(source.includes("restaurant-google-detail"), true);
  assert.equal(styles.includes(".restaurant-place-photo"), true);
  assert.equal(styles.includes(".place-photo-attribution"), true);
});

test("keeps food recommendations day scoped and edit controls unobtrusive", async () => {
  const source = await readFile(new URL("../src/App.js", import.meta.url), "utf8");
  const styles = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");

  assert.equal(source.includes("getDailyFoodRecommendations"), true);
  assert.equal(source.includes("getDailyRestaurantLinks"), true);
  assert.equal(source.includes("EditDrawer"), true);
  assert.equal(source.includes("module-edit-button"), true);
  assert.equal(source.includes("edit-drawer-panel"), true);
  assert.equal(styles.includes(".module-edit-button"), true);
  assert.equal(styles.includes(".edit-drawer-panel"), true);
});

test("adds a mystic detail view reachable from the cover summary", async () => {
  const source = await readFile(new URL("../src/App.js", import.meta.url), "utf8");
  const styles = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");

  assert.equal(source.includes("MysticPanel"), true);
  assert.equal(source.includes('setActiveView("mystic")'), true);
  assert.equal(source.includes("今日玄学"), true);
  assert.equal(source.includes("mystic-link-deck"), true);
  assert.equal(source.includes("getMysticLinkMeta"), true);
  assert.equal(source.includes("getMoonPhaseInfo"), true);
  assert.equal(source.includes("moon-phase-summary"), true);
  assert.equal(source.includes("mystic-oracle-grid"), true);
  assert.equal(source.includes("mystic-symbol"), true);
  assert.equal(source.includes("今日签"), true);
  assert.equal(source.includes("Astro-Seek"), true);
  assert.equal(source.includes("xzw.com"), false);
  assert.equal(source.includes("只保留一句判断"), false);
  assert.equal(source.includes("细节放到外链里"), false);
  assert.equal(styles.includes(".mystic-link-deck"), true);
  assert.equal(styles.includes(".mystic-source-card"), true);
  assert.equal(styles.includes(".moon-phase-summary"), true);
  assert.equal(styles.includes(".mystic-oracle-grid"), true);
  assert.equal(styles.includes(".mystic-symbol"), true);
});

test("adds a lightweight cloud snapshot panel for two-person editing", async () => {
  const source = await readFile(new URL("../src/App.js", import.meta.url), "utf8");
  const adapter = await readFile(new URL("../src/lib/supabaseAdapter.js", import.meta.url), "utf8");

  assert.equal(source.includes("syncState"), true);
  assert.equal(source.includes("pushCloud"), true);
  assert.equal(source.includes("pullCloud"), true);
  assert.equal(source.includes("pullLatestCloud"), true);
  assert.equal(source.includes("hasLoadedCloud"), true);
  assert.equal(source.includes("sync-editor-input"), true);
  assert.equal(source.includes("sync-diagnostics"), true);
  assert.equal(source.includes("formatSyncDiagnosticItems"), true);
  assert.equal(source.includes("行程 ID"), true);
  assert.equal(source.includes("云端"), true);
  assert.equal(source.includes("本机演示不会跨手机同步"), true);
  assert.equal(source.includes("Supabase URL"), true);
  assert.equal(source.includes("先在两台手机填同一组 Supabase 配置"), true);
  assert.equal(source.includes("测试同步状态"), false);
  assert.equal(adapter.includes("trip_snapshots"), true);
  assert.equal(adapter.includes("payload"), true);
  assert.equal(adapter.includes("version"), true);
  assert.equal(adapter.includes("short-trip-supabase-url"), true);
});

test("collaboration sync is explicit about all-day snapshots and cloud clearing", async () => {
  const source = await readFile(new URL("../src/App.js", import.meta.url), "utf8");
  const styles = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");

  assert.equal(source.includes("clearCloud"), true);
  assert.equal(source.includes("clearTrip"), true);
  assert.equal(source.includes("拉取全行程"), true);
  assert.equal(source.includes("推送全行程"), true);
  assert.equal(source.includes("清空云端"), true);
  assert.equal(source.includes("全部日期"), true);
  assert.equal(source.includes("本机当前行程不会删除"), true);
  assert.equal(styles.includes(".sync-clear-button"), true);
});

test("renders an hourly weather time-series chart instead of only static source cards", async () => {
  const source = await readFile(new URL("../src/App.js", import.meta.url), "utf8");
  const styles = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");

  assert.equal(source.includes("HourlyWeatherChart"), true);
  assert.equal(source.includes("WeatherLocationCard"), true);
  assert.equal(source.includes("getDayWeatherLocations"), true);
  assert.equal(source.includes("weatherLocationReports"), true);
  assert.equal(source.includes("weather-timeline-chart"), true);
  assert.equal(source.includes("weather-location-grid"), true);
  assert.equal(source.includes("wide-weather-chart"), true);
  assert.equal(source.includes("WEATHER_CHART_WIDTH"), true);
  assert.equal(source.includes("hourly-scroller"), true);
  assert.equal(styles.includes(".weather-timeline-chart"), true);
  assert.equal(styles.includes(".weather-location-grid"), true);
  assert.equal(styles.includes(".hourly-scroller"), true);
  assert.equal(styles.includes("repeat(6, minmax(0, 1fr))"), false);
});

test("supports no-key Google Maps imports for restaurants and places", async () => {
  const source = await readFile(new URL("../src/App.js", import.meta.url), "utf8");
  const styles = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");

  assert.equal(source.includes("normalizeGoogleMapsPlace"), true);
  assert.equal(source.includes("restaurant-card"), true);
  assert.equal(source.includes("restaurant-meta-grid"), true);
  assert.equal(source.includes("place-google-import"), true);
  assert.equal(source.includes("importGooglePlace"), true);
  assert.equal(styles.includes(".restaurant-card"), true);
  assert.equal(styles.includes(".place-google-import"), true);
});

test("keeps restaurant map jump icons visible on filled buttons", async () => {
  const styles = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");

  assert.equal(styles.includes(".restaurant-card header a svg"), true);
  assert.equal(styles.includes("color: #ffffff"), true);
});

test("lets action edits update timing, places, addresses, and credential bindings", async () => {
  const source = await readFile(new URL("../src/App.js", import.meta.url), "utf8");

  assert.equal(source.includes("action-edit-grid"), true);
  assert.equal(source.includes("asset-picker"), true);
  assert.equal(source.includes("primaryPlaceId"), true);
  assert.equal(source.includes("destinationPlaceId"), true);
  assert.equal(source.includes("行动地址"), true);
});

test("adds ChatGPT and Gemini language helpers", async () => {
  const source = await readFile(new URL("../src/App.js", import.meta.url), "utf8");
  const styles = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");
  const assistantLinks = await readFile(new URL("../src/lib/assistantLinks.js", import.meta.url), "utf8");

  assert.equal(source.includes("ai-language-links"), true);
  assert.equal(source.includes("ai-language-actions"), true);
  assert.equal(assistantLinks.includes("ChatGPT"), true);
  assert.equal(assistantLinks.includes("Gemini"), true);
  assert.equal(assistantLinks.includes("chatgpt.com"), true);
  assert.equal(assistantLinks.includes("gemini.google.com/app"), true);
  assert.equal(assistantLinks.includes("chatgpt://"), false);
  assert.equal(assistantLinks.includes("googlegemini://"), false);
  assert.equal(assistantLinks.includes("browser_fallback_url"), false);
  assert.equal(source.includes("openAssistantLink"), true);
  assert.equal(source.includes("createAiTranslatorPrompt"), true);
  assert.equal(styles.includes(".ai-language-links"), true);
  assert.equal(styles.includes(".ai-language-actions"), true);
});

test("loads external weather and auto-selects the nearest trip date", async () => {
  const source = await readFile(new URL("../src/App.js", import.meta.url), "utf8");

  assert.equal(source.includes("useEffect"), true);
  assert.equal(source.includes("getNearestTripDate(seedTrip.days, new Date())"), true);
  assert.equal(source.includes("fetchOpenMeteoForecast"), true);
  assert.equal(source.includes("externalWeather"), true);
  assert.equal(source.includes("selectedWeatherSnapshots"), true);
  assert.equal(source.includes("selectedHourlyForecast"), true);
  assert.equal(source.includes("weatherStatus"), true);
});

test("uses the Santorini morning palette instead of the green or dark-blue themes", async () => {
  const styles = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");

  assert.equal(styles.includes("#fbfaf6"), true);
  assert.equal(styles.includes("#256d85"), true);
  assert.equal(styles.includes("#ef8f7a"), true);
  assert.equal(styles.includes("#eaf3f7"), true);
  assert.equal(styles.includes("#24685f"), false);
  assert.equal(styles.includes("#e6f5f3"), false);
  assert.equal(styles.includes("#243447"), false);
  assert.equal(styles.includes("#3b5f73"), false);
});
