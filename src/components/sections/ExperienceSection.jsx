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
      className="card bg-base-200 mb-4"
    >
      <div className="card-body">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <button
                {...attributes}
                {...listeners}
                className="cursor-move text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h3 className="font-bold">{experience.position}</h3>
            </div>
            <div className="text-sm text-gray-600">
              {experience.company} • {experience.location}
            </div>
            <div className="text-sm text-gray-500">
              {experience.startDate} - {experience.current ? 'Present' : experience.endDate}
            </div>
            {experience.bullets && experience.bullets.length > 0 && (
              <ul className="list-disc list-inside text-sm mt-2">
                {experience.bullets.map((bullet, index) => (
                  <li key={index}>{bullet}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(experience)}
              className="btn btn-sm btn-outline"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(experience.id)}
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text">Position *</span>
        </label>
        <input
          type="text"
          className="input input-bordered w-full"
          {...register('position', { required: 'Position is required' })}
        />
        {errors.position && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.position.message}</span>
          </label>
        )}
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Company *</span>
        </label>
        <input
          type="text"
          className="input input-bordered w-full"
          {...register('company', { required: 'Company is required' })}
        />
        {errors.company && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.company.message}</span>
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
            <span className="label-text">End Date</span>
          </label>
          <input
            type="month"
            className="input input-bordered w-full"
            {...register('endDate')}
            disabled={isCurrent}
          />
        </div>
      </div>

      <div className="form-control">
        <label className="label cursor-pointer">
          <span className="label-text">Currently working here</span>
          <input
            type="checkbox"
            className="checkbox checkbox-primary"
            {...register('current')}
          />
        </label>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Key Responsibilities & Achievements</span>
        </label>
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <input
                type="text"
                className="input input-bordered flex-1"
                placeholder="Describe your responsibility or achievement..."
                {...register(`bullets.${index}`)}
              />
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="btn btn-error btn-outline btn-sm"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => append('')}
            className="btn btn-outline btn-sm"
          >
            Add Bullet Point
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary">
          {experience ? 'Update' : 'Add'} Experience
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Work Experience</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary btn-sm"
          >
            Add Experience
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
            <div className="text-center py-8 text-gray-500">
              No experience added yet. Click "Add Experience" to get started.
            </div>
          ) : (
            experience.map((exp) => (
              <SortableExperienceItem
                key={exp.id}
                experience={exp}
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