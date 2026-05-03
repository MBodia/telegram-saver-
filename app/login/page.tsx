import Link from 'next/link'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import DevLoginButton from '@/components/DevLoginButton'
import BotCodeForm from '@/components/BotCodeForm'

const ERROR_MESSAGES: Record<string, string> = {
  expired: 'Час авторизації вийшов. Спробуй ще раз.',
  invalid_signature: 'Помилка підпису від Telegram. Спробуй ще раз.',
  db_error: 'Помилка бази даних. Спробуй ще раз.',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const session = await getSession()
  if (session) redirect('/dashboard')

  const { error } = await searchParams
  const errorMessage = error ? (ERROR_MESSAGES[error] ?? 'Помилка входу. Спробуй ще раз.') : null

  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? 'AI_hol228MBot'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400;1,700&family=Syne:wght@500;600;700;800&display=swap');

        .lg-root {
          --bg:         #09090C;
          --surface:    #111116;
          --surface2:   #17171E;
          --border:     #1F1F28;
          --text:       #F0EDE4;
          --muted:      #6E6E82;
          --accent:     #E8A020;
          --accent-bg:  rgba(232, 160, 32, 0.08);
          --accent-dim: rgba(232, 160, 32, 0.20);
          --blue:       #229ED9;
          --blue-bg:    rgba(34, 158, 217, 0.08);
          --blue-dim:   rgba(34, 158, 217, 0.20);
          --red:        #E05252;
          --red-bg:     rgba(224, 82, 82, 0.08);

          background-color: var(--bg);
          color: var(--text);
          font-family: 'Syne', sans-serif;
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* ── grid texture ── */
        .lg-grid-bg {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.016) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.016) 1px, transparent 1px);
          background-size: 72px 72px;
        }

        /* ── ambient glow ── */
        .lg-glow {
          position: fixed;
          top: -120px;
          right: -80px;
          width: 560px;
          height: 560px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(232,160,32,0.055) 0%, transparent 65%);
          pointer-events: none;
          z-index: 0;
        }
        .lg-glow-2 {
          position: fixed;
          bottom: -100px;
          left: -60px;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(34,158,217,0.04) 0%, transparent 65%);
          pointer-events: none;
          z-index: 0;
        }

        /* ── staggered entrance ── */
        @keyframes lg-rise {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lg-fade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes lg-slide-right {
          from { opacity: 0; transform: translateX(-16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes lg-line-grow {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes lg-pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.7); }
        }

        .lg-anim-1 { animation: lg-rise 0.7s 0.0s ease both; }
        .lg-anim-2 { animation: lg-rise 0.7s 0.1s ease both; }
        .lg-anim-3 { animation: lg-rise 0.7s 0.2s ease both; }
        .lg-anim-4 { animation: lg-rise 0.7s 0.3s ease both; }
        .lg-anim-5 { animation: lg-rise 0.7s 0.4s ease both; }
        .lg-anim-6 { animation: lg-rise 0.7s 0.55s ease both; }
        .lg-anim-fade { animation: lg-fade 1.2s 0.0s ease both; }
        .lg-line-anim {
          transform-origin: left center;
          animation: lg-line-grow 1s 0.2s ease both;
        }

        /* ── layout ── */
        .lg-layout {
          position: relative;
          z-index: 10;
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: auto 1fr auto;
        }
        @media (max-width: 860px) {
          .lg-layout {
            grid-template-columns: 1fr;
            grid-template-rows: auto auto 1fr auto;
          }
          .lg-left { display: none; }
          .lg-right { border-left: none !important; padding: 0 24px 48px !important; }
          .lg-header { grid-column: 1 !important; }
          .lg-footer { grid-column: 1 !important; }
          .lg-mobile-hero { display: flex; }
        }

        /* ── mobile hero (shown only on mobile) ── */
        .lg-mobile-hero {
          display: none;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 32px 24px 8px;
          gap: 10px;
        }
        .lg-mobile-hero-logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .lg-mobile-hero-mark {
          width: 36px; height: 36px;
          border-radius: 9px;
          background: var(--accent);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }
        .lg-mobile-hero-name {
          font-weight: 800;
          font-size: 14px;
          letter-spacing: .08em;
          color: var(--text);
        }
        .lg-mobile-hero-tag {
          font-size: 12px;
          color: var(--muted);
          line-height: 1.6;
          max-width: 280px;
        }

        /* ── header ── */
        .lg-header {
          grid-column: 1 / -1;
          border-bottom: 1px solid var(--border);
          padding: 16px 36px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .lg-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }
        .lg-logo-mark {
          width: 32px; height: 32px;
          border-radius: 8px;
          background: var(--accent);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
        }
        .lg-logo-name {
          font-weight: 800;
          font-size: 13px;
          letter-spacing: .08em;
          color: var(--text);
        }
        .lg-back-link {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: .07em;
          color: var(--muted);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: color .2s;
        }
        .lg-back-link:hover { color: var(--text); }

        /* ── left panel ── */
        .lg-left {
          border-right: 1px solid var(--border);
          padding: 56px 48px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .lg-serif { font-family: 'Playfair Display', Georgia, serif; }

        .lg-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .18em;
          color: var(--accent);
          margin-bottom: 28px;
        }
        .lg-eyebrow-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: var(--accent);
          animation: lg-pulse-dot 2s infinite;
        }

        .lg-h1 {
          font-size: clamp(44px, 5vw, 70px);
          line-height: 1.04;
          font-weight: 700;
          letter-spacing: -.03em;
          margin-bottom: 28px;
        }
        .lg-h1 em {
          font-style: italic;
          color: var(--accent);
        }
        .lg-h1 .lg-dim { color: var(--muted); }

        .lg-divider {
          width: 80px;
          height: 1px;
          background: linear-gradient(to right, var(--accent), transparent);
          margin-bottom: 28px;
        }

        .lg-tagline {
          font-size: 14px;
          line-height: 1.8;
          color: var(--muted);
          max-width: 320px;
          margin-bottom: 48px;
        }

        .lg-badges {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .lg-badge {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: .04em;
          color: var(--muted);
        }
        .lg-badge-icon {
          width: 32px; height: 32px;
          border-radius: 9px;
          background: var(--surface2);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          flex-shrink: 0;
          transition: background .2s;
        }

        /* decorative vertical rule */
        .lg-vert-rule {
          position: absolute;
          top: 0; bottom: 0;
          left: 50%;
          width: 1px;
          background: linear-gradient(to bottom, transparent, var(--border) 20%, var(--border) 80%, transparent);
          pointer-events: none;
        }

        /* ── right panel ── */
        .lg-right {
          border-left: 1px solid var(--border);
          padding: 56px 48px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .lg-right-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .18em;
          color: var(--muted);
          margin-bottom: 32px;
        }

        /* ── method card ── */
        .lg-method {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 28px;
          margin-bottom: 12px;
          position: relative;
          overflow: hidden;
          transition: transform .2s, box-shadow .2s, border-color .2s;
        }
        .lg-method:hover {
          border-color: rgba(255,255,255,0.1);
          transform: translateY(-2px);
          box-shadow: 0 12px 36px rgba(0,0,0,.35);
        }
        .lg-method-accent:hover {
          border-color: var(--accent-dim) !important;
        }
        .lg-method-inner-glow {
          position: absolute;
          top: -40px; left: -40px;
          width: 160px; height: 160px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(232,160,32,0.06), transparent 70%);
          pointer-events: none;
        }
        .lg-method-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .14em;
          color: var(--accent);
          background: var(--accent-bg);
          border: 1px solid var(--accent-dim);
          border-radius: 99px;
          padding: 3px 10px;
          margin-bottom: 16px;
        }
        .lg-method-tag-blue {
          color: var(--blue) !important;
          background: var(--blue-bg) !important;
          border-color: var(--blue-dim) !important;
        }
        .lg-method-title {
          font-size: 16px;
          font-weight: 700;
          letter-spacing: -.01em;
          margin-bottom: 6px;
        }
        .lg-method-desc {
          font-size: 12px;
          line-height: 1.75;
          color: var(--muted);
          margin-bottom: 20px;
        }

        /* ── steps list ── */
        .lg-steps {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 20px;
        }
        .lg-step {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 12px;
          color: var(--muted);
          line-height: 1.5;
        }
        .lg-step-n {
          width: 22px;
          height: 22px;
          border-radius: 5px;
          background: var(--accent-bg);
          border: 1px solid var(--accent-dim);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 800;
          color: var(--accent);
          flex-shrink: 0;
          margin-top: 1px;
        }
        .lg-step code {
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 1px 6px;
          font-size: 11px;
          font-family: 'Syne', monospace;
          color: var(--text);
          letter-spacing: .04em;
        }

        /* ── telegram button ── */
        .lg-tg-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          width: 100%;
          background: #229ED9;
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: .06em;
          padding: 16px 24px;
          border-radius: 10px;
          text-decoration: none;
          transition: opacity .15s, box-shadow .2s, transform .15s;
          border: none;
          cursor: pointer;
        }
        .lg-tg-btn:hover {
          opacity: .92;
          box-shadow: 0 8px 28px rgba(34,158,217,0.3);
          transform: translateY(-1px);
        }
        .lg-tg-btn:active {
          transform: translateY(0) scale(0.98);
          opacity: 1;
        }
        .lg-tg-btn:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 3px;
        }

        /* ── separator ── */
        .lg-sep {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 10px 0;
        }
        .lg-sep-line {
          flex: 1;
          height: 1px;
          background: var(--border);
        }
        .lg-sep-text {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .12em;
          color: var(--muted);
        }

        /* ── error banner ── */
        .lg-error {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--red-bg);
          border: 1px solid rgba(224,82,82,0.22);
          border-radius: 10px;
          padding: 12px 14px;
          margin-bottom: 16px;
          font-size: 12px;
          color: var(--red);
          line-height: 1.5;
        }
        .lg-error-icon {
          font-size: 14px;
          flex-shrink: 0;
        }

        /* ── footer ── */
        .lg-footer {
          grid-column: 1 / -1;
          border-top: 1px solid var(--border);
          padding: 14px 36px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .lg-footer-trust {
          display: flex;
          align-items: center;
          gap: 18px;
        }
        .lg-footer-item {
          font-size: 11px;
          color: var(--muted);
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .lg-footer-dot {
          width: 4px; height: 4px;
          border-radius: 50%;
          background: var(--muted);
          opacity: 0.4;
        }
        .lg-dev-wrap {
          display: flex;
          align-items: center;
        }
      `}</style>

      <div className="lg-root">
        <div className="lg-grid-bg lg-anim-fade" />
        <div className="lg-glow lg-anim-fade" />
        <div className="lg-glow-2 lg-anim-fade" />

        <div className="lg-layout">

          {/* ── Header ── */}
          <header className="lg-header">
            <Link href="/" className="lg-logo">
              <div className="lg-logo-mark">📎</div>
              <span className="lg-logo-name">TELEGRAM SAVER</span>
            </Link>
            <Link href="/" className="lg-back-link">
              ← На головну
            </Link>
          </header>

          {/* ── Left Panel ── */}
          <div className="lg-left">
            <div className="lg-vert-rule" />

            <div className="lg-eyebrow lg-anim-1">
              <span className="lg-eyebrow-dot" />
              ВХІД ДО КАБІНЕТУ
            </div>

            <h1 className="lg-h1 lg-serif lg-anim-2">
              <em>Увійди</em><br />
              і почни<br />
              <span className="lg-dim">зберігати</span>
            </h1>

            <div className="lg-divider lg-line-anim" />

            <p className="lg-tagline lg-anim-3">
              Авторизація через Telegram — без паролів,
              без реєстрації. Твої дані захищені.
            </p>

            <div className="lg-badges lg-anim-4">
              <div className="lg-badge">
                <div className="lg-badge-icon">🔒</div>
                Без паролів — вхід через Telegram
              </div>
              <div className="lg-badge">
                <div className="lg-badge-icon">⚡</div>
                Вхід за 10 секунд
              </div>
              <div className="lg-badge">
                <div className="lg-badge-icon">🆓</div>
                Безкоштовно назавжди
              </div>
            </div>
          </div>

          {/* ── Right Panel ── */}
          <div className="lg-right">

            {/* Mobile-only hero block */}
            <div className="lg-mobile-hero lg-anim-1">
              <div className="lg-mobile-hero-logo">
                <div className="lg-mobile-hero-mark">📎</div>
                <span className="lg-mobile-hero-name">TELEGRAM SAVER</span>
              </div>
              <p className="lg-mobile-hero-tag">
                Зберігай важливе з Telegram — без паролів, миттєво.
              </p>
            </div>

            <div className="lg-right-label lg-anim-1">
              ОБЕРІТЬ СПОСІБ ВХОДУ
            </div>

            {errorMessage && (
              <div className="lg-error lg-anim-2">
                <span className="lg-error-icon">⚠</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Method 1: Bot link */}
            <div className="lg-method lg-method-accent lg-anim-2">
              <div className="lg-method-inner-glow" />
              <div className="lg-method-tag">✦ РЕКОМЕНДОВАНО</div>
              <div className="lg-method-title">Вхід через бота</div>
              <div className="lg-method-desc">
                Відкрий бота, надішли команду — і натисни кнопку в повідомленні.
              </div>

              <div className="lg-steps">
                <div className="lg-step">
                  <span className="lg-step-n">1</span>
                  <span>Відкрий бота в Telegram</span>
                </div>
                <div className="lg-step">
                  <span className="lg-step-n">2</span>
                  <span>Надішли команду <code>/login</code></span>
                </div>
                <div className="lg-step">
                  <span className="lg-step-n">3</span>
                  <span>Натисни <strong style={{color: 'var(--text)'}}>«Увійти на сайт»</strong> у повідомленні</span>
                </div>
              </div>

              <a
                href={`https://t.me/${botUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="lg-tg-btn"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.012 9.478c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.48 14.697l-2.95-.924c-.642-.202-.655-.642.136-.95l11.525-4.445c.535-.194 1.004.13.371.87z"/>
                </svg>
                Відкрити @{botUsername}
              </a>
            </div>

            {/* Separator */}
            <div className="lg-sep lg-anim-3">
              <div className="lg-sep-line" />
              <span className="lg-sep-text">АБО</span>
              <div className="lg-sep-line" />
            </div>

            {/* Method 2: Manual code */}
            <div className="lg-method lg-anim-4">
              <div className="lg-method-tag lg-method-tag-blue">✦ КОД ВІД БОТА</div>
              <div className="lg-method-title">Введи 6-значний код</div>
              <div className="lg-method-desc">
                Якщо бот вже надіслав тобі код — введи його тут вручну.
              </div>
              <BotCodeForm />
            </div>

            {/* Dev login */}
            <div className="lg-anim-5" style={{marginTop: '4px', display: 'flex', justifyContent: 'center'}}>
              <DevLoginButton />
            </div>
          </div>

          {/* ── Footer ── */}
          <footer className="lg-footer">
            <div className="lg-footer-trust">
              <span className="lg-footer-item">🔒 Без паролів</span>
              <span className="lg-footer-dot" />
              <span className="lg-footer-item">⚡ Миттєвий вхід</span>
              <span className="lg-footer-dot" />
              <span className="lg-footer-item">🆓 Безкоштовно</span>
            </div>
            <span style={{fontSize: '11px', color: 'var(--muted)'}}>© 2026</span>
          </footer>

        </div>
      </div>
    </>
  )
}
