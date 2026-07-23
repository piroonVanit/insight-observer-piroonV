import React from 'react';
import { Sparkles, MessageSquare, CheckCircle2, Eye, Copy, Check } from 'lucide-react';

interface VisualEvalPanelProps {
  evaluationText: string | null;
  isLoading: boolean;
  onStartInterview: () => void;
}

export const VisualEvalPanel: React.FC<VisualEvalPanelProps> = ({
  evaluationText,
  isLoading,
  onStartInterview,
}) => {
  const [copied, setCopied] = React.useState<boolean>(false);

  const handleCopy = () => {
    if (evaluationText) {
      navigator.clipboard.writeText(evaluationText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div id="visual-eval-loading" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center gap-3 text-center min-h-[220px]">
        <div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-200">Evaluating Facial Reactions...</p>
          <p className="text-xs text-slate-400 font-mono">Model: gpt-5.6-luna • Analyzing up to 20 frame samples</p>
        </div>
      </div>
    );
  }

  if (!evaluationText) {
    return null;
  }

  return (
    <div id="visual-evaluation-card" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 id="visual-eval-title" className="text-sm font-semibold text-slate-100">Visual Evaluation Output</h3>
              <span className="px-2 py-0.5 text-[10px] font-mono font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded-full">
                gpt-5.6-luna
              </span>
            </div>
            <p className="text-xs text-slate-400">Webcam reaction analysis across video timeline</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="copy-visual-eval-btn"
            onClick={handleCopy}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
            title="Copy visual evaluation text"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Formatted Evaluation Output */}
      <div id="visual-evaluation-text-display" className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-200 leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto">
        {evaluationText}
      </div>

      {/* Action to proceed to Interviewer */}
      <div className="flex items-center justify-between pt-1">
        <p className="text-xs text-slate-400">Ready to initiate the interviewer chatbot?</p>
        <button
          id="start-interview-btn"
          onClick={onStartInterview}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Start Interview</span>
        </button>
      </div>
    </div>
  );
};
