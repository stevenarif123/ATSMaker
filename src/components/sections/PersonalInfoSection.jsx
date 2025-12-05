import { useForm } from 'react-hook-form';
import { useResumeStore } from '../../store/resumeStore';

export default function PersonalInfoSection({ data }) {
  const { updatePersonalInfo } = useResumeStore();
  const { register, formState: { errors } } = useForm({
    defaultValues: data
  });

  // Auto-save on input change
  const handleInputChange = (field, value) => {
    updatePersonalInfo(field, value);
  };

  return (
    <form className="space-y-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text">Full Name *</span>
        </label>
        <input
          type="text"
          className="input input-bordered w-full"
          {...register('fullName', { required: 'Full name is required' })}
          onChange={(e) => handleInputChange('fullName', e.target.value)}
        />
        {errors.fullName && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.fullName.message}</span>
          </label>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Email *</span>
          </label>
          <input
            type="email"
            className="input input-bordered w-full"
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            onChange={(e) => handleInputChange('email', e.target.value)}
          />
          {errors.email && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.email.message}</span>
            </label>
          )}
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Phone *</span>
          </label>
          <input
            type="tel"
            className="input input-bordered w-full"
            {...register('phone', { required: 'Phone is required' })}
            onChange={(e) => handleInputChange('phone', e.target.value)}
          />
          {errors.phone && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.phone.message}</span>
            </label>
          )}
        </div>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Location *</span>
        </label>
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="City, State"
          {...register('location', { required: 'Location is required' })}
          onChange={(e) => handleInputChange('location', e.target.value)}
        />
        {errors.location && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.location.message}</span>
          </label>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Website</span>
          </label>
          <input
            type="url"
            className="input input-bordered w-full"
            placeholder="https://yourwebsite.com"
            {...register('website')}
            onChange={(e) => handleInputChange('website', e.target.value)}
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">LinkedIn</span>
          </label>
          <input
            type="url"
            className="input input-bordered w-full"
            placeholder="https://linkedin.com/in/yourprofile"
            {...register('linkedin')}
            onChange={(e) => handleInputChange('linkedin', e.target.value)}
          />
        </div>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">GitHub</span>
        </label>
        <input
          type="url"
          className="input input-bordered w-full"
          placeholder="https://github.com/yourusername"
          {...register('github')}
          onChange={(e) => handleInputChange('github', e.target.value)}
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Professional Summary</span>
        </label>
        <textarea
          className="textarea textarea-bordered h-32"
          placeholder="Write a brief professional summary highlighting your key qualifications and career goals..."
          {...register('summary')}
          onChange={(e) => handleInputChange('summary', e.target.value)}
        ></textarea>
      </div>
    </form>
  );
}