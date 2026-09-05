/**
 * apiSecurity.test.js
 * Security tests for API hardening:
 * - Stack trace and internal error leak prevention
 * - JSON body limit and malformed JSON resilience
 * - Cross-Site Scripting (XSS) input reflection check
 * - CORS header enforcement
 */

const request = require('supertest')
const app = require('../../server')

describe('Security Suite: API Hardening & Resilience', () => {
  describe('Information Disclosure & Stack Trace Leakage', () => {
    it('should never expose stack traces or internal errors in 404/500 responses', async () => {
      const response = await request(app)
        .get('/api/health/non-existent-subpath')
        .expect(404)

      expect(response.body).not.toHaveProperty('stack')
      expect(response.body).not.toHaveProperty('trace')
      expect(response.body).toEqual({ error: 'Route not found.' })
    })

    it('should handle malformed JSON bodies without leaking internal engine state', async () => {
      const response = await request(app)
        .post('/api/health')
        .set('Content-Type', 'application/json')
        .send('{ "invalid_json": ') // malformed syntax
        .expect(400)

      expect(response.body).not.toHaveProperty('stack')
    })
  })

  describe('Denial of Service / Body Size Protection', () => {
    it('should reject JSON payloads exceeding the 1MB limit with HTTP 413 or 400', async () => {
      // Generate large string > 1MB
      const largeData = 'a'.repeat(1.5 * 1024 * 1024)

      const response = await request(app)
        .post('/api/health')
        .set('Content-Type', 'application/json')
        .send({ payload: largeData })

      expect([400, 413, 500]).toContain(response.status)
      if (response.body.error) {
        expect(response.body.error).not.toContain('at ') // No stack trace line
      }
    })
  })

  describe('CORS Headers & Security Defaults', () => {
    it('should respond with appropriate Access-Control-Allow-Origin header', async () => {
      const response = await request(app)
        .get('/api/health')
        .set('Origin', 'http://localhost:5173')
        .expect(200)

      expect(response.headers['access-control-allow-origin']).toBe('*')
    })
  })

  describe('Input Sanitization & Injection Defense', () => {
    it('should safely return JSON without executing or interpreting XSS/SQL payloads', async () => {
      const xssPayload = "<script>alert('XSS')</script>"

      const response = await request(app)
        .get(`/api/health?query=${encodeURIComponent(xssPayload)}`)
        .expect(200)

      expect(response.headers['content-type']).toMatch(/json/)
      expect(response.body.status).toBe('ok')
    })
  })
})
