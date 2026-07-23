import React, { useState, useEffect, useRef } from 'react';
import { Youtube, Clock, FileText, ChevronDown, ChevronUp, Loader2, Sparkles } from 'lucide-react';
import { VideoMetadata } from '../types';

interface VideoPlayerProps {
  url: string;
  setUrl: (url: string) => void;
  metadata: VideoMetadata | null;
  isLoadingMetadata: boolean;
  onFetchMetadata: (inputUrl: string) => void;
  onCurrentTimeChange: (timeInSeconds: number) => void;
  isPlaying: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  setUrl,
  metadata,
  isLoadingMetadata,
  onFetchMetadata,
  onCurrentTimeChange,
  isPlaying,
}) => {
  const [showTranscript, setShowTranscript] = useState<boolean>(false);
  const [playbackSeconds, setPlaybackSeconds] = useState<number>(0);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Helper to extract YouTube video ID
  const extractVideoId = (inputUrl: string): string => {
    const match = inputUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : 'Mzw2ttJD2qQ';
  };

  const videoId = extractVideoId(url);

  // Sync YouTube iframe playback command with isPlaying state
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const command = isPlaying ? 'playVideo' : 'pauseVideo';
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: command, args: [] }),
        '*'
      );
    }
  }, [isPlaying]);

  // Playback timer simulation for syncing webcam reaction sampling
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlaybackSeconds((prev) => {
          const maxDur = metadata?.duration_seconds || 135;
          const next = prev >= maxDur ? 0 : prev + 1;
          onCurrentTimeChange(next);
          return next;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, metadata, onCurrentTimeChange]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFetchMetadata(url);
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div id="video-player-container" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
      {/* Top Input Bar */}
      <form id="youtube-input-form" onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Youtube className="w-4 h-4 text-red-500" />
          </div>
          <input
            id="youtube-url-input"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste YouTube Video URL (e.g. https://www.youtube.com/watch?v=Mzw2ttJD2qQ)"
            className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>
        <button
          id="fetch-metadata-btn"
          type="submit"
          disabled={isLoadingMetadata || !url.trim()}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-medium text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
        >
          {isLoadingMetadata ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Fetching...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Retrieve Metadata</span>
            </>
          )}
        </button>
      </form>

      {/* Embedded YouTube Player */}
      <div id="youtube-embed-wrapper" className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-slate-800 shadow-inner group">
        <iframe
          ref={iframeRef}
          id="youtube-iframe"
          title={metadata?.title || 'YouTube Video'}
          src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=${isPlaying ? 1 : 0}&rel=0`}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
        {isPlaying && (
          <div id="video-playback-indicator" className="absolute top-3 right-3 px-2.5 py-1 bg-red-600/90 text-white text-xs font-mono font-semibold rounded-full flex items-center gap-1.5 shadow-lg backdrop-blur-sm animate-pulse">
            <span className="w-2 h-2 rounded-full bg-white" />
            <span>RECORDING REACTION • {formatSeconds(playbackSeconds)}</span>
          </div>
        )}
      </div>

      {/* Video Metadata Panel */}
      {metadata ? (
        <div id="video-metadata-card" className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                Video Metadata
              </span>
              <h2 id="video-title" className="text-base font-semibold text-slate-100 mt-1">
                {metadata.title}
              </h2>
            </div>
            <div id="video-duration-tag" className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 text-slate-300 text-xs font-mono font-medium rounded-lg border border-slate-700">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>{metadata.duration_seconds}s ({formatSeconds(metadata.duration_seconds)})</span>
            </div>
          </div>

          <p id="video-description" className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {metadata.description}
          </p>

          {/* Transcript Accordion */}
          <div id="transcript-container" className="border-t border-slate-800 pt-3">
            <button
              id="toggle-transcript-btn"
              onClick={() => setShowTranscript(!showTranscript)}
              className="flex items-center justify-between w-full text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-purple-400" />
                <span>Transcript ({metadata.transcript ? 'Available' : 'Empty'})</span>
              </div>
              {showTranscript ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showTranscript && (
              <div id="transcript-content" className="mt-2.5 p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 max-h-40 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                {metadata.transcript}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div id="no-metadata-placeholder" className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-xl text-center text-xs text-slate-500">
          Enter a YouTube URL above or click "Load Odyssey Trailer" to fetch title, duration, description, and transcript.
        </div>
      )}
    </div>
  );
};
