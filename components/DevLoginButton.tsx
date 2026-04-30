'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DevLoginButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    const res = await fetch('/api/auth/dev-login', { method: 'POST' })
    if (res.ok) {
      router.push('/dashboard')
    } else {
      alert('Помилка тестового входу')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-xs text-gray-400 hover:text-gray-600 underline mt-4 disabled:opacity-50"
    >
      {loading ? 'Входжу...' : 'Тестовий вхід (dev)'}
    </button>
  )
}
