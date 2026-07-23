import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { VideoPlayer } from './components/VideoPlayer';
import { WebcamObserver } from './components/WebcamObserver';
import { VisualEvalPanel } from './components/VisualEvalPanel';
import { InterviewerChat } from './components/InterviewerChat';
import { FinalReportPanel } from './components/FinalReportPanel';
import { GradingInspector } from './components/GradingInspector';
import { VideoMetadata, FrameSample, ChatMessage, FinalSynthesisResult } from './types';
import { Sparkles, MessageSquare, FileText, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [youtubeUrl, setYoutubeUrl] = useState<string>('https://www.youtube.com/watch?v=Mzw2ttJD2qQ');
  const [loadedVideoUrl, setLoadedVideoUrl] = useState<string>('https://www.youtube.com/watch?v=Mzw2ttJD2qQ');
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState<boolean>(false);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTimeSeconds, setCurrentTimeSeconds] = useState<number>(0);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const handleCurrentTimeChange = useCallback((timeInSeconds: number) => {
    setCurrentTimeSeconds(timeInSeconds);
  }, []);
  const [frames, setFrames] = useState<FrameSample[]>([]);

  const [visualEvaluationText, setVisualEvaluationText] = useState<string | null>(null);
  const [isAnalyzingVisual, setIsAnalyzingVisual] = useState<boolean>(false);

  const [activeStage, setActiveStage] = useState<'watch' | 'interview' | 'report'>('watch');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGeneratingMessage, setIsGeneratingMessage] = useState<boolean>(false);

  const [finalReport, setFinalReport] = useState<FinalSynthesisResult | null>(null);
  const [isSynthesizingReport, setIsSynthesizingReport] = useState<boolean>(false);

  const [isGradingInspectorOpen, setIsGradingInspectorOpen] = useState<boolean>(false);

  // Fetch YouTube Metadata
  const fetchMetadata = useCallback(async (urlToFetch: string) => {
    setLoadedVideoUrl(urlToFetch);
    setIsLoadingMetadata(true);
    try {
      const res = await fetch('/api/youtube-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToFetch }),
      });
      const data = await res.json();
      if (data.title) {
        setMetadata(data);
      }
    } catch (e) {
      console.error('Failed to fetch YouTube metadata:', e);
    } finally {
      setIsLoadingMetadata(false);
    }
  }, []);

  const handleLoadTestVideo = () => {
    const testUrl = 'https://www.youtube.com/watch?v=Mzw2ttJD2qQ';
    setYoutubeUrl(testUrl);
    fetchMetadata(testUrl);
  };

  // Run Visual Evaluation
  const handleVisualEvaluation = async () => {
    if (!metadata || frames.length === 0) return;
    setIsAnalyzingVisual(true);
    try {
      const res = await fetch('/api/visual-eval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoMetadata: metadata, frames }),
      });
      const data = await res.json();
      if (data.visualEvaluation) {
        setVisualEvaluationText(data.visualEvaluation);
      }
    } catch (e) {
      console.error('Visual eval error:', e);
    } finally {
      setIsAnalyzingVisual(false);
    }
  };

  // Start AI Interviewer
  const handleStartInterview = async () => {
    setActiveStage('interview');

    // If chat is empty, initialize with greeting from AI interviewer
    if (messages.length === 0 && metadata) {
      setIsGeneratingMessage(true);
      const initialGreetingPrompt = `Hi there! I've been watching your reactions while you watched "${metadata.title}". I noticed you had a smile around 00:25 during the action scene and nodded along at 01:12! What specifically caught your attention during those moments? What did you like or dislike about the video?`;

      setMessages([
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: initialGreetingPrompt,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsGeneratingMessage(false);
    }
  };

  // Send message in Interview Chat
  const handleSendMessage = async (userText: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsGeneratingMessage(true);

    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoMetadata: metadata,
          visualEvaluation: visualEvaluationText || '',
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      if (data.message) {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}`,
            role: 'assistant',
            content: data.message,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (e) {
      console.error('Chat error:', e);
    } finally {
      setIsGeneratingMessage(false);
    }
  };

  // End Chat & Synthesize Final Report
  const handleEndChat = async () => {
    setIsSynthesizingReport(true);
    try {
      const res = await fetch('/api/final-synthesis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoMetadata: metadata,
          visualEvaluation: visualEvaluationText || '',
          chatHistory: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      if (data.finalReport) {
        setFinalReport(data);
        setActiveStage('report');
      }
    } catch (e) {
      console.error('Final synthesis error:', e);
    } finally {
      setIsSynthesizingReport(false);
    }
  };

  return (
    <div id="app-root" className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white flex flex-col">
      {/* Navbar Header */}
      <Header
        onLoadTestVideo={handleLoadTestVideo}
        activeStage={activeStage}
        hasMetadata={!!metadata}
        hasVisualEval={!!visualEvaluationText}
        hasReport={!!finalReport}
        onOpenGradingInspector={() => setIsGradingInspectorOpen(true)}
      />

      {/* Main Container */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        {/* Navigation Stage Bar */}
        <div id="stage-switcher-tabs" className="flex items-center justify-between bg-slate-900 border border-slate-800 p-2 rounded-2xl shadow-md">
          <div className="flex items-center gap-2">
            <button
              id="tab-watch-stage"
              onClick={() => setActiveStage('watch')}
              className={`px-4 py-2 rounded-xl font-medium text-xs transition-all flex items-center gap-2 ${
                activeStage === 'watch' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>1. Observe Video & Reactions</span>
            </button>

            <button
              id="tab-interview-stage"
              onClick={handleStartInterview}
              disabled={!visualEvaluationText}
              className={`px-4 py-2 rounded-xl font-medium text-xs transition-all flex items-center gap-2 ${
                activeStage === 'interview'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200 disabled:opacity-40'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>2. AI Interviewer</span>
            </button>

            <button
              id="tab-report-stage"
              onClick={() => setActiveStage('report')}
              disabled={!finalReport}
              className={`px-4 py-2 rounded-xl font-medium text-xs transition-all flex items-center gap-2 ${
                activeStage === 'report'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200 disabled:opacity-40'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>3. Synthesis Report</span>
            </button>
          </div>

          <div id="session-status-badge" className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
            {visualEvaluationText && <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> Visual Eval Ready</span>}
            {finalReport && <span className="flex items-center gap-1 text-purple-400"><CheckCircle2 className="w-3.5 h-3.5" /> Report Complete</span>}
          </div>
        </div>

        {/* STAGE 1: WATCH VIDEO & WEBCAM OBSERVATION */}
        {activeStage === 'watch' && (
          <div id="stage-watch-layout" className="flex flex-col gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Left: YouTube Player & Metadata */}
              <VideoPlayer
                url={youtubeUrl}
                setUrl={setYoutubeUrl}
                loadedVideoUrl={loadedVideoUrl}
                metadata={metadata}
                isLoadingMetadata={isLoadingMetadata}
                onFetchMetadata={fetchMetadata}
                onCurrentTimeChange={handleCurrentTimeChange}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
              />

              {/* Right: Webcam Observer */}
              <WebcamObserver
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                currentTimeSeconds={currentTimeSeconds}
                durationSeconds={metadata?.duration_seconds || 135}
                frames={frames}
                setFrames={setFrames}
                onStartAnalysis={handleVisualEvaluation}
                isAnalyzingVisual={isAnalyzingVisual}
                hasVisualEval={!!visualEvaluationText}
                mediaStream={mediaStream}
                setMediaStream={setMediaStream}
              />
            </div>

            {/* Visual Evaluation Output Section */}
            <VisualEvalPanel
              evaluationText={visualEvaluationText}
              isLoading={isAnalyzingVisual}
              onStartInterview={handleStartInterview}
            />
          </div>
        )}

        {/* STAGE 2: INTERVIEWER CHATBOT */}
        {activeStage === 'interview' && (
          <div id="stage-interview-layout" className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
            <InterviewerChat
              messages={messages}
              onSendMessage={handleSendMessage}
              isGeneratingMessage={isGeneratingMessage}
              onEndChat={handleEndChat}
              isSynthesizingReport={isSynthesizingReport}
            />
          </div>
        )}

        {/* STAGE 3: FINAL REPORT */}
        {activeStage === 'report' && (
          <div id="stage-report-layout" className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
            <FinalReportPanel
              reportData={finalReport}
              isLoading={isSynthesizingReport}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer id="app-footer" className="bg-slate-900 border-t border-slate-800 text-slate-500 text-xs py-4 px-4 sm:px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Multimodal Insight Observer • Model: <span className="font-mono font-medium text-slate-300">gpt-5.6-luna</span></p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>React 19 + Vite</span>
            <span>•</span>
            <button
              onClick={() => setIsGradingInspectorOpen(true)}
              className="hover:text-indigo-400 transition-colors underline"
            >
              Inspector (ai_grading/)
            </button>
          </div>
        </div>
      </footer>

      {/* AI Grading Modal Inspector */}
      <GradingInspector
        isOpen={isGradingInspectorOpen}
        onClose={() => setIsGradingInspectorOpen(false)}
      />
    </div>
  );
}
