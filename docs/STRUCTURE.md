# Структура проєктів Telegram Saver

Два окремих проєкти, спільна база даних Supabase.

---

## Де що знаходиться

```
C:\Users\bodia\Desktop\projects\
├── telegram-saver\          ← Веб-сайт (Next.js) → деплой на Vercel
└── telegram-saver-bot\      ← Telegram-бот (Node.js) → деплой на Railway
```

---

## Проєкт 1: telegram-saver (сайт)

**Стек:** Next.js 16 · TypeScript · TailwindCSS · Supabase

```
telegram-saver/
│
├── app/                          # Всі сторінки і API
│   ├── page.tsx                  # Головна (лендінг)
│   ├── login/page.tsx            # Сторінка входу
│   ├── dashboard/page.tsx        # Дашборд зі збереженнями ← головна сторінка
│   ├── item/[id]/page.tsx        # Деталі одного збереження
│   └── api/                      # API-маршрути (backend)
│       ├── auth/
│       │   ├── telegram/route.ts # Верифікація Telegram Login Widget
│       │   ├── login/route.ts    # Перевірка коду від бота
│       │   ├── bot-code/route.ts # Генерація коду для входу через бота
│       │   └── logout/route.ts   # Вихід з акаунту
│       ├── items/[id]/
│       │   ├── route.ts          # DELETE і PATCH збереження
│       │   └── tags/route.ts     # Додавання/видалення тегів
│       └── health/route.ts       # Перевірка підключення до Supabase
│
├── components/                   # Компоненти React
│   ├── SavedItemsList.tsx        # Список карток зі збереженнями ← основний UI
│   ├── TagsSection.tsx           # Теги на сторінці деталей
│   ├── DeleteButton.tsx          # Кнопка видалення (на сторінці деталей)
│   ├── BotCodeForm.tsx           # Форма для входу через код бота
│   └── TelegramLoginButton.tsx   # Кнопка Telegram Login Widget
│
├── lib/                          # Утиліти
│   ├── session.ts                # Читання/запис cookie-сесії
│   └── supabase/
│       ├── admin.ts              # Клієнт з service_role (для API routes)
│       ├── server.ts             # Клієнт для Server Components
│       └── client.ts             # Клієнт для браузера
│
├── docs/                         # Документація ← ти тут
│   ├── PROGRESS.md               # Прогрес і подальший план
│   ├── STRUCTURE.md              # Цей файл
│   ├── database.sql              # SQL-схема бази даних
│   └── Telegram_Saver_Spec_v2.md # Повна специфікація продукту
│
├── .env.local                    # Секрети (не в git!)
├── next.config.ts
└── package.json
```

**Важливі змінні середовища (`.env.local`):**
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
TELEGRAM_BOT_TOKEN=
NEXTAUTH_SECRET=
```

---

## Проєкт 2: telegram-saver-bot (бот)

**Стек:** Node.js · TypeScript · grammY · Anthropic Claude · Supabase

```
telegram-saver-bot/
│
├── src/
│   ├── index.ts      # Точка входу — запуск бота
│   ├── bot.ts        # Ініціалізація бота, реєстрація хендлерів
│   ├── commands.ts   # /start, /help, /list
│   ├── auth.ts       # /login — генерує код для входу на сайт
│   ├── handlers.ts   # Обробка повідомлень (посилання, фото, PDF, текст, forward)
│   ├── claude.ts     # Claude AI — резюме, аналіз тексту, vision OCR
│   └── supabase.ts   # Клієнт Supabase + TypeScript-типи
│
├── doc/
│   ├── bot-plan.md
│   └── Telegram_Saver_Spec_v2.md
│
├── dist/             # Скомпільований JS (після npm run build)
├── .env              # Секрети (не в git!)
├── railway.toml      # Конфіг деплою на Railway
└── package.json
```

**Важливі змінні середовища (`.env`):**
```
TELEGRAM_BOT_TOKEN=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
SITE_URL=https://твій-сайт.vercel.app
```

**Команди для розробки:**
```bash
npm run dev    # Запуск з hot-reload (tsx watch)
npm run build  # Компіляція TypeScript → dist/
npm start      # Запуск скомпільованого (продакшн)
```

---

## Як два проєкти взаємодіють

```
Користувач
    │
    ├─── Telegram ──► БОТ (Railway)
    │                    │ пише у Supabase
    │                    ▼
    │              [Supabase DB]
    │                    ▲
    └─── Браузер ──► САЙТ (Vercel)
                         │ читає з Supabase
```

**Авторизація (два шляхи):**
```
Шлях 1: Telegram Login Widget
  Сайт → Telegram Widget → /api/auth/telegram (верифікує підпис) → сесія

Шлях 2: Через бота
  Бот /login → генерує 6-значний код → Supabase login_codes
  Сайт → користувач вводить код → /api/auth/login (перевіряє код) → сесія
```

**Збереження контенту:**
```
Telegram-повідомлення → БОТ → Claude AI (резюме/OCR) → Supabase saved_items
                                                              ↓
                                                     Сайт показує на дашборді
```

---

## База даних (Supabase)

| Таблиця | Призначення |
|---------|-------------|
| `profiles` | Користувачі (дані з Telegram) |
| `saved_items` | Всі збереження (посилання, фото, PDF, текст, forward) |
| `tags` | Теги користувача |
| `item_tags` | Зв'язок теги ↔ збереження |
| `media_files` | Файли для фото-альбомів |

Повна схема з SQL: `docs/database.sql`

---

## Деплой

| Що | Де | Як запустити локально |
|----|----|-----------------------|
| Сайт | Vercel (auto від GitHub) | `npm run dev` → localhost:3000 |
| Бот | Railway (auto від GitHub) | `npm run dev` у папці бота |
| БД | Supabase | supabase.com → проєкт |
