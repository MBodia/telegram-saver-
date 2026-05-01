import { createAdminClient } from '@/lib/supabase/admin'
import { getSession } from '@/lib/session'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; tagId: string }> }
) {
  const profileId = await getSession()
  if (!profileId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: itemId, tagId } = await params
  const supabase = createAdminClient()

  await supabase
    .from('item_tags')
    .delete()
    .eq('item_id', itemId)
    .eq('tag_id', tagId)

  return Response.json({ ok: true })
}
