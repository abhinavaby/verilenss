/**
 * health.test.js
 * Unit and integration tests for backend health check and 404 endpoints.
 */

const request = require('supertest')
const app = require('../../server')

describe('Backend System Endpoints', () => {
  describe('GET /api/health', () => {
    it('should return 200 OK with status "ok" and timestamp', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect('Content-Type', /json/)
        .expect(200)

      expect(response.body).toHaveProperty('status', 'ok')
      expect(response.body).toHaveProperty('timestamp')
      expect(new Date(response.body.timestamp).getTime()).not.toBeNaN()
    })
  })

  describe('404 Route Fallback', () => {
    it('should return 404 JSON for undefined routes', async () => {
      const response = await request(app)
        .get('/api/invalid-route-xyz')
        .expect('Content-Type', /json/)
        .expect(404)

      expect(response.body).toEqual({ error: 'Route not found.' })
    })
  })
})
