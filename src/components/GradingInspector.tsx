import React, { useState, useEffect } from 'react';
import { X, FileText, CheckCircle2, Copy, Check } from 'lucide-react';

interface GradingInspectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GradingInspector: React.FC<GradingInspectorProps> = ({ isOpen, onClose }) => {
  const [activeFile, setActiveFile] = useState<'metadata' | 'eval' | 'prompt' | 'report'>('metadata');
  const [copied, setCopied] = useState<boolean>(false);

  const [liveData, setLiveData] = useState<{
    metadataJson: string;
    visualEvalTxt: string;
    finalPromptTxt: string;
    finalReportTxt: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/ai-grading-files')
        .then((res) => res.json())
        .then((data) => {
          if (data.metadataJson) {
            setLiveData(data);
          }
        })
        .catch((err) => console.error('Failed to load live ai_grading files:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const metadataJson = `{
  "status": "pending",
  "message": "No video session recorded yet. Please load a YouTube video or click 'Load Odyssey Trailer' to fetch metadata."
}`;

  const visualEvalTxt = `Visual Evaluation Report
Status: Pending Analysis
Message: No reaction frames evaluated yet. Please start watching a video with webcam observation enabled and click "Visual Evaluation" to generate reaction analysis.`;

  const finalPromptTxt = `[Pending Final Synthesis Prompt]
Status: Waiting for user completion
Message: Please complete Stage 1 (Video Observation & Reaction Analysis) and Stage 2 (AI Interviewer Chat) to assemble the final synthesis prompt.`;

  const finalReportTxt = `[Pending Final Sentiment Synthesis Report]
Status: Waiting for session completion
Message: Please complete the video watching session and the follow-up AI Interview to generate the final multimodal sentiment synthesis report.`;

  const getActiveContent = () => {
    switch (activeFile) {
      case 'metadata':
        return liveData?.metadataJson || metadataJson;
      case 'eval':
        return liveData?.visualEvalTxt || visualEvalTxt;
      case 'prompt':
        return liveData?.finalPromptTxt || finalPromptTxt;
      case 'report':
        return liveData?.finalReportTxt || finalReportTxt;
    }
  };

  const getActivePath = () => {
    switch (activeFile) {
      case 'metadata':
        return 'ai_grading/video_metadata.json';
      case 'eval':
        return 'ai_grading/visual_evaluation.txt';
      case 'prompt':
        return 'ai_grading/final_prompt.txt';
      case 'report':
        return 'ai_grading/final_report.txt';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="grading-modal-backdrop" className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div id="grading-modal-container" className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white">AI Grading Folder Inspector (`ai_grading/`)</h3>
              <p className="text-xs text-slate-400">Exact required outputs for automated grading evaluation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* File Tabs */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 overflow-x-auto gap-2">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveFile('metadata')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                activeFile === 'metadata' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              video_metadata.json
            </button>
            <button
              onClick={() => setActiveFile('eval')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                activeFile === 'eval' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              visual_evaluation.txt
            </button>
            <button
              onClick={() => setActiveFile('prompt')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                activeFile === 'prompt' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              final_prompt.txt
            </button>
            <button
              onClick={() => setActiveFile('report')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                activeFile === 'report' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              final_report.txt
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5 shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy File</span>
          </button>
        </div>

        {/* Code Content View */}
        <div className="p-4 bg-slate-950 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between text-[10px] font-mono mb-2">
            <span className="text-indigo-400">
              File Location: <span className="text-slate-200">{getActivePath()}</span>
            </span>
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-sans text-[10px]">
              ✓ Stored in repo root `ai_grading/` for AI Grader
            </span>
          </div>
          <pre className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 leading-relaxed whitespace-pre-wrap overflow-x-auto">
            {getActiveContent()}
          </pre>
        </div>
      </div>
    </div>
  );
};
