import Link from 'next/link'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'

export default async function Home() {
  const session = await getSession()
  if (session) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📎</span>
            <span className="font-semibold text-gray-900 text-lg">Telegram Saver</span>
          </div>
          <Link
            href="/login"
            className="bg-[#229ED9] hover:bg-[#1a8bbf] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Увійти
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,#dbeafe,transparent_60%)]" />
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <span>✨</span>
            <span>AI-резюме для будь-якого контенту</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-5 leading-[1.1] tracking-tight">
            Твій особистий архів<br />з Telegram
          </h1>
          <p className="text-lg text-gray-500 mb-10 leading-relaxed max-w-xl mx-auto">
            Кидай боту посилання, скріншоти та PDF —
            отримуй AI-резюме і знаходь усе за секунди.
          </p>
          <Link
            href="/login"
            className="inline-block bg-[#229ED9] hover:bg-[#1a8bbf] text-white font-medium px-8 py-3.5 rounded-xl text-base transition-all hover:shadow-lg hover:shadow-blue-200"
          >
            Почати безкоштовно
          </Link>
          <p className="text-sm text-gray-400 mt-4">Вхід через Telegram · Без паролів</p>
        </div>
      </main>

      <section className="border-t border-gray-100 px-6 py-16">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl">🔗</div>
            <h3 className="font-semibold text-gray-900">Посилання</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Бот заходить на сторінку і робить коротке резюме — без зайвих слів
            </p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-3xl">🖼️</div>
            <h3 className="font-semibold text-gray-900">Скріншоти та фото</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              AI читає текст з зображень і описує що на них
            </p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-3xl">📄</div>
            <h3 className="font-semibold text-gray-900">PDF-файли</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Завантаж документ — отримай стислий зміст і зберігай в архів
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100 px-6 py-6 text-center">
        <p className="text-sm text-gray-400">© 2026 Telegram Saver</p>
      </footer>
    </div>
  )
}
