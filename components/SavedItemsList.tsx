'use client'

import { useState } from 'react'
import Link from 'next/link'

type Tag = { id: string; name: string; color: string }

type SavedItem = {
  id: string
  type: 'link' | 'photo' | 'pdf' | 'text' | 'forward'
  title: string | null
  description: string | null
  summary: string | null
  created_at: string
  item_tags: { tags: Tag | null }[]
}

const TYPE_ICONS: Record<SavedItem['type'], string> = {
  link: '🔗',
  photo: '🖼️',
  pdf: '📄',
  text: '📝',
  forward: '↪️',
}

const TYPE_LABELS: Record<SavedItem['type'], string> = {
  link: 'Посилання',
  photo: 'Фото',
  pdf: 'PDF',
  text: 'Текст',
  forward: 'Репост',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getItemTags(item: SavedItem): Tag[] {
  return item.item_tags.map(it => it.tags).filter(Boolean) as Tag[]
}

export default function SavedItemsList({ items }: { items: SavedItem[] }) {
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<SavedItem['type'] | ''>('')
  const [filterTagId, setFilterTagId] = useState('')

  const types = Array.from(new Set(items.map(i => i.type))) as SavedItem['type'][]

  // Всі унікальні теги з усіх айтемів
  const allTags = Array.from(
    new Map(
      items.flatMap(i => getItemTags(i)).map(t => [t.id, t])
    ).values()
  )

  const filtered = items.filter(item => {
    if (filterType && item.type !== filterType) return false
    if (filterTagId && !getItemTags(item).some(t => t.id === filterTagId)) return false
    if (search) {
      const q = search.toLowerCase()
      const inTitle = item.title?.toLowerCase().includes(q) ?? false
      const inSummary = item.summary?.toLowerCase().includes(q) ?? false
      const inDesc = item.description?.toLowerCase().includes(q) ?? false
      if (!inTitle && !inSummary && !inDesc) return false
    }
    return true
  })

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
        <div className="text-4xl mb-4">📬</div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Твої збереження з&apos;являться тут
        </h2>
        <p className="text-gray-500 text-sm">
          Підключи бота і почни надсилати посилання, фото та тексти
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col gap-3 mb-6">
        <input
          type="text"
          placeholder="Пошук..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-400"
        />

        {/* Фільтр за типом */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterType('')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filterType === '' && !filterTagId ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
          >
            Всі
          </button>
          {types.map(type => (
            <button
              key={type}
              onClick={() => { setFilterType(filterType === type ? '' : type); setFilterTagId('') }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterType === type ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
              }`}
            >
              {TYPE_ICONS[type]} {TYPE_LABELS[type]}
            </button>
          ))}
        </div>

        {/* Фільтр за тегами */}
        {allTags.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {allTags.map(tag => (
              <button
                key={tag.id}
                onClick={() => { setFilterTagId(filterTagId === tag.id ? '' : tag.id); setFilterType('') }}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-opacity ${
                  filterTagId === tag.id ? 'opacity-100 ring-2 ring-offset-1' : 'opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: tag.color, color: '#fff', ringColor: tag.color }}
              >
                {tag.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-gray-400 py-12">Нічого не знайдено</p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(item => {
            const tags = getItemTags(item)
            return (
              <Link
                key={item.id}
                href={`/item/${item.id}`}
                className="block bg-white rounded-xl border border-gray-100 p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">{TYPE_ICONS[item.type]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {item.title ?? TYPE_LABELS[item.type]}
                    </p>
                    {(item.summary ?? item.description) && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {item.summary ?? item.description}
                      </p>
                    )}
                    {tags.length > 0 && (
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {tags.map(tag => (
                          <span
                            key={tag.id}
                            className="px-2 py-0.5 rounded-full text-xs text-white"
                            style={{ backgroundColor: tag.color }}
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap mt-1">
                    {formatDate(item.created_at)}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
