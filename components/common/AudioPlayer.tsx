'use client'

import React, { useRef, useState, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, RotateCcw } from 'lucide-react'

interface AudioPlayerProps {
  audioSrc: string // Base64 data URI or URL
  onEnded?: () => void
  className?: string
}

/**
 * Custom Audio Player Component for TTS
 * Features: Play/Pause, Progress bar, Volume control, Playback speed
 */
const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioSrc,
  onEnded,
  className = '',
}) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const rangeInputRef = useRef<HTMLInputElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)

  // Update current time as audio plays
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    let animationFrameId: number

    // Use requestAnimationFrame for smoother updates (60fps)
    const updateTime = () => {
      if (audio && !audio.paused) {
        const time = audio.currentTime
        const dur = audio.duration

        // Update state for time display
        setCurrentTime(time)

        // Update both progress bar and range input directly for perfect sync
        if (dur > 0) {
          const percentage = (time / dur) * 100

          if (progressBarRef.current) {
            progressBarRef.current.style.width = `${percentage}%`
          }

          if (rangeInputRef.current) {
            rangeInputRef.current.value = String(time)
          }
        }

        animationFrameId = requestAnimationFrame(updateTime)
      }
    }

    const handlePlay = () => {
      animationFrameId = requestAnimationFrame(updateTime)
    }

    const handlePause = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }

    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => {
      setIsPlaying(false)
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      if (onEnded) onEnded()
    }

    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [onEnded])

  // Play/Pause control
  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  // Seek control
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return

    const newTime = parseFloat(e.target.value)
    audio.currentTime = newTime
    setCurrentTime(newTime)

    // Update both progress bar and range input immediately
    if (audio.duration > 0) {
      const percentage = (newTime / audio.duration) * 100

      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${percentage}%`
      }

      if (rangeInputRef.current) {
        rangeInputRef.current.value = String(newTime)
      }
    }
  }

  // Volume control
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return

    const newVolume = parseFloat(e.target.value)
    audio.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  // Toggle mute
  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isMuted) {
      audio.volume = volume || 0.5
      setIsMuted(false)
    } else {
      audio.volume = 0
      setIsMuted(true)
    }
  }

  // Playback speed control
  const handleSpeedChange = (speed: number) => {
    const audio = audioRef.current
    if (!audio) return

    audio.playbackRate = speed
    setPlaybackRate(speed)
  }

  // Restart audio
  const handleRestart = () => {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = 0
    setCurrentTime(0)
    if (!isPlaying) {
      audio.play()
      setIsPlaying(true)
    }
  }

  // Format time display
  const formatTime = (time: number): string => {
    if (isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div
      className={`audio-player bg-white rounded-lg p-5 border border-gray-200 ${className}`}
    >
      {/* Hidden audio element */}
      <audio ref={audioRef} src={audioSrc} preload="metadata" />

      <div className="flex flex-col space-y-4">
        {/* Top Row: Play/Pause and Progress */}
        <div className="flex items-center space-x-4">
          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
            className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause size={22} />
            ) : (
              <Play size={22} className="ml-1" />
            )}
          </button>

          {/* Progress Bar with Time */}
          <div className="flex-grow flex flex-col space-y-1">
            <div className="relative h-2.5">
              {/* Background track */}
              <div className="absolute inset-0 bg-gray-200 rounded-full" />

              {/* Progress fill */}
              <div
                ref={progressBarRef}
                className="absolute top-0 left-0 h-full bg-blue-600 rounded-full pointer-events-none z-10"
                style={{ width: '0%' }}
              />

              {/* Range input */}
              <input
                ref={rangeInputRef}
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                onInput={handleSeek}
                className="absolute inset-0 w-full appearance-none cursor-pointer audio-progress bg-transparent z-20"
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-gray-600 tabular-nums">
                {formatTime(currentTime)}
              </span>
              <span className="text-xs font-medium text-gray-500 tabular-nums">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Restart Button */}
          <button
            onClick={handleRestart}
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            aria-label="Restart"
            title="Phát lại từ đầu"
          >
            <RotateCcw size={18} />
          </button>
        </div>

        {/* Bottom Row: Volume and Speed Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-3 border-t border-gray-100">
          {/* Volume Control */}
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <button
              onClick={toggleMute}
              className="flex-shrink-0 text-gray-600 hover:text-blue-600 transition-colors p-1"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="flex-1 h-2 bg-gray-200 rounded-full appearance-none cursor-pointer volume-slider"
              style={{
                background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${(isMuted ? 0 : volume) * 100}%, #e5e7eb ${(isMuted ? 0 : volume) * 100}%, #e5e7eb 100%)`,
              }}
            />
            <span className="text-xs font-medium text-gray-600 min-w-[35px] text-right">
              {Math.round((isMuted ? 0 : volume) * 100)}%
            </span>
          </div>

          {/* Playback Speed */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-gray-600 whitespace-nowrap">
              Tốc độ:
            </span>
            <div className="flex space-x-1">
              {[0.75, 1, 1.25, 1.5, 2].map((speed) => (
                <button
                  key={speed}
                  onClick={() => handleSpeedChange(speed)}
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    playbackRate === speed
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .audio-progress {
          background: transparent;
        }

        .audio-progress::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          background: #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(59, 130, 246, 0.4);
          transition: all 0.2s ease;
          position: relative;
          z-index: 10;
        }

        .audio-progress::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 3px 8px rgba(59, 130, 246, 0.6);
        }

        .audio-progress::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(59, 130, 246, 0.4);
          transition: all 0.2s ease;
          position: relative;
          z-index: 10;
        }

        .audio-progress::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 3px 8px rgba(59, 130, 246, 0.6);
        }

        .volume-slider::-webkit-slider-thumb {
          appearance: none;
          width: 14px;
          height: 14px;
          background: #6366f1;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(99, 102, 241, 0.4);
          transition: all 0.2s ease;
        }

        .volume-slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 2px 6px rgba(99, 102, 241, 0.6);
        }

        .volume-slider::-moz-range-thumb {
          width: 14px;
          height: 14px;
          background: #6366f1;
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(99, 102, 241, 0.4);
          transition: all 0.2s ease;
        }

        .volume-slider::-moz-range-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 2px 6px rgba(99, 102, 241, 0.6);
        }
          height: 12px;
          background: #4b5563;
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  )
}

export default AudioPlayer
