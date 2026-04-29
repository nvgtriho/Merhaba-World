export function createAssistantLinks(prompt, userAgent = "") {
  const encodedPrompt = encodeURIComponent(prompt);
  return [
    { id: "copy-prompt", label: "复制提示词", kind: "copy", prompt },
    { id: "chatgpt-link", label: "复制并打开 ChatGPT", kind: "assistant", href: `https://chatgpt.com/?q=${encodedPrompt}`, prompt },
    { id: "gemini-link", label: "复制并打开 Gemini", kind: "assistant", href: "https://gemini.google.com/app", prompt }
  ];
}

export function createClockReminderLink(day, items = [], userAgent = "") {
  if (!/Android/i.test(userAgent)) return "";
  const reminder = createReminderPayload(day, items);
  return [
    "intent:#Intent",
    "action=android.intent.action.SET_ALARM",
    `S.android.intent.extra.alarm.MESSAGE=${encodeURIComponent(reminder.message)}`,
    `i.android.intent.extra.alarm.HOUR=${reminder.hour}`,
    `i.android.intent.extra.alarm.MINUTES=${reminder.minutes}`,
    "B.android.intent.extra.alarm.SKIP_UI=false",
    "end"
  ].join(";");
}

export function createClockReminderNote(day, items = []) {
  const reminder = createReminderPayload(day, items);
  return `${String(reminder.hour).padStart(2, "0")}:${String(reminder.minutes).padStart(2, "0")} ${reminder.message}`;
}

function createReminderPayload(day, items) {
  const firstTimedItem = items.find((item) => /^\d{1,2}:\d{2}$/.test(item.startTime ?? ""));
  const [hour = "9", minutes = "0"] = String(firstTimedItem?.startTime ?? "09:00").split(":");
  const title = firstTimedItem?.title ?? day?.title ?? "今日行程";
  const city = day?.city ? ` · ${day.city}` : "";
  return {
    hour: Number(hour),
    minutes: Number(minutes),
    message: `${day?.title ?? "今日"}${city}：${title}`
  };
}
