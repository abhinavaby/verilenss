/**
 * metadataService.js
 * Extracts basic metadata from the uploaded file.
 * Runs O(1) — reads only what multer has already parsed.
 */

/**
 * Returns basic metadata from the multer file object.
 * Extended EXIF data would require exiftool-vendored, kept simple for MVP.
 * @param {object} file - Multer file object
 * @returns {object} metadata
 */
function extractMetadata(file) {
  const sizeKB = (file.size / 1024).toFixed(1)
  const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
  const displaySize = file.size > 1024 * 1024
    ? `${sizeMB} MB`
    : `${sizeKB} KB`

  return {
    fileName: file.originalname,
    fileType: file.mimetype,
    fileSize: displaySize,
    // Dimensions and EXIF require reading the file buffer — done in analyze route for images
    dimensions: null,
    created: null,
    editingSoftware: null,
  }
}

module.exports = { extractMetadata }
