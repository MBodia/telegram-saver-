# Telegram Saver — Стан проекту

> Документ описує що вже побудовано, як це працює і куди рухаємось далі.
> Оновлено: 2026-05-06

---

## Що це за проект

**Telegram Saver** — SaaS-додаток для збереження та пошуку контенту з Telegram.

Складається з двох окремих сервісів:

| Сервіс | Технологія | Хостинг | Репозиторій |
|--------|-----------|---------|-------------|
| Веб-сайт `telegram-saver.vercel.app` | Next.js 16 | Vercel | `telegram-saver` |
| Telegram-бот `@AI_hol228MBot` | Node.js + grammY | Railway | `telegram-saver-bot` |

Обидва сервіси працюють зі **спільною базою Supabase** — читають і пишуть в одні й ті самі таблиці.

---

## Розташування на локальній машині

```
Desktop/
└── projects/
    ├── telegram-saver/          ← Next.js фронтенд (Vercel)
    │   ├── app/
    │   ├── components/
    │   ├── lib/
    │   ├── scripts/
    │   └── docs/
    │
    └── telegram-saver-bot/      ← Telegram бот (Railway)
        └── src/
            ├── index.ts
            ├── bot.ts
            ├── commands.ts
            ├── auth.ts
            ├── handlers.ts
            ├── claude.ts
            └── supabase.ts
```

---

## Як працює система

```
Користувач у Telegram
        │
        │  надсилає повідомлення
        ▼
┌──────────────────────┐
│    Telegram API      │  Long Polling
└──────────┬───────────┘
           ▼
       handlers.ts
           │
           ├── Голосове/Аудіо → Whisper → Claude → saved_items + embedding
           ├── Фото/Альбом    → Storage → Claude Vision → saved_items + embedding
           ├── PDF            → pdf-parse → Claude → saved_items + embedding
           ├── Forward        → Claude → saved_items + embedding
           ├── Посилання      → fetchPageData → Claude → saved_items + embedding
           └── Текст          → Claude → saved_items + embedding

Користувач у браузері
        │
        ▼
    dashboard (Next.js)
        │
        ├── Звичайний пошук → client-side includes()
        └── AI пошук → /api/search → OpenAI embedding → pgvector → результати
```

---

## Що реалізовано — повний список

### Інфраструктура
- [x] Бот запущений 24/7 на Railway
- [x] Long Polling — стабільна робота без webhook
- [x] Спільна база Supabase з веб-сайтом
- [x] TypeScript, компіляція через tsc

### Команди бота
- [x] `/start` — реєстрація профілю, аватар → Supabase Storage, кнопка на сайт
- [x] `/help` — список можливостей
- [x] `/list` — останні 5 збережень з типами і датами
- [x] `/login` — одноразовий 6-значний код для входу на сайт

### Типи контенту

| Тип | Іконка | Що робить бот |
|-----|--------|---------------|
| `text` | 📝 | Claude: тема + ключова думка + теги |
| `link` | 🔗 | Парсинг сторінки + AI-резюме + теги |
| `photo` | 🖼️ | Supabase Storage + Claude Vision: OCR + опис |
| `pdf` | 📄 | pdf-parse + Claude: резюме документа |
| `forward` | ↩️ | Текст + аналіз + назва джерела |
| `voice` | 🎙️ | Whisper транскрипція + Claude резюме + Storage |
| `audio` | 🎵 | Whisper транскрипція + Claude резюме + Storage |

### Спеціальна обробка посилань
- [x] **YouTube** — YouTube Data API v3: назва, опис, теги
- [x] **Telegram пост** (`t.me/channel/id`) — regex-парсинг через embed
- [x] **Telegram пост з фото** — витяг URL зображення + Vision
- [x] **YouTube лінк у тексті Telegram поста** — авто-визначення + аналіз відео
- [x] **Fallback** — якщо сторінка недоступна, Claude аналізує за URL

### Аудіо
- [x] Голосові повідомлення (.ogg) — без конвертації, Whisper підтримує напряму
- [x] Аудіофайли (.mp3, .m4a) — авто-визначення mime-типу
- [x] Мова транскрипції: `uk` (українська)
- [x] Fallback: якщо Whisper не спрацював — зберігає без транскрипта
- [x] Оригінальний файл зберігається у `audio/` в Supabase Storage

### Семантичний пошук (додано 2026-05-05)
- [x] pgvector extension в Supabase
- [x] Колонка `embedding vector(1536)` в `saved_items`
- [x] Функція `search_items()` — cosine similarity через ivfflat індекс
- [x] Бот генерує embedding для **кожного нового збереження** (всі 8 типів)
- [x] Backfill-скрипт для існуючих збережень (`scripts/backfill-embeddings.ts`)
- [x] API route `POST /api/search` — OpenAI `text-embedding-3-small`
- [x] UI toggle "ТЕКСТ / AI" в дашборді
- [x] AI-пошук: кнопка "ЗНАЙТИ", бейдж схожості (87%), стан завантаження

### Якість AI-аналізу
- [x] Summary з конкретними фактами (без абстракцій)
- [x] Розпізнавання відомих осіб на фото
- [x] Визначення типу зображення (прев'ю YouTube / скріншот / фото / мем)
- [x] Prompt caching через `cache_control: ephemeral`

---

## Веб-сайт (telegram-saver) — що реалізовано

- [x] Авторизація через Telegram + /login код
- [x] Dashboard: список збережень з фільтрами (тип, теги, дата, пошук, обране)
- [x] AI-пошук з бейджем схожості
- [x] Сторінка елемента: тип-специфічне відображення
  - Фото: одиночне або сітка альбому
  - PDF: кнопка "Відкрити PDF"
  - Голос/Аудіо: `<audio>` плеєр + блок "Транскрипція"
  - Текст/Посилання: summary + full_text
- [x] Теги: додавання, кольори, AI-пропозиції
- [x] Обране (is_favorite)
- [x] Видалення окремих елементів або масово
- [x] Аватар користувача з Telegram (зберігається в Supabase Storage — не протухає)

---

## Змінні середовища

### Bot (Railway → Variables)

| Змінна | Призначення |
|--------|-------------|
| `TELEGRAM_BOT_TOKEN` | Токен бота від @BotFather |
| `SUPABASE_URL` | URL проекту Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role ключ |
| `ANTHROPIC_API_KEY` | Claude API (Haiku) |
| `OPENAI_API_KEY` | OpenAI Whisper + Embeddings |
| `YOUTUBE_API_KEY` | YouTube Data API v3 (опційно) |
| `SITE_URL` | URL сайту для кнопки /start |

### Frontend (Vercel → Environment Variables)

| Змінна | Призначення |
|--------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon ключ |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role ключ |
| `OPENAI_API_KEY` | OpenAI Embeddings для /api/search |

---

## Claude API — моделі та функції

| Функція | Модель | Max tokens |
|---------|--------|------------|
| Аналіз посилання | `claude-haiku-4-5-20251001` | 600 |
| Аналіз тексту | `claude-haiku-4-5-20251001` | 512 |
| Аналіз зображення | `claude-haiku-4-5-20251001` | 1024 |
| Резюме PDF | `claude-haiku-4-5-20251001` | 512 |
| Резюме транскрипції | `claude-haiku-4-5-20251001` | 512 |

---

## База даних

### Таблиця `saved_items`

| Поле | Тип | Що зберігається |
|------|-----|-----------------|
| `id` | uuid | унікальний ідентифікатор |
| `user_id` | uuid | FK → profiles |
| `type` | enum | `link` / `pdf` / `photo` / `text` / `forward` / `voice` / `audio` |
| `source_url` | text | URL посилання |
| `storage_path` | text | шлях у Supabase Storage |
| `title` | text | Назва / перші слова резюме |
| `description` | text | Коментар користувача |
| `full_text` | text | Текст статті / транскрипція аудіо |
| `summary` | text | AI-резюме 2-3 речення |
| `ai_analysis` | jsonb | `{topic, suggested_tags}` |
| `embedding` | vector(1536) | OpenAI embedding для семантичного пошуку |
| `created_at` | timestamp | Дата збереження |

### SQL-міграції (вже виконані)
```sql
ALTER TYPE public.item_type ADD VALUE IF NOT EXISTS 'voice';
ALTER TYPE public.item_type ADD VALUE IF NOT EXISTS 'audio';
CREATE EXTENSION IF NOT EXISTS vector;
ALTER TABLE saved_items ADD COLUMN embedding vector(1536);
CREATE INDEX ON saved_items USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

---

## Бюджет (поточний)

| Сервіс | Вартість |
|--------|----------|
| Vercel (сайт) | $0 |
| Supabase | $0 (free tier) |
| Railway (бот) | ~$5/міс |
| Claude API (Haiku) | ~$1–3/міс |
| OpenAI Whisper | ~$0.60/міс |
| OpenAI Embeddings | ~$0.01/міс (мізер) |
| YouTube Data API | $0 |
| **Разом** | **~$7–9/міс** |

---

## Що залишилось

### Технічний борг
- [ ] Оновити Node.js 18 → 20 в Railway
- [ ] Telegram пости з відео — наразі тільки текст і фото

### Потенційні покращення
- [ ] Команда `/search <запит>` — AI-пошук прямо в боті
- [ ] Кешування однакових URL (не витрачати API двічі)
- [ ] Telegram приватні канали (MTProto / UserBot)
- [ ] Відео-повідомлення (video_note, video)
- [ ] Пагінація на дашборді (зараз вантажяться всі елементи)
- [ ] Автооновлення аватара при кожному `/start` (вже є) + кнопка "Оновити фото" в профілі
