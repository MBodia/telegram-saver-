# Telegram Saver — Стан проекту

> Документ описує що вже побудовано, як це працює і куди рухаємось далі.
> Оновлено: 2026-05-03

---

## Що це за проект

**Telegram Saver** — SaaS-додаток для збереження та пошуку контенту з Telegram.

Складається з двох окремих сервісів:

| Сервіс | Технологія | Хостинг | Репозиторій |
|--------|-----------|---------|-------------|
| Веб-сайт `telegram-saver.vercel.app` | Next.js 14 | Vercel | окремий проект |
| Telegram-бот `@AI_hol228MBot` | Node.js + grammY | Railway | **цей репозиторій** |

Обидва сервіси працюють зі **спільною базою Supabase** — читають і пишуть в одні й ті самі таблиці.

---

## Розташування на локальній машині

```
Desktop/
└── projects/                               ← папка всіх проектів
    └── telegram-saver-bot/                 ← цей репозиторій
        │
        ├── src/                            ← весь вихідний код (TypeScript)
        │   ├── index.ts                    — точка входу, запуск Long Polling
        │   ├── bot.ts                      — ініціалізація Bot, підключення модулів
        │   ├── commands.ts                 — команди /start, /help, /list
        │   ├── auth.ts                     — команда /login (код для входу на сайт)
        │   ├── handlers.ts                 — вся логіка обробки повідомлень
        │   │                                 fetchPageData, fetchTelegramPostData,
        │   │                                 fetchYouTubeData, tgParseText
        │   ├── claude.ts                   — всі виклики Claude API
        │   │                                 analyzeLinkContent, analyzeText,
        │   │                                 analyzeImage, summarizePdf
        │   └── supabase.ts                 — клієнт Supabase + TypeScript типи
        │
        ├── doc/                            ← документація проекту
        │   ├── bot-plan.md                 — початковий план (Етап 3)
        │   ├── Telegram_Saver_Spec_v2.md   — повна специфікація проекту
        │   └── PROJECT_STATUS.md           — цей файл
        │
        ├── dist/                           — скомпільований JS (генерується tsc, не в git)
        ├── node_modules/                   — залежності npm (не в git)
        ├── .env.example                    — приклад змінних середовища
        ├── .gitignore
        ├── railway.toml                    — конфіг деплою на Railway
        ├── package.json                    — залежності та скрипти (build, start)
        └── tsconfig.json                   — конфіг TypeScript компілятора
```

---

## Як працює Telegram-бот

```
Користувач у Telegram
        │
        │  надсилає повідомлення
        ▼
┌──────────────────────┐
│    Telegram API      │  Long Polling — бот постійно "слухає" нові повідомлення
└──────────┬───────────┘
           │
           ▼
┌──────────────────────────────────────────────┐
│                  bot.ts                       │
│   registerCommands()                          │
│   registerAuthCommands()                      │
│   registerHandlers()                          │
└──────────┬───────────────────────────────────┘
           │
           ├── Команди (/start /help /list /login)
           │        └── commands.ts / auth.ts → Supabase → відповідь
           │
           └── Будь-яке інше повідомлення → handlers.ts
                        │
                        ├── Forward (переслане з каналу)
                        │       └── analyzeText() → summary + теги → Supabase
                        │
                        ├── Фото
                        │       ├── download з Telegram API
                        │       ├── upload → Supabase Storage
                        │       └── analyzeImage() → OCR + опис → Supabase
                        │
                        ├── Документ
                        │       ├── PDF → pdf-parse → summarizePdf() → Supabase
                        │       └── Зображення-файл → analyzeImage() → Supabase
                        │
                        └── Текст
                                │
                                ├── Містить URL? ─── YES ──→ fetchPageData(url)
                                │                               │
                                │                               ├── t.me/channel/123
                                │                               │     └── embed парсинг (regex)
                                │                               │         + витяг фото з поста
                                │                               │         + YouTube API якщо є yt-лінк
                                │                               │
                                │                               ├── youtube.com / youtu.be
                                │                               │     └── YouTube Data API v3
                                │                               │
                                │                               └── Будь-який інший сайт
                                │                                     └── fetch + Readability
                                │
                                │                    + є фото? → analyzeImage()
                                │                    └── analyzeLinkContent() → summary + теги
                                │
                                └── Немає URL ──→ analyzeText() → summary + теги
                                                        │
                                                        └── Supabase → saved_items
```

---

## Що вже побудовано

### Інфраструктура
- [x] Бот запущений 24/7 на Railway
- [x] Long Polling — стабільна робота без webhook
- [x] Спільна база Supabase з веб-сайтом
- [x] Захист від подвійного запуску (один інстанс)

### Команди бота
- [x] `/start` — реєстрація профілю в базі, кнопка-посилання на сайт
- [x] `/help` — список всіх можливостей
- [x] `/list` — останні 5 збережень з типами і датами
- [x] `/login` — одноразовий 6-значний код для входу на сайт

### Типи контенту
- [x] **Текст** → Claude аналізує тему, ключову думку, пропонує теги
- [x] **Посилання** → парсинг сторінки + AI-резюме + теги
- [x] **Фото** → upload в Supabase Storage + Claude Vision (OCR + опис)
- [x] **PDF** → витяг тексту через pdf-parse + резюме
- [x] **Forward** → зберігає текст + аналіз + назву джерела

### Спеціальна обробка посилань
- [x] **YouTube** — YouTube Data API v3: назва відео, опис, теги автора
- [x] **Telegram пост** (`t.me/channel/id`) — regex-парсинг тексту через embed
- [x] **Telegram пост з фото** — витяг URL зображення + Claude Vision
- [x] **YouTube лінк у тексті Telegram поста** — автовизначення та аналіз відео
- [x] **Fallback** — якщо сторінка недоступна, Claude аналізує за URL

### Якість AI-аналізу
- [x] Summary з конкретними фактами (імена, події — без абстракцій)
- [x] Розпізнавання відомих осіб на фото
- [x] Визначення типу зображення (прев'ю YouTube / скріншот / фото / мем)

---

## Змінні середовища (Railway → Variables)

| Змінна | Призначення |
|--------|-------------|
| `TELEGRAM_BOT_TOKEN` | Токен бота від @BotFather |
| `SUPABASE_URL` | URL проекту Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role ключ Supabase |
| `ANTHROPIC_API_KEY` | Claude API (Haiku) |
| `YOUTUBE_API_KEY` | YouTube Data API v3 (Google Cloud Console) |
| `SITE_URL` | URL сайту для кнопки у відповіді /start |

---

## Claude API — моделі та використання

| Функція | Модель | Max tokens |
|---------|--------|------------|
| Аналіз посилання | `claude-haiku-4-5-20251001` | 600 |
| Аналіз тексту | `claude-haiku-4-5-20251001` | 512 |
| Аналіз зображення | `claude-haiku-4-5-20251001` | 1024 |
| Резюме PDF | `claude-haiku-4-5-20251001` | 512 |

Haiku — найдешевша модель Claude, повністю достатня для задач бота.
Prompt caching увімкнено через `cache_control: ephemeral` на system prompt.

---

## База даних — таблиця `saved_items`

| Поле | Тип | Що зберігається |
|------|-----|-----------------|
| `id` | uuid | унікальний ідентифікатор |
| `user_id` | uuid | FK → profiles |
| `type` | enum | `link` / `pdf` / `photo` / `text` / `forward` |
| `source_url` | text | URL посилання або `t.me/...` |
| `title` | text | Назва сторінки / відео / канал |
| `description` | text | Коментар користувача (якщо є) |
| `full_text` | text | Повний текст статті або поста |
| `summary` | text | AI-резюме 2-3 речення |
| `ai_analysis` | jsonb | `{topic, suggested_tags}` або `{key_idea, suggested_tags}` |
| `created_at` | timestamp | Дата збереження |

---

## Куди рухаємось далі

### Залишилось з MVP (Spec v2, Етап 7):
- [ ] Пошук на сайті по `title`, `summary`, `full_text`
- [ ] Фільтри за типом контенту і датою
- [ ] Альбоми фото (кілька фото в одному пості) → таблиця `media_files`
- [ ] End-to-end тестування всіх сценаріїв

### Технічний борг:
- [ ] Оновити Node.js 18 → 20 в Railway (є попередження від supabase-js)
- [ ] Telegram пости з відео — наразі аналізується тільки текст і фото

### Потенційні покращення бота:
- [ ] Команда `/search <запит>` — пошук прямо в боті без сайту
- [ ] Кешування аналізу однакових URL (не витрачати API двічі)
- [ ] Telegram приватні канали (потребує MTProto або UserBot)

---

## Бюджет (поточний)

| Сервіс | Вартість |
|--------|----------|
| Vercel (сайт) | $0 |
| Supabase | $0 (free tier) |
| Railway (бот) | ~$5/міс |
| Claude API (Haiku) | ~$1–3/міс |
| YouTube Data API | $0 (10k запитів/день безкоштовно) |
| **Разом** | **~$6–8/міс** |
