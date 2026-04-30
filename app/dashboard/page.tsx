import { getSession } from '@/lib/session'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const profileId = await getSession()
  if (!profileId) redirect('/login')

  const supabase = createAdminClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .single()

  if (!profile) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📎</span>
            <span className="font-semibold text-gray-900">Telegram Saver</span>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Вийти
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center gap-4 mb-8">
          {profile.telegram_photo_url && (
            <img
              src={profile.telegram_photo_url}
              alt="Фото профілю"
              className="w-16 h-16 rounded-full"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Привіт, {profile.telegram_first_name}!
            </h1>
            {profile.telegram_username && (
              <p className="text-gray-500">@{profile.telegram_username}</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <div className="text-4xl mb-4">📬</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Твої збереження з&apos;являться тут
          </h2>
          <p className="text-gray-500 text-sm">
            Підключи бота і почни надсилати посилання, фото та тексти
          </p>
        </div>
      </main>
    </div>
  )
}
