import React from 'react'

export default function FindingsList({ findings }) {
  if (!findings || findings.length === 0) return null

  return (
    <>
      <h2>What We Found</h2>
      <ul className="findings-list">
        {findings.map((finding, index) => (
          <li key={index}>{finding}</li>
        ))}
      </ul>
    </>
  )
}
