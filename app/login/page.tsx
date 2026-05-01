import Link from 'next/link'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import DevLoginButton from '@/components/DevLoginButton'
import BotCodeForm from '@/components/BotCodeForm'

const ERROR_MESSAGES: Record<string, string> = {
  expired: 'Час авторизації вийшов. Спробуй ще раз.',
  invalid_signature: 'Помилка підпису від Telegram. Спробуй ще раз.',
  db_error: 'Помилка бази даних. Спробуй ще раз.',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const session = await getSession()
  if (session) redirect('/dashboard')

  const { error } = await searchParams
  const errorMessage = error ? (ERROR_MESSAGES[error] ?? 'Помилка входу. Спробуй ще раз.') : null

  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? 'AI_hol228MBot'

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="px-6 py-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
          ← На головну
        </Link>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div className="text-center max-w-sm w-full">
          <div className="text-5xl mb-6">📎</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Telegram Saver</h1>
          <p className="text-gray-500 mb-8">
            Увійди через Telegram щоб почати зберігати контент
          </p>

          {errorMessage && (
            <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {/* Головний спосіб входу — через бота */}
          <div className="bg-blue-50 rounded-2xl p-6 text-left">
            <p className="text-sm font-semibold text-blue-900 mb-4">Як увійти:</p>
            <ol className="space-y-3 text-sm text-blue-800">
              <li className="flex gap-3">
                <span className="font-bold text-blue-500 shrink-0">1.</span>
                <span>Відкрий бота в Telegram</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-500 shrink-0">2.</span>
                <span>Надішли команду <code className="bg-blue-100 px-1 rounded">/login</code></span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-500 shrink-0">3.</span>
                <span>Натисни кнопку <b>«Увійти на сайт»</b> в повідомленні від бота</span>
              </li>
            </ol>

            <a
              href={`https://t.me/${botUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 flex items-center justify-center gap-2 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.012 9.478c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.48 14.697l-2.95-.924c-.642-.202-.655-.642.136-.95l11.525-4.445c.535-.194 1.004.13.371.87z"/>
              </svg>
              Відкрити @{botUsername}
            </a>
          </div>

          <p className="text-xs text-gray-400 mt-4">
            Без паролів · Безпечно · Безкоштовно
          </p>

          {/* Резервний спосіб — ввести код вручну */}
          <div className="mt-8 pt-8 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-600 mb-1">Вже маєш код від бота?</p>
            <p className="text-xs text-gray-400 mb-4">
              Введи 6-значний код який надіслав бот
            </p>
            <BotCodeForm />
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <DevLoginButton />
          </div>
        </div>
      </div>
    </div>
  )
}
