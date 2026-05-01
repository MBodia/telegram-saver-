import { createAdminClient } from '@/lib/supabase/admin'
import { createSession } from '@/lib/session'
import { redirect } from 'next/navigation'
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

async function handleTelegramAuth(data: TelegramData): Promise<string> {
  const ageSeconds = Math.floor(Date.now() / 1000) - parseInt(data.auth_date)
  if (ageSeconds > 86400) {
    console.error('[telegram-auth] Auth data expired, age:', ageSeconds, 'seconds')
    return '/login?error=expired'
  }

  if (!verifyTelegramHash(data)) {
    console.error('[telegram-auth] Invalid signature. Bot token present:', !!process.env.TELEGRAM_BOT_TOKEN)
    return '/login?error=invalid_signature'
  }

  const supabase = createAdminClient()
  const telegramId = parseInt(data.id)

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
      return '/login?error=db_error'
    }
    profileId = created.id
  }

  await createSession(profileId)
  return '/dashboard'
}

// GET — redirect режим (Telegram сам перенаправляє сюди після підтвердження)
export async function GET(request: Request) {
  const url = new URL(request.url)
  const params = Object.fromEntries(url.searchParams.entries())

  const data = params as unknown as TelegramData
  const destination = await handleTelegramAuth(data)
  redirect(destination)
}

// POST — залишаємо для сумісності (бот-код та інші)
export async function POST(request: Request) {
  const data: TelegramData = await request.json()
  const destination = await handleTelegramAuth(data)

  if (destination === '/dashboard') {
    return Response.json({ ok: true })
  }
  const errorMsg = destination.includes('expired')
    ? 'Дані авторизації застаріли. Спробуй ще раз.'
    : destination.includes('invalid_signature')
      ? 'Невірний підпис від Telegram.'
      : 'Помилка авторизації.'
  return Response.json({ error: errorMsg }, { status: 401 })
}
