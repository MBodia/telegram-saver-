'use client'

import { useState } from 'react'

type Tag = { id: string; name: string; color: string }

export default function TagsSection({
  itemId,
  initialTags,
  suggestedTags,
}: {
  itemId: string
  initialTags: Tag[]
  suggestedTags: string[]
}) {
  const [tags, setTags] = useState<Tag[]>(initialTags)
  const [loading, setLoading] = useState<string | null>(null)
  const [customTag, setCustomTag] = useState('')

  const pendingSuggestions = suggestedTags.filter(
    s => !tags.some(t => t.name.toLowerCase() === s.toLowerCase())
  )

  async function addTag(tagName: string) {
    const name = tagName.trim()
    if (!name || tags.some(t => t.name.toLowerCase() === name.toLowerCase())) return
    setLoading(name)
    const res = await fetch(`/api/items/${itemId}/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tagName: name }),
    })
    const data = await res.json()
    if (data.ok) setTags(prev => [...prev, data.tag])
    setLoading(null)
  }

  async function removeTag(tagId: string) {
    setLoading(tagId)
    await fetch(`/api/items/${itemId}/tags/${tagId}`, { method: 'DELETE' })
    setTags(prev => prev.filter(t => t.id !== tagId))
    setLoading(null)
  }

  async function handleCustomSubmit(e: React.FormEvent) {
    e.preventDefault()
    await addTag(customTag)
    setCustomTag('')
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 mb-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Теги</p>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map(tag => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm text-white"
              style={{ backgroundColor: tag.color }}
            >
              {tag.name}
              <button
                onClick={() => removeTag(tag.id)}
                disabled={loading === tag.id}
                className="opacity-70 hover:opacity-100 ml-1 leading-none"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {pendingSuggestions.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-400 mb-2">AI пропонує:</p>
          <div className="flex flex-wrap gap-2">
            {pendingSuggestions.map(name => (
              <button
                key={name}
                onClick={() => addTag(name)}
                disabled={loading === name}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm border border-dashed border-gray-300 text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors disabled:opacity-50"
              >
                + {loading === name ? '...' : name}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleCustomSubmit} className="flex gap-2 mt-2">
        <input
          type="text"
          value={customTag}
          onChange={e => setCustomTag(e.target.value)}
          placeholder="Додати свій тег..."
          className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-400"
        />
        <button
          type="submit"
          disabled={!customTag.trim() || loading !== null}
          className="text-sm px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-lg transition-colors"
        >
          Додати
        </button>
      </form>
    </div>
  )
}
