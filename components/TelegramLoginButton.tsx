'use client'

import { useEffect, useRef } from 'react'

export default function TelegramLoginButton() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || containerRef.current.childElementCount > 0) return

    const authUrl = `${window.location.origin}/api/auth/telegram/callback`

    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?23'
    script.setAttribute('data-telegram-login', process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME!)
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-auth-url', authUrl)
    script.setAttribute('data-request-access', 'write')
    script.async = true

    containerRef.current.appendChild(script)
  }, [])

  return <div ref={containerRef} />
}
