'use client'

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useResumeStore } from '../../store/resumeStore';

function SortableExperienceItem({ experience, onEdit, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: experience.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="item-card group"
    >
      <div className="flex gap-3">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="drag-handle mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </button>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900 truncate">{experience.position}</h3>
              <p className="text-sm text-slate-600">{experience.company} • {experience.location}</p>
              <p className="text-xs text-slate-500 mt-1">
                {experience.startDate} — {experience.current ? 'Present' : experience.endDate}
              </p>
            </div>
            
            {/* Actions */}
            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={() => onEdit(experience)}
                className="btn btn-ghost btn-sm btn-icon"
                title="Edit"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(experience.id)}
                className="btn btn-ghost btn-sm btn-icon text-red-600 hover:bg-red-50"
                title="Delete"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Bullets Preview */}
          {experience.bullets && experience.bullets.length > 0 && (
            <ul className="mt-3 space-y-1 list-disc list-inside marker:text-slate-400">
              {experience.bullets.slice(0, 2).map((bullet, index) => (
                <li key={index} className="text-sm text-slate-600">
                  <span className="line-clamp-1 inline">{bullet}</span>
                </li>
              ))}
              {experience.bullets.length > 2 && (
                <li className="text-xs text-slate-400 list-none">+{experience.bullets.length - 2} more</li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function ExperienceForm({ experience, onSave, onCancel }) {
  const { register, handleSubmit, control, watch, formState: { errors } } = useForm({
    defaultValues: experience || {
      position: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      bullets: ['']
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'bullets'
  });

  const isCurrent = watch('current');

  const onSubmit = (data) => {
    const cleanBullets = data.bullets.filter(bullet => bullet.trim() !== '');
    onSave({ ...data, bullets: cleanBullets });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 animate-fade-in">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-blue-900 mb-1">
          {experience ? 'Edit Experience' : 'Add New Experience'}
        </h3>
        <p className="text-sm text-blue-700">Fill in your work experience details below</p>
      </div>

      <div className="form-group">
        <label className="form-label form-label-required">Position / Job Title</label>
        <input
          type="text"
          className={`form-input ${errors.position ? 'form-input-error' : ''}`}
          placeholder="e.g., Senior Software Engineer"
          {...register('position', { required: 'Position is required' })}
        />
        {errors.position && <p className="form-error">{errors.position.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label form-label-required">Company</label>
          <input
            type="text"
            className={`form-input ${errors.company ? 'form-input-error' : ''}`}
            placeholder="e.g., Google"
            {...register('company', { required: 'Company is required' })}
          />
          {errors.company && <p className="form-error">{errors.company.message}</p>}
        </div>

        <div className="form-group">
          <label className="form-label form-label-required">Location</label>
          <input
            type="text"
            className={`form-input ${errors.location ? 'form-input-error' : ''}`}
            placeholder="e.g., San Francisco, CA"
            {...register('location', { required: 'Location is required' })}
          />
          {errors.location && <p className="form-error">{errors.location.message}</p>}
        </div>
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
          <label className="form-label">End Date</label>
          <input
            type="month"
            className="form-input disabled:bg-slate-100 disabled:text-slate-400"
            {...register('endDate')}
            disabled={isCurrent}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="current"
          className="form-checkbox"
          {...register('current')}
        />
        <label htmlFor="current" className="text-sm text-slate-700 cursor-pointer">
          I currently work here
        </label>
      </div>

      <div className="form-group">
        <label className="form-label">Key Achievements & Responsibilities</label>
        <p className="form-hint mb-3">Use action verbs and quantify results when possible</p>
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <input
                type="text"
                className="form-input flex-1"
                placeholder="e.g., Led a team of 5 engineers to deliver a new feature that increased revenue by 20%"
                {...register(`bullets.${index}`)}
              />
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="btn btn-ghost btn-icon text-red-600 hover:bg-red-50 flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => append('')}
            className="btn btn-ghost btn-sm text-blue-600 hover:bg-blue-50"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add bullet point
          </button>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-slate-200">
        <button type="submit" className="btn btn-primary">
          {experience ? 'Update Experience' : 'Add Experience'}
        </button>
        <button type="button" onClick={onCancel} className="btn btn-outline">
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function ExperienceSection({ experience }) {
  const { addExperience, updateExperience, deleteExperience } = useResumeStore();
  const [editingExperience, setEditingExperience] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handleSave = (data) => {
    if (editingExperience) {
      updateExperience(editingExperience.id, data);
    } else {
      addExperience(data);
    }
    setEditingExperience(null);
    setShowForm(false);
  };

  const handleEdit = (exp) => {
    setEditingExperience(exp);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this experience?')) {
      deleteExperience(id);
    }
  };

  const handleCancel = () => {
    setEditingExperience(null);
    setShowForm(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-1">Work Experience</h2>
          <p className="text-sm text-slate-500">Add your professional work history</p>
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
        <ExperienceForm
          experience={editingExperience}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      ) : (
        <div>
          {experience.length === 0 ? (
            <div className="empty-state">
              <svg className="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="empty-state-title">No experience added yet</h3>
              <p className="empty-state-description">Start by adding your most recent work experience</p>
              <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm">
                Add Experience
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {experience.map((exp) => (
                <SortableExperienceItem
                  key={exp.id}
                  experience={exp}
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