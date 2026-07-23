import React from 'react';
import { Eye, Video, FileText, Sparkles, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  onLoadTestVideo: () => void;
  activeStage: 'watch' | 'interview' | 'report';
  hasMetadata: boolean;
  hasVisualEval: boolean;
  hasReport: boolean;
  onOpenGradingInspector: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onLoadTestVideo,
  activeStage,
  hasMetadata,
  hasVisualEval,
  hasReport,
  onOpenGradingInspector,
}) => {
  return (
    <header id="header-container" className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-30 shadow-md">
      <div id="header-inner" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Title */}
        <div id="header-branding" className="flex items-center gap-3">
          <div id="logo-icon" className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 id="app-title" className="font-bold text-lg text-white tracking-tight">Insight Observer</h1>
              <span id="model-badge" className="px-2 py-0.5 text-xs font-mono font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded-full">
                gpt-5.6-luna
              </span>
            </div>
            <p id="app-subtitle" className="text-xs text-slate-400">Multimodal Video & Webcam Sentiment Analytics</p>
          </div>
        </div>

        {/* Workflow Progress Steps */}
        <div id="workflow-steps" className="hidden md:flex items-center gap-2 bg-slate-950/60 p-1.5 rounded-lg border border-slate-800 text-xs">
          <div id="step-watch" className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
            activeStage === 'watch' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400'
          }`}>
            {hasVisualEval ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Video className="w-3.5 h-3.5" />}
            <span>1. Watch & Sample</span>
          </div>
          <span className="text-slate-700">→</span>
          <div id="step-interview" className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
            activeStage === 'interview' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400'
          }`}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>2. AI Interview</span>
          </div>
          <span className="text-slate-700">→</span>
          <div id="step-report" className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
            activeStage === 'report' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400'
          }`}>
            {hasReport ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <FileText className="w-3.5 h-3.5" />}
            <span>3. Synthesis Report</span>
          </div>
        </div>

        {/* Right Quick Action Buttons */}
        <div id="header-actions" className="flex items-center gap-2">
          <button
            id="load-test-video-btn"
            onClick={onLoadTestVideo}
            className="px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-all flex items-center gap-1.5"
            title="Load the official Odyssey trailer test video required for homework grading"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Load Odyssey Trailer</span>
          </button>

          <button
            id="open-grading-folder-btn"
            onClick={onOpenGradingInspector}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all flex items-center gap-1.5"
            title="View exact files generated in ai_grading/ folder"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">ai_grading/ Files</span>
          </button>
        </div>
      </div>
    </header>
  );
};
