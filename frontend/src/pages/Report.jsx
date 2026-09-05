import React from 'react'
import RiskScore from '../components/RiskScore'
import FindingsList from '../components/FindingsList'
import MetadataSection from '../components/MetadataSection'
import RecommendationSection from '../components/RecommendationSection'

export default function Report({ file, data, onReset }) {
  if (!data) return null

  // Support both real backend response and mock data structure
  const result = data.result || data
  const metadata = data.metadata || null

  return (
    <div className="report-container">
      <div className="report-header">
        <h1>Verification Report</h1>
        {file && <p className="file-subtitle">File: {file.name}</p>}
      </div>

      <div className="report-grid">
        <div className="report-main">
          <div className="card">
            <RiskScore score={result.score} level={result.level} />
          </div>

          <div className="card">
            <FindingsList findings={result.findings} />
          </div>

          <div className="card">
            <h2>Why This Matters</h2>
            <p className="explanation-text">{result.explanation}</p>
          </div>

          <div className="card">
            <h2>Detected Claims</h2>
            <ul className="findings-list">
              {result.claims && result.claims.length > 0 ? (
                result.claims.map((claim, idx) => (
                  <li key={idx}>{claim}</li>
                ))
              ) : (
                <li>No major factual claim detected.</li>
              )}
            </ul>
          </div>
        </div>

        <div className="report-sidebar">
          <div className="card">
            <RecommendationSection recommendations={result.recommendations} />
          </div>

          <div className="card">
            <MetadataSection file={file} serverMetadata={metadata} />
          </div>

          <div className="limitations-section">
            <h3>Analysis Limitations</h3>
            {result.limitations && result.limitations.map((limit, idx) => (
              <p key={idx}>{limit}</p>
            ))}
          </div>

          <button className="btn" onClick={onReset} style={{ width: '100%' }}>
            Analyze Another File
          </button>
        </div>
      </div>
    </div>
  )
}
