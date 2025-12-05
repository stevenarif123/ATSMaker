import { createContext, createElement, useCallback, useContext, useMemo, useReducer } from 'react'

const ResumeContext = createContext(null)

const initialState = {
  sections: [],
  lastUpdated: null,
  history: [],
}

function resumeReducer(state, action) {
  switch (action.type) {
    case 'MERGE_SECTIONS': {
      const timestamp = new Date().toISOString()
      const existingMap = new Map(state.sections.map((section) => [section.id, section]))
      action.payload.forEach((section) => {
        const previous = existingMap.get(section.id)
        existingMap.set(section.id, {
          ...section,
          version: previous ? (previous.version || 1) + 1 : 1,
          mergedAt: timestamp,
        })
      })
      return {
        sections: Array.from(existingMap.values()),
        lastUpdated: timestamp,
        history: [{ id: timestamp, merged: action.payload.length }, ...state.history].slice(0, 5),
      }
    }
    default:
      return state
  }
}

function normalizeListValue(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean)
  }
  if (!value) return []
  return String(value)
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function normalizeSection(section) {
  return {
    ...section,
    accepted: true,
    fields: section.fields.map((field) => ({
      ...field,
      value: field.type === 'list' ? normalizeListValue(field.value) : (field.value ?? '').toString().trim(),
    })),
  }
}

export function ResumeProvider({ children }) {
  const [state, dispatch] = useReducer(resumeReducer, initialState)

  const mergeSections = useCallback((sections) => {
    const normalized = sections.filter((section) => section.accepted).map(normalizeSection)
    if (!normalized.length) return
    dispatch({ type: 'MERGE_SECTIONS', payload: normalized })
  }, [])

  const value = useMemo(
    () => ({
      resume: state,
      mergeSections,
    }),
    [state, mergeSections],
  )

  return createElement(ResumeContext.Provider, { value }, children)
}

export function useResumeStore() {
  const context = useContext(ResumeContext)
  if (!context) {
    throw new Error('useResumeStore must be used within a ResumeProvider')
  }
  return context
}
