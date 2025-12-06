'use client'

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useResumeStore } from '../../store/resumeStore';

export default function LinksSection({ links }) {
  const [editingId, setEditingId] = useState(null);
  const { addLink, updateLink, deleteLink } = useResumeStore();
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    defaultValues: {
      label: '',
      url: ''
    }
  });

  const onSubmit = (data) => {
    if (editingId) {
      updateLink(editingId, data);
      setEditingId(null);
    } else {
      addLink(data);
    }
    reset();
  };

  const handleEdit = (link) => {
    setEditingId(link.id);
    setValue('label', link.label || '');
    setValue('url', link.url || '');
  };

  const handleCancel = () => {
    setEditingId(null);
    reset();
  };

  const linkPresets = [
    { label: 'Portfolio', placeholder: 'https://myportfolio.com' },
    { label: 'Dribbble', placeholder: 'https://dribbble.com/username' },
    { label: 'Behance', placeholder: 'https://behance.net/username' },
    { label: 'Medium', placeholder: 'https://medium.com/@username' },
    { label: 'Twitter/X', placeholder: 'https://twitter.com/username' },
    { label: 'Stack Overflow', placeholder: 'https://stackoverflow.com/users/id' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Links</h2>
          <p className="text-sm text-slate-500">Add portfolio, social media, or other relevant links</p>
        </div>
      </div>

      {/* Quick Add Presets */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-slate-500 w-full mb-1">Quick add:</span>
        {linkPresets.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => {
              setValue('label', preset.label);
              setValue('url', '');
            }}
            className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 transition-colors"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="card p-4 border-2 border-dashed border-slate-200 bg-slate-50/50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Label *
            </label>
            <input
              {...register('label', { required: 'Label is required' })}
              type="text"
              className="form-input"
              placeholder="e.g., Portfolio, Dribbble, Blog"
            />
            {errors.label && <p className="text-red-500 text-xs mt-1">{errors.label.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              URL *
            </label>
            <input
              {...register('url', { 
                required: 'URL is required',
                pattern: {
                  value: /^(https?:\/\/|www\.)/i,
                  message: 'Please enter a valid URL starting with http://, https://, or www.'
                }
              })}
              type="url"
              className="form-input"
              placeholder="https://example.com"
            />
            {errors.url && <p className="text-red-500 text-xs mt-1">{errors.url.message}</p>}
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          {editingId && (
            <button type="button" onClick={handleCancel} className="btn btn-outline btn-sm">
              Cancel
            </button>
          )}
          <button type="submit" className="btn btn-primary btn-sm">
            {editingId ? 'Update' : 'Add'} Link
          </button>
        </div>
      </form>

      {/* List */}
      <div className="space-y-2">
        {links.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <p>No links added yet</p>
            <p className="text-xs mt-1">Add your portfolio, social media, or other relevant links</p>
          </div>
        ) : (
          <div className="space-y-2">
            {links.map((link) => (
              <div key={link.id} className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
                <div className="min-w-0 flex-1">
                  <span className="font-medium text-slate-900">{link.label}</span>
                  <a 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block text-sm text-blue-600 hover:underline truncate"
                  >
                    {link.url}
                  </a>
                </div>
                <div className="flex gap-1 ml-3">
                  <button
                    onClick={() => handleEdit(link)}
                    className="text-slate-400 hover:text-blue-600 p-1"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => deleteLink(link.id)}
                    className="text-slate-400 hover:text-red-600 p-1"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
