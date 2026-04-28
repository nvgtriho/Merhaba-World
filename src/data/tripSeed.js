export const seedMarkdown = `# 五一小土特种兵行动方针

| 日期 | 时间        | 行程                                                         |
| ---- | ----------- | ------------------------------------------------------------ |
| 5.1  | 8:10        | 到达伊斯坦布尔机场 IST                                       |
|      | 11:00-12:10 | 伊斯坦布尔机场 IST - 伊兹密尔 阿德楠曼德列斯 ADB TK2320 11:00-12:10 |
|      | 11:30-13:30 | 伊兹密尔-以弗所 轻轨+巴士                                    |
|      | 14:00-18:00 | 游览以弗所古城，时间充裕                                     |
|      |             | 住宿 塞尔丘克 Saint John Hotel                               |
| 5.2  | 8:00-13:00  | 塞尔丘克-费特希耶 大巴 需中转                                |
|      | 13:00-19:00 | 酒店放行李，吃饭<br />租个沙滩椅，躺平，游泳，或者去城区逛逛<br />预约滑翔伞（或者线上预约） |
|      |             | 住宿 Oludeniz - Salonika Suites                              |
| 5.3  | 8:00-10:00  | 滑翔伞                                                       |
|      | 12:00-19:00 | 徒步利西亚之路<br />minibus或uber至起点Lycian Way Start Point<br />如果来不及，徒步至打卡点原路返回 |
`;

export const seedTrip = {
  id: "turkey-2026",
  name: "五一小土特种兵行动台",
  destinationTemplate: "turkey",
  startDate: "2026-04-30",
  endDate: "2026-05-07",
  members: [
    { id: "m1", name: "PassionateChat", role: "editor" },
    { id: "m2", name: "旅伴", role: "editor" }
  ],
  days: [
    {
      id: "day-2026-04-30",
      date: "2026-04-30",
      title: "4.30",
      city: "香港 / 上海 / 伊斯坦布尔",
      weatherSnapshots: [
        { sourceId: "mgm", sourceName: "MGM", highC: 18, lowC: 11, precipitationChance: 20, windKmh: 15 },
        { sourceId: "yr", sourceName: "Yr", highC: 17, lowC: 10, precipitationChance: 25, windKmh: 18 },
        { sourceId: "open-meteo", sourceName: "Open-Meteo", highC: 19, lowC: 11, precipitationChance: 28, windKmh: 16 }
      ]
    },
    {
      id: "day-2026-05-01",
      date: "2026-05-01",
      title: "5.1",
      city: "伊斯坦布尔 / 伊兹密尔 / 以弗所",
      weatherSnapshots: [
        { sourceId: "mgm", sourceName: "MGM", highC: 24, lowC: 15, precipitationChance: 20, windKmh: 14 },
        { sourceId: "yr", sourceName: "Yr", highC: 25, lowC: 14, precipitationChance: 25, windKmh: 18 },
        { sourceId: "open-meteo", sourceName: "Open-Meteo", highC: 27, lowC: 16, precipitationChance: 48, windKmh: 22 }
      ]
    },
    {
      id: "day-2026-05-02",
      date: "2026-05-02",
      title: "5.2",
      city: "塞尔丘克 / 费特希耶 / 厄吕代尼兹",
      weatherSnapshots: [
        { sourceId: "mgm", sourceName: "MGM", highC: 25, lowC: 16, precipitationChance: 15, windKmh: 12 },
        { sourceId: "yr", sourceName: "Yr", highC: 26, lowC: 17, precipitationChance: 18, windKmh: 20 },
        { sourceId: "open-meteo", sourceName: "Open-Meteo", highC: 29, lowC: 18, precipitationChance: 50, windKmh: 30, gustKmh: 52 }
      ]
    },
    {
      id: "day-2026-05-03",
      date: "2026-05-03",
      title: "5.3",
      city: "费特希耶 / 安塔利亚",
      weatherSnapshots: [
        { sourceId: "mgm", sourceName: "MGM", highC: 24, lowC: 15, precipitationChance: 10, windKmh: 18 },
        { sourceId: "yr", sourceName: "Yr", highC: 25, lowC: 16, precipitationChance: 12, windKmh: 22 },
        { sourceId: "open-meteo", sourceName: "Open-Meteo", highC: 26, lowC: 15, precipitationChance: 18, windKmh: 24 }
      ]
    },
    {
      id: "day-2026-05-04",
      date: "2026-05-04",
      title: "5.4",
      city: "格雷梅 / 卡帕多奇亚",
      weatherSnapshots: [
        { sourceId: "mgm", sourceName: "MGM", highC: 20, lowC: 8, precipitationChance: 25, windKmh: 16 },
        { sourceId: "yr", sourceName: "Yr", highC: 19, lowC: 7, precipitationChance: 30, windKmh: 19 },
        { sourceId: "open-meteo", sourceName: "Open-Meteo", highC: 21, lowC: 9, precipitationChance: 32, windKmh: 17 }
      ]
    }
  ],
  items: [
    { id: "item-1", date: "2026-05-01", startTime: "08:10", endTime: null, type: "transport", title: "到达伊斯坦布尔机场 IST", notes: ["入境后确认下一程 TK2320"] },
    { id: "item-2", date: "2026-05-01", startTime: "11:00", endTime: "12:10", type: "transport", title: "IST → ADB · TK2320", notes: ["伊斯坦布尔机场至伊兹密尔阿德楠曼德列斯机场"] },
    { id: "item-3", date: "2026-05-01", startTime: "14:00", endTime: "18:00", type: "activity", title: "以弗所古城", notes: ["官网/票务入口放在快速链接", "时间充裕"] },
    { id: "item-4", date: "2026-05-01", startTime: null, endTime: null, type: "lodging", title: "Saint John Hotel", address: "Isabey Mah. Sehit Polis Metin Tavaslioglu Cad. No:67", notes: ["PDF 固定输入：酒店地址已补全"] },
    { id: "item-5", date: "2026-05-02", startTime: "08:00", endTime: "13:00", type: "transport", title: "塞尔丘克 → 费特希耶", notes: ["大巴需中转 Aydin Otogari"] },
    { id: "item-6", date: "2026-05-02", startTime: "13:00", endTime: "19:00", type: "activity", title: "厄吕代尼兹躺平 + 预约滑翔伞", notes: ["海边日重点看风、阵风、降雨"] },
    { id: "item-7", date: "2026-05-03", startTime: "08:00", endTime: "10:00", type: "activity", title: "滑翔伞", notes: ["出发前确认天气和商家通知"] },
    { id: "item-8", date: "2026-05-03", startTime: "12:00", endTime: "19:00", type: "activity", title: "利西亚之路徒步", notes: ["起点 Lycian Way Start Point", "来不及时原路返回打卡点"] },
    { id: "item-9", date: "2026-05-03", startTime: "23:59", endTime: null, type: "transport", title: "KimilKoc 夜巴 → 格雷梅", notes: ["安塔利亚出发，次日 07:10 到达"] }
  ],
  places: [
    { id: "place-1", name: "Saint John Hotel", city: "塞尔丘克", address: "Isabey Mah. Sehit Polis Metin Tavaslioglu Cad. No:67" },
    { id: "place-2", name: "以弗所古城", city: "以弗所", address: "Ephesus Archaeological Site, Selcuk" },
    { id: "place-3", name: "Oludeniz Beach", city: "厄吕代尼兹", address: "Fethiye/Muğla, Turkey" },
    { id: "place-4", name: "Lycian Way Start Point", city: "费特希耶", address: "Lycian Way Trailhead, Fethiye" },
    { id: "place-5", name: "King Apart Goreme", city: "格雷梅", address: "Goreme, Nevsehir" }
  ],
  lodgings: [
    { id: "lodging-1", date: "2026-05-01", title: "Saint John Hotel", address: "Isabey Mah. Sehit Polis Metin Tavaslioglu Cad. No:67" },
    { id: "lodging-2", date: "2026-05-02", title: "Salonika Suites", address: "Oludeniz, Fethiye" },
    { id: "lodging-3", date: "2026-05-04", title: "King Apart Goreme", address: "Goreme, Nevsehir" }
  ],
  links: [
    { id: "link-1", title: "MGM 土耳其官方天气", url: "https://www.mgm.gov.tr/eng/forecast-cities.aspx", tag: "天气" },
    { id: "link-2", title: "Open-Meteo 多模型预报", url: "https://open-meteo.com/", tag: "天气" },
    { id: "link-3", title: "Booking / Agoda 订单截图手动归档", url: "#", tag: "附件" }
  ]
};
