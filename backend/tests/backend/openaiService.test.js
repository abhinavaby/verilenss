/**
 * openaiService.test.js
 * Unit tests for openaiService API wrappers.
 */

const { analyzeImage, analyzeTranscript } = require('../../services/openaiService')
const OpenAI = require('openai')

jest.mock('openai')

describe('openaiService', () => {
  let mockCreate

  beforeEach(() => {
    jest.clearAllMocks()
    mockCreate = jest.fn()
    OpenAI.prototype.chat = {
      completions: {
        create: mockCreate
      }
    }
  })

  describe('analyzeImage', () => {
    it('should send image payload and parse JSON response correctly', async () => {
      const mockResult = {
        score: 15,
        level: 'LOW',
        findings: ['Consistent lighting', 'No facial distortion'],
        explanation: 'Image appears authentic.',
        claims: [],
        recommendations: ['Check metadata'],
        limitations: ['Cannot detect deep-layer compression']
      }

      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(mockResult)
            }
          }
        ]
      })

      const dummyBuffer = Buffer.from('fake-image-data')
      const result = await analyzeImage(dummyBuffer, 'image/jpeg')

      expect(mockCreate).toHaveBeenCalledTimes(1)
      expect(result).toEqual(mockResult)
    })

    it('should strip markdown code fences from OpenAI JSON response', async () => {
      const mockResult = {
        score: 75,
        level: 'HIGH',
        findings: ['Warped background lines'],
        explanation: 'Likely AI generated.',
        claims: [],
        recommendations: [],
        limitations: []
      }

      const rawContent = "```json\n" + JSON.stringify(mockResult) + "\n```"

      mockCreate.mockResolvedValue({
        choices: [{ message: { content: rawContent } }]
      })

      const dummyBuffer = Buffer.from('fake-image-data')
      const result = await analyzeImage(dummyBuffer, 'image/png')

      expect(result).toEqual(mockResult)
    })
  })

  describe('analyzeTranscript', () => {
    it('should send transcript text and parse response', async () => {
      const mockResult = {
        score: 40,
        level: 'CAUTION',
        findings: ['Unverifiable claims about event dates'],
        explanation: 'Transcript contains suspicious factual assertions.',
        claims: ['Event happened in 1999'],
        recommendations: ['Verify with archives'],
        limitations: ['Audio tone not analyzed']
      }

      mockCreate.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockResult) } }]
      })

      const result = await analyzeTranscript('The event happened in 1999.')

      expect(mockCreate).toHaveBeenCalledTimes(1)
      expect(result).toEqual(mockResult)
    })
  })
})
