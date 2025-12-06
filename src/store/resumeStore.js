import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const initialState = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    linkedin: '',
    github: '',
    summary: ''
  },
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
  customSections: []
};

export const useResumeStore = create(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Personal Info
      updatePersonalInfo: (field, value) => set((state) => ({
        personalInfo: { ...state.personalInfo, [field]: value }
      })),
      
      // Experience
      addExperience: (experience) => set((state) => ({
        experience: [...state.experience, { ...experience, id: Date.now().toString() }]
      })),
      
      updateExperience: (id, updates) => set((state) => ({
        experience: state.experience.map(exp => 
          exp.id === id ? { ...exp, ...updates } : exp
        )
      })),
      
      deleteExperience: (id) => set((state) => ({
        experience: state.experience.filter(exp => exp.id !== id)
      })),
      
      reorderExperience: (newOrder) => set({ experience: newOrder }),
      
      // Education
      addEducation: (education) => set((state) => ({
        education: [...state.education, { ...education, id: Date.now().toString() }]
      })),
      
      updateEducation: (id, updates) => set((state) => ({
        education: state.education.map(edu => 
          edu.id === id ? { ...edu, ...updates } : edu
        )
      })),
      
      deleteEducation: (id) => set((state) => ({
        education: state.education.filter(edu => edu.id !== id)
      })),
      
      // Skills
      addSkill: (skill) => set((state) => ({
        skills: [...state.skills, { ...skill, id: Date.now().toString() }]
      })),
      
      updateSkill: (id, updates) => set((state) => ({
        skills: state.skills.map(skill => 
          skill.id === id ? { ...skill, ...updates } : skill
        )
      })),
      
      deleteSkill: (id) => set((state) => ({
        skills: state.skills.filter(skill => skill.id !== id)
      })),
      
      // Projects
      addProject: (project) => set((state) => ({
        projects: [...state.projects, { ...project, id: Date.now().toString() }]
      })),
      
      updateProject: (id, updates) => set((state) => ({
        projects: state.projects.map(project => 
          project.id === id ? { ...project, ...updates } : project
        )
      })),
      
      deleteProject: (id) => set((state) => ({
        projects: state.projects.filter(project => project.id !== id)
      })),

      // Certifications
      addCertification: (certification) => set((state) => ({
        certifications: [...state.certifications, { ...certification, id: Date.now().toString() }]
      })),
      
      updateCertification: (id, updates) => set((state) => ({
        certifications: state.certifications.map(cert => 
          cert.id === id ? { ...cert, ...updates } : cert
        )
      })),
      
      deleteCertification: (id) => set((state) => ({
        certifications: state.certifications.filter(cert => cert.id !== id)
      })),

      // Languages
      addLanguage: (language) => set((state) => ({
        languages: [...state.languages, { ...language, id: Date.now().toString() }]
      })),
      
      updateLanguage: (id, updates) => set((state) => ({
        languages: state.languages.map(lang => 
          lang.id === id ? { ...lang, ...updates } : lang
        )
      })),
      
      deleteLanguage: (id) => set((state) => ({
        languages: state.languages.filter(lang => lang.id !== id)
      })),

      // Custom Sections
      addCustomSection: (section) => set((state) => ({
        customSections: [...state.customSections, { ...section, id: Date.now().toString() }]
      })),
      
      updateCustomSection: (id, updates) => set((state) => ({
        customSections: state.customSections.map(section => 
          section.id === id ? { ...section, ...updates } : section
        )
      })),
      
      deleteCustomSection: (id) => set((state) => ({
        customSections: state.customSections.filter(section => section.id !== id)
      })),
      
      // Import/Export
      importResume: (data) => set(data),
      
      exportResume: () => get(),
      
      // Reset
      resetResume: () => set(initialState)
    }),
    {
      name: 'resume-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        personalInfo: state.personalInfo,
        experience: state.experience,
        education: state.education,
        skills: state.skills,
        projects: state.projects,
        certifications: state.certifications,
        languages: state.languages,
        customSections: state.customSections
      })
    }
  )
);
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
