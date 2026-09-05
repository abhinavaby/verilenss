import React, { useState, useRef } from 'react'

export default function MediaUploader({ onAnalyze }) {
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [isDragActive, setIsDragActive] = useState(false)
  const inputRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true)
    } else if (e.type === 'dragleave') {
      setIsDragActive(false)
    }
  }

  const validateFile = (selectedFile) => {
    setError('')
    
    if (!selectedFile) return false

    // Size limit 25MB roughly
    if (selectedFile.size > 25 * 1024 * 1024) {
      setError('File is too large. Maximum size is 25MB.')
      setFile(null)
      return false
    }

    const validTypes = [
      'image/jpeg', 'image/png', 'image/webp',
      'audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/x-m4a',
      'video/mp4', 'video/webm'
    ]

    if (!validTypes.includes(selectedFile.type)) {
      setError('Unsupported file type. Please upload a valid image, audio, or video.')
      setFile(null)
      return false
    }

    return true
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (validateFile(droppedFile)) {
        setFile(droppedFile)
      }
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (validateFile(selectedFile)) {
        setFile(selectedFile)
      }
    }
  }

  const onButtonClick = () => {
    inputRef.current.click()
  }

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="upload-card">
      <div 
        className={`upload-area ${isDragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
      >
        <input
          ref={inputRef}
          type="file"
          className="file-input"
          style={{ display: 'none' }}
          onChange={handleChange}
          accept="image/jpeg, image/png, image/webp, audio/mpeg, audio/wav, audio/mp4, video/mp4, video/webm"
        />
        
        {file ? (
          <div>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom: '1rem'}}>
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
              <polyline points="13 2 13 9 20 9"></polyline>
            </svg>
            <p className="loading-text">{file.name}</p>
            <p className="file-info">{file.type} • {formatSize(file.size)}</p>
          </div>
        ) : (
          <div>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom: '1rem'}}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <p className="loading-text">Drag and drop or Choose File</p>
            <p className="file-info">Supports JPG, PNG, WEBP, MP3, WAV, MP4, WEBM</p>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <button 
        className="btn" 
        disabled={!file} 
        onClick={() => onAnalyze(file)}
      >
        Analyze Media
      </button>
    </div>
  )
}
