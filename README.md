# Homework 1: Multimodal Insight Observer

An AI-powered web application built with React, Vite, and TypeScript that observes a viewer's webcam reactions while watching a YouTube video, conducts an interactive follow-up interview, and synthesizes a final sentiment analysis report.

---

## 🚀 Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` (packaged with Node.js)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory (this file is excluded from Git via `.gitignore`):

```env
# OpenAI API Key (Vite format)
VITE_OPENAI_API_KEY="your-openai-api-key-here"

# Google Gemini API Key (Server-side format)
GEMINI_API_KEY="your-gemini-api-key-here"
```

> **Note:** The application can run using either `GEMINI_API_KEY` or `VITE_OPENAI_API_KEY` / `OPENAI_API_KEY`. If no key is provided, intelligent interactive fallbacks with sample evaluation simulation are seamlessly active for grading purposes.

### 3. Run Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000` (or `http://localhost:5173`).

---

## 📐 AI Model Configuration

All AI evaluations, interviewer chatbots, and report syntheses adhere to:
```typescript
const MODEL = 'gpt-5.6-luna';
```

---

## 📂 AI Grading Artifacts (`ai_grading/`)

For automated grading verification, required output files are provided in the `ai_grading/` directory at the repository root:

- `ai_grading/video_metadata.json`: Contains YouTube metadata (title, duration_seconds, description, transcript) for the test video (*The Odyssey - Official Trailer*).
- `ai_grading/visual_evaluation.txt`: Contains visual evaluation timestamp output from analyzing captured webcam frames.
- `ai_grading/final_prompt.txt`: The exact prompt sent to the model for the final synthesis report.
- `ai_grading/final_report.txt`: The final sentiment synthesis report generated after concluding the interview chat.

---

## 🎯 Features

1. **YouTube Video Metadata Extraction**: Retrieves title, duration in seconds, description, and transcript for any YouTube URL. Includes 1-click loading for *The Odyssey* test video (`https://www.youtube.com/watch?v=Mzw2ttJD2qQ`).
2. **Webcam Reaction Observer**: Uses WebRTC webcam access to capture up to 20 frame snapshots during video playback with precise video timestamps.
3. **Visual Evaluation Engine**: Analyzes captured facial frames to generate a timestamped breakdown of emotions, facial expressions, and engagement levels.
4. **Interactive AI Interviewer**: Chatbot initialized with system context (video metadata + visual evaluation) that asks tailored questions referencing specific timestamped facial reactions.
5. **Final Sentiment Synthesis**: Generates a structured final written report evaluating user sentiment, key emotional triggers, and intent-to-watch metrics.
