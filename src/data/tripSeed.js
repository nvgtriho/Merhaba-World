export const seedMarkdown = `# Merhaba-World 行动方针

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
|      | 10:00-12:00 | 退房，行李寄存，吃饭                                         |
|      | 12:00-19:00 | 徒步利西亚之路<br />minibus或uber至起点Lycian Way Start Point<br />徒步约15km-738m-5h到达蝴蝶谷，minibus回oludaniz，每半个小时一班<br />如果来不及，徒步至打卡点原路返回（往返约3km）<br />时间晚的话直接让车来山上接人 |
|      | 19:00-22:00 | 乘坐包车去往安塔利亚                                         |
|      | 23:59       | 乘坐KimilKoc夜巴去往格雷梅小镇                               |
| 5.4  | 08:30       | 到达格雷梅小镇                                               |
|      | 13:00-13:30 | King Apart Goreme 入住，钥匙领取地址与住宿地址分开确认        |
|      | 傍晚        | 格雷梅小镇休整，视体力去日落观景点                           |
| 5.5  | 04:30-07:30 | 热气球/观球日出，出发前复核 MGM、Yr、Open-Meteo 风况          |
|      | 09:30-12:30 | 格雷梅露天博物馆                                             |
|      | 14:00-17:30 | 乌奇萨城堡、鸽子谷或红线/绿线半日机动                         |
|      | 18:00-19:30 | Love Valley / Sunset View Point 看日落                        |
| 5.6  | 06:00-06:30 | King Apart Goreme 退房，确认前往 NAV 机场交通                  |
|      | 08:30-10:00 | 内夫谢希尔 卡帕多奇亚机场 NAV - 伊斯坦布尔机场 IST TK2001 8:30-10:00 |
`;

const scenicImages = {
  istanbulAirport: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Istanbul_Airport%2C_Arnavutk%C3%B6y_%28P1090183%29.jpg/960px-Istanbul_Airport%2C_Arnavutk%C3%B6y_%28P1090183%29.jpg",
  ephesusLibrary: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Ephesus_-_Celsus_Library.jpg/960px-Ephesus_-_Celsus_Library.jpg",
  oludenizBeach: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Oludeniz-beach.JPG/960px-Oludeniz-beach.JPG",
  oludenizLagoon: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Oludeniz_%2815405773192%29.jpg/960px-Oludeniz_%2815405773192%29.jpg",
  butterflyValley: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Butterfly_Valley%2C_Fethiye.jpg/960px-Butterfly_Valley%2C_Fethiye.jpg",
  fethiyeValley: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Fethiye%2C_Butterfly_Valley.jpg/960px-Fethiye%2C_Butterfly_Valley.jpg",
  goremeTown: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/G%C3%B6reme_Town_in_Cappadocia_%2851600258636%29.jpg/960px-G%C3%B6reme_Town_in_Cappadocia_%2851600258636%29.jpg",
  goremeValley: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Autumn_in_G%C3%B6reme_Valley.jpg/960px-Autumn_in_G%C3%B6reme_Valley.jpg",
  cappadociaBalloons: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Cappadocia_Aerial_View_Landscape.jpg/960px-Cappadocia_Aerial_View_Landscape.jpg",
  cappadociaBalloonClose: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Hot_air_balloon_in_Cappadocia_02.jpg/960px-Hot_air_balloon_in_Cappadocia_02.jpg",
  uchisarCastle: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Castle_U%C3%A7hisar_in_Cappadocia.jpg/960px-Castle_U%C3%A7hisar_in_Cappadocia.jpg",
  pigeonValley: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Pigeon_Valley%2C_Cappadocia.jpg/960px-Pigeon_Valley%2C_Cappadocia.jpg",
  loveValley: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Love_Valley_Cappadocia_%2824885453%29.jpeg/960px-Love_Valley_Cappadocia_%2824885453%29.jpeg",
  adnanMenderesAirport: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Adnan_Menderes_Airport_International_Terminal.jpg/960px-Adnan_Menderes_Airport_International_Terminal.jpg",
  antalyaOtogar: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Antalya_Otogar_-_29.1.26.jpg/960px-Antalya_Otogar_-_29.1.26.jpg",
  goremeOtogar: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/GOREME_BUS_STATION_GOREME_CAPPADOCIA_CENTRAL_TURKEY_OCT_2011_%286291362292%29.jpg/960px-GOREME_BUS_STATION_GOREME_CAPPADOCIA_CENTRAL_TURKEY_OCT_2011_%286291362292%29.jpg",
  nevsehirAirport: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Nev%C5%9Fehir_Kapadokya_Airport.jpg/960px-Nev%C5%9Fehir_Kapadokya_Airport.jpg"
};

function hourlyForecast(points) {
  return points.map(([time, tempC, precipitationChance, windKmh]) => ({
    time,
    tempC,
    precipitationChance,
    windKmh
  }));
}

const dayExtras = {
  "2026-04-30": {
    mystic: {
      summary: "宜轻装、宜提前；别把转机判断留给现场情绪。",
      focus: "行李直挂、护照、落地交通",
      luckyColor: "雾蓝",
      links: createMysticLinks("0430", "伊斯坦布尔月相", "https://www.timeanddate.com/moon/turkey/istanbul?month=4&year=2026")
    },
    hourlyForecast: hourlyForecast([["06:00", 11, 12, 12], ["09:00", 14, 18, 14], ["12:00", 17, 22, 16], ["15:00", 18, 24, 18], ["18:00", 15, 20, 15], ["21:00", 12, 16, 12]])
  },
  "2026-05-01": {
    mystic: {
      summary: "宜抢节奏、宜先难后易；以弗所段不要被午后拖慢。",
      focus: "转机、古城、首晚入住",
      luckyColor: "石榴红",
      links: createMysticLinks("0501", "伊兹密尔月相", "https://www.timeanddate.com/moon/turkey/izmir?month=5&year=2026")
    },
    hourlyForecast: hourlyForecast([["07:00", 15, 10, 10], ["10:00", 20, 16, 13], ["13:00", 24, 24, 15], ["16:00", 25, 35, 18], ["19:00", 21, 28, 14], ["22:00", 17, 20, 10]])
  },
  "2026-05-02": {
    mystic: {
      summary: "宜慢一点、宜看风；海边日的好运来自留白。",
      focus: "大巴中转、海边休整、滑翔伞预约",
      luckyColor: "海盐绿",
      links: createMysticLinks("0502", "费特希耶月相", "https://www.timeanddate.com/moon/turkey/fethiye?month=5&year=2026")
    },
    hourlyForecast: hourlyForecast([["07:00", 16, 12, 10], ["10:00", 22, 18, 16], ["13:00", 25, 30, 22], ["16:00", 24, 46, 30], ["19:00", 21, 34, 24], ["22:00", 18, 24, 18]])
  },
  "2026-05-03": {
    mystic: {
      summary: "宜按体力改线；今天不是证明自己，是安全抵达下一段。",
      focus: "滑翔伞、徒步、夜巴",
      luckyColor: "岩灰",
      links: createMysticLinks("0503", "费特希耶月相", "https://www.timeanddate.com/moon/turkey/fethiye?month=5&year=2026")
    },
    hourlyForecast: hourlyForecast([["07:00", 16, 8, 16], ["10:00", 21, 10, 20], ["13:00", 24, 12, 22], ["16:00", 24, 16, 24], ["19:00", 20, 14, 18], ["23:00", 16, 12, 14]])
  },
  "2026-05-04": {
    mystic: {
      summary: "宜补眠、宜确认；卡帕第一天先稳住能量。",
      focus: "夜巴恢复、钥匙领取、日落点",
      luckyColor: "陶土橙",
      links: createMysticLinks("0504", "卡帕多奇亚月相", "https://www.timeanddate.com/moon/%40322954")
    },
    hourlyForecast: hourlyForecast([["06:00", 8, 20, 12], ["09:00", 12, 22, 14], ["12:00", 18, 26, 16], ["15:00", 20, 30, 18], ["18:00", 16, 24, 14], ["21:00", 10, 18, 10]])
  },
  "2026-05-05": {
    mystic: {
      summary: "宜早起、宜许愿；热气球日适合把选择留给天空。",
      focus: "日出、热气球、红线绿线机动",
      luckyColor: "霞粉",
      links: createMysticLinks("0505", "卡帕多奇亚月相", "https://www.timeanddate.com/moon/%40322954")
    },
    hourlyForecast: hourlyForecast([["04:00", 8, 8, 10], ["07:00", 11, 10, 12], ["10:00", 18, 14, 14], ["13:00", 22, 18, 16], ["17:00", 20, 20, 15], ["20:00", 13, 16, 12]])
  },
  "2026-05-06": {
    mystic: {
      summary: "宜复盘、宜清点；返程日最旺的是不丢东西。",
      focus: "退房、机场交通、登机口",
      luckyColor: "晨白",
      links: createMysticLinks("0506", "卡帕多奇亚月相", "https://www.timeanddate.com/moon/%40322954")
    },
    hourlyForecast: hourlyForecast([["05:00", 10, 14, 12], ["07:00", 12, 18, 16], ["09:00", 16, 20, 18], ["12:00", 20, 24, 20], ["15:00", 21, 26, 19], ["18:00", 17, 22, 15]])
  }
};

function createMysticLinks(dayId, moonTitle, moonUrl) {
  return [
    { id: `mystic-${dayId}-moon`, title: moonTitle, url: moonUrl },
    { id: `mystic-${dayId}-astro`, title: "Astrology.com 每日星座", url: "https://www.astrology.com/horoscope/daily.html" },
    { id: `mystic-${dayId}-astro-seek`, title: "Astro-Seek 每日天象", url: "https://horoscopes.astro-seek.com/current-planets-astrology-transits-planetary-positions" }
  ];
}

const imageSourceUrls = {
  istanbulAirport: "https://commons.wikimedia.org/wiki/File:Istanbul_Airport,_Arnavutk%C3%B6y_(P1090183).jpg",
  ephesusLibrary: "https://commons.wikimedia.org/wiki/File:Ephesus_-_Celsus_Library.jpg",
  oludenizLagoon: "https://commons.wikimedia.org/wiki/File:Oludeniz_(15405773192).jpg",
  butterflyValley: "https://commons.wikimedia.org/wiki/File:Butterfly_Valley,_Fethiye.jpg",
  fethiyeValley: "https://commons.wikimedia.org/wiki/File:Fethiye,_Butterfly_Valley.jpg",
  goremeTown: "https://commons.wikimedia.org/wiki/File:G%C3%B6reme_Town_in_Cappadocia_(51600258636).jpg",
  goremeValley: "https://commons.wikimedia.org/wiki/File:Autumn_in_G%C3%B6reme_Valley.jpg",
  uchisarCastle: "https://commons.wikimedia.org/wiki/File:Castle_U%C3%A7hisar_in_Cappadocia.jpg",
  pigeonValley: "https://commons.wikimedia.org/wiki/File:Pigeon_Valley,_Cappadocia.jpg",
  loveValley: "https://commons.wikimedia.org/wiki/File:Love_Valley_Cappadocia_(24885453).jpeg",
  cappadociaBalloonClose: "https://commons.wikimedia.org/wiki/File:Hot_air_balloon_in_Cappadocia_02.jpg",
  adnanMenderesAirport: "https://commons.wikimedia.org/wiki/File:Adnan_Menderes_Airport_International_Terminal.jpg",
  antalyaOtogar: "https://commons.wikimedia.org/wiki/File:Antalya_Otogar_-_29.1.26.jpg",
  goremeOtogar: "https://commons.wikimedia.org/wiki/File:GOREME_BUS_STATION_GOREME_CAPPADOCIA_CENTRAL_TURKEY_OCT_2011_(6291362292).jpg",
  nevsehirAirport: "https://commons.wikimedia.org/wiki/File:Nev%C5%9Fehir_Kapadokya_Airport.jpg"
};

const hotelJumps = {
  saintJohn: {
    externalUrl: "https://www.booking.com/searchresults.html?ss=Saint%20John%20Hotel%20Selcuk",
    externalLabel: "Booking 酒店页"
  },
  salonika: {
    externalUrl: "https://www.agoda.com/search?textToSearch=Salonika%20Suites%20Oludeniz",
    externalLabel: "Agoda 酒店页"
  },
  kingApart: {
    externalUrl: "https://www.booking.com/searchresults.html?ss=King%20Apart%20Goreme",
    externalLabel: "Booking 酒店页"
  }
};

const placeGuides = {
  ephesus: {
    summary: "以弗所不是单一景点，而是一座从希腊化、罗马到早期基督教时期不断叠加的古城。实际游览时可以把它当作一条城市主轴：剧场、商业街、图书馆立面和街道遗存依次展开，能明显感到它曾经是爱琴海东岸的重要港口城市。",
    facts: ["塞尔苏斯图书馆既是图书馆立面，也是纪念性墓葬建筑，适合放在行程中段细看。", "古城大剧场规模很大，现场站上看台会更容易理解当年城市公共生活的尺度。"],
    sources: [
      { title: "UNESCO Ephesus", url: "https://whc.unesco.org/en/list/1018/" },
      { title: "Türkiye Museums Ephesus", url: "https://muze.gov.tr/muze-detay?SectionId=EFM01&DistId=EFM" }
    ]
  },
  oludeniz: {
    summary: "厄吕代尼兹的核心不是普通海滩，而是蓝色潟湖、海湾和滑翔伞共同组成的地形体验。海水颜色很好看，但当天真正影响体验的是风向、阵风和能见度；适合把海滩休息和滑翔伞确认放在同一天处理。",
    facts: ["蓝色潟湖是当地最有辨识度的景观，适合安排轻松半日。", "从 Babadağ 起飞的滑翔伞是这里的经典项目，天气变化会直接影响出发。"],
    sources: [
      { title: "Ölüdeniz overview", url: "https://en.wikipedia.org/wiki/%C3%96l%C3%BCdeniz" },
      { title: "Discover Ölüdeniz", url: "https://www.discoveroludeniz.com/" }
    ]
  },
  lycian: {
    summary: "利西亚之路是一条长距离徒步线，费特希耶附近只是它最容易接入的一段。你这天不需要把它当成完整穿越，而是把起点、体力、返程 minibus 和叫车备选提前想好；这样即使只走精华段，也不会被回程牵制。",
    facts: ["这条线路通常被介绍为土耳其第一条长距离徒步路线。", "沿线把古代利西亚遗址、海岸线和村落路径串在一起，路况会比城市步道更野。"],
    sources: [
      { title: "Culture Routes Society: Lycian Way", url: "https://cultureroutesinturkey.com/the-lycian-way/" },
      { title: "Lycian Way overview", url: "https://en.wikipedia.org/wiki/Lycian_Way" }
    ]
  },
  butterfly: {
    summary: "蝴蝶谷是夹在陡峭山壁之间的海湾和峡谷，视觉上比普通沙滩更有戏剧性。它适合作为徒步目标或船游目标，但回程交通要提前留余量；如果时间或体力不够，停在观景点往返会更稳。",
    facts: ["海湾背后有峡谷和季节性水流，靠近自然保护区气质。", "从高处俯看比单纯到海滩更容易看出地形的纵深。"],
    sources: [
      { title: "Butterfly Valley overview", url: "https://en.wikipedia.org/wiki/Butterfly_Valley,_Fethiye" },
      { title: "Discover Fethiye", url: "https://www.discoverfethiye.com/" }
    ]
  },
  goremeOpenAir: {
    summary: "格雷梅露天博物馆是一组岩壁教堂和修道院空间，重点不是“看洞穴”，而是看拜占庭时期的壁画和岩石建筑如何结合。上午去会更适合慢看，强光和人流都相对好控制，也更容易把不同教堂的空间关系串起来。",
    facts: ["这里属于卡帕多奇亚世界遗产核心区域。", "岩壁教堂里的壁画保存度不一，现场看会比照片更能理解空间层次。"],
    sources: [
      { title: "UNESCO Göreme", url: "https://whc.unesco.org/en/list/357/" },
      { title: "Türkiye Museums Göreme", url: "https://muze.gov.tr/muze-detay?SectionId=GRM01&DistId=MRK" }
    ]
  },
  uchisar: {
    summary: "乌奇萨城堡是卡帕多奇亚最好的高点之一，本质上是一整块被开凿过的火山凝灰岩堡垒。适合在天气清晰时去，优先价值是俯瞰格雷梅周边谷地，而不是在内部停留很久；它更像一个判断地形的观景点。",
    facts: ["它常被视为卡帕多奇亚区域的制高点。", "岩体里有大量曾经用于居住、防御和储藏的空间痕迹。"],
    sources: [
      { title: "Uçhisar overview", url: "https://en.wikipedia.org/wiki/U%C3%A7hisar" },
      { title: "Göreme.com Uçhisar Castle", url: "https://www.goreme.com/uchisar-castle.php" }
    ]
  },
  pigeon: {
    summary: "鸽子谷的名字来自岩壁上密集的鸽舍孔洞。它不是只为了拍照的谷地：这些小洞曾经和农业、肥料、居住体系有关，能把卡帕多奇亚“风景很奇特”这件事拉回到真实生活里，也适合作为乌奇萨方向的轻徒步补充。",
    facts: ["岩壁鸽舍曾被用来收集鸽粪，作为葡萄园和农田肥料。", "它连接格雷梅和乌奇萨方向，适合和乌奇萨城堡一起做半日机动。"],
    sources: [
      { title: "Göreme.com Pigeon Valley", url: "https://www.goreme.com/pigeon-valley.php" },
      { title: "Pigeon Valley overview", url: "https://en.wikipedia.org/wiki/Pigeon_Valley" }
    ]
  },
  loveValley: {
    summary: "Love Valley 的看点是被侵蚀出的高耸凝灰岩柱，地貌辨识度非常强。它适合日落前后安排，但不要只冲着打卡照；沿着边缘慢走，可以更好地看出火山沉积和风化如何塑造卡帕多奇亚。",
    facts: ["这里的岩柱属于卡帕多奇亚典型的 fairy chimney 地貌。", "光线低的时候阴影更明显，照片比正午更有层次。"],
    sources: [
      { title: "Göreme.com Love Valley", url: "https://www.goreme.com/love-valley.php" },
      { title: "Cappadocia UNESCO context", url: "https://whc.unesco.org/en/list/357/" }
    ]
  },
  sunset: {
    summary: "格雷梅日落点更像一个行程缓冲器：离镇上近，适合夜巴后按体力临时决定。它的价值在于快速获得镇区、谷地和热气球方向的整体视角，不需要像远郊景点那样投入完整半天，适合作为恢复日的小收尾。",
    facts: ["日落前后人会变多，早点到更容易找到视野。", "如果第二天要早起看热气球，这里也适合提前判断地形和拍摄方向。"],
    sources: [
      { title: "Göreme overview", url: "https://en.wikipedia.org/wiki/G%C3%B6reme" },
      { title: "UNESCO Göreme context", url: "https://whc.unesco.org/en/list/357/" }
    ]
  }
};

export const seedTrip = {
  id: "turkey-2026",
  name: "Merhaba-World",
  destinationTemplate: "turkey",
  startDate: "2026-04-30",
  endDate: "2026-05-06",
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
      heroImageUrl: scenicImages.istanbulAirport,
      heroImageCredit: "Wikimedia Commons · Istanbul Airport",
      weatherLocation: { name: "Istanbul", latitude: 41.0082, longitude: 28.9784 },
      ...dayExtras["2026-04-30"],
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
      heroImageUrl: scenicImages.ephesusLibrary,
      heroImageCredit: "Wikimedia Commons · Ephesus",
      weatherLocation: { name: "Selcuk", latitude: 37.9514, longitude: 27.3686 },
      ...dayExtras["2026-05-01"],
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
      heroImageUrl: scenicImages.oludenizBeach,
      heroImageCredit: "Wikimedia Commons · Oludeniz",
      weatherLocation: { name: "Oludeniz", latitude: 36.5704, longitude: 29.1388 },
      ...dayExtras["2026-05-02"],
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
      heroImageUrl: scenicImages.butterflyValley,
      heroImageCredit: "Wikimedia Commons · Butterfly Valley",
      weatherLocation: { name: "Oludeniz", latitude: 36.5704, longitude: 29.1388 },
      ...dayExtras["2026-05-03"],
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
      heroImageUrl: scenicImages.goremeTown,
      heroImageCredit: "Wikimedia Commons · Goreme",
      weatherLocation: { name: "Goreme", latitude: 38.6431, longitude: 34.8289 },
      ...dayExtras["2026-05-04"],
      weatherSnapshots: [
        { sourceId: "mgm", sourceName: "MGM", highC: 20, lowC: 8, precipitationChance: 25, windKmh: 16 },
        { sourceId: "yr", sourceName: "Yr", highC: 19, lowC: 7, precipitationChance: 30, windKmh: 19 },
        { sourceId: "open-meteo", sourceName: "Open-Meteo", highC: 21, lowC: 9, precipitationChance: 32, windKmh: 17 }
      ]
    },
    {
      id: "day-2026-05-05",
      date: "2026-05-05",
      title: "5.5",
      city: "格雷梅 / 卡帕多奇亚",
      heroImageUrl: scenicImages.cappadociaBalloons,
      heroImageCredit: "Wikimedia Commons · Cappadocia",
      weatherLocation: { name: "Goreme", latitude: 38.6431, longitude: 34.8289 },
      ...dayExtras["2026-05-05"],
      weatherSnapshots: [
        { sourceId: "mgm", sourceName: "MGM", highC: 22, lowC: 8, precipitationChance: 18, windKmh: 14 },
        { sourceId: "yr", sourceName: "Yr", highC: 21, lowC: 7, precipitationChance: 22, windKmh: 18 },
        { sourceId: "open-meteo", sourceName: "Open-Meteo", highC: 23, lowC: 9, precipitationChance: 25, windKmh: 16 }
      ]
    },
    {
      id: "day-2026-05-06",
      date: "2026-05-06",
      title: "5.6",
      city: "内夫谢希尔 / 伊斯坦布尔",
      heroImageUrl: scenicImages.nevsehirAirport,
      heroImageCredit: "Wikimedia Commons · Nevsehir Airport",
      weatherLocation: { name: "Nevsehir Kapadokya Airport", latitude: 38.7719, longitude: 34.5345 },
      ...dayExtras["2026-05-06"],
      weatherSnapshots: [
        { sourceId: "mgm", sourceName: "MGM", highC: 20, lowC: 11, precipitationChance: 20, windKmh: 17 },
        { sourceId: "yr", sourceName: "Yr", highC: 19, lowC: 10, precipitationChance: 26, windKmh: 20 },
        { sourceId: "open-meteo", sourceName: "Open-Meteo", highC: 21, lowC: 12, precipitationChance: 30, windKmh: 19 }
      ]
    }
  ],
  items: [
    { id: "item-1", date: "2026-05-01", startTime: "08:10", endTime: null, type: "transport", title: "到达伊斯坦布尔机场 IST", primaryPlaceId: "place-ist", notes: ["入境后确认下一程 TK2320", "国内段转机先看行李是否直挂"] },
    { id: "item-2", date: "2026-05-01", startTime: "11:00", endTime: "12:10", type: "transport", title: "IST → ADB · TK2320", primaryPlaceId: "place-ist", destinationPlaceId: "place-adb", assetIds: ["asset-flight-tk2320"], notes: ["国内段转机，抵达后按行李状态决定节奏", "登机前复核航班柜台、登机口和行李直挂"] },
    { id: "item-3", date: "2026-05-01", startTime: "11:30", endTime: "13:30", type: "transport", title: "ADB → 塞尔丘克/以弗所", primaryPlaceId: "place-adb", destinationPlaceId: "place-ephesus", notes: ["原计划轻轨 + 巴士；按航班落地时间重算", "抵达后先放行李或直奔古城"] },
    { id: "item-4", date: "2026-05-01", startTime: "14:00", endTime: "18:00", type: "activity", title: "以弗所古城", primaryPlaceId: "place-ephesus", notes: ["游览时间充裕", "带水、防晒，闭馆前留出回酒店时间"] },
    { id: "item-5", date: "2026-05-01", startTime: null, endTime: null, type: "lodging", title: "Saint John Hotel", primaryPlaceId: "place-saint-john", assetIds: ["asset-saint-john"], notes: ["以弗所夜宿，适合古城结束后直接休整", "入住与退房时间见凭证页"] },
    { id: "item-6", date: "2026-05-02", startTime: "08:00", endTime: "13:00", type: "transport", title: "塞尔丘克 → 费特希耶", primaryPlaceId: "place-saint-john", destinationPlaceId: "place-salonika", notes: ["大巴需中转，优先复核 Aydin Otogari 班次", "到费特希耶后再转厄吕代尼兹"] },
    { id: "item-7", date: "2026-05-02", startTime: "13:00", endTime: "19:00", type: "activity", title: "厄吕代尼兹躺平 + 预约滑翔伞", primaryPlaceId: "place-oludeniz", notes: ["酒店放行李，吃饭", "租沙滩椅、游泳或去城区逛逛", "海边日重点看风、阵风、降雨"] },
    { id: "item-8", date: "2026-05-02", startTime: null, endTime: null, type: "lodging", title: "Salonika Suites", primaryPlaceId: "place-salonika", assetIds: ["asset-salonika"], notes: ["海边夜宿，重点是放松和次日滑翔伞衔接", "入住信息和房型细节见凭证页"] },
    { id: "item-9", date: "2026-05-03", startTime: "08:00", endTime: "10:00", type: "activity", title: "滑翔伞", primaryPlaceId: "place-oludeniz", notes: ["出发前确认天气和商家通知", "任一来源提示强风时先暂停"] },
    { id: "item-10", date: "2026-05-03", startTime: "10:00", endTime: "12:00", type: "note", title: "退房，行李寄存，吃饭", primaryPlaceId: "place-salonika", notes: ["酒店退房后寄存行李，补能再出发"] },
    { id: "item-11", date: "2026-05-03", startTime: "12:00", endTime: "19:00", type: "activity", title: "利西亚之路徒步", primaryPlaceId: "place-lycian", destinationPlaceId: "place-butterfly", notes: ["minibus 或 Uber 至 Lycian Way Start Point", "徒步约 15km / 738m / 5h 到达蝴蝶谷，minibus 回 Oludeniz", "来不及时徒步至打卡点原路返回，时间晚可叫车上山接人"] },
    { id: "item-12", date: "2026-05-03", startTime: "19:00", endTime: "22:00", type: "transport", title: "包车前往安塔利亚", primaryPlaceId: "place-oludeniz", destinationPlaceId: "place-antalya-otogar", notes: ["从 Oludeniz / Fethiye 乘包车去安塔利亚", "夜巴前留出晚餐和取票时间"] },
    { id: "item-13", date: "2026-05-03", startTime: "23:59", endTime: null, type: "transport", title: "KimilKoc 夜巴 → 格雷梅", primaryPlaceId: "place-antalya-otogar", destinationPlaceId: "place-goreme-otogar", assetIds: ["asset-kamilkoc"], notes: ["安塔利亚夜巴前往格雷梅，晚餐和取票留足缓冲", "车票截图已放在凭证页"] },
    { id: "item-14", date: "2026-05-04", startTime: "08:30", endTime: null, type: "transport", title: "到达格雷梅小镇", primaryPlaceId: "place-goreme-otogar", destinationPlaceId: "place-king-apart", notes: ["夜巴抵达后先去 King Apart Goreme 寄存行李或确认入住"] },
    { id: "item-15", date: "2026-05-04", startTime: "13:00", endTime: "13:30", type: "lodging", title: "King Apart Goreme 入住", primaryPlaceId: "place-king-apart", assetIds: ["asset-king-apart"], notes: ["到达后先确认入住与钥匙领取安排", "地址和联系方式见凭证页"] },
    { id: "item-16", date: "2026-05-04", startTime: "17:00", endTime: "19:30", type: "activity", title: "格雷梅小镇休整 + 日落点", primaryPlaceId: "place-sunset", notes: ["夜巴后不要排太满", "按体力选择 Göreme Sunset View Point 或在镇上吃饭"] },
    { id: "item-17", date: "2026-05-05", startTime: "04:30", endTime: "07:30", type: "activity", title: "热气球/观球日出", primaryPlaceId: "place-love-valley", notes: ["出发前复核 MGM、Yr、Open-Meteo 风况", "如果飞行取消，保留早晨观景和补觉备选"] },
    { id: "item-18", date: "2026-05-05", startTime: "09:30", endTime: "12:30", type: "activity", title: "格雷梅露天博物馆", primaryPlaceId: "place-goreme-open-air", notes: ["卡帕多奇亚核心景点，适合上午人少时去", "带水、防晒，现场看票务和开放状态"] },
    { id: "item-19", date: "2026-05-05", startTime: "14:00", endTime: "17:30", type: "activity", title: "乌奇萨城堡 / 鸽子谷机动", primaryPlaceId: "place-uchisar", destinationPlaceId: "place-pigeon", notes: ["按体力选择红线/绿线半日机动", "如果想轻松，改为格雷梅镇内咖啡和纪念品"] },
    { id: "item-20", date: "2026-05-05", startTime: "18:00", endTime: "19:30", type: "activity", title: "Love Valley / Sunset View Point 看日落", primaryPlaceId: "place-love-valley", notes: ["日落前到位，注意回程交通", "风大时避免太靠边拍照"] },
    { id: "item-21", date: "2026-05-06", startTime: "06:00", endTime: "06:30", type: "lodging", title: "King Apart Goreme 退房", primaryPlaceId: "place-king-apart", assetIds: ["asset-king-apart"], notes: ["退房窗口从 11:00-11:30；因早班机需提前和住宿确认钥匙/退房方式", "出门前检查护照、机票、充电器"] },
    { id: "item-22", date: "2026-05-06", startTime: "06:30", endTime: "07:30", type: "transport", title: "前往 NAV 卡帕多奇亚机场", primaryPlaceId: "place-king-apart", destinationPlaceId: "place-nav", notes: ["从格雷梅到 NAV 机场预留 50-60 分钟", "建议前一晚确认酒店接送或出租车"] },
    { id: "item-23", date: "2026-05-06", startTime: "08:30", endTime: "10:00", type: "transport", title: "NAV → IST · TK2001", primaryPlaceId: "place-nav", destinationPlaceId: "place-ist", assetIds: ["asset-flight-tk2001"], notes: ["返程国内段，提前确认机场交通、行李和登机口", "机票截图已放在凭证页"] }
  ],
  places: [
    { id: "place-saint-john", name: "Saint John Hotel", kind: "hotel", city: "塞尔丘克", address: "Isabey Mah. Sehit Polis Metin Tavaslioglu Cad. No:67 Izmir, 35920 Selcuk, Turkey", phone: "+90 232 892 63 22", imageUrl: "/assets/wiki/saint-john-place.jpg", imageCredit: "wiki 截图 · Booking 酒店页", ...hotelJumps.saintJohn },
    { id: "place-ephesus", name: "以弗所古城", kind: "attraction", city: "以弗所", address: "Ephesus Archaeological Site, Selcuk", imageUrl: scenicImages.ephesusLibrary, imageCredit: "Wikimedia Commons · Celsus Library", imageSourceUrl: imageSourceUrls.ephesusLibrary, guide: placeGuides.ephesus },
    { id: "place-salonika", name: "Salonika Suites", kind: "hotel", city: "厄吕代尼兹", address: "No. 12, 224 Sokak, Oludeniz, Fethiye, Mugla, Turkey 48340", imageUrl: "/assets/wiki/salonika-suites-place.jpg", imageCredit: "wiki 截图 · Agoda 酒店页", ...hotelJumps.salonika },
    { id: "place-oludeniz", name: "Oludeniz Beach", kind: "attraction", city: "厄吕代尼兹", address: "Ölüdeniz Beach and Blue Lagoon, Fethiye/Mugla, Turkey", imageUrl: scenicImages.oludenizLagoon, imageCredit: "Wikimedia Commons · Oludeniz", imageSourceUrl: imageSourceUrls.oludenizLagoon, guide: placeGuides.oludeniz },
    { id: "place-lycian", name: "Lycian Way Start Point", kind: "attraction", city: "费特希耶", address: "Lycian Way Trailhead, Fethiye", imageUrl: scenicImages.fethiyeValley, imageCredit: "Wikimedia Commons · Fethiye coast", imageSourceUrl: imageSourceUrls.fethiyeValley, guide: placeGuides.lycian },
    { id: "place-butterfly", name: "蝴蝶谷", kind: "attraction", city: "费特希耶", address: "Butterfly Valley, Fethiye", imageUrl: scenicImages.butterflyValley, imageCredit: "Wikimedia Commons · Butterfly Valley", imageSourceUrl: imageSourceUrls.butterflyValley, guide: placeGuides.butterfly },
    { id: "place-king-apart", name: "King Apart Goreme", kind: "hotel", city: "格雷梅", address: "Orta Mah. Kazim Eren Sok. No: 4, 50180 Goreme, Turkey", phone: "+90 534 327 34 50", imageUrl: scenicImages.goremeTown, imageCredit: "Wikimedia Commons · Goreme town", imageSourceUrl: imageSourceUrls.goremeTown, ...hotelJumps.kingApart },
    { id: "place-goreme-open-air", name: "格雷梅露天博物馆", kind: "attraction", city: "格雷梅", address: "Goreme Open Air Museum, Nevsehir", imageUrl: scenicImages.goremeValley, imageCredit: "Wikimedia Commons · Goreme Valley", imageSourceUrl: imageSourceUrls.goremeValley, guide: placeGuides.goremeOpenAir },
    { id: "place-uchisar", name: "乌奇萨城堡", kind: "attraction", city: "卡帕多奇亚", address: "Uchisar Castle, Nevsehir", imageUrl: scenicImages.uchisarCastle, imageCredit: "Wikimedia Commons · Uchisar Castle", imageSourceUrl: imageSourceUrls.uchisarCastle, guide: placeGuides.uchisar },
    { id: "place-pigeon", name: "鸽子谷", kind: "attraction", city: "卡帕多奇亚", address: "Pigeon Valley, Nevsehir", imageUrl: scenicImages.pigeonValley, imageCredit: "Wikimedia Commons · Pigeon Valley", imageSourceUrl: imageSourceUrls.pigeonValley, guide: placeGuides.pigeon },
    { id: "place-love-valley", name: "Love Valley", kind: "attraction", city: "卡帕多奇亚", address: "Love Valley, Goreme", imageUrl: scenicImages.loveValley, imageCredit: "Wikimedia Commons · Love Valley", imageSourceUrl: imageSourceUrls.loveValley, guide: placeGuides.loveValley },
    { id: "place-sunset", name: "Göreme Sunset View Point", kind: "attraction", city: "格雷梅", address: "Goreme Sunset View Point, Nevsehir", imageUrl: scenicImages.cappadociaBalloonClose, imageCredit: "Wikimedia Commons · Cappadocia balloons", imageSourceUrl: imageSourceUrls.cappadociaBalloonClose, guide: placeGuides.sunset },
    { id: "place-ist", name: "伊斯坦布尔机场 IST", kind: "transit", city: "伊斯坦布尔", address: "Istanbul Airport, Istanbul", imageUrl: scenicImages.istanbulAirport, imageCredit: "Wikimedia Commons · Istanbul Airport", imageSourceUrl: imageSourceUrls.istanbulAirport },
    { id: "place-adb", name: "伊兹密尔 阿德楠曼德列斯机场 ADB", kind: "transit", city: "伊兹密尔", address: "Izmir Adnan Menderes Airport", imageUrl: scenicImages.adnanMenderesAirport, imageCredit: "Wikimedia Commons · Adnan Menderes Airport", imageSourceUrl: imageSourceUrls.adnanMenderesAirport },
    { id: "place-antalya-otogar", name: "安塔利亚 Otogar", kind: "transit", city: "安塔利亚", address: "Antalya Otogar", imageUrl: scenicImages.antalyaOtogar, imageCredit: "Wikimedia Commons · Antalya Otogar", imageSourceUrl: imageSourceUrls.antalyaOtogar },
    { id: "place-goreme-otogar", name: "Göreme Otogarı", kind: "transit", city: "格雷梅", address: "Goreme Otogari, Nevsehir", imageUrl: scenicImages.goremeOtogar, imageCredit: "Wikimedia Commons · Goreme Bus Station", imageSourceUrl: imageSourceUrls.goremeOtogar },
    { id: "place-nav", name: "内夫谢希尔 卡帕多奇亚机场 NAV", kind: "transit", city: "内夫谢希尔", address: "Nevsehir Kapadokya Airport", imageUrl: scenicImages.nevsehirAirport, imageCredit: "Wikimedia Commons · Nevsehir Kapadokya Airport", imageSourceUrl: imageSourceUrls.nevsehirAirport }
  ],
  lodgings: [
    {
      id: "lodging-1",
      date: "2026-05-01",
      title: "Saint John Hotel",
      address: "Isabey Mah. Sehit Polis Metin Tavaslioglu Cad. No:67 Izmir, 35920 Selcuk, Turkey",
      phone: "+90 232 892 63 22",
      checkIn: "14:00-00:00",
      checkOut: "12:00 前",
      rooms: "2间客房",
      breakfast: "含早餐",
      total: "€170.10",
      assetId: "asset-saint-john"
    },
    {
      id: "lodging-2",
      date: "2026-05-02",
      title: "Salonika Suites",
      address: "No. 12, 224 Sokak, Oludeniz, Fethiye, Mugla, Turkey 48340",
      confirmationCode: "1714659219",
      checkIn: "2026-05-02",
      checkOut: "2026-05-03",
      room: "Family Suite",
      guests: "2名成人",
      roomCount: "1间",
      benefits: "快速入住、咖啡和茶、免费 WiFi",
      assetId: "asset-salonika"
    },
    {
      id: "lodging-3",
      date: "2026-05-04",
      title: "King Apart Goreme",
      address: "Orta Mah. Kazim Eren Sok. No: 4, 50180 Goreme, Turkey",
      keyPickup: "Aydinli Mahallesi Gungor Sokak No. 11, Goreme",
      phone: "+90 534 327 34 50",
      checkIn: "13:00-13:30",
      checkOut: "11:00-11:30",
      room: "1间公寓，含早餐",
      total: "€330.48",
      assetId: "asset-king-apart"
    },
    {
      id: "lodging-4",
      date: "2026-05-05",
      title: "King Apart Goreme",
      address: "Orta Mah. Kazim Eren Sok. No: 4, 50180 Goreme, Turkey",
      keyPickup: "Aydinli Mahallesi Gungor Sokak No. 11, Goreme",
      phone: "+90 534 327 34 50",
      checkIn: "已入住",
      checkOut: "5月6日早班机前确认退房方式",
      assetId: "asset-king-apart"
    }
  ],
  assets: [
    { id: "asset-saint-john", type: "image", title: "Saint John Hotel 订单确认截图", src: "/assets/wiki/saint-john-confirmation.jpg", tag: "住宿凭证", scope: "date", date: "2026-05-01" },
    { id: "asset-salonika", type: "image", title: "Salonika Suites Agoda 酒店预订确认单", src: "/assets/wiki/salonika-suites-confirmation.png", tag: "住宿凭证", scope: "date", date: "2026-05-02" },
    { id: "asset-king-apart", type: "image", title: "King Apart Goreme 订单确认截图", src: "/assets/wiki/king-apart-goreme-confirmation.jpg", tag: "住宿凭证", scope: "date", date: "2026-05-04" },
    { id: "asset-kamilkoc", type: "image", title: "KamilKoç Antalya → Göreme 夜巴票", src: "/assets/wiki/ticket-kamilkoc-antalya-goreme.jpg", tag: "交通凭证", scope: "date", date: "2026-05-03" },
    { id: "asset-flight-tk2320", type: "image", title: "TK2320 IST → ADB 机票截图", src: "/assets/wiki/flight-tk2320.jpg", tag: "交通凭证", scope: "date", date: "2026-05-01" },
    { id: "asset-flight-tk2001", type: "image", title: "TK2001 NAV → IST 机票截图", src: "/assets/wiki/flight-tk2001.jpg", tag: "交通凭证", scope: "date", date: "2026-05-06" }
  ],
  foodRecommendations: [
    { id: "food-1", dates: ["2026-05-01"], city: "伊兹密尔 / 以弗所", title: "Kumru 三明治", description: "伊兹密尔街头经典，转机后适合快速补能。", googleQuery: "Kumru sandwich Izmir", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Izmir%20kumru%20sandwich%201.jpg?width=960", imageCredit: "Wikimedia Commons · Izmir kumru" },
    { id: "food-2", dates: ["2026-05-01"], city: "塞尔丘克", title: "Gözleme 土耳其煎饼", description: "古城日轻食，适合配酸奶或茶。", googleQuery: "Gozleme Selcuk Turkey", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Gozleme%20at%20Manning%20Market.jpg?width=960", imageCredit: "Wikimedia Commons · Gözleme" },
    { id: "food-3", dates: ["2026-05-02", "2026-05-03"], city: "费特希耶", title: "海鲜与 meze", description: "海边晚餐优先选烤鱼、冷盘和清爽沙拉。", googleQuery: "Fethiye seafood meze restaurant", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Turkish%20Meze%20Plate.jpg?width=960", imageCredit: "Wikimedia Commons · Turkish meze" },
    { id: "food-4", dates: ["2026-05-02", "2026-05-03"], city: "厄吕代尼兹", title: "土耳其早餐", description: "滑翔伞前后都适合，注意别吃太撑。", googleQuery: "Oludeniz Turkish breakfast", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Turkish%20breakfast.jpg?width=960", imageCredit: "Wikimedia Commons · Turkish breakfast" },
    { id: "food-5", dates: ["2026-05-04", "2026-05-05"], city: "格雷梅", title: "Testi Kebab 瓦罐炖肉", description: "卡帕多奇亚招牌菜，适合作为到达后的正餐。", googleQuery: "Testi Kebab Goreme", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/TestiKebabGoreme.jpg?width=960", imageCredit: "Wikimedia Commons · Testi kebab" },
    { id: "food-6", dates: ["2026-05-05", "2026-05-06"], city: "格雷梅", title: "Menemen 与土耳其茶", description: "热气球日的轻早餐备选，节奏慢一点。", googleQuery: "Menemen Goreme breakfast", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Menemen%20%2849657982813%29.jpg?width=960", imageCredit: "Wikimedia Commons · Menemen" }
  ],
  restaurantLinks: [
    { id: "restaurant-goreme-kebab", title: "格雷梅 Testi Kebab 搜索", date: "2026-05-04", city: "格雷梅", url: "https://www.google.com/maps/search/?api=1&query=Testi%20Kebab%20Goreme", source: "google" },
    { id: "restaurant-fethiye-seafood", title: "费特希耶海鲜搜索", date: "2026-05-02", city: "费特希耶", url: "https://www.google.com/maps/search/?api=1&query=Fethiye%20seafood%20restaurant", source: "google" }
  ],
  links: [
    { id: "link-1", title: "MGM 土耳其官方天气", url: "https://www.mgm.gov.tr/eng/forecast-cities.aspx", tag: "天气" },
    { id: "link-2", title: "Open-Meteo 多模型预报", url: "https://open-meteo.com/", tag: "天气" }
  ]
};
