'use client'

import { useState, useRef } from 'react'

function fmt(s: number) {
  if (!isFinite(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export default function AudioPlayer({ src, type }: { src: string; type?: string }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)

  function toggle() {
    const el = audioRef.current
    if (!el) return
    if (playing) { el.pause(); setPlaying(false) }
    else { el.play(); setPlaying(true) }
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const el = audioRef.current
    if (!el || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    el.currentTime = ratio * duration
  }

  const progress = duration > 0 ? (current / duration) * 100 : 0
  const icon = type === 'voice' ? '🎙️' : '🎵'

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 16,
      padding: '18px 20px',
    }}>
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={() => setCurrent(audioRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onEnded={() => { setPlaying(false); setCurrent(0) }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Icon */}
        <div style={{ fontSize: 20, flexShrink: 0 }}>{icon}</div>

        {/* Progress + times */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            onClick={seek}
            style={{
              height: 4,
              background: 'var(--border)',
              borderRadius: 99,
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            <div style={{
              position: 'absolute',
              left: 0, top: 0, bottom: 0,
              width: `${progress}%`,
              background: 'var(--accent)',
              borderRadius: 99,
              transition: 'width .1s linear',
            }} />
            {/* Thumb */}
            <div style={{
              position: 'absolute',
              left: `${progress}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 12, height: 12,
              borderRadius: '50%',
              background: 'var(--accent)',
              boxShadow: '0 0 0 3px rgba(232,160,32,.25)',
              transition: 'left .1s linear',
            }} />
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 6,
            fontSize: 11,
            color: 'var(--muted)',
            fontFamily: "'Syne', sans-serif",
          }}>
            <span>{fmt(current)}</span>
            <span>{fmt(duration)}</span>
          </div>
        </div>

        {/* Play/Pause */}
        <button
          onClick={toggle}
          style={{
            width: 42, height: 42,
            borderRadius: '50%',
            background: 'var(--accent)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            flexShrink: 0,
            color: '#000',
            fontWeight: 700,
            transition: 'transform .15s, box-shadow .2s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)'
            ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 24px rgba(232,160,32,.45)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
            ;(e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'
          }}
        >
          {playing ? '⏸' : '▶'}
        </button>
      </div>
    </div>
  )
}
