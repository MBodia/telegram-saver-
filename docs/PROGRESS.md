# Telegram Saver — Прогрес і поточний стан

> Останнє оновлення: 2026-05-04

---

## Архітектура проєкту

```
telegram-saver/          ← Next.js 16 + TypeScript (деплой: Vercel)
├── app/
│   ├── page.tsx         ← Лендінг
│   ├── login/page.tsx   ← Сторінка входу
│   ├── dashboard/page.tsx ← Дашборд
│   ├── item/[id]/page.tsx ← Деталі збереження
│   └── api/
│       ├── auth/login   ← Вхід за кодом від бота
│       ├── auth/bot-code ← Вхід через форму (POST)
│       ├── auth/telegram ← Telegram Widget (legacy)
│       ├── auth/logout  ← Вихід
│       ├── auth/dev-login ← Dev-вхід (тільки у .env)
│       └── items/[id]   ← PATCH (favorite), DELETE
├── components/
│   ├── SavedItemsList.tsx ← Список збережень + фільтри (client)
│   ├── BotCodeForm.tsx  ← Форма введення 6-значного коду
│   ├── TagsSection.tsx  ← Управління тегами на /item/[id]
│   ├── DeleteButton.tsx ← Видалення зі сторінки деталей
│   └── DevLoginButton.tsx ← Dev-кнопка входу
└── lib/
    ├── session.ts       ← Cookie-сесія (ts_session, 30 днів)
    └── supabase/        ← admin/server/client клієнти

telegram-saver-bot/src/  ← grammY (деплой: Railway)
├── index.ts             ← Webhook entrypoint
├── bot.ts               ← Збирає всі handlers
├── commands.ts          ← /start, /help, /list
├── auth.ts              ← /login (генерує код + inline кнопка)
├── handlers.ts          ← Обробники всіх типів повідомлень
├── claude.ts            ← Всі виклики Claude API
└── supabase.ts          ← Supabase client + типи
```

---

## База даних (Supabase)

| Таблиця | Призначення |
|---------|-------------|
| `profiles` | Telegram-користувачі (id, username, first_name, photo_url) |
| `saved_items` | Всі збереження (link/photo/pdf/text/forward/voice/audio) |
| `tags` | Словник тегів з кольором |
| `item_tags` | Зв'язок збережень з тегами |
| `media_files` | Фото-файли альбомів, аудіо (storage_path, extracted_text, vision_description) |
| `login_codes` | Тимчасові коди входу (10 хв TTL, one-time use) |

**Supabase Storage:** bucket `media` — фото (`photos/`), PDF (`pdfs/`), аудіо (`audio/`)

---

## Що реалізовано

### Етап 1 — Базовий сайт ✅
- Next.js 16, TypeScript, TailwindCSS
- Лендінг з описом продукту
- Деплой на Vercel

### Етап 2 — База даних ✅
- Supabase: 6 таблиць + Storage bucket
- RLS-політики для всіх таблиць
- Схема: `docs/database.sql`

### Етап 2a — Авторизація через Telegram ✅
- Вхід через бота: `/login` → 6-значний код → кнопка «Увійти на сайт» або ручне введення
- Верифікація коду на сайті (`/api/auth/login`) — one-time use, 10 хв TTL
- Cookie-сесія (`ts_session`, 30 днів)
- Захищені сторінки: `/dashboard`, `/item/[id]`
- Dev-логін для розробки (через `.env`)

### Етап 3 — Telegram-бот (базова структура) ✅
- Фреймворк: grammY
- Команди: `/start` (реєстрація + фото профілю), `/help`, `/list` (останні 5 збережень), `/login`
- Деплой на Railway

### Етап 4 — Збереження посилань і тексту ✅
- Бот розпізнає URL, парсить через `@mozilla/readability` + JSDOM
- Підтримка Telegram-постів (embed API + `t.me/s/channel`)
- Підтримка YouTube (YouTube Data API v3 — назва, опис, теги)
- Тип `text` — звичайні повідомлення
- Тип `forward` — пересилки з каналів (`forward_origin`)

### Етап 5 — Claude AI ✅
- Модель: `claude-haiku-4-5-20251001`
- Prompt caching (`cache_control: ephemeral`) на всіх запитах
- `analyzeLinkContent` — резюме з конкретними фактами + тема + теги
- `analyzeText` — тема + ключова думка + теги для тексту/reposts
- `analyzeImage` — OCR (extracted_text) + опис (description) через Vision
- `summarizePdf` — резюме PDF у 3-5 речень
- `summarizeTranscript` — резюме транскрипції голосових/аудіо
- Сторінка деталей `/item/[id]` — резюме, повний текст, теги, джерело

### Дашборд — UX-функції ✅
- **★ Обрані** — зірочка на кожній картці, миттєво зберігається
- **Видалення** прямо з картки без переходу на деталь
- **Режим вибору** — чекбокси + панель масових дій (видалити / додати в обрані)
- **Фільтри**: за типом, тегом, датою (сьогодні/тиждень/місяць), тільки обрані
- **Пошук** по title, summary, description, full_text (включно з OCR-текстом)
- **Мініатюри** фото 64×64 на картках дашборду

### Етап 6 — Обробка зображень ✅
- **Одиночне фото**: Claude Vision → OCR + опис → Storage → `media_files`
- **Альбоми**: буфер `albumBuffer` + таймер 1.5 сек → кожне фото аналізується окремо → усі в `media_files`, одне `saved_items` на альбом
- **Фото-документ** (без стиснення): аналогічно одиночному
- **Сторінка деталей**: галерея для альбому, одне фото для одиночного, OCR-тексти по кожному фото альбому

### Етап 7 — PDF, теги, розширений пошук ✅
- **PDF**: `pdf-parse` → Claude summary → Storage → кнопка «Відкрити PDF» на сайті
- **Ручне створення тегів**: форма «Додати тег» на `/item/[id]`
- **AI-пропоновані теги**: кнопка «Прийняти» для тегів від Claude
- **Фільтр за датою**: сьогодні / тиждень / місяць на дашборді

### Етап 8 — Голосові та аудіо-повідомлення ✅
- **Голосові** (`.ogg`): OpenAI Whisper (whisper-1) → транскрипція → Claude резюме → Storage → тип `voice`
- **Аудіо-файли** (`.mp3`, `.m4a`): аналогічно, підтримка кількох форматів
- **Сторінка деталей**: HTML5 `<audio>` програвач
- **Дашборд**: іконки 🎙️ / 🎵 у фільтрах і картках
- **Транскрипція** зберігається в `full_text`, відображається як «Транскрипція» на `/item/[id]`

### UI — Дизайн і полірування ✅ (2026-05-04)
**Лендінг:**
- Темна тема (Syne + Playfair Display), grid-текстура, плаваюча chat-mockup
- Stagger-анімації вльоту (fadeSlideUp 36px)
- CTA: hover підйом + золота тінь, active scale(0.97)
- Картки фіч: ліва золота рамка + тінь на hover
- Кроки «Як це працює»: з'єднувальні лінії між номерами (десктоп)

**Логін:**
- Split-layout (ліва панель брендингу, права — форми)
- Telegram-кнопка: великий padding, hover підйом, focus ring
- Method cards: hover lift + тінь
- Gradient divider, більші step-нумери
- Мобільний hero-блок коли ліва панель прихована

**Дашборд:**
- Аватар з золотим свіченням box-shadow
- Лічильник збережень у золотому бейджі
- Пошук: іконка ⌕ всередині інпуту
- Картки: підйом translateY(-2px) + тінь, badge золотіє на hover
- Порожній стан фільтрів: блок із 🔍 і підказкою
- Bulk action bar: темніший фон, більший border-radius

---

## Поточний стан: MVP повністю завершено ✅

Всі 8 етапів реалізовано. Продукт готовий до реального використання.

**Що вміє бот (повний список):**
| Тип повідомлення | Що робить |
|-----------------|-----------|
| Текст без URL | Зберігає як нотатку, Claude аналізує тему + теги |
| URL | Парсить сторінку (Readability / Telegram embed / YouTube API) → Claude резюме + теги |
| Фото | Claude Vision: OCR + опис → Supabase Storage |
| Альбом фото | Буфер 1.5 сек → кожне фото аналізується окремо |
| PDF | pdf-parse → Claude резюме → Storage → посилання на сайті |
| Пересилання | Зберігає текст + джерело → Claude аналіз |
| Голосове | OpenAI Whisper транскрипція → Claude резюме → Storage |
| Аудіофайл | Аналогічно голосовому, mp3/m4a |

---

## Ідеї після MVP (не зараз)

- Експорт у Notion / Obsidian
- Платні плани (Stripe)
- Мобільний додаток
- Автоматичне виявлення дублікатів
- Спільні папки / командна робота
- Відео-повідомлення (через Whisper для аудіо-доріжки)
- Push-нотифікації коли AI завершив обробку

---

## Бюджет

| Сервіс | Вартість |
|--------|----------|
| Vercel | безкоштовно |
| Supabase | безкоштовно (Free tier) |
| Railway | ~$5/міс |
| Claude API (text) | ~$1–3/міс |
| Claude API (vision) | ~$2–5/міс |
| OpenAI (Whisper) | ~$0.50–2/міс |
| YouTube Data API | безкоштовно (Free tier) |
| **Разом** | **~$9–17/міс** |
