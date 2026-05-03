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
  is_favorite: boolean
  item_tags: { tags: Tag | Tag[] | null }[]
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
  return item.item_tags
    .flatMap(it => (Array.isArray(it.tags) ? it.tags : it.tags ? [it.tags] : []))
}

export default function SavedItemsList({ items }: { items: SavedItem[] }) {
  const [localItems, setLocalItems] = useState(items)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<SavedItem['type'] | ''>('')
  const [filterTagId, setFilterTagId] = useState('')
  const [filterFavorites, setFilterFavorites] = useState(false)
  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const types = Array.from(new Set(localItems.map(i => i.type))) as SavedItem['type'][]

  const allTags = Array.from(
    new Map(
      localItems.flatMap(i => getItemTags(i)).map(t => [t.id, t])
    ).values()
  )

  const filtered = localItems.filter(item => {
    if (filterFavorites && !item.is_favorite) return false
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

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function exitSelectMode() {
    setSelectMode(false)
    setSelected(new Set())
  }

  async function toggleFavorite(id: string, cur: boolean) {
    setLocalItems(prev => prev.map(i => i.id === id ? { ...i, is_favorite: !cur } : i))
    await fetch(`/api/items/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_favorite: !cur }),
    })
  }

  async function deleteItem(id: string) {
    if (!confirm('Видалити це збереження?')) return
    setLocalItems(prev => prev.filter(i => i.id !== id))
    await fetch(`/api/items/${id}`, { method: 'DELETE' })
  }

  async function deleteSelected() {
    if (!confirm(`Видалити ${selected.size} елементів?`)) return
    const ids = Array.from(selected)
    setLocalItems(prev => prev.filter(i => !ids.includes(i.id)))
    exitSelectMode()
    await Promise.all(ids.map(id => fetch(`/api/items/${id}`, { method: 'DELETE' })))
  }

  async function favoriteSelected(fav: boolean) {
    const ids = Array.from(selected)
    setLocalItems(prev => prev.map(i => ids.includes(i.id) ? { ...i, is_favorite: fav } : i))
    exitSelectMode()
    await Promise.all(ids.map(id => fetch(`/api/items/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_favorite: fav }),
    })))
  }

  if (localItems.length === 0) {
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
      {/* Пошук + кнопка Вибрати */}
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          placeholder="Пошук..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-400"
        />
        <button
          onClick={() => { setSelectMode(v => !v); setSelected(new Set()) }}
          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
            selectMode
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
          }`}
        >
          {selectMode ? 'Скасувати' : 'Вибрати'}
        </button>
      </div>

      {/* Бар масових дій */}
      {selectMode && selected.size > 0 && (
        <div className="flex items-center gap-3 bg-gray-900 text-white px-4 py-2.5 rounded-xl mb-3 text-sm">
          <span className="font-medium">{selected.size} вибрано</span>
          <div className="flex-1" />
          <button
            onClick={() => favoriteSelected(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            ★ В обрані
          </button>
          <button
            onClick={deleteSelected}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-500/80 hover:bg-red-500 transition-colors"
          >
            🗑 Видалити
          </button>
        </div>
      )}

      {/* Фільтри */}
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => { setFilterType(''); setFilterTagId(''); setFilterFavorites(false) }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              !filterType && !filterTagId && !filterFavorites
                ? 'bg-gray-900 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
          >
            Всі
          </button>
          <button
            onClick={() => { setFilterFavorites(v => !v); setFilterType(''); setFilterTagId('') }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filterFavorites
                ? 'bg-yellow-400 text-white border-yellow-400'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
          >
            ★ Обрані
          </button>
          {types.map(type => (
            <button
              key={type}
              onClick={() => { setFilterType(filterType === type ? '' : type); setFilterTagId(''); setFilterFavorites(false) }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterType === type ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
              }`}
            >
              {TYPE_ICONS[type]} {TYPE_LABELS[type]}
            </button>
          ))}
        </div>

        {allTags.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {allTags.map(tag => {
              const active = filterTagId === tag.id
              return (
                <button
                  key={tag.id}
                  onClick={() => { setFilterTagId(active ? '' : tag.id); setFilterType(''); setFilterFavorites(false) }}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    active ? 'shadow-md scale-105' : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: tag.color,
                    color: '#fff',
                    boxShadow: active ? `0 0 0 2px white, 0 0 0 4px ${tag.color}` : undefined,
                  }}
                >
                  {tag.name}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Список */}
      {filtered.length === 0 ? (
        <p className="text-center text-gray-400 py-12">Нічого не знайдено</p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(item => {
            const tags = getItemTags(item)
            const isSelected = selected.has(item.id)

            const cardContent = (
              <div className="flex items-start gap-3">
                {selectMode && (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(item.id)}
                    onClick={e => e.stopPropagation()}
                    className="mt-1 w-4 h-4 accent-gray-900 cursor-pointer shrink-0"
                  />
                )}
                <span className="text-xl mt-0.5 shrink-0">{TYPE_ICONS[item.type]}</span>
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
                {/* Дата і кнопки дій */}
                <div
                  className="flex flex-col items-end gap-1.5 shrink-0"
                  onClick={e => e.preventDefault()}
                >
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {formatDate(item.created_at)}
                  </span>
                  {!selectMode && (
                    <div className="flex gap-1">
                      <button
                        onClick={e => { e.preventDefault(); e.stopPropagation(); toggleFavorite(item.id, item.is_favorite) }}
                        title={item.is_favorite ? 'Прибрати з обраних' : 'Додати в обрані'}
                        className={`text-lg leading-none transition-colors ${
                          item.is_favorite ? 'text-yellow-400' : 'text-gray-200 hover:text-yellow-300'
                        }`}
                      >
                        ★
                      </button>
                      <button
                        onClick={e => { e.preventDefault(); e.stopPropagation(); deleteItem(item.id) }}
                        title="Видалити"
                        className="text-base leading-none text-gray-200 hover:text-red-400 transition-colors"
                      >
                        🗑
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )

            if (selectMode) {
              return (
                <div
                  key={item.id}
                  onClick={() => toggleSelect(item.id)}
                  className={`bg-white rounded-xl border p-4 cursor-pointer transition-colors ${
                    isSelected ? 'border-gray-900 bg-gray-50' : 'border-gray-100 hover:border-gray-300'
                  }`}
                >
                  {cardContent}
                </div>
              )
            }

            return (
              <Link
                key={item.id}
                href={`/item/${item.id}`}
                className="block bg-white rounded-xl border border-gray-100 p-4 hover:border-gray-300 transition-colors"
              >
                {cardContent}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
