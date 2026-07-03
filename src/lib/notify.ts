// Уведомления. На время демо работает локально: если заданы переменные окружения
// TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID — отправит в Telegram; иначе просто логирует
// в консоль сервера и возвращает успех. Никаких обязательных внешних сервисов.

export async function notify(title: string, lines: string[]): Promise<void> {
  const text = `*${title}*\n` + lines.join("\n");

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    // Демо-режим: интеграции не настроены — просто печатаем в консоль.
    console.log("\n[MUWA notify — демо, Telegram не настроен]\n" + text + "\n");
    return;
  }

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
    });
  } catch (e) {
    console.error("[MUWA notify] Telegram error:", e);
  }
}
