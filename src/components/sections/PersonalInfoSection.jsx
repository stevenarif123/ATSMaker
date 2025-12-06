import { useForm } from 'react-hook-form';
import { useResumeStore } from '../../store/resumeStore';

export default function PersonalInfoSection({ data }) {
  const { updatePersonalInfo } = useResumeStore();
  const { register, formState: { errors } } = useForm({
    defaultValues: data
  });

  const handleInputChange = (field, value) => {
    updatePersonalInfo(field, value);
  };

  return (
    <form className="space-y-6">
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-1">Personal Information</h2>
        <p className="text-sm text-slate-500">Add your contact details and professional summary</p>
      </div>

      {/* Full Name */}
      <div className="form-group">
        <label className="form-label form-label-required">Full Name</label>
        <input
          type="text"
          className={`form-input ${errors.fullName ? 'form-input-error' : ''}`}
          placeholder="John Doe"
          {...register('fullName', { required: 'Full name is required' })}
          onChange={(e) => handleInputChange('fullName', e.target.value)}
        />
        {errors.fullName && <p className="form-error">{errors.fullName.message}</p>}
      </div>

      {/* Email & Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label form-label-required">Email</label>
          <input
            type="email"
            className={`form-input ${errors.email ? 'form-input-error' : ''}`}
            placeholder="john@example.com"
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            onChange={(e) => handleInputChange('email', e.target.value)}
          />
          {errors.email && <p className="form-error">{errors.email.message}</p>}
        </div>

        <div className="form-group">
          <label className="form-label form-label-required">Phone</label>
          <input
            type="tel"
            className={`form-input ${errors.phone ? 'form-input-error' : ''}`}
            placeholder="+1 (555) 123-4567"
            {...register('phone', { required: 'Phone is required' })}
            onChange={(e) => handleInputChange('phone', e.target.value)}
          />
          {errors.phone && <p className="form-error">{errors.phone.message}</p>}
        </div>
      </div>

      {/* Location */}
      <div className="form-group">
        <label className="form-label form-label-required">Location</label>
        <input
          type="text"
          className={`form-input ${errors.location ? 'form-input-error' : ''}`}
          placeholder="San Francisco, CA"
          {...register('location', { required: 'Location is required' })}
          onChange={(e) => handleInputChange('location', e.target.value)}
        />
        {errors.location && <p className="form-error">{errors.location.message}</p>}
      </div>

      {/* Website & LinkedIn */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label">Website</label>
          <input
            type="url"
            className="form-input"
            placeholder="https://yourwebsite.com"
            {...register('website')}
            onChange={(e) => handleInputChange('website', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">LinkedIn</label>
          <input
            type="url"
            className="form-input"
            placeholder="https://linkedin.com/in/yourprofile"
            {...register('linkedin')}
            onChange={(e) => handleInputChange('linkedin', e.target.value)}
          />
        </div>
      </div>

      {/* GitHub */}
      <div className="form-group">
        <label className="form-label">GitHub</label>
        <input
          type="url"
          className="form-input"
          placeholder="https://github.com/yourusername"
          {...register('github')}
          onChange={(e) => handleInputChange('github', e.target.value)}
        />
      </div>

      {/* Professional Summary */}
      <div className="form-group">
        <label className="form-label">Professional Summary</label>
        <textarea
          className="form-textarea h-32"
          placeholder="Write a brief professional summary highlighting your key qualifications, experience, and career goals. Keep it concise and impactful."
          {...register('summary')}
          onChange={(e) => handleInputChange('summary', e.target.value)}
        ></textarea>
        <p className="form-hint">A strong summary helps recruiters quickly understand your value proposition</p>
      </div>
    </form>
  );
}