import { getSession } from '@/lib/session'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DeleteButton from '@/components/DeleteButton'
import TagsSection from '@/components/TagsSection'

const TYPE_ICONS: Record<string, string> = {
  link: '🔗',
  photo: '🖼️',
  pdf: '📄',
  text: '📝',
  forward: '↪️',
}

const TYPE_LABELS: Record<string, string> = {
  link: 'Посилання',
  photo: 'Фото',
  pdf: 'PDF',
  text: 'Текст',
  forward: 'Репост',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function ItemPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const profileId = await getSession()
  if (!profileId) redirect('/login')

  const { id } = await params
  const supabase = createAdminClient()

  const [{ data: item }, { data: itemTags }] = await Promise.all([
    supabase
      .from('saved_items')
      .select('*')
      .eq('id', id)
      .eq('user_id', profileId)
      .single(),
    supabase
      .from('item_tags')
      .select('tags(id, name, color)')
      .eq('item_id', id),
  ])

  if (!item) redirect('/dashboard')

  const existingTags = (itemTags ?? [])
    .map(row => (row.tags as { id: string; name: string; color: string } | null))
    .filter(Boolean) as { id: string; name: string; color: string }[]

  const suggestedTags: string[] =
    (item.ai_analysis as { suggested_tags?: string[] } | null)?.suggested_tags ?? []

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
            ← Назад
          </Link>
          <DeleteButton itemId={item.id} />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          <span>{TYPE_ICONS[item.type]}</span>
          <span>{TYPE_LABELS[item.type]}</span>
          <span>·</span>
          <span>{formatDate(item.created_at)}</span>
        </div>

        {item.title && (
          <h1 className="text-2xl font-bold text-gray-900 mb-6">{item.title}</h1>
        )}

        {item.source_url && (
          <a
            href={item.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-blue-50 text-blue-600 hover:text-blue-800 text-sm px-4 py-3 rounded-xl mb-6 truncate transition-colors"
          >
            {item.source_url}
          </a>
        )}

        {item.type === 'photo' && item.source_url && (
          <div className="mb-6">
            <img
              src={item.source_url}
              alt={item.title ?? 'Фото'}
              className="rounded-xl w-full object-contain max-h-[70vh]"
            />
          </div>
        )}

        {item.type === 'pdf' && item.storage_path && (
          <a
            href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${item.storage_path}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-orange-50 text-orange-600 hover:text-orange-800 text-sm px-4 py-3 rounded-xl mb-6 transition-colors"
          >
            <span>📄</span>
            <span>Відкрити PDF</span>
          </a>
        )}

        <TagsSection
          itemId={item.id}
          initialTags={existingTags}
          suggestedTags={suggestedTags}
        />

        {item.summary && (
          <div className="bg-white border border-gray-100 rounded-xl p-5 mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Резюме</p>
            <p className="text-gray-700 leading-relaxed">{item.summary}</p>
          </div>
        )}

        {item.description && item.description !== item.summary && (
          <div className="bg-white border border-gray-100 rounded-xl p-5 mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Опис</p>
            <p className="text-gray-700 leading-relaxed">{item.description}</p>
          </div>
        )}

        {item.full_text && (
          <div className="bg-white border border-gray-100 rounded-xl p-5 mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Повний текст</p>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{item.full_text}</p>
          </div>
        )}

        {item.forward_origin && (
          <div className="bg-white border border-gray-100 rounded-xl p-5 mb-4">
            <p className="text-xs font-semibond text-gray-400 uppercase tracking-wide mb-2">Джерело репосту</p>
            <p className="text-gray-700 text-sm">
              {(item.forward_origin as { chat_title?: string; sender_name?: string })?.chat_title ??
               (item.forward_origin as { sender_name?: string })?.sender_name ??
               'Невідоме джерело'}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
