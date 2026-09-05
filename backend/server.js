/**
 * server.js
 * VeriLens Express backend entry point.
 */

require('dotenv').config()

const express = require('express')
const cors = require('cors')

const analyzeRouter = require('./routes/analyze')

const app = express()
const PORT = process.env.PORT || 3001

// --- Middleware ---
app.use(cors()) // Allow all origins — fine for local hackathon dev


app.use(express.json({ limit: '1mb' }))

// --- Routes ---

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Media analysis
app.use('/api/analyze', analyzeRouter)

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' })
})

// Global error handler — never expose stack traces to client
app.use((err, req, res, next) => {
  console.error('[server error]', err.message)

  // Handle multer file-too-large error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File is too large. Please check size limits.' })
  }

  res.status(err.status || 500).json({
    error: err.message || 'Something went wrong. Please try again.'
  })
})

app.listen(PORT, () => {
  console.log(`✅ VeriLens backend running at http://localhost:${PORT}`)
  console.log(`   Health check: http://localhost:${PORT}/api/health`)
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
    console.warn('⚠️  OPENAI_API_KEY is not set — AI analysis will fail. Add it to .env')
  }
})
