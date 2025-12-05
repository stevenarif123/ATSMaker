import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { set, get, del } from 'idb-keyval';
import { Resume, ResumeSchema, PersonalInfo, WorkExperience, Education, Project, Skills, Certification } from '../lib/schema';
import { resumeValidation, atsCleanup } from '../lib/schema/validation-helpers';

// IndexedDB storage adapter
const indexedDBStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const value = await get(name);
      return value || null;
    } catch (error) {
      console.error('Error reading from IndexedDB:', error);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await set(name, value);
    } catch (error) {
      console.error('Error writing to IndexedDB:', error);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await del(name);
    } catch (error) {
      console.error('Error removing from IndexedDB:', error);
    }
  },
};

// Store state interface
interface ResumeStore {
  // State
  resume: Resume | null;
  isLoading: boolean;
  error: string | null;
  lastSaved: string | null;
  isDirty: boolean;

  // Actions
  loadResume: (resume: Resume) => void;
  updatePersonalInfo: (personalInfo: PersonalInfo) => void;
  updateSummary: (summary: string) => void;
  addWorkExperience: (experience: WorkExperience) => void;
  updateWorkExperience: (id: string, experience: Partial<WorkExperience>) => void;
  removeWorkExperience: (id: string) => void;
  addEducation: (education: Education) => void;
  updateEducation: (id: string, education: Partial<Education>) => void;
  removeEducation: (id: string) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  removeProject: (id: string) => void;
  updateSkills: (skills: Skills) => void;
  addCertification: (certification: Certification) => void;
  updateCertification: (id: string, certification: Partial<Certification>) => void;
  removeCertification: (id: string) => void;
  mergeImportedData: (importedData: Partial<Resume>) => void;
  resetResume: () => void;
  validateResume: () => { isValid: boolean; errors: string[] };
  getCompletenessScore: () => number;
  extractKeywords: () => string[];
  exportResume: () => string;
  importResume: (jsonString: string) => { success: boolean; error?: string };
  clearError: () => void;
  markAsClean: () => void;
}

// Helper function to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Default empty resume
const createEmptyResume = (): Resume => ({
  personalInfo: {
    fullName: '',
    title: '',
    summary: '',
    contact: {
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
      website: '',
    },
  },
  summary: '',
  workExperience: [],
  education: [],
  projects: [],
  skills: {
    technical: [],
    soft: [],
    languages: [],
  },
  certifications: [],
  languages: [],
  lastModified: new Date().toISOString(),
});

// Create the store
export const useResumeStore = create<ResumeStore>()(
  persist(
    (set, get) => ({
      // Initial state
      resume: null,
      isLoading: false,
      error: null,
      lastSaved: null,
      isDirty: false,

      // Actions
      loadResume: (resume) => {
        try {
          const validatedResume = ResumeSchema.parse(resume);
          set({
            resume: {
              ...validatedResume,
              lastModified: new Date().toISOString(),
            },
            error: null,
            isDirty: false,
          });
        } catch (error) {
          set({
            error: `Invalid resume data: ${error instanceof Error ? error.message : 'Unknown error'}`,
          });
        }
      },

      updatePersonalInfo: (personalInfo) => {
        const { resume } = get();
        if (!resume) return;

        try {
          const updatedResume = {
            ...resume,
            personalInfo,
            lastModified: new Date().toISOString(),
          };
          set({ resume: updatedResume, isDirty: true });
        } catch (error) {
          set({ error: `Invalid personal info: ${error instanceof Error ? error.message : 'Unknown error'}` });
        }
      },

      updateSummary: (summary) => {
        const { resume } = get();
        if (!resume) return;

        const cleanedSummary = atsCleanup.cleanString(summary);
        const updatedResume = {
          ...resume,
          summary: cleanedSummary,
          lastModified: new Date().toISOString(),
        };
        set({ resume: updatedResume, isDirty: true });
      },

      addWorkExperience: (experience) => {
        const { resume } = get();
        if (!resume) return;

        const experienceWithId = {
          ...experience,
          id: experience.id || generateId(),
        };

        const updatedResume = {
          ...resume,
          workExperience: [...resume.workExperience, experienceWithId],
          lastModified: new Date().toISOString(),
        };
        set({ resume: updatedResume, isDirty: true });
      },

      updateWorkExperience: (id, updates) => {
        const { resume } = get();
        if (!resume) return;

        const updatedWorkExperience = resume.workExperience.map((exp) =>
          exp.id === id ? { ...exp, ...updates } : exp
        );

        const updatedResume = {
          ...resume,
          workExperience: updatedWorkExperience,
          lastModified: new Date().toISOString(),
        };
        set({ resume: updatedResume, isDirty: true });
      },

      removeWorkExperience: (id) => {
        const { resume } = get();
        if (!resume) return;

        const updatedResume = {
          ...resume,
          workExperience: resume.workExperience.filter((exp) => exp.id !== id),
          lastModified: new Date().toISOString(),
        };
        set({ resume: updatedResume, isDirty: true });
      },

      addEducation: (education) => {
        const { resume } = get();
        if (!resume) return;

        const educationWithId = {
          ...education,
          id: education.id || generateId(),
        };

        const updatedResume = {
          ...resume,
          education: [...resume.education, educationWithId],
          lastModified: new Date().toISOString(),
        };
        set({ resume: updatedResume, isDirty: true });
      },

      updateEducation: (id, updates) => {
        const { resume } = get();
        if (!resume) return;

        const updatedEducation = resume.education.map((edu) =>
          edu.id === id ? { ...edu, ...updates } : edu
        );

        const updatedResume = {
          ...resume,
          education: updatedEducation,
          lastModified: new Date().toISOString(),
        };
        set({ resume: updatedResume, isDirty: true });
      },

      removeEducation: (id) => {
        const { resume } = get();
        if (!resume) return;

        const updatedResume = {
          ...resume,
          education: resume.education.filter((edu) => edu.id !== id),
          lastModified: new Date().toISOString(),
        };
        set({ resume: updatedResume, isDirty: true });
      },

      addProject: (project) => {
        const { resume } = get();
        if (!resume) return;

        const projectWithId = {
          ...project,
          id: project.id || generateId(),
        };

        const updatedResume = {
          ...resume,
          projects: [...resume.projects, projectWithId],
          lastModified: new Date().toISOString(),
        };
        set({ resume: updatedResume, isDirty: true });
      },

      updateProject: (id, updates) => {
        const { resume } = get();
        if (!resume) return;

        const updatedProjects = resume.projects.map((proj) =>
          proj.id === id ? { ...proj, ...updates } : proj
        );

        const updatedResume = {
          ...resume,
          projects: updatedProjects,
          lastModified: new Date().toISOString(),
        };
        set({ resume: updatedResume, isDirty: true });
      },

      removeProject: (id) => {
        const { resume } = get();
        if (!resume) return;

        const updatedResume = {
          ...resume,
          projects: resume.projects.filter((proj) => proj.id !== id),
          lastModified: new Date().toISOString(),
        };
        set({ resume: updatedResume, isDirty: true });
      },

      updateSkills: (skills) => {
        const { resume } = get();
        if (!resume) return;

        const updatedResume = {
          ...resume,
          skills,
          lastModified: new Date().toISOString(),
        };
        set({ resume: updatedResume, isDirty: true });
      },

      addCertification: (certification) => {
        const { resume } = get();
        if (!resume) return;

        const certificationWithId = {
          ...certification,
          id: certification.id || generateId(),
        };

        const updatedResume = {
          ...resume,
          certifications: [...resume.certifications, certificationWithId],
          lastModified: new Date().toISOString(),
        };
        set({ resume: updatedResume, isDirty: true });
      },

      updateCertification: (id, updates) => {
        const { resume } = get();
        if (!resume) return;

        const updatedCertifications = resume.certifications.map((cert) =>
          cert.id === id ? { ...cert, ...updates } : cert
        );

        const updatedResume = {
          ...resume,
          certifications: updatedCertifications,
          lastModified: new Date().toISOString(),
        };
        set({ resume: updatedResume, isDirty: true });
      },

      removeCertification: (id) => {
        const { resume } = get();
        if (!resume) return;

        const updatedResume = {
          ...resume,
          certifications: resume.certifications.filter((cert) => cert.id !== id),
          lastModified: new Date().toISOString(),
        };
        set({ resume: updatedResume, isDirty: true });
      },

      mergeImportedData: (importedData) => {
        const { resume } = get();
        const currentResume = resume || createEmptyResume();

        try {
          const mergedResume = {
            ...currentResume,
            ...importedData,
            // Merge arrays instead of replacing
            workExperience: [
              ...currentResume.workExperience,
              ...(importedData.workExperience || []),
            ],
            education: [
              ...currentResume.education,
              ...(importedData.education || []),
            ],
            projects: [
              ...currentResume.projects,
              ...(importedData.projects || []),
            ],
            certifications: [
              ...currentResume.certifications,
              ...(importedData.certifications || []),
            ],
            lastModified: new Date().toISOString(),
          };

          const validatedResume = ResumeSchema.parse(mergedResume);
          set({
            resume: validatedResume,
            isDirty: true,
            error: null,
          });
        } catch (error) {
          set({
            error: `Failed to merge imported data: ${error instanceof Error ? error.message : 'Unknown error'}`,
          });
        }
      },

      resetResume: () => {
        set({
          resume: createEmptyResume(),
          isDirty: false,
          error: null,
        });
      },

      validateResume: () => {
        const { resume } = get();
        if (!resume) {
          return { isValid: false, errors: ['No resume loaded'] };
        }
        return resumeValidation.validateResume(resume);
      },

      getCompletenessScore: () => {
        const { resume } = get();
        if (!resume) return 0;
        return resumeValidation.getCompletenessScore(resume);
      },

      extractKeywords: () => {
        const { resume } = get();
        if (!resume) return [];
        return resumeValidation.extractKeywords(resume);
      },

      exportResume: () => {
        const { resume } = get();
        if (!resume) return '';
        return JSON.stringify(resume, null, 2);
      },

      importResume: (jsonString) => {
        try {
          const importedData = JSON.parse(jsonString);
          const validatedResume = ResumeSchema.parse(importedData);
          get().loadResume(validatedResume);
          return { success: true };
        } catch (error) {
          return {
            success: false,
            error: `Failed to import resume: ${error instanceof Error ? error.message : 'Unknown error'}`,
          };
        }
      },

      clearError: () => {
        set({ error: null });
      },

      markAsClean: () => {
        set({ isDirty: false, lastSaved: new Date().toISOString() });
      },
    }),
    {
      name: 'resume-store',
      storage: createJSONStorage(() => indexedDBStorage),
      // Custom onRehydrateStorage to sync with localStorage
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Also save to localStorage for faster access
          try {
            localStorage.setItem('resume-store-backup', JSON.stringify(state.resume));
          } catch (error) {
            console.warn('Failed to backup to localStorage:', error);
          }
        }
      },
      // Custom partialize to control what gets persisted
      partialize: (state) => ({
        resume: state.resume,
        lastSaved: state.lastSaved,
      }),
    }
  )
);

// Selectors for common use cases
export const usePersonalInfo = () => useResumeStore((state) => state.resume?.personalInfo);
export const useWorkExperience = () => useResumeStore((state) => state.resume?.workExperience || []);
export const useEducation = () => useResumeStore((state) => state.resume?.education || []);
export const useProjects = () => useResumeStore((state) => state.resume?.projects || []);
export const useSkills = () => useResumeStore((state) => state.resume?.skills);
export const useCertifications = () => useResumeStore((state) => state.resume?.certifications || []);
export const useResumeValidation = () => useResumeStore((state) => ({
  validate: state.validateResume,
  getScore: state.getCompletenessScore,
  getKeywords: state.extractKeywords,
}));
export const useResumeActions = () => useResumeStore((state) => ({
  loadResume: state.loadResume,
  updatePersonalInfo: state.updatePersonalInfo,
  updateSummary: state.updateSummary,
  addWorkExperience: state.addWorkExperience,
  updateWorkExperience: state.updateWorkExperience,
  removeWorkExperience: state.removeWorkExperience,
  addEducation: state.addEducation,
  updateEducation: state.updateEducation,
  removeEducation: state.removeEducation,
  addProject: state.addProject,
  updateProject: state.updateProject,
  removeProject: state.removeProject,
  updateSkills: state.updateSkills,
  addCertification: state.addCertification,
  updateCertification: state.updateCertification,
  removeCertification: state.removeCertification,
  mergeImportedData: state.mergeImportedData,
  resetResume: state.resetResume,
  exportResume: state.exportResume,
  importResume: state.importResume,
  clearError: state.clearError,
  markAsClean: state.markAsClean,
}));

// Store state hooks
export const useResumeState = () => useResumeStore((state) => ({
  resume: state.resume,
  isLoading: state.isLoading,
  error: state.error,
  isDirty: state.isDirty,
  lastSaved: state.lastSaved,
}));