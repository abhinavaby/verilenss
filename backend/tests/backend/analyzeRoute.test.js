/**
 * analyzeRoute.test.js
 * Integration tests for /api/analyze route handling and validation.
 */

const request = require('supertest')
const app = require('../../server')
const path = require('path')
const fs = require('fs')

// Mock OpenAI service calls so tests do not make live API requests
jest.mock('../../services/openaiService', () => ({
  analyzeImage: jest.fn().mockResolvedValue({
    score: 20,
    level: 'LOW',
    findings: ['No signs of manipulation detected'],
    explanation: 'Image appears genuine based on observable patterns.',
    claims: [],
    recommendations: [],
    limitations: []
  }),
  analyzeTranscript: jest.fn().mockResolvedValue({
    score: 10,
    level: 'LOW',
    findings: ['Speech analysis normal'],
    explanation: 'No suspicious claims detected in transcript.',
    claims: [],
    recommendations: [],
    limitations: []
  })
}))

describe('POST /api/analyze', () => {
  const dummyImagePath = path.join(__dirname, 'test_sample.png')

  beforeAll(() => {
    // Valid 1x1 PNG byte array compatible with Sharp
    const validPngBuffer = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
      0x0d, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82
    ])
    fs.writeFileSync(dummyImagePath, validPngBuffer)
  })

  afterAll(() => {
    if (fs.existsSync(dummyImagePath)) {
      fs.unlinkSync(dummyImagePath)
    }
  })

  it('should return 400 Bad Request when no file is uploaded', async () => {
    const response = await request(app)
      .post('/api/analyze')
      .expect(400)

    expect(response.body).toEqual({ error: 'No file uploaded.' })
  })

  it('should successfully analyze a valid image file and clean up temp uploads', async () => {
    const response = await request(app)
      .post('/api/analyze')
      .attach('file', dummyImagePath, { contentType: 'image/png' })
      .expect(200)

    expect(response.body).toHaveProperty('success', true)
    expect(response.body).toHaveProperty('mediaType', 'image')
    expect(response.body).toHaveProperty('metadata')
    expect(response.body.metadata.fileName).toBe('test_sample.png')
    expect(response.body).toHaveProperty('result')
    expect(response.body.result.level).toBe('LOW')

    // Verify temp upload folder has no leftover test file
    const uploadsDir = path.join(__dirname, '..', '..', 'uploads')
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir)
      // Check that test file is removed
      const matchingFiles = files.filter(f => f.includes('test_sample'))
      expect(matchingFiles.length).toBe(0)
    }
  })

  it('should return 400 error when uploading video media', async () => {
    const dummyVideoPath = path.join(__dirname, 'test_sample.mp4')
    fs.writeFileSync(dummyVideoPath, 'dummy video content')

    try {
      const response = await request(app)
        .post('/api/analyze')
        .attach('file', dummyVideoPath, { contentType: 'video/mp4' })
        .expect(400)

      expect(response.body.error).toContain('Video analysis is not yet available')
    } finally {
      if (fs.existsSync(dummyVideoPath)) {
        fs.unlinkSync(dummyVideoPath)
      }
    }
  })
})
