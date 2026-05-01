'use client'

import { useState } from 'react'

export default function DeleteButton({ itemId }: { itemId: string }) {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('Видалити це збереження?')) return
    setLoading(true)

    await fetch(`/api/items/${itemId}`, { method: 'DELETE' })
    window.location.href = '/dashboard'
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-sm text-red-500 hover:text-red-700 disabled:text-gray-400 transition-colors"
    >
      {loading ? 'Видалення...' : 'Видалити'}
    </button>
  )
}
