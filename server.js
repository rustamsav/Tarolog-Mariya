import express from "express";
import cors from "cors";
import fs from "fs";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Загружаем отзывы из файла
function loadReviews() {
  try {
    return JSON.parse(fs.readFileSync("reviews.json", "utf8"));
  } catch {
    return [];
  }
}

// Сохраняем отзывы в файл
function saveReviews(reviews) {
  fs.writeFileSync("reviews.json", JSON.stringify(reviews, null, 2));
}

// Получить все отзывы
app.get("/reviews", (req, res) => {
  res.json(loadReviews());
});

// Сохранить новый отзыв
app.post("/send-review", (req, res) => {
  const { name, text } = req.body;
  if (!name || !text) {
    return res.status(400).json({ success: false, message: "Имя и отзыв обязательны" });
  }

  const reviews = loadReviews();
  reviews.push({ name, text });
  saveReviews(reviews);

  // Отправка в Telegram
  const message = `📝 Новый отзыв!\n\n👤 Имя: ${name}\n💬 Отзыв: ${text}`;
  fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text: message }),
  }).catch(console.error);

  res.json({ success: true });
});

// Сообщение с формы контакта
app.post("/send-contact", (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email) {
    return res.status(400).json({ success: false, message: "Имя и email обязательны" });
  }

  const textMsg = `📩 Новое сообщение!\n\n👤 Имя: ${name}\n📧 Email: ${email}\n💬 Сообщение: ${message}`;
  fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text: textMsg }),
  }).catch(console.error);

  res.json({ success: true });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на порту ${PORT}`);
});
