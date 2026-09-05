import React from 'react'

export default function RiskScore({ score, level }) {
  const levelClass = level ? level.toLowerCase() : 'low'

  return (
    <div className="risk-score-container">
      <div className={`score-circle ${levelClass}`}>
        <span className="score-value">{score}</span>
        <span className="score-label">{level}</span>
      </div>
      <p className="score-disclaimer">
        This score represents verification risk, not the probability that the media was AI-generated.
      </p>
    </div>
  )
}
