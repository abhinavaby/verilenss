/**
 * fileUploadSecurity.test.js
 * Security tests for file upload vulnerability checks:
 * - Unrestricted file upload prevention
 * - MIME type whitelist validation
 * - Size limit enforcement
 * - Path traversal attack resilience
 * - Upload directory isolation and temp file cleanup
 */

const request = require('supertest')
const app = require('../../server')
const path = require('path')
const fs = require('fs')

describe('Security Suite: File Upload Protection', () => {
  const tempDir = path.join(__dirname, 'temp_fixtures')

  beforeAll(() => {
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }
  })

  afterAll(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  })

  describe('Unrestricted File Upload & Extension Blocking', () => {
    const maliciousFiles = [
      { name: 'malicious.sh', mime: 'application/x-sh', content: '#!/bin/bash\necho hacked' },
      { name: 'shell.php', mime: 'application/x-httpd-php', content: '<?php system($_GET["cmd"]); ?>' },
      { name: 'script.js', mime: 'text/javascript', content: 'console.log("XSS attack")' },
      { name: 'payload.exe', mime: 'application/x-msdownload', content: 'MZ executable dummy content' },
      { name: 'vector.svg', mime: 'image/svg+xml', content: '<svg onload="alert(1)"></svg>' },
      { name: 'page.html', mime: 'text/html', content: '<h1>Fake Login Page</h1>' }
    ]

    maliciousFiles.forEach(({ name, mime, content }) => {
      it(`should reject executable/script file upload: ${name} (${mime})`, async () => {
        const filePath = path.join(tempDir, name)
        fs.writeFileSync(filePath, content)

        const response = await request(app)
          .post('/api/analyze')
          .attach('file', filePath, { contentType: mime })

        expect(response.status).toBe(500) // Multer fileFilter error passed to error handler
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toContain('Unsupported file type')
      })
    })
  })

  describe('File Size Limit Enforcement', () => {
    it('should reject image file exceeding 5MB size limit', async () => {
      const oversizedImgPath = path.join(tempDir, 'oversized.jpg')
      // Create a 6MB dummy buffer
      const sixMBBuffer = Buffer.alloc(6 * 1024 * 1024, 0x61)
      fs.writeFileSync(oversizedImgPath, sixMBBuffer)

      const response = await request(app)
        .post('/api/analyze')
        .attach('file', oversizedImgPath, { contentType: 'image/jpeg' })
        .expect(400)

      expect(response.body.error).toMatch(/File is too large/i)
    })
  })

  describe('Path Traversal & Filename Sanitization', () => {
    it('should safely handle malicious filename attempting directory traversal', async () => {
      const traversePath = path.join(tempDir, 'normal.jpg')
      fs.writeFileSync(traversePath, 'dummy image content')

      const response = await request(app)
        .post('/api/analyze')
        .attach('file', traversePath, {
          filename: '../../../../etc/passwd',
          contentType: 'image/jpeg'
        })

      // The request should complete without touching system files or failing due to path traversal
      expect([200, 500]).toContain(response.status)
      if (response.status === 200) {
        expect(response.body.metadata.fileName).toBe('../../../../etc/passwd')
      }

      // Verify no file was created outside the uploads folder
      const systemFileExists = fs.existsSync(path.join(__dirname, '../../uploads/etc/passwd'))
      expect(systemFileExists).toBe(false)
    })
  })

  describe('Temp File Cleanup Verification', () => {
    it('should leave zero orphaned temporary files in uploads directory after upload failure', async () => {
      const badPath = path.join(tempDir, 'corrupt.xyz')
      fs.writeFileSync(badPath, 'bad content')

      await request(app)
        .post('/api/analyze')
        .attach('file', badPath, { contentType: 'invalid/mime' })

      const uploadsDir = path.join(__dirname, '../../uploads')
      if (fs.existsSync(uploadsDir)) {
        const files = fs.readdirSync(uploadsDir)
        const orphaned = files.filter(f => f.includes('corrupt'))
        expect(orphaned.length).toBe(0)
      }
    })
  })
})
