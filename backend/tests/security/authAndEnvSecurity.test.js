/**
 * authAndEnvSecurity.test.js
 * Security tests for secret protection & environment config safety:
 * - OpenAI API key non-disclosure
 * - Environment secret protection in logs and response payloads
 */

const request = require('supertest')
const app = require('../../server')

describe('Security Suite: Auth & Secret Confidentiality', () => {
  const originalEnv = process.env.OPENAI_API_KEY

  afterEach(() => {
    process.env.OPENAI_API_KEY = originalEnv
  })

  it('should never expose OPENAI_API_KEY in API responses even during errors', async () => {
    process.env.OPENAI_API_KEY = 'sk-proj-SECRET_TEST_KEY_DO_NOT_EXPOSE'

    const response = await request(app)
      .post('/api/analyze')
      .expect(400) // Missing file request

    const responseString = JSON.stringify(response.body)
    expect(responseString).not.toContain('sk-proj-SECRET_TEST_KEY_DO_NOT_EXPOSE')
  })

  it('should gracefully handle missing API key configuration without crashing server process', async () => {
    delete process.env.OPENAI_API_KEY

    const response = await request(app)
      .get('/api/health')
      .expect(200)

    expect(response.body.status).toBe('ok')
  })
})
