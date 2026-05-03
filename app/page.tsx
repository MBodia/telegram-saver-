import Link from 'next/link'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'

export default async function Home() {
  const session = await getSession()
  if (session) redirect('/dashboard')

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400;1,700&family=Syne:wght@500;600;700;800&display=swap');

        .ts-root {
          --bg:         #09090C;
          --surface:    #111116;
          --surface2:   #17171E;
          --border:     #1F1F28;
          --text:       #F0EDE4;
          --muted:      #6E6E82;
          --accent:     #E8A020;
          --accent-bg:  rgba(232, 160, 32, 0.10);
          --accent-dim: rgba(232, 160, 32, 0.22);
          --blue:       #229ED9;

          background-color: var(--bg);
          color: var(--text);
          font-family: 'Syne', sans-serif;
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* ── grid texture ── */
        .ts-grid-bg {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px);
          background-size: 72px 72px;
        }

        /* ── staggered entrance ── */
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(36px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .anim-1 { animation: fadeSlideUp .65s .00s ease both; }
        .anim-2 { animation: fadeSlideUp .65s .12s ease both; }
        .anim-3 { animation: fadeSlideUp .65s .24s ease both; }
        .anim-4 { animation: fadeSlideUp .65s .36s ease both; }

        /* ── floating card ── */
        @keyframes floatCard {
          0%,100% { transform: translateY(0)    rotate(-1.5deg); }
          50%     { transform: translateY(-14px) rotate( 0.5deg); }
        }
        .ts-float { animation: floatCard 7s ease-in-out infinite; }

        /* ── typing dots ── */
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.2} }
        .dot-1 { animation: blink 1.4s  0.0s infinite; }
        .dot-2 { animation: blink 1.4s  0.2s infinite; }
        .dot-3 { animation: blink 1.4s  0.4s infinite; }

        /* ── typography ── */
        .ts-serif { font-family: 'Playfair Display', Georgia, serif; }

        /* ── header ── */
        .ts-header {
          position: relative; z-index: 10;
          border-bottom: 1px solid var(--border);
          padding: 16px 24px;
        }
        .ts-header-inner {
          max-width: 1120px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
        }
        .ts-logo {
          display: flex; align-items: center; gap: 10px;
        }
        .ts-logo-mark {
          width: 34px; height: 34px; border-radius: 8px;
          background: var(--accent);
          display: flex; align-items: center; justify-content: center;
          font-size: 17px; flex-shrink: 0;
        }
        .ts-logo-name {
          font-weight: 800; font-size: 14px;
          letter-spacing: .08em; color: var(--text);
        }
        .ts-nav-btn {
          border: 1px solid var(--border);
          color: var(--muted);
          font-family: 'Syne', sans-serif;
          font-weight: 700; font-size: 12px;
          letter-spacing: .08em;
          padding: 8px 18px; border-radius: 8px;
          text-decoration: none;
          transition: border-color .2s, color .2s, background .2s;
        }
        .ts-nav-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-bg); }

        /* ── hero ── */
        .ts-hero {
          position: relative; z-index: 10;
          padding: 88px 24px 96px;
        }
        .ts-hero-inner {
          max-width: 1120px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 64px; align-items: center;
        }
        @media (max-width: 768px) {
          .ts-hero-inner { grid-template-columns: 1fr; gap: 48px; }
          .ts-hero { padding: 56px 24px 64px; }
        }

        .ts-pill {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--accent-bg);
          border: 1px solid var(--accent-dim);
          border-radius: 99px;
          padding: 5px 14px;
          font-size: 11px; font-weight: 700;
          letter-spacing: .12em; color: var(--accent);
          margin-bottom: 24px;
        }
        .ts-pill-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--accent);
        }

        .ts-h1 {
          font-size: clamp(52px, 6.5vw, 86px);
          line-height: 1.0; font-weight: 700;
          letter-spacing: -.025em;
          margin-bottom: 24px;
        }
        @media (max-width: 480px) {
          .ts-h1 { font-size: clamp(40px, 11vw, 52px); }
        }
        .ts-h1 em { font-style: italic; color: var(--accent); }
        .ts-h1 .muted { color: var(--muted); }

        .ts-lead {
          font-size: 16px; line-height: 1.75;
          color: var(--muted); max-width: 400px;
          margin-bottom: 36px;
        }

        .ts-cta-row {
          display: flex; align-items: center; gap: 18px; flex-wrap: wrap;
        }
        .ts-btn-primary {
          display: inline-block;
          background: var(--accent); color: #000;
          font-family: 'Syne', sans-serif;
          font-weight: 800; font-size: 13px;
          letter-spacing: .07em;
          padding: 14px 28px; border-radius: 10px;
          text-decoration: none;
          transition: transform .18s ease, box-shadow .2s ease;
        }
        .ts-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 40px rgba(232,160,32,.5);
        }
        .ts-btn-primary:active {
          transform: scale(0.97);
          box-shadow: 0 4px 16px rgba(232,160,32,.3);
        }
        .ts-cta-note { font-size: 12px; color: var(--muted); }

        /* ── chat card ── */
        .ts-chat-wrap {
          display: flex; justify-content: center;
        }
        .ts-chat {
          width: 100%; max-width: 340px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px; overflow: hidden;
          box-shadow: 0 40px 80px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.04);
        }
        .ts-chat-head {
          padding: 12px 14px;
          background: var(--surface2);
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center; gap: 10px;
        }
        .ts-chat-avatar {
          width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg,#229ED9,#1A7CB3);
          display: flex; align-items: center; justify-content: center; font-size: 15px;
        }
        .ts-chat-name { font-weight: 700; font-size: 13px; }
        .ts-chat-status { font-size: 11px; color: #4CAF50; margin-top: 1px; }
        .ts-chat-body { padding: 14px; display: flex; flex-direction: column; gap: 10px; }

        .ts-msg-out {
          display: flex; justify-content: flex-end;
        }
        .ts-msg-out-bubble {
          background: #229ED9; color: #fff;
          padding: 8px 12px; border-radius: 16px 16px 4px 16px;
          font-size: 12px; max-width: 80%; line-height: 1.4;
          word-break: break-all;
        }

        .ts-msg-in { display: flex; align-items: flex-end; gap: 6px; }
        .ts-msg-in-av {
          width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg,#229ED9,#1A7CB3);
          display: flex; align-items: center; justify-content: center; font-size: 11px;
        }
        .ts-bubble-dots {
          background: var(--surface2); border: 1px solid var(--border);
          padding: 8px 14px; border-radius: 16px 16px 16px 4px;
          display: flex; align-items: center; gap: 4px;
        }
        .ts-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: var(--muted); display: inline-block;
        }

        .ts-bubble-summary {
          background: var(--surface2); border: 1px solid var(--border);
          padding: 10px 12px; border-radius: 16px 16px 16px 4px;
          font-size: 12px; line-height: 1.5; max-width: 80%;
        }
        .ts-summary-label {
          display: flex; align-items: center; gap: 5px;
          color: var(--accent); font-weight: 700;
          font-size: 10px; letter-spacing: .07em;
          margin-bottom: 6px;
        }
        .ts-summary-text { color: var(--text); opacity: .9; }
        .ts-tags { display: flex; gap: 4px; flex-wrap: wrap; margin-top: 8px; }
        .ts-tag {
          background: var(--accent-bg); color: var(--accent);
          font-size: 10px; padding: 2px 8px; border-radius: 99px;
          border: 1px solid var(--accent-dim);
        }
        .ts-saved-note {
          text-align: center; font-size: 11px;
          color: var(--muted); padding: 2px 0;
        }

        /* ── section header ── */
        .ts-section { position: relative; z-index: 10; padding: 72px 24px; }
        .ts-section-inner { max-width: 1120px; margin: 0 auto; }
        .ts-section-border { border-top: 1px solid var(--border); }

        .ts-section-label {
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 40px;
        }
        .ts-label-text {
          font-size: 11px; font-weight: 700; letter-spacing: .15em;
          color: var(--accent); white-space: nowrap;
        }
        .ts-label-line { flex: 1; height: 1px; background: var(--border); }

        /* ── features grid ── */
        .ts-features-grid {
          display: grid; grid-template-columns: repeat(3,1fr);
          gap: 1px; background: var(--border);
          border-radius: 16px; overflow: hidden;
        }
        @media (max-width: 640px) {
          .ts-features-grid { grid-template-columns: 1fr; }
        }

        .ts-feature-card {
          background: var(--surface);
          padding: 36px 28px;
          position: relative; overflow: hidden;
          border-left: 3px solid transparent;
          transition: background .25s, border-color .25s, box-shadow .25s;
        }
        .ts-feature-card:hover {
          background: var(--surface2);
          border-left-color: var(--accent);
          box-shadow: 0 12px 40px rgba(0,0,0,.4);
        }
        .ts-feature-card:hover .ts-feature-num {
          -webkit-text-stroke-color: rgba(232,160,32,.2);
          opacity: 1;
        }

        .ts-feature-num {
          position: absolute; top: 16px; right: 20px;
          font-family: 'Playfair Display', serif;
          font-size: 80px; font-weight: 700; line-height: 1;
          color: transparent;
          -webkit-text-stroke: 1px rgba(255,255,255,.05);
          opacity: .6;
          user-select: none;
          transition: all .3s ease;
        }

        .ts-feature-icon { font-size: 28px; margin-bottom: 18px; }
        .ts-feature-title {
          font-weight: 700; font-size: 16px;
          letter-spacing: -.01em; margin-bottom: 10px;
        }
        .ts-feature-desc {
          font-size: 13px; line-height: 1.75; color: var(--muted);
        }

        /* ── how it works ── */
        .ts-steps {
          display: grid; grid-template-columns: repeat(4,1fr); gap: 24px;
        }
        @media (max-width: 768px) {
          .ts-steps { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 420px) {
          .ts-steps { grid-template-columns: 1fr; }
        }

        .ts-step-num {
          width: 38px; height: 38px; border-radius: 10px;
          background: var(--accent-bg);
          border: 1px solid var(--accent-dim);
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 15px; color: var(--accent);
          margin-bottom: 16px;
          position: relative;
        }
        .ts-step-num::after {
          content: '';
          position: absolute;
          left: 44px;
          top: 50%;
          transform: translateY(-50%);
          width: 32px; height: 1px;
          background: linear-gradient(to right, var(--accent-dim), transparent);
        }
        @media (max-width: 768px) {
          .ts-step-num::after { display: none; }
        }
        .ts-step-title {
          font-weight: 700; font-size: 15px; margin-bottom: 8px;
        }
        .ts-step-desc { font-size: 13px; line-height: 1.7; color: var(--muted); }

        /* ── CTA block ── */
        .ts-cta-block {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 64px 48px; text-align: center;
          position: relative; overflow: hidden;
        }
        @media (max-width: 640px) {
          .ts-cta-block { padding: 40px 24px; }
        }
        .ts-cta-glow {
          position: absolute; top: -60px; left: 50%;
          transform: translateX(-50%);
          width: 320px; height: 320px; border-radius: 50%;
          background: radial-gradient(circle, rgba(232,160,32,.08), transparent 70%);
          pointer-events: none;
        }
        .ts-cta-h2 {
          font-size: clamp(32px, 4.5vw, 56px);
          font-weight: 700; line-height: 1.1;
          letter-spacing: -.025em; margin-bottom: 16px;
        }
        .ts-cta-h2 em { font-style: italic; color: var(--accent); }
        .ts-cta-sub { font-size: 14px; color: var(--muted); margin-bottom: 28px; }

        /* ── footer ── */
        .ts-footer {
          position: relative; z-index: 10;
          border-top: 1px solid var(--border);
          padding: 20px 24px;
        }
        .ts-footer-inner {
          max-width: 1120px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
        }
        .ts-footer-name {
          font-weight: 800; font-size: 12px; letter-spacing: .08em;
        }
        .ts-footer-copy { font-size: 12px; color: var(--muted); }
      `}</style>

      <div className="ts-root">
        <div className="ts-grid-bg" />

        {/* ── Header ── */}
        <header className="ts-header">
          <div className="ts-header-inner">
            <div className="ts-logo">
              <div className="ts-logo-mark">📎</div>
              <span className="ts-logo-name">TELEGRAM SAVER</span>
            </div>
            <Link href="/login" className="ts-nav-btn">УВІЙТИ →</Link>
          </div>
        </header>

        {/* ── Hero ── */}
        <section className="ts-hero">
          <div className="ts-hero-inner">
            {/* Left: text */}
            <div>
              <div className="ts-pill anim-1">
                <span className="ts-pill-dot dot-1" />
                AI-АРХІВ ДЛЯ TELEGRAM
              </div>

              <h1 className="ts-h1 ts-serif anim-2">
                <em>Зберігай</em><br />
                все важливе<br />
                <span className="muted">з Telegram</span>
              </h1>

              <p className="ts-lead anim-3">
                Надсилай боту посилання, скріншоти та PDF —
                отримуй AI-резюме і знаходь усе за секунди.
              </p>

              <div className="ts-cta-row anim-4">
                <Link href="/login" className="ts-btn-primary">
                  ПОЧАТИ БЕЗКОШТОВНО
                </Link>
                <span className="ts-cta-note">Через Telegram · Без пароля</span>
              </div>
            </div>

            {/* Right: floating chat mockup */}
            <div className="ts-chat-wrap">
              <div className="ts-chat ts-float">
                {/* Chat header */}
                <div className="ts-chat-head">
                  <div className="ts-chat-avatar">🤖</div>
                  <div>
                    <div className="ts-chat-name">Saver Bot</div>
                    <div className="ts-chat-status">● онлайн</div>
                  </div>
                </div>

                {/* Messages */}
                <div className="ts-chat-body">
                  {/* User sends link */}
                  <div className="ts-msg-out">
                    <div className="ts-msg-out-bubble">
                      https://youtu.be/dQw4w9WgXcQ
                    </div>
                  </div>

                  {/* Bot typing */}
                  <div className="ts-msg-in">
                    <div className="ts-msg-in-av">🤖</div>
                    <div className="ts-bubble-dots">
                      <span className="ts-dot dot-1" />
                      <span className="ts-dot dot-2" />
                      <span className="ts-dot dot-3" />
                    </div>
                  </div>

                  {/* Bot summary */}
                  <div className="ts-msg-in">
                    <div className="ts-msg-in-av">🤖</div>
                    <div className="ts-bubble-summary">
                      <div className="ts-summary-label">
                        <span>✦</span> AI-РЕЗЮМЕ
                      </div>
                      <div className="ts-summary-text">
                        Rick Astley — Never Gonna Give You Up (1987). Культовий кліп поп-музики 80-х.
                      </div>
                      <div className="ts-tags">
                        {['музика', '80-ті', 'відео'].map(t => (
                          <span key={t} className="ts-tag">#{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="ts-saved-note">✓ Збережено в архів</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="ts-section ts-section-border">
          <div className="ts-section-inner">
            <div className="ts-section-label">
              <span className="ts-label-text">ЩО МОЖНА ЗБЕРІГАТИ</span>
              <div className="ts-label-line" />
            </div>

            <div className="ts-features-grid">
              {[
                {
                  num: '01', icon: '🔗',
                  title: 'Посилання',
                  desc: 'Бот заходить на сторінку, зчитує зміст і генерує стисле AI-резюме. Без зайвих слів.',
                },
                {
                  num: '02', icon: '🖼️',
                  title: 'Скріншоти та фото',
                  desc: 'AI читає текст із зображень, описує що на них і автоматично додає теги для пошуку.',
                },
                {
                  num: '03', icon: '📄',
                  title: 'PDF-файли',
                  desc: 'Завантаж документ — отримай стислий зміст і збережи в персональний архів.',
                },
              ].map(f => (
                <div key={f.num} className="ts-feature-card">
                  <span className="ts-feature-num">{f.num}</span>
                  <div className="ts-feature-icon">{f.icon}</div>
                  <div className="ts-feature-title">{f.title}</div>
                  <div className="ts-feature-desc">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="ts-section ts-section-border">
          <div className="ts-section-inner">
            <div className="ts-section-label">
              <span className="ts-label-text">ЯК ЦЕ ПРАЦЮЄ</span>
              <div className="ts-label-line" />
            </div>

            <div className="ts-steps">
              {[
                {
                  n: '1', title: 'Підключи бота',
                  desc: 'Запусти бота у Telegram та авторизуйся на сайті одним кліком.',
                },
                {
                  n: '2', title: 'Надсилай контент',
                  desc: 'Кидай боту будь-що — посилання, фото, PDF або просто текст.',
                },
                {
                  n: '3', title: 'AI обробляє',
                  desc: 'Бот аналізує, робить резюме і додає теги автоматично.',
                },
                {
                  n: '4', title: 'Шукай і знаходь',
                  desc: 'Відкрий архів у браузері і знайди що треба за секунди.',
                },
              ].map(s => (
                <div key={s.n}>
                  <div className="ts-step-num">{s.n}</div>
                  <div className="ts-step-title">{s.title}</div>
                  <div className="ts-step-desc">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="ts-section ts-section-border">
          <div className="ts-section-inner">
            <div className="ts-cta-block">
              <div className="ts-cta-glow" />
              <h2 className="ts-cta-h2 ts-serif">
                Почни зберігати<br />
                <em>прямо зараз</em>
              </h2>
              <p className="ts-cta-sub">
                Безкоштовно · Вхід через Telegram · Без паролів
              </p>
              <Link href="/login" className="ts-btn-primary">
                РОЗПОЧАТИ →
              </Link>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="ts-footer">
          <div className="ts-footer-inner">
            <span className="ts-footer-name">TELEGRAM SAVER</span>
            <span className="ts-footer-copy">© 2026</span>
          </div>
        </footer>
      </div>
    </>
  )
}
