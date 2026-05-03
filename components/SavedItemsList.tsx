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
  full_text: string | null
  source_url: string | null
  created_at: string
  is_favorite: boolean
  item_tags: { tags: Tag | Tag[] | null }[]
}

type DateFilter = '' | 'today' | 'week' | 'month'

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
  const [filterDate, setFilterDate] = useState<DateFilter>('')
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
    if (filterDate) {
      const now = new Date()
      const itemDate = new Date(item.created_at)
      if (filterDate === 'today') {
        if (itemDate.toDateString() !== now.toDateString()) return false
      } else if (filterDate === 'week') {
        const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7)
        if (itemDate < weekAgo) return false
      } else if (filterDate === 'month') {
        const monthAgo = new Date(now); monthAgo.setMonth(now.getMonth() - 1)
        if (itemDate < monthAgo) return false
      }
    }
    if (search) {
      const q = search.toLowerCase()
      const inTitle = item.title?.toLowerCase().includes(q) ?? false
      const inSummary = item.summary?.toLowerCase().includes(q) ?? false
      const inDesc = item.description?.toLowerCase().includes(q) ?? false
      const inFullText = item.full_text?.toLowerCase().includes(q) ?? false
      if (!inTitle && !inSummary && !inDesc && !inFullText) return false
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

  /* ── empty state ── */
  if (localItems.length === 0) {
    return (
      <div style={{
        background: '#111116', border: '1px solid #1F1F28', borderRadius: 16,
        padding: '56px 32px', textAlign: 'center',
      }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>📬</div>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 17, marginBottom: 8, color: '#F0EDE4' }}>
          Твої збереження з&apos;являться тут
        </h2>
        <p style={{ fontSize: 13, color: '#6E6E82', lineHeight: 1.7 }}>
          Підключи бота і почни надсилати посилання, фото та тексти
        </p>
      </div>
    )
  }

  const isFiltered = !!(filterType || filterTagId || filterFavorites || filterDate || search)

  return (
    <>
      <style>{`
        /* ── search wrapper ── */
        .sl-search-wrap {
          flex: 1; min-width: 0;
          position: relative;
          display: flex; align-items: center;
        }
        .sl-search-icon {
          position: absolute;
          left: 13px;
          font-size: 16px;
          color: #4A4A5A;
          pointer-events: none;
          line-height: 1;
          user-select: none;
        }

        /* ── search ── */
        .sl-search {
          flex: 1; min-width: 0; width: 100%;
          background: #111116;
          border: 1px solid #1F1F28;
          border-radius: 10px;
          padding: 10px 16px 10px 40px;
          font-family: 'Syne', sans-serif;
          font-size: 14px; font-weight: 500;
          color: #F0EDE4;
          outline: none;
          transition: border-color .2s;
        }
        .sl-search::placeholder { color: #4A4A5A; }
        .sl-search:focus { border-color: #E8A020; }

        /* ── filter pill ── */
        .sl-pill {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 7px 14px; border-radius: 8px;
          font-family: 'Syne', sans-serif;
          font-size: 12px; font-weight: 700;
          letter-spacing: .04em;
          cursor: pointer; border: none;
          transition: background .15s, color .15s, border-color .15s;
          white-space: nowrap;
        }
        .sl-pill-off {
          background: transparent;
          border: 1px solid #1F1F28;
          color: #6E6E82;
        }
        .sl-pill-off:hover { border-color: #3A3A4A; color: #A0A0B0; }
        .sl-pill-on {
          background: #F0EDE4;
          border: 1px solid #F0EDE4;
          color: #09090C;
        }
        .sl-pill-fav-on {
          background: rgba(232,160,32,.15);
          border: 1px solid rgba(232,160,32,.4);
          color: #E8A020;
        }

        /* ── select button ── */
        .sl-sel-btn {
          padding: 10px 16px; border-radius: 10px;
          font-family: 'Syne', sans-serif;
          font-size: 12px; font-weight: 700; letter-spacing: .05em;
          cursor: pointer; border: none;
          transition: background .15s, color .15s;
          white-space: nowrap;
        }
        .sl-sel-btn-off {
          background: transparent;
          border: 1px solid #1F1F28;
          color: #6E6E82;
        }
        .sl-sel-btn-off:hover { border-color: #3A3A4A; color: #A0A0B0; }
        .sl-sel-btn-on {
          background: #F0EDE4; color: #09090C;
          border: 1px solid #F0EDE4;
        }

        /* ── bulk action bar ── */
        .sl-bulk {
          display: flex; align-items: center; gap: 10px;
          background: #1F1F2C; border: 1px solid #2E2E42;
          border-radius: 14px; padding: 10px 16px;
          margin-bottom: 12px;
        }
        .sl-bulk-count {
          font-family: 'Syne', sans-serif;
          font-size: 13px; font-weight: 700;
          color: #F0EDE4;
        }
        .sl-bulk-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 14px; border-radius: 8px;
          font-family: 'Syne', sans-serif;
          font-size: 12px; font-weight: 700; letter-spacing: .04em;
          cursor: pointer; border: none;
          transition: background .15s;
        }
        .sl-bulk-fav { background: rgba(232,160,32,.12); color: #E8A020; }
        .sl-bulk-fav:hover { background: rgba(232,160,32,.22); }
        .sl-bulk-del { background: rgba(239,68,68,.12); color: #F87171; }
        .sl-bulk-del:hover { background: rgba(239,68,68,.22); }

        /* ── card ── */
        .sl-card {
          display: block;
          background: #111116;
          border: 1px solid #1F1F28;
          border-left: 3px solid transparent;
          border-radius: 12px;
          padding: 18px 20px;
          text-decoration: none;
          color: inherit;
          transition: background .18s, border-left-color .18s, box-shadow .18s, transform .18s;
          cursor: pointer;
        }
        .sl-card:hover {
          background: #17171E;
          border-left-color: #E8A020;
          box-shadow: 0 8px 32px rgba(0,0,0,.45);
          transform: translateY(-2px);
        }
        .sl-card:hover .sl-type-badge {
          background: rgba(232,160,32,0.12);
          border-color: rgba(232,160,32,0.25);
        }
        .sl-card-selected {
          background: #17171E;
          border-left-color: #E8A020;
          border-color: #2A2A38;
        }

        /* ── card inner ── */
        .sl-card-body { display: flex; align-items: flex-start; gap: 14px; }

        .sl-type-badge {
          display: flex; align-items: center; justify-content: center;
          width: 36px; height: 36px; border-radius: 9px;
          background: #1A1A22; border: 1px solid #272730;
          font-size: 17px; flex-shrink: 0; margin-top: 1px;
        }

        .sl-content { flex: 1; min-width: 0; }

        .sl-title {
          font-family: 'Syne', sans-serif;
          font-size: 15px; font-weight: 700;
          letter-spacing: -.01em; line-height: 1.3;
          color: #F0EDE4;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          margin-bottom: 5px;
        }
        .sl-summary {
          font-family: 'Syne', sans-serif;
          font-size: 13px; font-weight: 500; line-height: 1.65;
          color: #6E6E82;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin-bottom: 0;
        }
        .sl-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px; }
        .sl-tag {
          font-family: 'Syne', sans-serif;
          font-size: 11px; font-weight: 600;
          padding: 2px 9px; border-radius: 99px; color: #fff;
          letter-spacing: .02em;
        }

        /* ── meta (date + actions) ── */
        .sl-meta {
          display: flex; flex-direction: column; align-items: flex-end;
          gap: 8px; flex-shrink: 0;
        }
        .sl-date {
          font-family: 'Syne', sans-serif;
          font-size: 11px; font-weight: 600;
          letter-spacing: .04em; color: #4A4A5A;
          white-space: nowrap;
        }
        .sl-actions { display: flex; gap: 4px; }
        .sl-action-btn {
          display: flex; align-items: center; justify-content: center;
          width: 30px; height: 30px; border-radius: 7px;
          background: transparent; border: none; cursor: pointer;
          font-size: 15px; line-height: 1;
          transition: background .15s, color .15s;
          color: #3A3A4A;
        }
        .sl-action-btn:hover { background: #1A1A22; }
        .sl-fav-active { color: #E8A020 !important; }
        .sl-fav-btn:hover { color: #E8A020; }
        .sl-del-btn:hover { color: #F87171; }

        /* ── thumbnail ── */
        .sl-thumb {
          width: 64px; height: 64px; border-radius: 8px;
          object-fit: cover; flex-shrink: 0;
          border: 1px solid #272730;
        }

        /* ── mobile: meta wraps below content ── */
        @media (max-width: 520px) {
          .sl-card { padding: 14px 16px; }
          .sl-card-body { flex-wrap: wrap; gap: 12px; }
          .sl-type-badge { order: 0; width: 32px; height: 32px; font-size: 15px; }
          .sl-content { order: 1; flex-basis: calc(100% - 44px); }
          .sl-meta {
            order: 2;
            flex-basis: 100%;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            margin-top: 2px;
            padding-left: 44px;
          }
          .sl-title { font-size: 14px; }
        }
      `}</style>

      {/* ── Search + Select button ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <div className="sl-search-wrap">
          <span className="sl-search-icon">⌕</span>
          <input
            type="text"
            placeholder="Пошук..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="sl-search"
          />
        </div>
        <button
          onClick={() => { setSelectMode(v => !v); setSelected(new Set()) }}
          className={`sl-sel-btn ${selectMode ? 'sl-sel-btn-on' : 'sl-sel-btn-off'}`}
        >
          {selectMode ? 'СКАСУВАТИ' : 'ВИБРАТИ'}
        </button>
      </div>

      {/* ── Bulk action bar ── */}
      {selectMode && selected.size > 0 && (
        <div className="sl-bulk">
          <span className="sl-bulk-count">{selected.size} вибрано</span>
          <div style={{ flex: 1 }} />
          <button onClick={() => favoriteSelected(true)} className="sl-bulk-btn sl-bulk-fav">
            ★ В обрані
          </button>
          <button onClick={deleteSelected} className="sl-bulk-btn sl-bulk-del">
            🗑 Видалити
          </button>
        </div>
      )}

      {/* ── Filters ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
        {/* Рядок 1: Всі / Обрані / Типи */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button
            onClick={() => { setFilterType(''); setFilterTagId(''); setFilterFavorites(false); setFilterDate('') }}
            className={`sl-pill ${!isFiltered ? 'sl-pill-on' : 'sl-pill-off'}`}
          >
            Всі
          </button>
          <button
            onClick={() => { setFilterFavorites(v => !v); setFilterType(''); setFilterTagId('') }}
            className={`sl-pill ${filterFavorites ? 'sl-pill-fav-on' : 'sl-pill-off'}`}
          >
            ★ Обрані
          </button>
          {types.map(type => (
            <button
              key={type}
              onClick={() => { setFilterType(filterType === type ? '' : type); setFilterTagId(''); setFilterFavorites(false) }}
              className={`sl-pill ${filterType === type ? 'sl-pill-on' : 'sl-pill-off'}`}
            >
              {TYPE_ICONS[type]} {TYPE_LABELS[type]}
            </button>
          ))}
        </div>

        {/* Рядок 2: Фільтр за датою */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(['today', 'week', 'month'] as DateFilter[]).map(d => {
            const labels = { today: '📅 Сьогодні', week: '📅 Тиждень', month: '📅 Місяць' }
            return (
              <button
                key={d}
                onClick={() => setFilterDate(filterDate === d ? '' : d)}
                className={`sl-pill ${filterDate === d ? 'sl-pill-on' : 'sl-pill-off'}`}
              >
                {labels[d as keyof typeof labels]}
              </button>
            )
          })}
        </div>

        {/* Рядок 3: Теги */}
        {allTags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {allTags.map(tag => {
              const active = filterTagId === tag.id
              return (
                <button
                  key={tag.id}
                  onClick={() => { setFilterTagId(active ? '' : tag.id); setFilterType(''); setFilterFavorites(false) }}
                  style={{
                    backgroundColor: active ? tag.color : 'transparent',
                    color: active ? '#fff' : tag.color,
                    border: `1px solid ${tag.color}`,
                    opacity: active ? 1 : 0.65,
                    boxShadow: active ? `0 0 0 3px ${tag.color}22` : 'none',
                    transform: active ? 'scale(1.05)' : 'scale(1)',
                  }}
                  className="sl-pill"
                >
                  {tag.name}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* ── List ── */}
      {filtered.length === 0 ? (
        <div style={{
          background: '#111116',
          border: '1px solid #1F1F28',
          borderRadius: 16,
          padding: 40,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 32, marginBottom: 14 }}>🔍</div>
          <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, color: '#F0EDE4', margin: '0 0 8px' }}>
            Нічого не знайдено
          </p>
          <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, color: '#6E6E82', margin: 0, lineHeight: 1.6 }}>
            Спробуй змінити фільтри або пошуковий запит
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(item => {
            const tags = getItemTags(item)
            const isSelected = selected.has(item.id)
            const displayText = item.summary ?? item.description

            const cardInner = (
              <>
                <div className="sl-card-body">
                  {selectMode && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(item.id)}
                      onClick={e => e.stopPropagation()}
                      style={{ marginTop: 10, width: 16, height: 16, accentColor: '#E8A020', cursor: 'pointer', flexShrink: 0 }}
                    />
                  )}

                  {/* Type icon */}
                  <div className="sl-type-badge">{TYPE_ICONS[item.type]}</div>

                  {/* Photo thumbnail */}
                  {item.type === 'photo' && item.source_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.source_url}
                      alt=""
                      className="sl-thumb"
                    />
                  )}

                  {/* Content */}
                  <div className="sl-content">
                    <div className="sl-title">{item.title ?? TYPE_LABELS[item.type]}</div>
                    {displayText && (
                      <div className="sl-summary">{displayText}</div>
                    )}
                    {tags.length > 0 && (
                      <div className="sl-tags">
                        {tags.map(tag => (
                          <span key={tag.id} className="sl-tag" style={{ backgroundColor: tag.color }}>
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Meta: date + actions */}
                  <div className="sl-meta" onClick={e => e.preventDefault()}>
                    <span className="sl-date">{formatDate(item.created_at)}</span>
                    {!selectMode && (
                      <div className="sl-actions">
                        <button
                          onClick={e => { e.preventDefault(); e.stopPropagation(); toggleFavorite(item.id, item.is_favorite) }}
                          title={item.is_favorite ? 'Прибрати з обраних' : 'Додати в обрані'}
                          className={`sl-action-btn sl-fav-btn ${item.is_favorite ? 'sl-fav-active' : ''}`}
                        >
                          ★
                        </button>
                        <button
                          onClick={e => { e.preventDefault(); e.stopPropagation(); deleteItem(item.id) }}
                          title="Видалити"
                          className="sl-action-btn sl-del-btn"
                        >
                          🗑
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </>
            )

            if (selectMode) {
              return (
                <div
                  key={item.id}
                  onClick={() => toggleSelect(item.id)}
                  className={`sl-card ${isSelected ? 'sl-card-selected' : ''}`}
                >
                  {cardInner}
                </div>
              )
            }

            return (
              <Link key={item.id} href={`/item/${item.id}`} className="sl-card">
                {cardInner}
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}
