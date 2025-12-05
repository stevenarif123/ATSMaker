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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text">Skill Name *</span>
        </label>
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="e.g., JavaScript, Project Management, Data Analysis"
          {...register('name', { required: 'Skill name is required' })}
        />
        {errors.name && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.name.message}</span>
          </label>
        )}
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Proficiency Level (Optional)</span>
        </label>
        <select className="select select-bordered w-full" {...register('level')}>
          <option value="">Select level</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
          <option value="Expert">Expert</option>
        </select>
      </div>

      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary">
          {skill ? 'Update' : 'Add'} Skill
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
    <div className="flex items-center gap-2 p-2 bg-base-200 rounded-lg">
      <div className="flex-1">
        <span className="font-medium">{skill.name}</span>
        {skill.level && (
          <span className={`ml-2 badge ${levelColors[skill.level]} badge-sm`}>
            {skill.level}
          </span>
        )}
      </div>
      <div className="flex gap-1">
        <button
          onClick={() => onEdit(skill)}
          className="btn btn-xs btn-outline"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(skill.id)}
          className="btn btn-xs btn-error btn-outline"
        >
          Delete
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Skills</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary btn-sm"
          >
            Add Skill
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
            <div className="text-center py-8 text-gray-500">
              No skills added yet. Click "Add Skill" to get started.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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