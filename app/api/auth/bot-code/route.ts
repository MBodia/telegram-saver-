import { createAdminClient } from '@/lib/supabase/admin'
import { createSession } from '@/lib/session'

export async function POST(request: Request) {
  const { code } = await request.json()

  if (!code || typeof code !== 'string') {
    return Response.json({ error: 'Код обовʼязковий' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: loginCode } = await supabase
    .from('login_codes')
    .select('telegram_user_id')
    .eq('code', code)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (!loginCode) {
    return Response.json({ error: 'Код невірний або застарів' }, { status: 401 })
  }

  await supabase
    .from('login_codes')
    .update({ used: true })
    .eq('code', code)

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('telegram_user_id', loginCode.telegram_user_id)
    .single()

  if (!profile) {
    return Response.json(
      { error: 'Профіль не знайдено. Спочатку напишіть боту /start' },
      { status: 404 }
    )
  }

  await createSession(profile.id)
  return Response.json({ ok: true })
}
