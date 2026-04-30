import { createAdminClient } from '@/lib/supabase/admin'
import { createSession } from '@/lib/session'

// ⚠️ Тимчасовий dev-вхід для тестування поки розбираємось з Telegram Widget
// TODO: видалити коли заробить нормальна авторизація через Telegram

export async function POST() {
  const supabase = createAdminClient()
  const testTelegramId = 999000001

  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('telegram_user_id', testTelegramId)
    .maybeSingle()

  let profileId: string

  if (existing) {
    profileId = existing.id
  } else {
    const { data: created, error } = await supabase
      .from('profiles')
      .insert({
        telegram_user_id: testTelegramId,
        telegram_username: 'test_user',
        telegram_first_name: 'Тестовий користувач',
      })
      .select('id')
      .single()

    if (error || !created) {
      return Response.json({ error: error?.message ?? 'Failed' }, { status: 500 })
    }
    profileId = created.id
  }

  await createSession(profileId)
  return Response.json({ ok: true })
}
