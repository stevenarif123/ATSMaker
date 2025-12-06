'use client'

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useResumeStore } from '../../store/resumeStore';

function EducationForm({ education, onSave, onCancel }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: education || {
      degree: '',
      school: '',
      location: '',
      startDate: '',
      endDate: '',
      gpa: ''
    }
  });

  const onSubmit = (data) => {
    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 animate-fade-in">
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-emerald-900 mb-1">
          {education ? 'Edit Education' : 'Add New Education'}
        </h3>
        <p className="text-sm text-emerald-700">Enter your educational background</p>
      </div>

      <div className="form-group">
        <label className="form-label form-label-required">Degree</label>
        <input
          type="text"
          className={`form-input ${errors.degree ? 'form-input-error' : ''}`}
          placeholder="e.g., Bachelor of Science in Computer Science"
          {...register('degree', { required: 'Degree is required' })}
        />
        {errors.degree && <p className="form-error">{errors.degree.message}</p>}
      </div>

      <div className="form-group">
        <label className="form-label form-label-required">School / University</label>
        <input
          type="text"
          className={`form-input ${errors.school ? 'form-input-error' : ''}`}
          placeholder="e.g., Stanford University"
          {...register('school', { required: 'School is required' })}
        />
        {errors.school && <p className="form-error">{errors.school.message}</p>}
      </div>

      <div className="form-group">
        <label className="form-label form-label-required">Location</label>
        <input
          type="text"
          className={`form-input ${errors.location ? 'form-input-error' : ''}`}
          placeholder="e.g., Stanford, CA"
          {...register('location', { required: 'Location is required' })}
        />
        {errors.location && <p className="form-error">{errors.location.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label form-label-required">Start Date</label>
          <input
            type="month"
            className={`form-input ${errors.startDate ? 'form-input-error' : ''}`}
            {...register('startDate', { required: 'Start date is required' })}
          />
          {errors.startDate && <p className="form-error">{errors.startDate.message}</p>}
        </div>

        <div className="form-group">
          <label className="form-label form-label-required">End Date</label>
          <input
            type="month"
            className={`form-input ${errors.endDate ? 'form-input-error' : ''}`}
            {...register('endDate', { required: 'End date is required' })}
          />
          {errors.endDate && <p className="form-error">{errors.endDate.message}</p>}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">GPA (Optional)</label>
        <input
          type="text"
          className="form-input"
          placeholder="e.g., 3.8 / 4.0"
          {...register('gpa')}
        />
      </div>

      <div className="flex gap-3 pt-4 border-t border-slate-200">
        <button type="submit" className="btn btn-primary">
          {education ? 'Update Education' : 'Add Education'}
        </button>
        <button type="button" onClick={onCancel} className="btn btn-outline">
          Cancel
        </button>
      </div>
    </form>
  );
}

function EducationItem({ education, onEdit, onDelete }) {
  return (
    <div className="item-card group">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-900">{education.degree}</h3>
          <p className="text-sm text-slate-600">{education.school} • {education.location}</p>
          <p className="text-xs text-slate-500 mt-1">
            {education.startDate} — {education.endDate}
            {education.gpa && <span className="ml-2">• GPA: {education.gpa}</span>}
          </p>
        </div>
        <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(education)}
            className="btn btn-ghost btn-sm btn-icon"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(education.id)}
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
  );
}

export default function EducationSection({ education }) {
  const { addEducation, updateEducation, deleteEducation } = useResumeStore();
  const [editingEducation, setEditingEducation] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handleSave = (data) => {
    if (editingEducation) {
      updateEducation(editingEducation.id, data);
    } else {
      addEducation(data);
    }
    setEditingEducation(null);
    setShowForm(false);
  };

  const handleEdit = (edu) => {
    setEditingEducation(edu);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this education entry?')) {
      deleteEducation(id);
    }
  };

  const handleCancel = () => {
    setEditingEducation(null);
    setShowForm(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-1">Education</h2>
          <p className="text-sm text-slate-500">Add your educational background</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary btn-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add
          </button>
        )}
      </div>

      {showForm ? (
        <EducationForm
          education={editingEducation}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      ) : (
        <div>
          {education.length === 0 ? (
            <div className="empty-state">
              <svg className="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
              </svg>
              <h3 className="empty-state-title">No education added yet</h3>
              <p className="empty-state-description">Add your degrees, certifications, and educational achievements</p>
              <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm">
                Add Education
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {education.map((edu) => (
                <EducationItem
                  key={edu.id}
                  education={edu}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}