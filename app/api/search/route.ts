import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateEmbedding } from '@/lib/embeddings'

export async function POST(req: NextRequest) {
  const { query, userId } = await req.json()

  if (!query || !userId) {
    return NextResponse.json({ error: 'query and userId are required' }, { status: 400 })
  }

  const embedding = await generateEmbedding(query)
  const supabase = createAdminClient()

  const { data, error } = await supabase.rpc('search_items', {
    query_embedding: embedding,
    user_id: userId,
    match_count: 20,
    similarity_threshold: 0.3,
  })

  if (error) {
    console.error('search_items error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}
