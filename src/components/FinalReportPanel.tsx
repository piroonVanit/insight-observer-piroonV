import React, { useState } from 'react';
import { FileText, Copy, Download, Check, Sparkles, Code2, HeartHandshake } from 'lucide-react';
import { FinalSynthesisResult } from '../types';

interface FinalReportPanelProps {
  reportData: FinalSynthesisResult | null;
  isLoading: boolean;
}

export const FinalReportPanel: React.FC<FinalReportPanelProps> = ({
  reportData,
  isLoading,
}) => {
  const [activeTab, setActiveTab] = useState<'report' | 'prompt'>('report');
  const [copied, setCopied] = useState<boolean>(false);

  if (isLoading) {
    return (
      <div id="final-report-loading" className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl flex flex-col items-center justify-center gap-4 text-center min-h-[300px]">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center animate-bounce">
          <Sparkles className="w-6 h-6 text-indigo-400" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-slate-100">Synthesizing Final Multimodal Report...</h3>
          <p className="text-xs text-slate-400 font-mono">Combining YouTube Metadata + Visual Evaluation + Interview Chat History</p>
        </div>
      </div>
    );
  }

  if (!reportData) return null;

  const handleCopy = () => {
    const textToCopy = activeTab === 'report' ? reportData.finalReport : reportData.finalPrompt;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const textToDownload = activeTab === 'report' ? reportData.finalReport : reportData.finalPrompt;
    const filename = activeTab === 'report' ? 'final_report.txt' : 'final_prompt.txt';
    const blob = new Blob([textToDownload], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="final-report-card" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col gap-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 id="final-report-title" className="text-base font-bold text-white tracking-tight">
                Final Sentiment Synthesis Report
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-full">
                gpt-5.6-luna
              </span>
            </div>
            <p className="text-xs text-slate-400">Complete AI multimodal reaction & interview analysis</p>
          </div>
        </div>

        {/* Tab Toggle & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              id="tab-final-report"
              onClick={() => setActiveTab('report')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'report' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Final Report</span>
            </button>
            <button
              id="tab-final-prompt"
              onClick={() => setActiveTab('prompt')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'prompt' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Exact Prompt</span>
            </button>
          </div>

          <button
            id="copy-report-btn"
            onClick={handleCopy}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-colors"
            title="Copy Content"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            id="download-report-btn"
            onClick={handleDownload}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-colors"
            title="Download TXT"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Display Body */}
      <div id="report-content-body" className="bg-slate-950 border border-slate-800/90 rounded-xl p-5 text-xs font-mono text-slate-200 leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-y-auto">
        {activeTab === 'report' ? reportData.finalReport : reportData.finalPrompt}
      </div>
    </div>
  );
};
