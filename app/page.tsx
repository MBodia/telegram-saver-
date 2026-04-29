export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* Шапка */}
      <header className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📎</span>
            <span className="font-semibold text-gray-900 text-lg">Telegram Saver</span>
          </div>
          <button className="bg-[#229ED9] hover:bg-[#1a8bbf] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            Увійти через Telegram
          </button>
        </div>
      </header>

      {/* Головний блок */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="max-w-2xl">
          <div className="text-5xl mb-6">📬</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Твій особистий архів<br />з Telegram
          </h1>
          <p className="text-lg text-gray-500 mb-10 leading-relaxed">
            Кидай боту посилання, скріншоти та PDF —<br />
            отримуй AI-резюме і знаходь усе за секунди.
          </p>
          <button className="bg-[#229ED9] hover:bg-[#1a8bbf] text-white font-medium px-8 py-3 rounded-xl text-base transition-colors">
            Почати безкоштовно
          </button>
          <p className="text-sm text-gray-400 mt-4">Вхід через Telegram · Без паролів</p>
        </div>
      </main>

      {/* Блок можливостей */}
      <section className="border-t border-gray-100 px-6 py-16">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">

          <div className="flex flex-col items-center gap-3">
            <span className="text-3xl">🔗</span>
            <h3 className="font-semibold text-gray-900">Посилання</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Бот заходить на сторінку і робить коротке резюме — без зайвих слів
            </p>
          </div>

          <div className="flex flex-col items-center gap-3">
            <span className="text-3xl">🖼️</span>
            <h3 className="font-semibold text-gray-900">Скріншоти та фото</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              AI читає текст з зображень і описує що на них — знайдеш навіть по словах зі скріна
            </p>
          </div>

          <div className="flex flex-col items-center gap-3">
            <span className="text-3xl">📄</span>
            <h3 className="font-semibold text-gray-900">PDF-файли</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Завантаж документ — отримай стислий зміст і зберігай в архів
            </p>
          </div>

        </div>
      </section>

      {/* Підвал */}
      <footer className="border-t border-gray-100 px-6 py-6 text-center">
        <p className="text-sm text-gray-400">© 2025 Telegram Saver</p>
      </footer>

    </div>
  );
}
