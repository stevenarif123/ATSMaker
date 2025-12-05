import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useResumeStore } from '../../store/resumeStore';

function ProjectForm({ project, onSave, onCancel }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: project || {
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text">Project Name *</span>
        </label>
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="e.g., E-commerce Platform"
          {...register('name', { required: 'Project name is required' })}
        />
        {errors.name && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.name.message}</span>
          </label>
        )}
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Description *</span>
        </label>
        <textarea
          className="textarea textarea-bordered h-24"
          placeholder="Brief description of the project and your role..."
          {...register('description', { required: 'Description is required' })}
        ></textarea>
        {errors.description && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.description.message}</span>
          </label>
        )}
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Technologies Used</span>
        </label>
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="e.g., React, Node.js, MongoDB, AWS (comma-separated)"
          {...register('technologies')}
        />
        <label className="label">
          <span className="label-text-alt">Separate technologies with commas</span>
        </label>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Project URL (Optional)</span>
        </label>
        <input
          type="url"
          className="input input-bordered w-full"
          placeholder="https://github.com/username/project or https://project-demo.com"
          {...register('url')}
        />
      </div>

      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary">
          {project ? 'Update' : 'Add'} Project
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
    <div className="card bg-base-200 mb-4">
      <div className="card-body">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-bold">{project.name}</h3>
            <p className="text-sm mt-1">{project.description}</p>
            {project.technologies && project.technologies.length > 0 && (
              <div className="mt-2">
                <span className="text-sm font-medium">Technologies: </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {project.technologies.map((tech, index) => (
                    <span key={index} className="badge badge-info badge-sm">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {project.url && (
              <div className="mt-2">
                <a 
                  href={project.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View Project
                </a>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(project)}
              className="btn btn-sm btn-outline"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(project.id)}
              className="btn btn-sm btn-error btn-outline"
            >
              Delete
            </button>
          </div>
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Projects</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary btn-sm"
          >
            Add Project
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
            <div className="text-center py-8 text-gray-500">
              No projects added yet. Click "Add Project" to showcase your work.
            </div>
          ) : (
            projects.map((project) => (
              <ProjectItem
                key={project.id}
                project={project}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}