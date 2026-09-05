import React, { useState, useEffect } from 'react'

export default function LoadingState() {
  const [statusText, setStatusText] = useState('Reading file...')

  useEffect(() => {
    const states = [
      'Reading file...',
      'Checking metadata...',
      'Analyzing visible or spoken content...',
      'Preparing verification report...'
    ]
    
    let currentIndex = 0
    const interval = setInterval(() => {
      currentIndex++
      if (currentIndex < states.length) {
        setStatusText(states[currentIndex])
      } else {
        clearInterval(interval)
      }
    }, 700)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="loading-state">
      <div className="spinner"></div>
      <p className="loading-text">Analyzing your media...</p>
      <p className="loading-subtext">{statusText}</p>
    </div>
  )
}
