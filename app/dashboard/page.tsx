import { getSession } from '@/lib/session'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SavedItemsList from '@/components/SavedItemsList'

export default async function DashboardPage() {
  const profileId = await getSession()
  if (!profileId) redirect('/login')

  const supabase = createAdminClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .single()

  if (!profile) redirect('/login')

  const { data: items } = await supabase
    .from('saved_items')
    .select('id, type, title, description, summary, full_text, source_url, created_at, is_favorite, item_tags(tags(id, name, color))')
    .eq('user_id', profileId)
    .order('created_at', { ascending: false })

  const itemCount = items?.length ?? 0

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#09090C', color: '#F0EDE4', fontFamily: "'Syne', sans-serif" }}>
      <style>{`
        /* ── header logo ── */
        .db-logo {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none;
          opacity: 1;
          transition: opacity .2s;
        }
        .db-logo:hover { opacity: 0.85; }

        /* ── logout button ── */
        .db-logout-btn {
          background: transparent;
          border: 1px solid transparent;
          border-radius: 8px;
          padding: 6px 14px;
          font-family: 'Syne', sans-serif;
          font-size: 12px; font-weight: 700;
          letter-spacing: .06em;
          color: #6E6E82;
          cursor: pointer;
          transition: border-color .18s, color .18s;
        }
        .db-logout-btn:hover {
          border-color: #2A2A38;
          color: #A0A0B0;
        }
      `}</style>

      {/* Header */}
      <header style={{ borderBottom: '1px solid #1F1F28', position: 'sticky', top: 0, zIndex: 20, backgroundColor: 'rgba(9,9,12,0.92)', backdropFilter: 'blur(12px)', padding: '0 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
          <Link href="/dashboard" className="db-logo">
            <div style={{ width: 30, height: 30, borderRadius: 7, background: '#E8A020', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>
              📎
            </div>
            <span style={{ fontWeight: 800, fontSize: 13, letterSpacing: '.08em', color: '#F0EDE4' }}>
              TELEGRAM SAVER
            </span>
          </Link>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="db-logout-btn">
              ВИЙТИ
            </button>
          </form>
        </div>
      </header>

      <main style={{ maxWidth: 960, margin: '0 auto', padding: '48px 24px 96px' }}>
        {/* Profile strip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40, paddingBottom: 32, borderBottom: '1px solid #1F1F28' }}>
          {profile.telegram_photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.telegram_photo_url}
              alt="Фото профілю"
              style={{
                width: 52, height: 52, borderRadius: '50%', objectFit: 'cover',
                border: '2px solid #1F1F28', flexShrink: 0,
                boxShadow: '0 0 0 3px rgba(232,160,32,0.15)',
              }}
            />
          ) : (
            <div style={{
              width: 52, height: 52, borderRadius: '50%', background: '#1F1F28',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, flexShrink: 0,
              boxShadow: '0 0 0 3px rgba(232,160,32,0.15)',
            }}>
              👤
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: '-.01em', margin: 0, lineHeight: 1.2 }}>
              Привіт, {profile.telegram_first_name}!
            </h1>
            {profile.telegram_username && (
              <p style={{ fontSize: 12, color: '#6E6E82', margin: '3px 0 0', fontWeight: 500, letterSpacing: '.04em' }}>
                @{profile.telegram_username}
              </p>
            )}
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{
              fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, fontSize: 32, lineHeight: 1, color: '#E8A020',
              background: 'rgba(232,160,32,0.1)',
              border: '1px solid rgba(232,160,32,0.2)',
              borderRadius: 12,
              padding: '8px 16px',
            }}>
              {itemCount}
            </div>
            <div style={{ fontSize: 10, color: '#6E6E82', letterSpacing: '.12em', fontWeight: 700, marginTop: 6 }}>
              ЗБЕРЕЖЕНЬ
            </div>
          </div>
        </div>

        <SavedItemsList items={items ?? []} userId={profileId} />
      </main>
    </div>
  )
}
