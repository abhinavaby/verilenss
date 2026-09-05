import React from 'react'

export default function MetadataSection({ file, serverMetadata }) {
  const formatSize = (bytes) => {
    if (!bytes) return 'Unknown'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Use server metadata if available, otherwise fall back to client-side file object
  const fileType = serverMetadata?.fileType || file?.type || 'Unknown'
  const fileSize = serverMetadata?.fileSize || (file ? formatSize(file.size) : 'Unknown')
  const dimensions = serverMetadata?.dimensions || 'Unknown'
  const created = serverMetadata?.created || 'Unknown'
  const editingSoftware = serverMetadata?.editingSoftware || 'Unknown'

  return (
    <>
      <h2>Metadata</h2>
      <div className="metadata-grid">
        <div className="meta-item">
          <span className="label">File Type</span>
          <span className="value">{fileType}</span>
        </div>
        <div className="meta-item">
          <span className="label">File Size</span>
          <span className="value">{fileSize}</span>
        </div>
        <div className="meta-item">
          <span className="label">Dimensions</span>
          <span className="value">{dimensions}</span>
        </div>
        <div className="meta-item">
          <span className="label">Created</span>
          <span className="value">{created}</span>
        </div>
        <div className="meta-item">
          <span className="label">Editing Software</span>
          <span className="value">{editingSoftware}</span>
        </div>
      </div>
      <p className="metadata-note">Missing metadata does not mean that the file is fake.</p>
    </>
  )
}
