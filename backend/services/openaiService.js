/**
 * openaiService.js
 * Handles all OpenAI API interactions.
 * ONE request per media file — no separate calls for each field.
 */

const OpenAI = require('openai')

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SYSTEM_PROMPT = `You are a forensic media verification assistant specializing in detecting AI-generated, manipulated, or synthetic media.

Analyze uploaded content carefully for observable indicators that may warrant additional verification.

You are NOT a scientifically validated deepfake detector. Never claim certainty.

WHAT TO LOOK FOR IN IMAGES:
- Lighting & shadows: inconsistent light sources, shadows that don't match, unrealistic specular highlights
- Human anatomy: distorted hands (wrong number of fingers, unnatural bends), asymmetric faces, ear and teeth irregularities, unnatural eye reflections
- Texture artifacts: smearing, over-smoothing of skin, repeated texture patterns, plastic-looking surfaces
- Background inconsistencies: blurry or incoherent backgrounds, doubled objects, perspective errors
- Text & numbers: garbled, misspelled, or malformed text in the image, inconsistent fonts
- Edges & compositing: halo effects, jagged edges around subjects, color fringing, unnatural blending
- Metadata anomalies: absence of camera metadata, software fingerprints from known AI generators
- Context: anachronistic elements, objects that don't belong to the claimed time or place

SCORING GUIDE:
- 0–30 LOW: No clear indicators, image appears authentic on observable criteria
- 31–60 CAUTION: Some suspicious patterns worth noting, cannot confirm manipulation
- 61–100 HIGH: Multiple strong indicators of potential AI generation or manipulation

IMPORTANT RULES:
- Do not invent evidence. Only describe what is genuinely observable.
- If evidence is weak or ambiguous, say so explicitly.
- Use plain, clear language. Avoid jargon.
- Never say "definitely fake", "confirmed AI", or "100% manipulated".
- Use hedged language: "appears", "may indicate", "could suggest", "warrants verification".

Return ONLY valid JSON with this exact structure — no markdown fences, no extra text:
{
  "score": <integer 0-100>,
  "level": "<LOW|CAUTION|HIGH>",
  "findings": [<up to 5 specific observable findings as plain strings>],
  "explanation": "<2-3 sentence summary under 80 words, explaining what was found and why it matters>",
  "claims": [<up to 3 factual claims visible or spoken in the media, or empty array>],
  "recommendations": [<up to 4 practical verification actions>],
  "limitations": [<1-2 honest statements about what this analysis cannot determine>]
}`

/**
 * Analyze an image using OpenAI Vision (gpt-4o, high detail).
 * @param {Buffer} imageBuffer - The prepared image buffer
 * @param {string} mimeType - e.g. 'image/jpeg'
 * @returns {object} parsed JSON result
 */
async function analyzeImage(imageBuffer, mimeType) {
  const base64Image = imageBuffer.toString('base64')
  const dataUrl = `data:${mimeType};base64,${base64Image}`

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 1200,
    temperature: 0.2, // low temperature = more consistent, factual responses
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Carefully analyze this image for all observable indicators of AI generation or manipulation. Be thorough but honest — only report what you can actually observe. Return only the JSON object.'
          },
          {
            type: 'image_url',
            image_url: {
              url: dataUrl,
              detail: 'high' // Full tile analysis — examines image at full resolution in tiles
            }
          }
        ]
      }
    ]
  })

  const raw = response.choices[0].message.content.trim()
  // Strip markdown code fences if model wraps JSON in them
  const cleaned = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim()
  return JSON.parse(cleaned)
}

/**
 * Analyze a text transcript (from audio) using OpenAI.
 * @param {string} transcript - Transcribed text
 * @returns {object} parsed JSON result
 */
async function analyzeTranscript(transcript) {
  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 800,
    temperature: 0.2,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Analyze this audio transcript for verification indicators. Look for:
- Specific factual claims (dates, places, names, events) that can be verified
- Internal inconsistencies or contradictions
- Statements that are verifiable against public records
- Any claims that seem implausible or require verification

Transcript:
"${transcript}"

Return only the JSON object.`
      }
    ]
  })

  const raw = response.choices[0].message.content.trim()
  const cleaned = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim()
  return JSON.parse(cleaned)
}

module.exports = { analyzeImage, analyzeTranscript }
