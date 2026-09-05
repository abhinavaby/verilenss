import React from 'react'
import MediaUploader from '../components/MediaUploader'

export default function Home({ onAnalyze, error, onClearError }) {
  return (
    <div className="home">
      <section className="hero">
        <h1>Know Before You Share</h1>
        <p>Analyze suspicious images, audio, and video and understand what deserves further verification.</p>
      </section>

      {error && (
        <div className="error-message" style={{ maxWidth: '640px', margin: '0 auto 2rem auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
          <span>{error}</span>
          <button
            onClick={onClearError}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1, flexShrink: 0, padding: 0 }}
            aria-label="Dismiss error"
          >×</button>
        </div>
      )}

      <MediaUploader onAnalyze={onAnalyze} />

      <section className="how-it-works">
        <div className="step-card">
          <div className="step-number">1</div>
          <h3>Upload</h3>
          <p>Upload an image, audio clip, or video.</p>
        </div>
        <div className="step-card">
          <div className="step-number">2</div>
          <h3>Analyze</h3>
          <p>VeriLens looks for suspicious indicators and available context.</p>
        </div>
        <div className="step-card">
          <div className="step-number">3</div>
          <h3>Understand</h3>
          <p>Receive a simple evidence-based verification report.</p>
        </div>
      </section>
    </div>
  )
}

