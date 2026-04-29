export function createAssistantLinks(prompt, userAgent = "") {
  return [
    { id: "copy-prompt", label: "复制提示词", kind: "copy", prompt },
    { id: "chatgpt-app", label: "ChatGPT App", kind: "app", href: "chatgpt://" },
    { id: "gemini-app", label: "Gemini App", kind: "app", href: createGeminiAppLink(userAgent) }
  ];
}

export function createClockReminderLink() {
  return "clock-alarm://";
}

function createGeminiAppLink(userAgent) {
  if (/Android/i.test(userAgent)) {
    return "intent://gemini.google.com/#Intent;scheme=https;package=com.google.android.apps.bard;end";
  }
  return "googlegemini://";
}
