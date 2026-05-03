import { createAdminClient } from '@/lib/supabase/admin'
import { createSession } from '@/lib/session'
import { redirect } from 'next/navigation'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    redirect('/login?error=invalid_code')
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
    redirect('/login?error=invalid_code')
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
    redirect('/login?error=db_error')
  }

  await createSession(profile.id)
  redirect('/dashboard')
}
