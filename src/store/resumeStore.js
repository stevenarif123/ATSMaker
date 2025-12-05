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