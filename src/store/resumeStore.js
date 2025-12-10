import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const resumeTemplate = {
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
  links: [],
  customSections: [],
  template: 'classic',
  createdAt: '',
  updatedAt: '',
  jobDescription: ''
};

const createDefaultResume = (name = 'Resume') => ({
  id: 'default',
  name,
  ...resumeTemplate,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

export const useResumeStore = create(
  persist(
    (set, get) => ({
      versions: {
        'default': createDefaultResume('My Resume')
      },
      activeResumeId: 'default',

      // Helper to get active resume
      getActiveResume: () => {
        const state = get();
        return state.versions[state.activeResumeId];
      },

      // Helper to update active resume
      setActiveResume: (updater) => {
        set((state) => {
          const updated = typeof updater === 'function' 
            ? updater(state.versions[state.activeResumeId])
            : updater;
          return {
            versions: {
              ...state.versions,
              [state.activeResumeId]: {
                ...state.versions[state.activeResumeId],
                ...updated,
                updatedAt: new Date().toISOString()
              }
            }
          };
        });
      },

      // Legacy selectors - route through active version
      get personalInfo() {
        return get().getActiveResume()?.personalInfo || resumeTemplate.personalInfo;
      },

      get experience() {
        return get().getActiveResume()?.experience || [];
      },

      get education() {
        return get().getActiveResume()?.education || [];
      },

      get skills() {
        return get().getActiveResume()?.skills || [];
      },

      get projects() {
        return get().getActiveResume()?.projects || [];
      },

      get certifications() {
        return get().getActiveResume()?.certifications || [];
      },

      get languages() {
        return get().getActiveResume()?.languages || [];
      },

      get links() {
        return get().getActiveResume()?.links || [];
      },

      get customSections() {
        return get().getActiveResume()?.customSections || [];
      },

      // Personal Info
      updatePersonalInfo: (field, value) => {
        get().setActiveResume((resume) => ({
          personalInfo: { ...resume.personalInfo, [field]: value }
        }));
      },

      // Experience
      addExperience: (experience) => {
        get().setActiveResume((resume) => ({
          experience: [...resume.experience, { ...experience, id: Date.now().toString() }]
        }));
      },

      updateExperience: (id, updates) => {
        get().setActiveResume((resume) => ({
          experience: resume.experience.map(exp =>
            exp.id === id ? { ...exp, ...updates } : exp
          )
        }));
      },

      deleteExperience: (id) => {
        get().setActiveResume((resume) => ({
          experience: resume.experience.filter(exp => exp.id !== id)
        }));
      },

      reorderExperience: (newOrder) => {
        get().setActiveResume({ experience: newOrder });
      },

      // Education
      addEducation: (education) => {
        get().setActiveResume((resume) => ({
          education: [...resume.education, { ...education, id: Date.now().toString() }]
        }));
      },

      updateEducation: (id, updates) => {
        get().setActiveResume((resume) => ({
          education: resume.education.map(edu =>
            edu.id === id ? { ...edu, ...updates } : edu
          )
        }));
      },

      deleteEducation: (id) => {
        get().setActiveResume((resume) => ({
          education: resume.education.filter(edu => edu.id !== id)
        }));
      },

      // Skills
      addSkill: (skill) => {
        get().setActiveResume((resume) => ({
          skills: [...resume.skills, { ...skill, id: Date.now().toString() }]
        }));
      },

      updateSkill: (id, updates) => {
        get().setActiveResume((resume) => ({
          skills: resume.skills.map(skill =>
            skill.id === id ? { ...skill, ...updates } : skill
          )
        }));
      },

      deleteSkill: (id) => {
        get().setActiveResume((resume) => ({
          skills: resume.skills.filter(skill => skill.id !== id)
        }));
      },

      // Projects
      addProject: (project) => {
        get().setActiveResume((resume) => ({
          projects: [...resume.projects, { ...project, id: Date.now().toString() }]
        }));
      },

      updateProject: (id, updates) => {
        get().setActiveResume((resume) => ({
          projects: resume.projects.map(project =>
            project.id === id ? { ...project, ...updates } : project
          )
        }));
      },

      deleteProject: (id) => {
        get().setActiveResume((resume) => ({
          projects: resume.projects.filter(project => project.id !== id)
        }));
      },

      // Certifications
      addCertification: (certification) => {
        get().setActiveResume((resume) => ({
          certifications: [...resume.certifications, { ...certification, id: Date.now().toString() }]
        }));
      },

      updateCertification: (id, updates) => {
        get().setActiveResume((resume) => ({
          certifications: resume.certifications.map(cert =>
            cert.id === id ? { ...cert, ...updates } : cert
          )
        }));
      },

      deleteCertification: (id) => {
        get().setActiveResume((resume) => ({
          certifications: resume.certifications.filter(cert => cert.id !== id)
        }));
      },

      // Languages
      addLanguage: (language) => {
        get().setActiveResume((resume) => ({
          languages: [...resume.languages, { ...language, id: Date.now().toString() }]
        }));
      },

      updateLanguage: (id, updates) => {
        get().setActiveResume((resume) => ({
          languages: resume.languages.map(lang =>
            lang.id === id ? { ...lang, ...updates } : lang
          )
        }));
      },

      deleteLanguage: (id) => {
        get().setActiveResume((resume) => ({
          languages: resume.languages.filter(lang => lang.id !== id)
        }));
      },

      // Links
      addLink: (link) => {
        get().setActiveResume((resume) => ({
          links: [...resume.links, { ...link, id: Date.now().toString() }]
        }));
      },

      updateLink: (id, updates) => {
        get().setActiveResume((resume) => ({
          links: resume.links.map(link =>
            link.id === id ? { ...link, ...updates } : link
          )
        }));
      },

      deleteLink: (id) => {
        get().setActiveResume((resume) => ({
          links: resume.links.filter(link => link.id !== id)
        }));
      },

      // Custom Sections
      addCustomSection: (section) => {
        get().setActiveResume((resume) => ({
          customSections: [...resume.customSections, { ...section, id: Date.now().toString() }]
        }));
      },

      updateCustomSection: (id, updates) => {
        get().setActiveResume((resume) => ({
          customSections: resume.customSections.map(section =>
            section.id === id ? { ...section, ...updates } : section
          )
        }));
      },

      deleteCustomSection: (id) => {
        get().setActiveResume((resume) => ({
          customSections: resume.customSections.filter(section => section.id !== id)
        }));
      },

      // Version Management
      createVersion: (name = 'New Resume') => {
        const newId = Date.now().toString();
        const newResume = {
          id: newId,
          name,
          ...resumeTemplate,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        set((state) => ({
          versions: {
            ...state.versions,
            [newId]: newResume
          },
          activeResumeId: newId
        }));
        return newId;
      },

      duplicateVersion: (sourceId = null) => {
        set((state) => {
          const source = state.versions[sourceId || state.activeResumeId];
          if (!source) return state;
          const newId = Date.now().toString();
          const duplicate = {
            ...source,
            id: newId,
            name: `${source.name} (copy)`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          return {
            versions: {
              ...state.versions,
              [newId]: duplicate
            },
            activeResumeId: newId
          };
        });
      },

      renameVersion: (resumeId, newName) => {
        set((state) => ({
          versions: {
            ...state.versions,
            [resumeId]: {
              ...state.versions[resumeId],
              name: newName,
              updatedAt: new Date().toISOString()
            }
          }
        }));
      },

      deleteVersion: (resumeId) => {
        set((state) => {
          const versionIds = Object.keys(state.versions);
          
          // Prevent deletion if it's the last version
          if (versionIds.length <= 1) {
            console.warn('Cannot delete the last resume version');
            return state;
          }

          const { [resumeId]: _, ...remainingVersions } = state.versions;
          const newActiveId = state.activeResumeId === resumeId
            ? versionIds.find(id => id !== resumeId)
            : state.activeResumeId;

          return {
            versions: remainingVersions,
            activeResumeId: newActiveId
          };
        });
      },

      switchVersion: (resumeId) => {
        set((state) => {
          if (!state.versions[resumeId]) {
            console.warn(`Resume version ${resumeId} not found`);
            return state;
          }
          return { activeResumeId: resumeId };
        });
      },

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
      
      // Template
      setTemplate: (template) => set({ template }),
      // Job Description
      setJobDescription: (description) => set({ jobDescription: description }),
      
      // Import/Export
      importResume: (data) => {
        if (!data) return;
        
        // Handle if data is wrapped in a 'state' object (some zustand exports)
        const importData = data.state || data;
        
        // Handle legacy flat format (pre-versioning) - has personalInfo at root level
        if (importData.personalInfo && !importData.versions) {
          const legacyData = {
            personalInfo: importData.personalInfo || resumeTemplate.personalInfo,
            experience: importData.experience || [],
            education: importData.education || [],
            skills: importData.skills || [],
            projects: importData.projects || [],
            certifications: importData.certifications || [],
            languages: importData.languages || [],
            links: importData.links || [],
            customSections: importData.customSections || [],
            template: importData.template || 'classic',
            jobDescription: importData.jobDescription || ''
          };
          get().setActiveResume(legacyData);
          return;
        }
        
        // Handle versioned format - import into active resume
        if (importData.versions) {
          // Get the first version from imported data
          const versionIds = Object.keys(importData.versions);
          if (versionIds.length > 0) {
            const firstVersion = importData.versions[versionIds[0]];
            get().setActiveResume({
              personalInfo: firstVersion.personalInfo || resumeTemplate.personalInfo,
              experience: firstVersion.experience || [],
              education: firstVersion.education || [],
              skills: firstVersion.skills || [],
              projects: firstVersion.projects || [],
              certifications: firstVersion.certifications || [],
              languages: firstVersion.languages || [],
              links: firstVersion.links || [],
              customSections: firstVersion.customSections || [],
              template: firstVersion.template || 'classic',
              jobDescription: firstVersion.jobDescription || ''
            });
          }
          return;
        }
        
        // Fallback - try to use data as-is
        get().setActiveResume(importData);
      },

      exportResume: () => get().getActiveResume(),

      mergeSectionsToActiveResume: (sections) => {
        get().setActiveResume((resume) => {
          const merged = { ...resume };
          sections.forEach((section) => {
            if (section.type && section.data) {
              const sectionKey = section.type.toLowerCase();
              if (sectionKey in merged) {
                if (Array.isArray(merged[sectionKey])) {
                  merged[sectionKey] = [...merged[sectionKey], ...section.data];
                } else if (typeof merged[sectionKey] === 'object') {
                  merged[sectionKey] = { ...merged[sectionKey], ...section.data };
                }
              }
            }
          });
          return merged;
        });
      },

      // Reset
      resetResume: () => {
        set((state) => ({
          versions: {
            ...state.versions,
            [state.activeResumeId]: createDefaultResume(state.versions[state.activeResumeId]?.name || 'My Resume')
          }
        }));
      },

      // Get all versions (for UI)
      getVersions: () => Object.values(get().versions),

      // Get active version info (for header)
      getActiveVersionInfo: () => {
        const state = get();
        const active = state.versions[state.activeResumeId];
        return {
          id: state.activeResumeId,
          name: active?.name || 'My Resume',
          updatedAt: active?.updatedAt || new Date().toISOString()
        };
      }
    }),
    {
      name: 'resume-storage',
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState, version) => {
        if (!persistedState) {
          return {
            versions: {
              'default': createDefaultResume('My Resume')
            },
            activeResumeId: 'default'
          };
        }

        // Detect legacy flat state and migrate it
        if (!persistedState.versions && !persistedState.activeResumeId) {
          const defaultResume = {
            id: 'default',
            name: 'My Resume',
            ...resumeTemplate,
            personalInfo: persistedState.personalInfo || resumeTemplate.personalInfo,
            experience: persistedState.experience || [],
            education: persistedState.education || [],
            skills: persistedState.skills || [],
            projects: persistedState.projects || [],
            certifications: persistedState.certifications || [],
            languages: persistedState.languages || [],
            links: persistedState.links || [],
            customSections: persistedState.customSections || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          return {
            versions: {
              'default': defaultResume
            },
            activeResumeId: 'default'
          };
        }

        return persistedState;
      },
      partialize: (state) => ({
        versions: state.versions,
        activeResumeId: state.activeResumeId,
        personalInfo: state.personalInfo,
        experience: state.experience,
        education: state.education,
        skills: state.skills,
        projects: state.projects,
        certifications: state.certifications,
        languages: state.languages,
        links: state.links,
        customSections: state.customSections,
        template: state.template,
        jobDescription: state.jobDescription
      })
    }
  )
);
