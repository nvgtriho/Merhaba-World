import test from "node:test";
import assert from "node:assert/strict";
import { parseMarkdownItinerary } from "../src/lib/markdownImporter.js";

const sample = `# 五一小土特种兵行动方针

| 日期 | 时间        | 行程                                                         |
| ---- | ----------- | ------------------------------------------------------------ |
| 5.1  | 8:10        | 到达伊斯坦布尔机场 IST                                       |
|      | 11:00-12:10 | 伊斯坦布尔机场 IST - 伊兹密尔 阿德楠曼德列斯 ADB TK2320 11:00-12:10 |
|      |             | 住宿 塞尔丘克 Saint John Hotel                               |
| 5.3  | 12:00-19:00 | 徒步利西亚之路<br />minibus或uber至起点Lycian Way Start Point<br />如果来不及，徒步至打卡点原路返回 |
`;

test("parses markdown table rows while carrying forward blank dates", () => {
  const result = parseMarkdownItinerary(sample, { year: 2026 });

  assert.equal(result.days.length, 2);
  assert.equal(result.items.length, 4);
  assert.equal(result.items[1].date, "2026-05-01");
  assert.equal(result.items[1].type, "transport");
  assert.equal(result.items[2].type, "lodging");
  assert.equal(result.items[3].notes.length, 3);
});

test("normalizes empty times and preserves human-readable titles", () => {
  const result = parseMarkdownItinerary(sample, { year: 2026 });

  assert.equal(result.items[2].startTime, null);
  assert.equal(result.items[2].title, "塞尔丘克 Saint John Hotel");
});
