'use client'

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useResumeStore } from '../../store/resumeStore';

function SkillForm({ skill, onSave, onCancel }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: skill || {
      name: '',
      level: ''
    }
  });

  const onSubmit = (data) => {
    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 animate-fade-in">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-amber-900 mb-1">
          {skill ? 'Edit Skill' : 'Add New Skill'}
        </h3>
        <p className="text-sm text-amber-700">Add skills relevant to your target role</p>
      </div>

      <div className="form-group">
        <label className="form-label form-label-required">Skill Name</label>
        <input
          type="text"
          className={`form-input ${errors.name ? 'form-input-error' : ''}`}
          placeholder="e.g., JavaScript, Project Management, Data Analysis"
          {...register('name', { required: 'Skill name is required' })}
        />
        {errors.name && <p className="form-error">{errors.name.message}</p>}
      </div>

      <div className="form-group">
        <label className="form-label">Proficiency Level (Optional)</label>
        <select className="form-select" {...register('level')}>
          <option value="">Select level</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
          <option value="Expert">Expert</option>
        </select>
        <p className="form-hint">Adding a proficiency level is optional but can help highlight your strengths</p>
      </div>

      <div className="flex gap-3 pt-4 border-t border-slate-200">
        <button type="submit" className="btn btn-primary">
          {skill ? 'Update Skill' : 'Add Skill'}
        </button>
        <button type="button" onClick={onCancel} className="btn btn-outline">
          Cancel
        </button>
      </div>
    </form>
  );
}

function SkillChip({ skill, onEdit, onDelete }) {
  const levelColors = {
    'Beginner': 'badge-info',
    'Intermediate': 'badge-warning',
    'Advanced': 'badge-success',
    'Expert': 'badge-primary'
  };

  return (
    <div className="group flex items-center gap-2 bg-slate-100 hover:bg-slate-200 rounded-lg px-3 py-2 transition-colors">
      <span className="font-medium text-slate-800">{skill.name}</span>
      {skill.level && (
        <span className={`badge ${levelColors[skill.level]}`}>
          {skill.level}
        </span>
      )}
      <div className="flex gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(skill)}
          className="p-1 hover:bg-white rounded transition-colors"
          title="Edit"
        >
          <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(skill.id)}
          className="p-1 hover:bg-red-100 rounded transition-colors"
          title="Delete"
        >
          <svg className="w-3.5 h-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function SkillsSection({ skills }) {
  const { addSkill, updateSkill, deleteSkill } = useResumeStore();
  const [editingSkill, setEditingSkill] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handleSave = (data) => {
    if (editingSkill) {
      updateSkill(editingSkill.id, data);
    } else {
      addSkill(data);
    }
    setEditingSkill(null);
    setShowForm(false);
  };

  const handleEdit = (skill) => {
    setEditingSkill(skill);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    deleteSkill(id);
  };

  const handleCancel = () => {
    setEditingSkill(null);
    setShowForm(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-1">Skills</h2>
          <p className="text-sm text-slate-500">Add technical and soft skills</p>
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
        <SkillForm
          skill={editingSkill}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      ) : (
        <div>
          {skills.length === 0 ? (
            <div className="empty-state">
              <svg className="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h3 className="empty-state-title">No skills added yet</h3>
              <p className="empty-state-description">Add skills that are relevant to your target position</p>
              <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm">
                Add Skill
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <SkillChip
                  key={skill.id}
                  skill={skill}
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