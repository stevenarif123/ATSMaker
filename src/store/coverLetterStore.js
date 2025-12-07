import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const initialState = {
  coverLetters: [],
  activeCoverLetterId: null
};

export const useCoverLetterStore = create(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Cover Letter CRUD Operations
      addCoverLetter: (coverLetter) => set((state) => {
        const newCoverLetter = {
          ...coverLetter,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        return {
          coverLetters: [...state.coverLetters, newCoverLetter],
          activeCoverLetterId: newCoverLetter.id
        };
      }),
      
      updateCoverLetter: (id, updates) => set((state) => ({
        coverLetters: state.coverLetters.map(cl =>
          cl.id === id 
            ? { ...cl, ...updates, updatedAt: new Date().toISOString() }
            : cl
        )
      })),
      
      deleteCoverLetter: (id) => set((state) => ({
        coverLetters: state.coverLetters.filter(cl => cl.id !== id),
        activeCoverLetterId: state.activeCoverLetterId === id ? null : state.activeCoverLetterId
      })),
      
      setActiveCoverLetter: (id) => set({ activeCoverLetterId: id }),
      
      getActiveCoverLetter: () => {
        const state = get();
        return state.coverLetters.find(cl => cl.id === state.activeCoverLetterId) || null;
      },
      
      getCoverLetterById: (id) => {
        const state = get();
        return state.coverLetters.find(cl => cl.id === id) || null;
      },
      
      // Import/Export
      importCoverLetters: (data) => set(data),
      
      exportCoverLetters: () => get(),
      
      // Reset
      resetCoverLetters: () => set(initialState)
    }),
    {
      name: 'cover-letter-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        coverLetters: state.coverLetters,
        activeCoverLetterId: state.activeCoverLetterId
      })
    }
  )
);
