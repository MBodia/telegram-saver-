import { createAdminClient } from '@/lib/supabase/admin'
import { getSession } from '@/lib/session'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const profileId = await getSession()
  if (!profileId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { tagName } = await request.json()
  if (!tagName?.trim()) return Response.json({ error: 'Tag name required' }, { status: 400 })

  const { id: itemId } = await params
  const supabase = createAdminClient()

  // Upsert тег (створити якщо немає, або знайти існуючий)
  const { data: tag, error: tagError } = await supabase
    .from('tags')
    .upsert({ user_id: profileId, name: tagName.trim() }, { onConflict: 'user_id,name' })
    .select('id, name, color')
    .single()

  if (tagError || !tag) return Response.json({ error: 'Failed to create tag' }, { status: 500 })

  // Додаємо до айтема (ігноруємо якщо вже є)
  await supabase
    .from('item_tags')
    .upsert({ item_id: itemId, tag_id: tag.id }, { onConflict: 'item_id,tag_id' })

  return Response.json({ ok: true, tag })
}
