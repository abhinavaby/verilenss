import { useState } from 'react'
import Header from './components/Header'
import Home from './pages/Home'
import Report from './pages/Report'
import LoadingState from './components/LoadingState'
import './styles.css'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'
const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true'

const MOCK_DATA = {
  mediaType: 'image',
  metadata: {
    fileName: 'example.jpg',
    fileType: 'image/jpeg',
    fileSize: '1.2 MB',
    dimensions: '1920 × 1080',
    created: null,
    editingSoftware: null,
  },
  result: {
    score: 58,
    level: 'CAUTION',
    findings: [
      'Lighting around the subject appears slightly inconsistent.',
      'Background text contains some irregular character shapes.',
      'Edge blending around the subject appears softer than expected.',
    ],
    explanation:
      'Some visual characteristics in this image warrant further verification. These indicators alone do not confirm that the image was manipulated or AI-generated.',
    claims: ['No major factual claim detected.'],
    recommendations: [
      'Check the original uploader or source.',
      'Compare the media with reporting from established news organizations.',
      'Reverse-search the image using Google Lens or TinEye.',
    ],
    limitations: [
      'AI-based media analysis can make mistakes. Visual inconsistencies do not independently prove manipulation. VeriLens should be used as an assistant for verification, not as a final authority.',
    ],
  },
}

function App() {
  const [view, setView] = useState('HOME')
  const [file, setFile] = useState(null)
  const [reportData, setReportData] = useState(null)
  const [error, setError] = useState('')

  const handleAnalyze = async (uploadedFile) => {
    setFile(uploadedFile)
    setError('')
    setView('LOADING')

    if (USE_MOCK) {
      // Mock mode: simulate delay, no API call
      setTimeout(() => {
        setReportData(MOCK_DATA)
        setView('REPORT')
      }, 2800)
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', uploadedFile)

      const response = await fetch(`${BACKEND_URL}/api/analyze`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Unable to analyze this file. Please try again.')
      }

      setReportData(data)
      setView('REPORT')
    } catch (err) {
      // TypeError means network failure (backend not reachable)
      let msg = err.message
      if (err instanceof TypeError || msg === 'Failed to fetch' || msg === 'Load failed') {
        msg = 'Could not reach the analysis server. Make sure the backend is running on port 3001.'
      }
      setError(msg)
      setView('HOME')
    }
  }

  const handleReset = () => {
    setFile(null)
    setReportData(null)
    setError('')
    setView('HOME')
  }

  const handleNavigate = (newView) => {
    if (newView === 'HOME') {
      handleReset()
    } else {
      setView(newView)
    }
  }

  return (
    <div className="app-wrapper">
      <Header onNavigate={handleNavigate} />
      <main>
        <div className="container">
          {view === 'HOME' && <Home onAnalyze={handleAnalyze} error={error} onClearError={() => setError('')} />}
          {view === 'LOADING' && <LoadingState />}
          {view === 'REPORT' && <Report file={file} data={reportData} onReset={handleReset} />}
          
          {view === 'HOW_IT_WORKS' && (
            <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
              <h2>How VeriLens Works</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>VeriLens combines forensic file analysis with OpenAI's advanced vision and audio models to detect inconsistencies.</p>
              
              <h3 style={{ color: 'var(--accent)', marginTop: '1.5rem', marginBottom: '0.5rem' }}>1. Upload & Validation</h3>
              <p style={{ color: 'var(--text)' }}>Your file is validated locally for type and size. We support images (JPG, PNG, WEBP) and audio (MP3, WAV, M4A).</p>

              <h3 style={{ color: 'var(--accent)', marginTop: '1.5rem', marginBottom: '0.5rem' }}>2. High-Fidelity Tile Analysis</h3>
              <p style={{ color: 'var(--text)' }}>Unlike standard tools that compress images, VeriLens sends the raw, uncompressed file buffer to GPT-4o Vision using high-detail mode. This allows the AI to examine 512x512 tiles for micro-artifacts.</p>

              <h3 style={{ color: 'var(--accent)', marginTop: '1.5rem', marginBottom: '0.5rem' }}>3. Forensic Prompting</h3>
              <p style={{ color: 'var(--text)' }}>The AI is restricted by a strict forensic prompt. It looks for specific physical anomalies: lighting inconsistencies, anatomical distortions, and unnatural edge blending.</p>

              <button className="btn" onClick={() => handleNavigate('HOME')} style={{ marginTop: '2.5rem' }}>Try it now</button>
            </div>
          )}

          {view === 'ABOUT' && (
            <div className="card" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>About VeriLens</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem' }}>A GenAI-powered platform to help you verify before you trust.</p>
              
              <div style={{ background: 'var(--surface-2)', padding: '2rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', textAlign: 'left', marginBottom: '2rem' }}>
                <h3 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>The Problem</h3>
                <p style={{ color: 'var(--text)', marginBottom: '1rem' }}>With the rise of generative AI, deepfakes, and manipulated media, it's becoming incredibly difficult to trust what we see and hear online. Journalists, researchers, and everyday users need accessible tools to flag suspicious content.</p>
                <h3 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>Our Mission</h3>
                <p style={{ color: 'var(--text)' }}>VeriLens isn't here to declare what is mathematically true or false. It's designed to be an accessible assistant that flags visual and audio anomalies, extracts context, and provides actionable recommendations for independent verification.</p>
              </div>

              <button className="btn" onClick={() => handleNavigate('HOME')}>Back to Home</button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
