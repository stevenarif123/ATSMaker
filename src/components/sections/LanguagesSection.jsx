'use client'

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useResumeStore } from '../../store/resumeStore';

export default function LanguagesSection({ languages }) {
  const [editingId, setEditingId] = useState(null);
  const { addLanguage, updateLanguage, deleteLanguage } = useResumeStore();
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      level: ''
    }
  });

  const onSubmit = (data) => {
    if (editingId) {
      updateLanguage(editingId, data);
      setEditingId(null);
    } else {
      addLanguage(data);
    }
    reset();
  };

  const handleEdit = (lang) => {
    setEditingId(lang.id);
    setValue('name', lang.name || '');
    setValue('level', lang.level || '');
  };

  const handleCancel = () => {
    setEditingId(null);
    reset();
  };

  const proficiencyLevels = [
    'Native',
    'Fluent',
    'Advanced',
    'Intermediate',
    'Basic'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
        <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Languages</h2>
          <p className="text-sm text-slate-500">Add languages you speak</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="card p-4 border-2 border-dashed border-slate-200 bg-slate-50/50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Language *
            </label>
            <input
              {...register('name', { required: 'Language is required' })}
              type="text"
              className="form-input"
              placeholder="e.g., English, Indonesian"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Proficiency Level
            </label>
            <select {...register('level')} className="form-select">
              <option value="">Select level</option>
              {proficiencyLevels.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          {editingId && (
            <button type="button" onClick={handleCancel} className="btn btn-outline btn-sm">
              Cancel
            </button>
          )}
          <button type="submit" className="btn btn-primary btn-sm">
            {editingId ? 'Update' : 'Add'} Language
          </button>
        </div>
      </form>

      {/* List */}
      <div className="space-y-3">
        {languages.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            <p>No languages added yet</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {languages.map((lang) => (
              <div key={lang.id} className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm hover:shadow-md transition-shadow">
                <span className="font-medium text-slate-900">{lang.name}</span>
                {lang.level && (
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{lang.level}</span>
                )}
                <button
                  onClick={() => handleEdit(lang)}
                  className="text-slate-400 hover:text-blue-600 ml-1"
                  title="Edit"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => deleteLanguage(lang.id)}
                  className="text-slate-400 hover:text-red-600"
                  title="Delete"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
