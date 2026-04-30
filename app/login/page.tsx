import TelegramLoginButton from '@/components/TelegramLoginButton'
import DevLoginButton from '@/components/DevLoginButton'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-sm">
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
          <DevLoginButton />
        </div>
      </div>
    </div>
  )
}
