import { createAdminClient } from '@/lib/supabase/admin'
import { createSession } from '@/lib/session'
import crypto from 'crypto'

type TelegramData = {
  id: string
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: string
  hash: string
}

function verifyTelegramHash(data: TelegramData): boolean {
  const { hash, ...rest } = data

  const checkString = Object.keys(rest)
    .sort()
    .filter(key => rest[key as keyof typeof rest] !== undefined)
    .map(key => `${key}=${rest[key as keyof typeof rest]}`)
    .join('\n')

  const secretKey = crypto
    .createHash('sha256')
    .update(process.env.TELEGRAM_BOT_TOKEN!)
    .digest()

  const hmac = crypto
    .createHmac('sha256', secretKey)
    .update(checkString)
    .digest('hex')

  return hmac === hash
}

export async function POST(request: Request) {
  const data: TelegramData = await request.json()

  // Перевіряємо що дані не старіші 24 годин
  const ageSeconds = Math.floor(Date.now() / 1000) - parseInt(data.auth_date)
  if (ageSeconds > 86400) {
    console.error('[telegram-auth] Auth data expired, age:', ageSeconds, 'seconds')
    return Response.json({ error: 'Дані авторизації застаріли. Спробуй ще раз.' }, { status: 401 })
  }

  // Перевіряємо підпис від Telegram
  if (!verifyTelegramHash(data)) {
    console.error('[telegram-auth] Invalid signature. Bot token present:', !!process.env.TELEGRAM_BOT_TOKEN)
    return Response.json({ error: 'Невірний підпис від Telegram. Перевір TELEGRAM_BOT_TOKEN у змінних середовища.' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const telegramId = parseInt(data.id)

  // Шукаємо існуючого користувача
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('telegram_user_id', telegramId)
    .single()

  let profileId: string

  if (existing) {
    profileId = existing.id
    await supabase
      .from('profiles')
      .update({
        telegram_username: data.username ?? null,
        telegram_first_name: data.first_name,
        telegram_photo_url: data.photo_url ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profileId)
  } else {
    const { data: created, error } = await supabase
      .from('profiles')
      .insert({
        telegram_user_id: telegramId,
        telegram_username: data.username ?? null,
        telegram_first_name: data.first_name,
        telegram_photo_url: data.photo_url ?? null,
      })
      .select('id')
      .single()

    if (error || !created) {
      console.error('[telegram-auth] Failed to create profile:', error)
      return Response.json({ error: 'Не вдалось створити профіль у базі даних.' }, { status: 500 })
    }
    profileId = created.id
  }

  await createSession(profileId)
  return Response.json({ ok: true })
}
