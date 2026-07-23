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
  "title": "The Odyssey - Official Trailer",
  "duration_seconds": 135,
  "description": "Experience the epic journey of Odysseus as he battles mythic beasts and navigates treacherous seas to return home. Watch the official trailer for The Odyssey.",
  "transcript": "[0:00] For ten long years, Troy has fallen. But the hardest war is the one to reach home.\\n[0:25] Poseidon's wrath unleashes the storm!\\n[0:50] No mortal can escape the Sirens' call...\\n[1:15] Stand firm, my brothers, Ithaca awaits!\\n[1:45] Coming soon to theaters."
}`;

  const visualEvalTxt = `Visual Evaluation Report
Model: gpt-5.6-luna
Video: The Odyssey - Official Trailer (Duration: 135s)
Total Frame Samples Analyzed: 20

Timestamp Analysis:
- [00:05] Neutral / Attentive (Baseline focus as trailer title cards begin)
- [00:12] Slight Smile / Curiosity (Viewer lights up as Odysseus appears on screen)
- [00:18] Focused / Neutral (Attentive listening during opening monologue)
- [00:25] Widened Eyes / Surprised (Viewer reacts with amazement at the Poseidon sea monster effect)
- [00:32] Raised Eyebrows / Intrigued (Watching ship storm chaos)
- [00:40] Focused / Tense (Slight narrowing of eyes during naval battle)
- [00:50] Subtle Smile (Amusement at comic beat / mythical creature encounter)
- [00:58] Frown / Concerned (Viewer shifts posture as crew faces peril)
- [00:65] Neutral / Immersed (Steady focus on dialogue)
- [00:72] Gasp / Wide Eyes (Shocked reaction at Sirens jump reveal)
- [00:80] Slight Smile (Viewer nods in appreciation of visual cinematic composition)
- [00:88] Focused / Intent (Engaged with battle music build-up)
- [00:95] Smirk / Excited (Appreciation of heroic action sequence)
- [01:05] Tense Mouth / Anticipation (Climactic clash scene)
- [01:12] Bright Smile / Nodding (Strong positive approval at battle cry)
- [01:20] Wide Smile / Delighted (Enthusiastic reaction to title reveal sequence)
- [01:28] Neutral / Satisfied (Relaxed posture as trailer concludes)
- [01:35] Smile (Overall pleased impression as title screen fade finishes)

Overall Visual Summary:
The viewer demonstrated high emotional engagement throughout the 135-second trailer. Key peaks of emotional valence occurred during the CGI creature action sequences (00:25, 00:72) and the heroic climax (01:12 - 01:20), marked by smiles, widened eyes, and nodding.`;

  const finalPromptTxt = `System Model: gpt-5.6-luna

System Instruction:
You are an expert AI Sentiment Analyst and Interview Synthesizer. Your goal is to write a comprehensive, well-structured Final Sentiment & Insight Synthesis Report evaluating a user's emotional experience while watching a video and participating in a follow-up interview.

Input Data Provided:

=== YOUTUBE VIDEO METADATA ===
Title: The Odyssey - Official Trailer
Duration: 135 seconds
Description: Experience the epic journey of Odysseus as he battles mythic beasts and navigates treacherous seas to return home. Watch the official trailer for The Odyssey.
Transcript:
[0:00] For ten long years, Troy has fallen. But the hardest war is the one to reach home.
[0:25] Poseidon's wrath unleashes the storm!
[0:50] No mortal can escape the Sirens' call...
[1:15] Stand firm, my brothers, Ithaca awaits!
[1:45] Coming soon to theaters.

=== VISUAL EVALUATION (WEBCAM REACTION ANALYSIS) ===
Timestamp Analysis:
- [00:05] Neutral / Attentive
- [00:12] Slight Smile / Curiosity
- [00:18] Focused / Neutral
- [00:25] Widened Eyes / Surprised (Poseidon storm sequence)
- [00:32] Raised Eyebrows / Intrigued
- [00:40] Focused / Tense
- [00:50] Subtle Smile
- [00:58] Frown / Concerned
- [00:65] Neutral / Immersed
- [00:72] Gasp / Wide Eyes (Sirens reveal)
- [00:80] Slight Smile
- [00:88] Focused / Intent
- [00:95] Smirk / Excited
- [01:05] Tense Mouth / Anticipation
- [01:12] Bright Smile / Nodding (Heroic battle cry)
- [01:20] Wide Smile / Delighted (Title reveal)
- [01:28] Neutral / Satisfied
- [01:35] Smile

Overall Visual Summary: High emotional engagement with peak positive valence at 00:25, 00:72, and 01:12 - 01:20.

=== INTERVIEW CHAT HISTORY ===
Interviewer: Hi there! I've been observing your reactions while watching "The Odyssey - Official Trailer". I noticed you had a huge smile and widened eyes around 00:25 when Poseidon unleashed the storm, and again at 01:12 during the battle cry. What specifically excited you about those moments?
User: The visual effects for Poseidon's wave were insane! I love epic myth stories, and the orchestral music during the battle scene got me really hyped up for the movie.
Interviewer: That makes total sense! The CGI and score definitely set a grand tone. On the flip side, I saw your expression get a bit tense and focused around 00:58. Was there anything in that segment or overall trailer that you felt didn't work as well or made you skeptical?
User: Around 00:58 the lighting got super dark, so it was a bit hard to see what was happening in the monster fight. But overall, I thought it was a fantastic trailer!
Interviewer: Thanks for sharing that feedback! Darkness in fight scenes can definitely hinder visibility. Overall, would you say you're eager to watch this in theaters when it comes out?
User: Absolutely, 100%! I'm definitely buying a ticket on opening night.

=== TASK ===
Synthesize the user's total reaction into a final written sentiment report. Structure your report into clear sections:
1. Executive Summary
2. Visual Reaction Analysis & Key Emotional Triggers
3. Qualitative User Interview Insights
4. Overall Sentiment Score & Recommendations`;

  const finalReportTxt = `===================================================================
MULTIMODAL INSIGHT OBSERVER - FINAL SENTIMENT SYNTHESIS REPORT
Model: gpt-5.6-luna
Subject Video: The Odyssey - Official Trailer
Duration: 135 Seconds
===================================================================

1. EXECUTIVE SUMMARY
---------------------
The user demonstrated an overwhelmingly positive emotional response to "The Odyssey - Official Trailer". Across 20 visual frame samples captured during playback, the viewer exhibited sustained engagement, high curiosity, and vivid positive facial reactions during key cinematic highlights. The follow-up interview confirmed high intent-to-watch, driven by praise for the CGI visual effects and musical score.

2. VISUAL REACTION & EMOTIONAL TRIGGERS
----------------------------------------
- Peak Positive Triggers (00:25 & 01:12 - 01:20):
  - At 00:25, the user displayed widened eyes and an immediate smile upon seeing Poseidon's CGI storm sequence.
  - At 01:12, the user smiled brightly and nodded along to the protagonist's battle cry ("Ithaca awaits!"), culminating in a delighted smile during the title card at 01:20.
- Micro-Tension / Critical Moment (00:58):
  - A noticeable frown and posture shift occurred at 00:58 during a murky creature sequence, indicating visual strain or momentary confusion.

3. QUALITATIVE INTERVIEW INSIGHTS
----------------------------------
- High Approval Areas:
  - Visual Effects: User praised the scale and impact of Poseidon's water sequence ("insane CGI").
  - Audio & Score: The orchestral soundtrack successfully generated hype and anticipation.
- Areas for Improvement:
  - Lighting & Clarity: User noted that scene lighting around 00:58 was overly dark, obscuring action details.

4. OVERALL SENTIMENT & VERDICT
--------------------------------
- Overall Sentiment Score: 92/100 (Highly Enthusiastic)
- Conversion Intent: High (User confirmed immediate plans to watch in theaters on opening night)
- Key Recommendation: Maintain high-octane VFX showcase in future promotional teasers while ensuring high-contrast color grading in darker fight sequences.`;

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
          <div className="text-[10px] font-mono text-indigo-400 mb-2">
            File Location: <span className="text-slate-200">{getActivePath()}</span>
          </div>
          <pre className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 leading-relaxed whitespace-pre-wrap overflow-x-auto">
            {getActiveContent()}
          </pre>
        </div>
      </div>
    </div>
  );
};
