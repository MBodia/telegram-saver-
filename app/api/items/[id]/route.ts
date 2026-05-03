import { createAdminClient } from '@/lib/supabase/admin'
import { getSession } from '@/lib/session'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const profileId = await getSession()
  if (!profileId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { is_favorite } = await request.json()
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('saved_items')
    .update({ is_favorite })
    .eq('id', id)
    .eq('user_id', profileId)

  if (error) return Response.json({ error: 'Failed to update' }, { status: 500 })
  return Response.json({ ok: true })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const profileId = await getSession()
  if (!profileId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('saved_items')
    .delete()
    .eq('id', id)
    .eq('user_id', profileId)

  if (error) return Response.json({ error: 'Failed to delete' }, { status: 500 })

  return Response.json({ ok: true })
}
