'use client';
import { useState, useEffect, useRef } from 'react';

interface Props {
  onSend: (duration: string, audioUrl: string) => void;
  onCancel: () => void;
  darkMode: boolean;
}

export default function VoiceRecorder({ onSend, onCancel, darkMode }: Props) {
  const [seconds, setSeconds] = useState(0);
  const [preview, setPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const blobRef = useRef<Blob | null>(null);

  useEffect(() => {
    let stream: MediaStream;

    navigator.mediaDevices.getUserMedia({ audio: true }).then(s => {
      stream = s;
      const recorder = new MediaRecorder(s);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        blobRef.current = blob;
        setPreviewUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start();
      intervalRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    }).catch(() => {
      setError('Microphone access denied');
    });

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    mediaRecorderRef.current?.stop();
    setPreview(true);
  };

  const handleSend = async () => {
    if (!blobRef.current) return;
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('audio', blobRef.current, 'voice.webm');

      const res = await fetch('/api/upload-audio', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');

      const { url } = await res.json();
      const duration = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
      onSend(duration, url);
    } catch {
      setError('Failed to send. Try again.');
      setUploading(false);
    }
  };

  const duration = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

  const bars = [20, 40, 60, 80, 50, 70, 30, 90, 45, 65, 35, 75, 55, 85, 25, 60, 40, 70, 50, 80, 30, 65, 45, 75, 55, 35, 90, 20, 60, 40, 70, 50, 80, 30, 65, 45, 75, 55, 35, 90];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={!uploading ? onCancel : undefined} />
      <div className={`relative z-10 w-full max-w-sm mx-4 rounded-2xl p-6 shadow-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-center font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {uploading ? 'Sending...' : preview ? 'Voice Note Preview' : 'Recording...'}
        </h3>

        {error && (
          <p className="text-center text-sm text-red-500 mb-3">{error}</p>
        )}

        {preview && previewUrl ? (
          <div className="mb-4">
            <audio src={previewUrl} controls className="w-full rounded-xl" />
            <p className={`text-center text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Duration: {duration}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-end justify-center gap-0.5 h-16 mb-4">
              {bars.map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="w-1.5 rounded-full bg-red-400 animate-pulse"
                />
              ))}
            </div>
            <div className={`text-center text-3xl font-mono font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {duration}
            </div>
          </>
        )}

        {!preview ? (
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className={`flex-1 py-3 rounded-xl border font-semibold transition-colors cursor-pointer whitespace-nowrap ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
            >
              Cancel
            </button>
            <button
              onClick={stop}
              className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              Stop
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={uploading}
              className={`flex-1 py-3 rounded-xl border font-semibold transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
            >
              Discard
            </button>
            <button
              onClick={handleSend}
              disabled={uploading}
              className="flex-1 py-3 rounded-xl bg-violet-500 hover:bg-violet-600 text-white font-semibold transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Send'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
