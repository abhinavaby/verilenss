import React from 'react'

export default function RecommendationSection({ recommendations }) {
  if (!recommendations || recommendations.length === 0) return null

  return (
    <>
      <h2>Recommended Next Step</h2>
      <ul className="recommendations-list">
        {recommendations.map((rec, index) => (
          <li key={index}>{rec}</li>
        ))}
      </ul>
    </>
  )
}
