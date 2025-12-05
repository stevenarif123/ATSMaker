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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text">Degree *</span>
        </label>
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="e.g., Bachelor of Science in Computer Science"
          {...register('degree', { required: 'Degree is required' })}
        />
        {errors.degree && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.degree.message}</span>
          </label>
        )}
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">School/University *</span>
        </label>
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="e.g., University of California, Berkeley"
          {...register('school', { required: 'School is required' })}
        />
        {errors.school && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.school.message}</span>
          </label>
        )}
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Location *</span>
        </label>
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="e.g., Berkeley, CA"
          {...register('location', { required: 'Location is required' })}
        />
        {errors.location && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.location.message}</span>
          </label>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Start Date *</span>
          </label>
          <input
            type="month"
            className="input input-bordered w-full"
            {...register('startDate', { required: 'Start date is required' })}
          />
          {errors.startDate && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.startDate.message}</span>
            </label>
          )}
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">End Date *</span>
          </label>
          <input
            type="month"
            className="input input-bordered w-full"
            {...register('endDate', { required: 'End date is required' })}
          />
          {errors.endDate && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.endDate.message}</span>
            </label>
          )}
        </div>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">GPA (Optional)</span>
        </label>
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="e.g., 3.8"
          {...register('gpa')}
        />
      </div>

      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary">
          {education ? 'Update' : 'Add'} Education
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
    <div className="card bg-base-200 mb-4">
      <div className="card-body">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold">{education.degree}</h3>
            <div className="text-sm text-gray-600">
              {education.school} • {education.location}
            </div>
            <div className="text-sm text-gray-500">
              {education.startDate} - {education.endDate}
              {education.gpa && ` • GPA: ${education.gpa}`}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(education)}
              className="btn btn-sm btn-outline"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(education.id)}
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Education</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary btn-sm"
          >
            Add Education
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
            <div className="text-center py-8 text-gray-500">
              No education added yet. Click "Add Education" to get started.
            </div>
          ) : (
            education.map((edu) => (
              <EducationItem
                key={edu.id}
                education={edu}
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