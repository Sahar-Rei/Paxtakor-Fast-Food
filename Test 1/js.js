const phoneDigits = phone.replace(/\D/g, ""); // оставляет только цифры

// Проверка длины (12 цифр: 998XXXXXXXXX) и валидных кодов Узбекистана
const uzbekCodes = ["90", "91", "93", "94", "95", "97", "98", "99", "33", "88", "77", "50"];
const operatorCode = phoneDigits.substring(3, 5);

if (phoneDigits.length !== 12 || !phoneDigits.startsWith("998")) {
  return showError("Введите полный номер телефона в формате +998 XX XXX XX XX");
}

if (!uzbekCodes.includes(operatorCode)) {
  return showError("Указан некорректный код оператора Узбекистана.");
}


const COOLDOWN_MINUTES = 10; 

$("form").addEventListener("submit", async ev => {
  ev.preventDefault();
  $("error").classList.add("hidden");

  // 1. Проверка на спам из одного браузера
  const lastSubmit = localStorage.getItem("last_order_time");
  const now = Date.now();

  if (lastSubmit && (now - lastSubmit) < COOLDOWN_MINUTES * 60 * 1000) {
    const minutesLeft = Math.ceil((COOLDOWN_MINUTES * 60 * 1000 - (now - lastSubmit)) / 60000);
    return showError(`Вы уже отправили заказ! Повторный заказ можно сделать через ${minutesLeft} мин.`);
  }

  // ... дальше идет твой существующий код валидации (проверка имени, телефона и т.д.) ...

  try {
  // Отправка сообщения в Telegram
  const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: "Новый заказ!" // или твоя переменная с текстом заказа
    })
  });

  const d = await r.json();
  if (!d.ok) throw new Error(d.description);

  // 2. Успешно отправлено — запоминаем время отправки
  localStorage.setItem("last_order_time", Date.now());

  $("#modal").classList.remove("hidden");
  $("#form").reset();
  $("#phone").value = "+998 ";
  Object.keys(cart).forEach(k => delete cart[k]);
  update();

} catch (err) {
  showError("Ошибка отправки.");
}

});
