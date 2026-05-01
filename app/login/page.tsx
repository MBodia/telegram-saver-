import Link from 'next/link'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import TelegramLoginButton from '@/components/TelegramLoginButton'
import DevLoginButton from '@/components/DevLoginButton'
import BotCodeForm from '@/components/BotCodeForm'

export default async function LoginPage() {
  const session = await getSession()
  if (session) redirect('/dashboard')

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
          <div className="flex justify-center">
            <TelegramLoginButton />
          </div>
          <p className="text-xs text-gray-400 mt-6">
            Без паролів · Безпечно · Безкоштовно
          </p>

          <div className="mt-8 pt-8 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-600 mb-1">Або введи код від бота</p>
            <p className="text-xs text-gray-400 mb-4">
              Напиши <span className="font-mono">/login</span> боту і введи отриманий код
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
