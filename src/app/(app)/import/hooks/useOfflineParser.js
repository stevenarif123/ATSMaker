import { useCallback } from 'react'
import { hydrateSectionsFromJson, hydrateSectionsFromText } from '../utils/sectionTemplates.js'
import { useResumeStore } from '../../../../store/resumeStore.js'

export const ACCEPTED_EXTENSIONS = ['pdf', 'docx', 'txt', 'json']

export function useOfflineParser() {
  const importResume = useResumeStore((s) => s.importResume)
  
  return useCallback(async ({ file, onProgress }) => {
    const extension = getExtension(file)
    if (!ACCEPTED_EXTENSIONS.includes(extension)) {
      const error = new Error('Unsupported file type. Upload a PDF, DOCX, TXT, or JSON resume.')
      error.code = 'UNSUPPORTED_TYPE'
      throw error
    }

    onProgress?.(10)
    const raw = await readFileText(file)
    onProgress?.(40)

    const cleaned = raw.replace(/\0/g, '').trim()
    if (!cleaned || (extension === 'pdf' && cleaned.length < 30)) {
      const error = new Error('We could not extract text from this file.')
      error.code = extension === 'pdf' ? 'IMAGE_PDF' : 'EMPTY_FILE'
      throw error
    }

    let sections = []
    if (extension === 'json') {
      // Try to detect legacy resume format and import directly
      const parsed = safeParseJson(cleaned)
      if (parsed && isLegacyResumeFormat(parsed)) {
        // Import directly into the resume store for full compatibility
        importResume(parsed)
        // Still return sections for the review workflow
        sections = buildFromJson(cleaned)
      } else {
        sections = buildFromJson(cleaned)
      }
    } else {
      sections = hydrateSectionsFromText(cleaned)
    }

    onProgress?.(95)
    return sections
  }, [importResume])
}

/**
 * Check if the JSON is in legacy resume format (has personalInfo at root level)
 */
function isLegacyResumeFormat(payload) {
  return payload && (
    payload.personalInfo !== undefined ||
    (Array.isArray(payload.experience) && payload.experience.length > 0) ||
    (Array.isArray(payload.education) && payload.education.length > 0) ||
    (Array.isArray(payload.skills) && payload.skills.length > 0)
  )
}

function safeParseJson(raw) {
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function getExtension(file) {
  if (!file?.name) return ''
  const name = file.name.toLowerCase()
  return name.includes('.') ? name.split('.').pop() : ''
}

async function readFileText(file) {
  if (typeof file.text === 'function') {
    return file.text()
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result ?? '')
    reader.onerror = () => reject(reader.error ?? new Error('Unable to read file'))
    reader.readAsText(file)
  })
}

function buildFromJson(raw) {
  try {
    const payload = JSON.parse(raw)
    return hydrateSectionsFromJson(payload)
  } catch (error) {
    const enriched = new Error('JSON file is invalid. Provide structured resume data.')
    enriched.code = 'INVALID_JSON'
    throw enriched
  }
}
