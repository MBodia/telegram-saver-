'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

declare global {
  interface Window {
    onTelegramAuth: (user: Record<string, string>) => void
  }
}

export default function TelegramLoginButton() {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    window.onTelegramAuth = async (user) => {
      const res = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      })

      if (res.ok) {
        router.push('/dashboard')
      } else {
        const body = await res.json().catch(() => ({}))
        alert(body.error ?? 'Помилка входу. Спробуй ще раз.')
      }
    }

    if (!containerRef.current || containerRef.current.childElementCount > 0) return

    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.setAttribute('data-telegram-login', process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME!)
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-onauth', 'onTelegramAuth(user)')
    script.async = true

    containerRef.current.appendChild(script)
  }, [router])

  return <div ref={containerRef} />
}
