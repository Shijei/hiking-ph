'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  songUrl: string
  autoplay?: boolean
}

export default function SongPlayer({ songUrl, autoplay = false }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !autoplay) return

    audio.muted = true
    audio.volume = 0.35
    audio.play().then(() => {
      setPlaying(true)
    }).catch(() => {
      setPlaying(false)
    })

    const handleEnd = () => setPlaying(false)
    audio.addEventListener('ended', handleEnd)
    return () => audio.removeEventListener('ended', handleEnd)
  }, [autoplay])

  const toggleMute = () => {
    if (!audioRef.current) return
    audioRef.current.muted = !muted
    setMuted(!muted)
  }

  const togglePlay = () => {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.muted = muted
      audioRef.current.play()
      setPlaying(true)
    }
  }

  return (
    <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2">
      <button
        onClick={togglePlay}
        className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shrink-0 hover:bg-gray-800 transition text-xs"
      >
        {playing ? '⏸' : '▶'}
      </button>
      <div className="flex-1">
        <p className="text-xs font-medium">🎵 Profile Song</p>
        <p className="text-xs text-gray-400">{playing ? (muted ? 'Playing (muted)' : 'Now playing...') : 'Tap to play'}</p>
      </div>
      {playing && (
        <button
          onClick={toggleMute}
          className="text-xs text-gray-500 hover:text-gray-800 transition border rounded-lg px-2 py-1"
        >
          {muted ? '🔇 Unmute' : '🔊 Mute'}
        </button>
      )}
      <audio ref={audioRef} src={songUrl} />
    </div>
  )
}