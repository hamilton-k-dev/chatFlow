'use client';
import { useState, useRef, useEffect } from 'react';

interface AudioPlayerProps {
  duration: string;
  audioUrl?: string;
  isOwn: boolean;
}

const bars = [20, 35, 55, 40, 70, 50, 30, 65, 45, 80, 60, 35, 75, 55, 40, 65, 30, 50, 70, 45, 60, 35, 55, 40, 70, 50, 30, 45];

export default function AudioPlayer({ duration, audioUrl, isOwn }: AudioPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [displayTime, setDisplayTime] = useState(duration);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioUrl) return;
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    audio.onloadedmetadata = () => {
      const secs = Math.floor(audio.duration);
      setDisplayTime(`${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`);
    };
    audio.ontimeupdate = () => {
      setProgress((audio.currentTime / audio.duration) * 100);
      const secs = Math.floor(audio.currentTime);
      setDisplayTime(`${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`);
    };
    audio.onended = () => {
      setPlaying(false);
      setProgress(0);
      const secs = Math.floor(audio.duration);
      setDisplayTime(`${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`);
    };
    return () => { audio.pause(); audioRef.current = null; };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); } else { audioRef.current.play(); }
    setPlaying(!playing);
  };

  return (
    <div className="flex items-center gap-2.5 min-w-[180px]">
      <button
        onClick={togglePlay}
        disabled={!audioUrl}
        className={`w-8 h-8 flex items-center justify-center rounded-full cursor-pointer flex-shrink-0 disabled:opacity-40 transition-colors ${
          isOwn ? 'bg-white/20 hover:bg-white/30' : 'bg-indigo-100 hover:bg-indigo-200'
        }`}
      >
        <i className={`${playing ? 'ri-pause-fill' : 'ri-play-fill'} text-sm ${isOwn ? 'text-white' : 'text-indigo-600'}`} />
      </button>
      <div className="flex items-end gap-0.5 h-7 flex-1">
        {bars.map((h, i) => {
          const filled = (i / bars.length) * 100 <= progress;
          return (
            <div
              key={i}
              style={{ height: `${h}%` }}
              className={`w-1 rounded-full transition-colors ${
                filled
                  ? isOwn ? 'bg-white/85' : 'bg-indigo-500'
                  : isOwn ? 'bg-white/30' : 'bg-indigo-200'
              }`}
            />
          );
        })}
      </div>
      <span className={`text-xs flex-shrink-0 tabular-nums ${isOwn ? 'text-white/70' : 'text-slate-500'}`}>
        {displayTime}
      </span>
    </div>
  );
}
