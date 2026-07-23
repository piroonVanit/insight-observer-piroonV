import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, CameraOff, Video, Sparkles, Trash2, ShieldCheck, AlertCircle } from 'lucide-react';
import { FrameSample } from '../types';

interface WebcamObserverProps {
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  currentTimeSeconds: number;
  durationSeconds: number;
  frames: FrameSample[];
  setFrames: React.Dispatch<React.SetStateAction<FrameSample[]>>;
  onStartAnalysis: () => void;
  isAnalyzingVisual: boolean;
  hasVisualEval: boolean;
}

export const WebcamObserver: React.FC<WebcamObserverProps> = ({
  isPlaying,
  setIsPlaying,
  currentTimeSeconds,
  durationSeconds,
  frames,
  setFrames,
  onStartAnalysis,
  isAnalyzingVisual,
  hasVisualEval,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [streamActive, setStreamActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [useSimulatedCam, setUseSimulatedCam] = useState<boolean>(false);

  // Initialize webcam
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setStreamActive(true);
      setUseSimulatedCam(false);
    } catch (err: any) {
      console.warn('Webcam access error, falling back to simulated avatar stream:', err);
      setCameraError('Webcam access not allowed or unavailable. Using simulated reaction feed.');
      setUseSimulatedCam(true);
      setStreamActive(true);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const formatTimestamp = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Function to capture snapshot frame
  const captureFrame = useCallback((tsSec: number) => {
    if (frames.length >= 20) return; // Max 20 frames constraint

    const timestampStr = formatTimestamp(tsSec);
    let imageBase64 = '';

    if (videoRef.current && canvasRef.current && streamActive && !useSimulatedCam) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = 320;
      canvas.height = 240;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        imageBase64 = canvas.toDataURL('image/jpeg', 0.7);
      }
    }

    if (!imageBase64) {
      // Create a neat SVG base64 avatar placeholder with expression indicators
      const expressions = ['😊 Smile', '😮 Surprised', '😐 Attentive', '🤔 Intrigued', '😌 Delighted'];
      const expName = expressions[frames.length % expressions.length];
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240" viewBox="0 0 320 240">
        <rect width="320" height="240" fill="#0f172a"/>
        <circle cx="160" cy="110" r="50" fill="#334155" stroke="#6366f1" stroke-width="3"/>
        <circle cx="145" cy="100" r="6" fill="#f8fafc"/>
        <circle cx="175" cy="100" r="6" fill="#f8fafc"/>
        <path d="M 140 130 Q 160 ${140 + (frames.length % 2 === 0 ? 15 : -5)} 180 130" fill="none" stroke="#6366f1" stroke-width="4" stroke-linecap="round"/>
        <rect x="10" y="200" width="300" height="30" rx="6" fill="#1e293b"/>
        <text x="20" y="220" fill="#a5b4fc" font-family="sans-serif" font-size="12" font-weight="bold">TS: ${timestampStr} | ${expName}</text>
      </svg>`;
      imageBase64 = `data:image/svg+xml;base64,${btoa(svg)}`;
    }

    const newSample: FrameSample = {
      id: `frame-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: tsSec,
      timestampStr,
      imageBase64
    };

    setFrames((prev) => {
      if (prev.some((f) => f.timestampStr === timestampStr)) return prev;
      return [...prev, newSample].slice(0, 20); // Cap strictly at 20 max
    });
  }, [frames.length, streamActive, useSimulatedCam, setFrames]);

  // Automated frame sampling during video playback
  useEffect(() => {
    if (!isPlaying) return;

    // Interval calculation to space max 20 frames across total duration
    const dur = durationSeconds || 135;
    const intervalSec = Math.max(3, Math.floor(dur / 18));

    if (currentTimeSeconds % intervalSec === 0 && currentTimeSeconds > 0) {
      captureFrame(currentTimeSeconds);
    }
  }, [isPlaying, currentTimeSeconds, durationSeconds, captureFrame]);

  const toggleSession = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      // Capture initial frame at t=0
      if (frames.length === 0) {
        captureFrame(0);
      }
    } else {
      setIsPlaying(false);
    }
  };

  const handleClearFrames = () => {
    setFrames([]);
  };

  return (
    <div id="webcam-observer-card" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
      {/* Hidden canvas for taking snapshot frames */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Visual Reaction Observer</h3>
            <p className="text-xs text-slate-400">Captures max 20 frames during playback</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span id="frame-counter-badge" className="px-2.5 py-1 bg-slate-800 text-indigo-300 text-xs font-mono font-medium rounded-lg border border-slate-700">
            {frames.length} / 20 Frames
          </span>
        </div>
      </div>

      {/* Camera Viewport */}
      <div id="webcam-viewport" className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
        {streamActive && !useSimulatedCam ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform -scale-x-100"
          />
        ) : (
          <div id="simulated-feed" className="flex flex-col items-center justify-center p-6 text-center gap-3">
            <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
              <CameraOff className="w-8 h-8 text-indigo-400" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-300">Simulated Reactions Observer</p>
              <p className="text-[11px] text-slate-500 max-w-xs">Webcam feed will capture reactions or generate simulated multimodal frame telemetry.</p>
            </div>
          </div>
        )}

        {/* Live Camera Status Tag */}
        <div className="absolute top-3 left-3 px-2 py-0.5 bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-md text-[10px] font-mono font-medium text-slate-300 flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${streamActive ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
          <span>{streamActive ? 'Observer Active' : 'Camera Ready'}</span>
        </div>

        {isPlaying && (
          <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-indigo-600/90 text-white text-xs font-mono rounded-md shadow-lg flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>Sampling frame at {formatTimestamp(currentTimeSeconds)}</span>
          </div>
        )}
      </div>

      {cameraError && (
        <div id="camera-error-notice" className="p-2.5 bg-indigo-950/40 border border-indigo-800/50 rounded-xl text-xs text-indigo-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>{cameraError}</span>
        </div>
      )}

      {/* Control Action Buttons */}
      <div id="webcam-action-buttons" className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <button
          id="toggle-session-btn"
          onClick={toggleSession}
          className={`px-4 py-2.5 rounded-xl font-medium text-xs transition-all flex items-center justify-center gap-2 shadow-lg ${
            isPlaying
              ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/20'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>{isPlaying ? 'Pause Observer' : 'Start Watching Session'}</span>
        </button>

        <button
          id="manual-sample-btn"
          onClick={() => captureFrame(currentTimeSeconds)}
          disabled={frames.length >= 20}
          className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-1.5"
        >
          <Camera className="w-3.5 h-3.5 text-indigo-400" />
          <span>Sample Frame</span>
        </button>

        <button
          id="analyze-visual-btn"
          onClick={onStartAnalysis}
          disabled={frames.length === 0 || isAnalyzingVisual}
          className="col-span-2 sm:col-span-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-medium text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isAnalyzingVisual ? 'Evaluating...' : 'Visual Evaluation'}</span>
        </button>
      </div>

      {/* Captured Frames Thumbnail Strip */}
      {frames.length > 0 && (
        <div id="sampled-frames-strip" className="border-t border-slate-800 pt-3 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Captured Frame Samples ({frames.length} / 20 max)</span>
            <button
              id="clear-frames-btn"
              onClick={handleClearFrames}
              className="text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1 text-[11px]"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>

          <div id="frames-scroll-grid" className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
            {frames.map((frame, idx) => (
              <div
                key={frame.id}
                className="relative flex-shrink-0 w-20 aspect-video rounded-lg overflow-hidden bg-slate-950 border border-slate-800 group"
              >
                <img
                  src={frame.imageBase64}
                  alt={`Frame ${frame.timestampStr}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-slate-900/90 text-slate-200 text-[10px] font-mono text-center py-0.5 border-t border-slate-800">
                  {frame.timestampStr}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
