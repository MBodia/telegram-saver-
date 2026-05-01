'use client'

import { useState } from 'react'

export default function BotCodeForm() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/bot-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })

    const data = await res.json()

    if (data.ok) {
      window.location.href = '/dashboard'
    } else {
      setError(data.error ?? 'Щось пішло не так')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        type="text"
        inputMode="numeric"
        pattern="\d{6}"
        maxLength={6}
        placeholder="123456"
        value={code}
        onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
        className="w-full text-center text-2xl tracking-widest border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-400"
        required
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loading || code.length !== 6}
        className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-medium py-3 rounded-xl transition-colors"
      >
        {loading ? 'Перевіряємо...' : 'Увійти'}
      </button>
    </form>
  )
}
