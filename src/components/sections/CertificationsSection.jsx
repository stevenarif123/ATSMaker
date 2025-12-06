'use client'

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useResumeStore } from '../../store/resumeStore';

export default function CertificationsSection({ certifications }) {
  const [editingId, setEditingId] = useState(null);
  const { addCertification, updateCertification, deleteCertification } = useResumeStore();
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      issuer: '',
      date: '',
      url: ''
    }
  });

  const onSubmit = (data) => {
    if (editingId) {
      updateCertification(editingId, data);
      setEditingId(null);
    } else {
      addCertification(data);
    }
    reset();
  };

  const handleEdit = (cert) => {
    setEditingId(cert.id);
    setValue('name', cert.name || '');
    setValue('issuer', cert.issuer || '');
    setValue('date', cert.date || '');
    setValue('url', cert.url || '');
  };

  const handleCancel = () => {
    setEditingId(null);
    reset();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Certifications</h2>
          <p className="text-sm text-slate-500">Add professional certifications and credentials</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="card p-4 border-2 border-dashed border-slate-200 bg-slate-50/50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Certification Name *
            </label>
            <input
              {...register('name', { required: 'Certification name is required' })}
              type="text"
              className="form-input"
              placeholder="e.g., AWS Solutions Architect"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Issuing Organization
            </label>
            <input
              {...register('issuer')}
              type="text"
              className="form-input"
              placeholder="e.g., Amazon Web Services"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Date
            </label>
            <input
              {...register('date')}
              type="text"
              className="form-input"
              placeholder="e.g., Dec 2024 or 2024"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Certificate URL (optional)
            </label>
            <input
              {...register('url')}
              type="text"
              className="form-input"
              placeholder="https://..."
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          {editingId && (
            <button type="button" onClick={handleCancel} className="btn btn-outline btn-sm">
              Cancel
            </button>
          )}
          <button type="submit" className="btn btn-primary btn-sm">
            {editingId ? 'Update' : 'Add'} Certification
          </button>
        </div>
      </form>

      {/* List */}
      <div className="space-y-3">
        {certifications.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <p>No certifications added yet</p>
          </div>
        ) : (
          certifications.map((cert) => (
            <div key={cert.id} className="card p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{cert.name}</h3>
                  {cert.issuer && (
                    <p className="text-sm text-slate-600">{cert.issuer}</p>
                  )}
                  {cert.date && (
                    <p className="text-xs text-slate-500 mt-1">{cert.date}</p>
                  )}
                  {cert.url && (
                    <a href={cert.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 inline-block">
                      View Certificate
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(cert)}
                    className="btn btn-ghost btn-sm btn-icon"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => deleteCertification(cert.id)}
                    className="btn btn-ghost btn-sm btn-icon text-red-600 hover:bg-red-50"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
