'use client'

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useResumeStore } from '../../store/resumeStore';

function ProjectForm({ project, onSave, onCancel }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: project ? {
      ...project,
      technologies: project.technologies?.join(', ') || ''
    } : {
      name: '',
      description: '',
      technologies: '',
      url: ''
    }
  });

  const onSubmit = (data) => {
    const processedData = {
      ...data,
      technologies: data.technologies ? data.technologies.split(',').map(tech => tech.trim()).filter(tech => tech) : []
    };
    onSave(processedData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 animate-fade-in">
      <div className="bg-violet-50 border border-violet-200 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-violet-900 mb-1">
          {project ? 'Edit Project' : 'Add New Project'}
        </h3>
        <p className="text-sm text-violet-700">Showcase your best work and side projects</p>
      </div>

      <div className="form-group">
        <label className="form-label form-label-required">Project Name</label>
        <input
          type="text"
          className={`form-input ${errors.name ? 'form-input-error' : ''}`}
          placeholder="e.g., E-commerce Platform, Task Management App"
          {...register('name', { required: 'Project name is required' })}
        />
        {errors.name && <p className="form-error">{errors.name.message}</p>}
      </div>

      <div className="form-group">
        <label className="form-label form-label-required">Description</label>
        <textarea
          className={`form-textarea h-24 ${errors.description ? 'form-input-error' : ''}`}
          placeholder="Brief description of the project, your role, and the impact or results achieved..."
          {...register('description', { required: 'Description is required' })}
        ></textarea>
        {errors.description && <p className="form-error">{errors.description.message}</p>}
      </div>

      <div className="form-group">
        <label className="form-label">Technologies Used</label>
        <input
          type="text"
          className="form-input"
          placeholder="e.g., React, Node.js, MongoDB, AWS"
          {...register('technologies')}
        />
        <p className="form-hint">Separate technologies with commas</p>
      </div>

      <div className="form-group">
        <label className="form-label">Project URL (Optional)</label>
        <input
          type="url"
          className="form-input"
          placeholder="https://github.com/username/project or https://project-demo.com"
          {...register('url')}
        />
      </div>

      <div className="flex gap-3 pt-4 border-t border-slate-200">
        <button type="submit" className="btn btn-primary">
          {project ? 'Update Project' : 'Add Project'}
        </button>
        <button type="button" onClick={onCancel} className="btn btn-outline">
          Cancel
        </button>
      </div>
    </form>
  );
}

function ProjectItem({ project, onEdit, onDelete }) {
  return (
    <div className="item-card group">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900">{project.name}</h3>
            {project.url && (
              <a 
                href={project.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700"
                title="View Project"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
          <p className="text-sm text-slate-600 mt-1 line-clamp-2">{project.description}</p>
          {project.technologies && project.technologies.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {project.technologies.map((tech, index) => (
                <span key={index} className="badge badge-info">
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(project)}
            className="btn btn-ghost btn-sm btn-icon"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(project.id)}
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

export default function ProjectsSection({ projects }) {
  const { addProject, updateProject, deleteProject } = useResumeStore();
  const [editingProject, setEditingProject] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handleSave = (data) => {
    if (editingProject) {
      updateProject(editingProject.id, data);
    } else {
      addProject(data);
    }
    setEditingProject(null);
    setShowForm(false);
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      deleteProject(id);
    }
  };

  const handleCancel = () => {
    setEditingProject(null);
    setShowForm(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-1">Projects</h2>
          <p className="text-sm text-slate-500">Showcase your personal or professional projects</p>
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
        <ProjectForm
          project={editingProject}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      ) : (
        <div>
          {projects.length === 0 ? (
            <div className="empty-state">
              <svg className="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="empty-state-title">No projects added yet</h3>
              <p className="empty-state-description">Add projects that demonstrate your skills and experience</p>
              <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm">
                Add Project
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <ProjectItem
                  key={project.id}
                  project={project}
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