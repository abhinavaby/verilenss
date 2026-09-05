# VERILENS — Know Before You Share

A GenAI-powered media verification platform that helps users detect potential AI-generated or manipulated images and audio before trusting or sharing them.

---

## Problem Statement

In an era of AI-generated deepfakes and misinformation, it is difficult to know whether an image, audio clip, or video is authentic. VeriLens gives journalists, researchers, students, and everyday users an easy way to verify suspicious media.

**Important:** VeriLens does not scientifically prove that media is fake or AI-generated. Results are presented as **Verification Risk**, not probability of AI generation.

---

## Features

- Upload images (JPG, PNG, WEBP), audio (MP3, WAV, M4A), or video
- AI-powered analysis via OpenAI GPT-4o Vision
- Audio transcription via OpenAI Whisper
- Verification risk score (0–100) with LOW / CAUTION / HIGH levels
- Evidence-based findings with natural language explanations
- File metadata extraction (type, size, dimensions)
- Detected factual claims from the media
- Practical verification recommendations
- Clear limitations disclosure on every report
- Mock mode for UI development without spending API credits

---

## Technology Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite + Plain CSS |
| Backend | Node.js + Express |
| AI | OpenAI GPT-4o Vision + Whisper |
| File upload | Multer |
| Image resizing | Sharp |

---

## Architecture

```
User
 │
 ▼
React Frontend (Vite, port 5173)
 │
 │  POST /api/analyze  (multipart/form-data)
 ▼
Express Backend (port 3001)
 ├── File validation (type + size)
 ├── Metadata extraction (Sharp for images)
 ├── Image resize to ≤1600px (Sharp)
 ├── OpenAI GPT-4o Vision  ← single API call
 └── JSON report response
 │
 ▼
React Verification Report
```

---

## Setup

### 1. Clone and install

```bash
# Frontend
cd verilens/frontend
npm install

# Backend
cd ../backend
npm install
```

### 2. Configure environment

```bash
# backend/.env
OPENAI_API_KEY=sk-...your-key...
PORT=3001
```

```bash
# frontend/.env
VITE_BACKEND_URL=http://localhost:3001
VITE_USE_MOCK_DATA=false   # set to true for UI dev without API calls
```

### 3. Run

```bash
# Terminal 1 — Backend
cd verilens/backend
node server.js

# Terminal 2 — Frontend
cd verilens/frontend
npm run dev
```

Open: http://localhost:5173

---

## API Endpoints

### `GET /api/health`
Returns server status.
```json
{ "status": "ok", "timestamp": "..." }
```

### `POST /api/analyze`
Accepts one media file as `multipart/form-data` with field name `file`.

**Response:**
```json
{
  "success": true,
  "mediaType": "image",
  "metadata": {
    "fileName": "example.jpg",
    "fileType": "image/jpeg",
    "fileSize": "1.2 MB",
    "dimensions": "1920 × 1080"
  },
  "result": {
    "score": 58,
    "level": "CAUTION",
    "findings": ["..."],
    "explanation": "...",
    "claims": ["..."],
    "recommendations": ["..."],
    "limitations": ["..."]
  }
}
```

**File size limits:**
| Type | Limit |
|---|---|
| Image | 5 MB |
| Audio | 10 MB |
| Video | 25 MB (analysis not yet implemented) |

---

## Performance Notes

### Time Complexity

| Operation | Complexity | Notes |
|---|---|---|
| File validation | O(1) | MIME type lookup in a fixed map |
| Metadata extraction | O(n) | n = file size, linear read by Sharp |
| Image resize | O(n) | n = pixel count, single pass by Sharp |
| OpenAI image analysis | O(1) API calls | Exactly 1 request per file |
| Audio transcription | O(1) API calls | Exactly 1 Whisper request |
| Video frame analysis | O(k), k=4 | Only 4 sampled frames — effectively O(1) relative to total frames |
| Report rendering | O(f), f≤5 | Finding list capped at 5 items, effectively O(1) |

> ⚠️ Third-party API latency (OpenAI) is not under application control and is not included in complexity analysis.

### Space Complexity

- Only **one file is processed at a time** — no accumulation
- Uploaded files are **deleted immediately** after analysis
- No database — reports live in frontend state only
- Base64 encoding is used only for the resized image buffer (≤1600px), not the original
- Audio is streamed directly to Whisper — no duplicate buffer

Additional memory usage remains **O(1)** relative to the number of past requests.

---

## Security

- `OPENAI_API_KEY` lives only in `backend/.env` — never sent to the browser
- `.env` is in `.gitignore`
- API key is never logged
- File uploads are validated by both MIME type and size before processing
- Stack traces are never exposed to the client

---

## Limitations

- VeriLens is **not** a scientifically validated deepfake detector
- Results should be used as a starting point for verification, not a final verdict
- Analysis accuracy depends on OpenAI model capabilities
- Video analysis outputs frames only — full video understanding is not yet implemented
- Audio analysis is text-based (transcript only) — voice synthesis detection is not included

---

## Future Improvements

- Video frame extraction with FFmpeg (Phase 7)
- EXIF metadata deep-read with exiftool
- Reverse image search integration
- Source credibility cross-referencing
- Multi-language audio transcription
- Report export as PDF
