import { getSession } from '@/lib/session'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DeleteButton from '@/components/DeleteButton'
import TagsSection from '@/components/TagsSection'
import AudioPlayer from '@/components/AudioPlayer'

const TYPE_ICONS: Record<string, string> = {
  link: '🔗',
  photo: '🖼️',
  pdf: '📄',
  text: '📝',
  forward: '↪️',
  voice: '🎙️',
  audio: '🎵',
}

const TYPE_LABELS: Record<string, string> = {
  link: 'Посилання',
  photo: 'Фото',
  pdf: 'PDF',
  text: 'Текст',
  forward: 'Репост',
  voice: 'Голос',
  audio: 'Аудіо',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function ItemPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const profileId = await getSession()
  if (!profileId) redirect('/login')

  const { id } = await params
  const supabase = createAdminClient()

  const [{ data: item }, { data: itemTags }, { data: mediaFiles }] = await Promise.all([
    supabase
      .from('saved_items')
      .select('*')
      .eq('id', id)
      .eq('user_id', profileId)
      .single(),
    supabase
      .from('item_tags')
      .select('tags(id, name, color)')
      .eq('item_id', id),
    supabase
      .from('media_files')
      .select('id, storage_path, mime_type, extracted_text, vision_description, order_index')
      .eq('item_id', id)
      .order('order_index', { ascending: true }),
  ])

  if (!item) redirect('/dashboard')

  type Tag = { id: string; name: string; color: string }
  const existingTags: Tag[] = (itemTags ?? []).flatMap(row => {
    const tags = row.tags as Tag | Tag[] | null
    if (!tags) return []
    return Array.isArray(tags) ? tags : [tags]
  })

  const suggestedTags: string[] =
    (item.ai_analysis as { suggested_tags?: string[] } | null)?.suggested_tags ?? []

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const isAudio = item.type === 'voice' || item.type === 'audio'
  const audioSrc = isAudio
    ? (item.source_url ?? (item.storage_path ? `${supabaseUrl}/storage/v1/object/public/media/${item.storage_path}` : null))
    : null

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400;1,700&family=Syne:wght@500;600;700;800&display=swap');

        .it-root {
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
        }

        .it-grid-bg {
          position: fixed; inset: 0;
          pointer-events: none; z-index: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px);
          background-size: 72px 72px;
        }

        .it-header {
          position: relative; z-index: 10;
          border-bottom: 1px solid var(--border);
          padding: 14px 24px;
        }
        .it-header-inner {
          max-width: 720px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
        }
        .it-back {
          font-size: 13px; font-weight: 600;
          color: var(--muted);
          text-decoration: none;
          display: flex; align-items: center; gap: 6px;
          transition: color .2s;
        }
        .it-back:hover { color: var(--text); }

        .it-delete-btn {
          font-size: 12px; font-weight: 700;
          letter-spacing: .06em;
          color: #ef4444;
          background: rgba(239,68,68,.08);
          border: 1px solid rgba(239,68,68,.2);
          padding: 6px 14px; border-radius: 8px;
          cursor: pointer; transition: all .2s;
        }
        .it-delete-btn:hover {
          background: rgba(239,68,68,.15);
          border-color: rgba(239,68,68,.4);
        }

        .it-main {
          position: relative; z-index: 10;
          max-width: 720px; margin: 0 auto;
          padding: 40px 24px 80px;
        }

        .it-meta {
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 20px;
        }
        .it-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: var(--accent-bg);
          border: 1px solid var(--accent-dim);
          color: var(--accent);
          font-size: 11px; font-weight: 700;
          letter-spacing: .1em;
          padding: 4px 12px; border-radius: 99px;
        }
        .it-dot { color: var(--border); }
        .it-date { font-size: 12px; color: var(--muted); }

        .it-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(24px, 4vw, 36px);
          font-weight: 700; line-height: 1.2;
          letter-spacing: -.02em;
          margin-bottom: 28px;
        }

        .it-section-label {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 12px;
        }
        .it-label-text {
          font-size: 10px; font-weight: 700;
          letter-spacing: .15em;
          color: var(--accent);
          white-space: nowrap;
        }
        .it-label-line { flex: 1; height: 1px; background: var(--border); }

        .it-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 16px;
        }
        .it-card-label {
          font-size: 10px; font-weight: 700;
          letter-spacing: .15em;
          color: var(--muted);
          margin-bottom: 10px;
        }
        .it-card-text {
          font-size: 14px; line-height: 1.8;
          color: var(--text); opacity: .85;
          white-space: pre-wrap;
        }

        .it-link-btn {
          display: flex; align-items: center; gap: 10px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 14px 16px;
          text-decoration: none;
          color: var(--blue);
          font-size: 13px;
          margin-bottom: 24px;
          transition: border-color .2s, background .2s;
          overflow: hidden;
        }
        .it-link-btn:hover {
          border-color: var(--blue);
          background: rgba(34,158,217,.06);
        }
        .it-link-url {
          flex: 1; overflow: hidden;
          text-overflow: ellipsis; white-space: nowrap;
          font-size: 12px; opacity: .8;
        }

        .it-pdf-btn {
          display: flex; align-items: center; gap: 10px;
          background: var(--accent-bg);
          border: 1px solid var(--accent-dim);
          border-radius: 14px;
          padding: 14px 16px;
          text-decoration: none;
          color: var(--accent);
          font-size: 13px; font-weight: 600;
          margin-bottom: 24px;
          transition: background .2s, border-color .2s;
        }
        .it-pdf-btn:hover {
          background: rgba(232,160,32,.16);
          border-color: rgba(232,160,32,.4);
        }

        .it-photo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 8px; margin-bottom: 24px;
        }
        .it-photo-single {
          margin-bottom: 24px;
        }
        .it-photo-img {
          border-radius: 14px;
          width: 100%; object-fit: cover;
          border: 1px solid var(--border);
          aspect-ratio: 1/1;
          transition: opacity .2s;
        }
        .it-photo-img:hover { opacity: .85; }
        .it-photo-single-img {
          border-radius: 16px;
          width: 100%; object-fit: contain;
          max-height: 70vh;
          border: 1px solid var(--border);
        }

        .it-forward-origin {
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 13px;
          color: var(--muted);
          display: flex; align-items: center; gap: 8px;
        }

        /* Override DeleteButton default styles */
        .it-delete-wrap button {
          font-size: 12px !important;
          font-weight: 700 !important;
          letter-spacing: .06em !important;
          color: #ef4444 !important;
          background: rgba(239,68,68,.08) !important;
          border: 1px solid rgba(239,68,68,.2) !important;
          padding: 6px 14px !important;
          border-radius: 8px !important;
          transition: all .2s !important;
          font-family: 'Syne', sans-serif !important;
        }
        .it-delete-wrap button:hover {
          background: rgba(239,68,68,.15) !important;
          border-color: rgba(239,68,68,.4) !important;
        }
      `}</style>

      <div className="it-root">
        <div className="it-grid-bg" />

        {/* Header */}
        <header className="it-header">
          <div className="it-header-inner">
            <Link href="/dashboard" className="it-back">
              ← Назад до архіву
            </Link>
            <div className="it-delete-wrap">
              <DeleteButton itemId={item.id} />
            </div>
          </div>
        </header>

        <main className="it-main">
          {/* Meta: type badge + date */}
          <div className="it-meta">
            <span className="it-badge">
              <span>{TYPE_ICONS[item.type]}</span>
              <span>{TYPE_LABELS[item.type]}</span>
            </span>
            <span className="it-dot">·</span>
            <span className="it-date">{formatDate(item.created_at)}</span>
          </div>

          {/* Title */}
          {item.title && (
            <h1 className="it-title">{item.title}</h1>
          )}

          {/* Source URL (only for non-audio types) */}
          {item.source_url && !isAudio && (
            <a
              href={item.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="it-link-btn"
            >
              <span>🔗</span>
              <span className="it-link-url">{item.source_url}</span>
              <span style={{ flexShrink: 0, fontSize: 11, opacity: .5 }}>↗</span>
            </a>
          )}

          {/* Audio player */}
          {isAudio && audioSrc && (
            <div style={{ marginBottom: 24 }}>
              <div className="it-section-label">
                <span className="it-label-text">АУДІО</span>
                <div className="it-label-line" />
              </div>
              <AudioPlayer src={audioSrc} type={item.type} />
            </div>
          )}

          {/* Photos */}
          {item.type === 'photo' && (
            <div style={{ marginBottom: 24 }}>
              {mediaFiles && mediaFiles.length > 1 ? (
                <div className="it-photo-grid">
                  {mediaFiles.map((mf) => {
                    const url = `${supabaseUrl}/storage/v1/object/public/media/${mf.storage_path}`
                    return (
                      <a key={mf.id} href={url} target="_blank" rel="noopener noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={mf.vision_description ?? 'Фото'}
                          className="it-photo-img"
                          title={mf.vision_description ?? undefined}
                        />
                      </a>
                    )
                  })}
                </div>
              ) : (
                <div className="it-photo-single">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.source_url ?? (mediaFiles?.[0]
                      ? `${supabaseUrl}/storage/v1/object/public/media/${mediaFiles[0].storage_path}`
                      : '')}
                    alt={item.title ?? 'Фото'}
                    className="it-photo-single-img"
                  />
                </div>
              )}
            </div>
          )}

          {/* PDF */}
          {item.type === 'pdf' && (item.source_url || item.storage_path) && (
            <a
              href={item.source_url ?? `${supabaseUrl}/storage/v1/object/public/media/${item.storage_path}`}
              target="_blank"
              rel="noopener noreferrer"
              className="it-pdf-btn"
            >
              <span>📄</span>
              <span>Відкрити PDF</span>
            </a>
          )}

          {/* Tags */}
          <div style={{ marginBottom: 16 }}>
            <TagsSection
              itemId={item.id}
              initialTags={existingTags}
              suggestedTags={suggestedTags}
            />
          </div>

          {/* Summary */}
          {item.summary && (
            <div className="it-card">
              <div className="it-card-label">✦ РЕЗЮМЕ</div>
              <p className="it-card-text">{item.summary}</p>
            </div>
          )}

          {/* Description */}
          {item.description && item.description !== item.summary && (
            <div className="it-card">
              <div className="it-card-label">ОПИС</div>
              <p className="it-card-text">{item.description}</p>
            </div>
          )}

          {/* Full text / Transcription */}
          {item.full_text && (
            <div className="it-card">
              <div className="it-card-label">
                {isAudio ? 'ТРАНСКРИПЦІЯ' : 'ПОВНИЙ ТЕКСТ'}
              </div>
              <p className="it-card-text">{item.full_text}</p>
            </div>
          )}

          {/* OCR from album */}
          {mediaFiles && mediaFiles.length > 1 && mediaFiles.some(mf => mf.extracted_text) && (
            <div className="it-card">
              <div className="it-card-label">ТЕКСТ З ФОТО</div>
              {mediaFiles.map((mf, i) => mf.extracted_text ? (
                <div key={mf.id} style={{ marginBottom: 12 }}>
                  <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Фото {i + 1}</p>
                  <p className="it-card-text" style={{ fontSize: 13 }}>{mf.extracted_text}</p>
                </div>
              ) : null)}
            </div>
          )}

          {/* Forward origin */}
          {item.forward_origin && (
            <div className="it-card">
              <div className="it-card-label">ДЖЕРЕЛО РЕПОСТУ</div>
              <div className="it-forward-origin">
                <span>↪️</span>
                <span>
                  {(item.forward_origin as { chat_title?: string; sender_name?: string })?.chat_title ??
                   (item.forward_origin as { sender_name?: string })?.sender_name ??
                   'Невідоме джерело'}
                </span>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  )
}
