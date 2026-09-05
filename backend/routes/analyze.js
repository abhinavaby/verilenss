/**
 * analyze.js
 * POST /api/analyze — accepts one media file, validates it,
 * extracts metadata, runs AI analysis, and returns a JSON report.
 * Temporary files are deleted after processing.
 */

const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const sharp = require('sharp')

const { extractMetadata } = require('../services/metadataService')
const { analyzeImage, analyzeTranscript } = require('../services/openaiService')

const router = express.Router()

// --- File size limits ---
const IMAGE_MAX_BYTES = 5 * 1024 * 1024   // 5 MB
const AUDIO_MAX_BYTES = 10 * 1024 * 1024  // 10 MB (~60s of audio)
const VIDEO_MAX_BYTES = 25 * 1024 * 1024  // 25 MB

// --- MIME type whitelist ---
const ALLOWED_TYPES = {
  'image/jpeg': 'image',
  'image/jpg': 'image',
  'image/png': 'image',
  'image/webp': 'image',
  'audio/mpeg': 'audio',
  'audio/mp3': 'audio',
  'audio/wav': 'audio',
  'audio/x-wav': 'audio',
  'audio/mp4': 'audio',
  'audio/x-m4a': 'audio',
  'video/mp4': 'video',
  'video/webm': 'video',
}

// --- Multer setup: store to disk temporarily ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '..', 'uploads')
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`
    cb(null, `${unique}${path.extname(file.originalname)}`)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: VIDEO_MAX_BYTES }, // enforce largest limit at multer level
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES[file.mimetype]) {
      cb(null, true)
    } else {
      cb(new Error('Unsupported file type. Please upload a valid image, audio, or video.'))
    }
  }
})

// Helper: delete temp file without throwing
function cleanupFile(filePath) {
  fs.unlink(filePath, () => {}) // fire-and-forget
}

// --- Route: POST /api/analyze ---
router.post('/', upload.single('file'), async (req, res) => {
  const file = req.file

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded.' })
  }

  const mediaType = ALLOWED_TYPES[file.mimetype]

  // Per-type size validation
  const sizeLimit = mediaType === 'image'
    ? IMAGE_MAX_BYTES
    : mediaType === 'audio'
    ? AUDIO_MAX_BYTES
    : VIDEO_MAX_BYTES

  if (file.size > sizeLimit) {
    cleanupFile(file.path)
    const label = mediaType === 'image' ? '5 MB' : mediaType === 'audio' ? '10 MB' : '25 MB'
    return res.status(400).json({ error: `File is too large. Maximum size for ${mediaType} is ${label}.` })
  }

  // Extract basic metadata
  const metadata = extractMetadata(file)

  try {
    let aiResult

    if (mediaType === 'image') {
      // Send the ORIGINAL, uncompressed image to OpenAI for maximum forensic accuracy
      const imgBuffer = fs.readFileSync(file.path)

      // Add image dimensions to metadata
      const imgMeta = await sharp(file.path).metadata()
      if (imgMeta.width && imgMeta.height) {
        metadata.dimensions = `${imgMeta.width} × ${imgMeta.height}`
      }

      aiResult = await analyzeImage(imgBuffer, file.mimetype)

    } else if (mediaType === 'audio') {
      // Transcribe audio then analyze transcript
      const { default: OpenAI } = await import('openai')
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(file.path),
        model: 'whisper-1',
        language: 'en',
      })

      const transcript = transcription.text || ''
      if (!transcript.trim()) {
        // No speech detected
        aiResult = {
          score: 10,
          level: 'LOW',
          findings: ['No speech or audio content could be detected.'],
          explanation: 'The audio file did not contain detectable speech for analysis.',
          claims: [],
          recommendations: ['Verify the audio file is not silent or corrupted.'],
          limitations: ['Audio without speech cannot be analyzed for spoken claims.']
        }
      } else {
        aiResult = await analyzeTranscript(transcript)
        metadata.transcript = transcript.slice(0, 300) // store short snippet
      }

    } else {
      // Video: not fully implemented yet — return a clear message
      cleanupFile(file.path)
      return res.status(400).json({
        error: 'Video analysis is not yet available in this version. Please upload an image or audio file.'
      })
    }

    // Delete temp file
    cleanupFile(file.path)

    // Respond with the full report
    return res.json({
      success: true,
      mediaType,
      metadata,
      result: aiResult
    })

  } catch (err) {
    cleanupFile(file.path)

    // Don't expose internal errors
    console.error('[analyze error]', err.message)

    if (err.message && err.message.includes('JSON')) {
      return res.status(500).json({ error: 'AI returned an unexpected response. Please try again.' })
    }

    return res.status(500).json({ error: 'Unable to analyze this file. Please try again.' })
  }
})

module.exports = router
