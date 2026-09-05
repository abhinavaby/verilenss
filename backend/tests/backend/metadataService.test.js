/**
 * metadataService.test.js
 * Unit tests for metadataService helper function.
 */

const { extractMetadata } = require('../../services/metadataService')

describe('metadataService', () => {
  it('should correctly format size in KB for files smaller than 1MB', () => {
    const mockFile = {
      originalname: 'sample_image.jpg',
      mimetype: 'image/jpeg',
      size: 512 * 1024 // 512 KB
    }

    const metadata = extractMetadata(mockFile)

    expect(metadata).toEqual({
      fileName: 'sample_image.jpg',
      fileType: 'image/jpeg',
      fileSize: '512.0 KB',
      dimensions: null,
      created: null,
      editingSoftware: null
    })
  })

  it('should correctly format size in MB for files larger than 1MB', () => {
    const mockFile = {
      originalname: 'large_audio.mp3',
      mimetype: 'audio/mpeg',
      size: 3.5 * 1024 * 1024 // 3.5 MB
    }

    const metadata = extractMetadata(mockFile)

    expect(metadata.fileSize).toBe('3.50 MB')
    expect(metadata.fileName).toBe('large_audio.mp3')
    expect(metadata.fileType).toBe('audio/mpeg')
  })
})
