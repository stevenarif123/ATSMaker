import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PersonalInfoSchema, PersonalInfo } from '../../lib/schema';
import { usePersonalInfo, useResumeActions } from '../../stores/resume-store';

const PersonalInfoForm: React.FC = () => {
  const personalInfo = usePersonalInfo();
  const { updatePersonalInfo } = useResumeActions();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
  } = useForm<PersonalInfo>({
    resolver: zodResolver(PersonalInfoSchema),
    defaultValues: personalInfo || {
      fullName: '',
      title: '',
      summary: '',
      contact: {
        email: '',
        phone: '',
        location: '',
        linkedin: '',
        github: '',
        website: '',
      },
    },
    mode: 'onChange',
  });

  // Update form when personalInfo changes from store
  React.useEffect(() => {
    if (personalInfo) {
      reset(personalInfo);
    }
  }, [personalInfo, reset]);

  const onSubmit = (data: PersonalInfo) => {
    updatePersonalInfo(data);
  };

  // Auto-save when form is dirty
  React.useEffect(() => {
    const subscription = watch(() => {
      if (isDirty) {
        handleSubmit(onSubmit)();
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, isDirty, handleSubmit, onSubmit]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Personal Information</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              {...register('fullName')}
              type="text"
              id="fullName"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="John Doe"
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Professional Title *
            </label>
            <input
              {...register('title')}
              type="text"
              id="title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Senior Software Engineer"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">
            Professional Summary *
          </label>
          <textarea
            {...register('summary')}
            id="summary"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="A brief summary of your professional background and key achievements..."
          />
          {errors.summary && (
            <p className="mt-1 text-sm text-red-600">{errors.summary.message}</p>
          )}
        </div>

        {/* Contact Information */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Contact Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contact.email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                {...register('contact.email')}
                type="email"
                id="contact.email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="john.doe@example.com"
              />
              {errors.contact?.email && (
                <p className="mt-1 text-sm text-red-600">{errors.contact.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="contact.phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone *
              </label>
              <input
                {...register('contact.phone')}
                type="tel"
                id="contact.phone"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+1 (555) 123-4567"
              />
              {errors.contact?.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.contact.phone.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="contact.location" className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <input
                {...register('contact.location')}
                type="text"
                id="contact.location"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="San Francisco, CA"
              />
              {errors.contact?.location && (
                <p className="mt-1 text-sm text-red-600">{errors.contact.location.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="contact.linkedin" className="block text-sm font-medium text-gray-700 mb-1">
                LinkedIn URL
              </label>
              <input
                {...register('contact.linkedin')}
                type="url"
                id="contact.linkedin"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://linkedin.com/in/johndoe"
              />
              {errors.contact?.linkedin && (
                <p className="mt-1 text-sm text-red-600">{errors.contact.linkedin.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="contact.github" className="block text-sm font-medium text-gray-700 mb-1">
                GitHub URL
              </label>
              <input
                {...register('contact.github')}
                type="url"
                id="contact.github"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://github.com/johndoe"
              />
              {errors.contact?.github && (
                <p className="mt-1 text-sm text-red-600">{errors.contact.github.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="contact.website" className="block text-sm font-medium text-gray-700 mb-1">
                Personal Website
              </label>
              <input
                {...register('contact.website')}
                type="url"
                id="contact.website"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://johndoe.com"
              />
              {errors.contact?.website && (
                <p className="mt-1 text-sm text-red-600">{errors.contact.website.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => reset(personalInfo)}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Reset
          </button>
          <button
            type="submit"
            className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Save Changes
          </button>
        </div>
      </form>

      {/* Form Debug Info (Development Only) */}
      {true && (
        <div className="mt-8 p-4 bg-gray-100 rounded-md">
          <h4 className="font-semibold text-sm mb-2">Form State (Development)</h4>
          <pre className="text-xs overflow-x-auto">
            {JSON.stringify({
              isDirty,
              errors: Object.keys(errors),
              values: watch(),
            }, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default PersonalInfoForm;