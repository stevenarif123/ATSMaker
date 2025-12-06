import { useForm, useFieldArray } from 'react-hook-form';
import { useCoverLetterStore } from '../../store/coverLetterStore';
import { useResumeStore } from '../../store/resumeStore';

export default function CoverLetterForm() {
  const coverLetterStore = useCoverLetterStore();
  const resumeStore = useResumeStore();
  const activeCoverLetter = coverLetterStore.getActiveCoverLetter();
  
  const { register, control, formState: { errors }, watch } = useForm({
    defaultValues: activeCoverLetter || {
      recipientName: '',
      company: '',
      date: new Date().toISOString().split('T')[0],
      salutation: 'Dear Hiring Manager',
      bodyParagraphs: [{ text: '' }, { text: '' }, { text: '' }],
      closing: 'Sincerely',
      signature: resumeStore.personalInfo.fullName || '',
      associatedResumeId: null,
      templateId: 'formal'
    }
  });

  const { fields: bodyFields, append, remove } = useFieldArray({
    control,
    name: 'bodyParagraphs'
  });

  const formData = watch();

  const handleFieldChange = (field, value) => {
    if (activeCoverLetter) {
      coverLetterStore.updateCoverLetter(activeCoverLetter.id, {
        [field]: value
      });
    }
  };

  const handleBodyParagraphChange = (index, text) => {
    if (activeCoverLetter) {
      const updatedBodyParagraphs = [...(activeCoverLetter.bodyParagraphs || [{}, {}, {}])];
      updatedBodyParagraphs[index] = { text };
      coverLetterStore.updateCoverLetter(activeCoverLetter.id, {
        bodyParagraphs: updatedBodyParagraphs
      });
    }
  };

  const addBodyParagraph = () => {
    append({ text: '' });
    if (activeCoverLetter) {
      const updatedBodyParagraphs = [...(activeCoverLetter.bodyParagraphs || []), { text: '' }];
      coverLetterStore.updateCoverLetter(activeCoverLetter.id, {
        bodyParagraphs: updatedBodyParagraphs
      });
    }
  };

  const removeBodyParagraph = (index) => {
    remove(index);
    if (activeCoverLetter) {
      const updatedBodyParagraphs = (activeCoverLetter.bodyParagraphs || []).filter((_, i) => i !== index);
      coverLetterStore.updateCoverLetter(activeCoverLetter.id, {
        bodyParagraphs: updatedBodyParagraphs
      });
    }
  };

  return (
    <form className="space-y-6">
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-1">Cover Letter Details</h2>
        <p className="text-sm text-slate-500">Fill in the details for your cover letter</p>
      </div>

      {/* Recipient & Company */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label form-label-required">Recipient Name</label>
          <input
            type="text"
            className={`form-input ${errors.recipientName ? 'form-input-error' : ''}`}
            placeholder="John Smith"
            {...register('recipientName', { required: 'Recipient name is required' })}
            onChange={(e) => handleFieldChange('recipientName', e.target.value)}
          />
          {errors.recipientName && <p className="form-error">{errors.recipientName.message}</p>}
        </div>

        <div className="form-group">
          <label className="form-label form-label-required">Company</label>
          <input
            type="text"
            className={`form-input ${errors.company ? 'form-input-error' : ''}`}
            placeholder="Acme Corp"
            {...register('company', { required: 'Company name is required' })}
            onChange={(e) => handleFieldChange('company', e.target.value)}
          />
          {errors.company && <p className="form-error">{errors.company.message}</p>}
        </div>
      </div>

      {/* Date & Salutation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label form-label-required">Date</label>
          <input
            type="date"
            className={`form-input ${errors.date ? 'form-input-error' : ''}`}
            {...register('date', { required: 'Date is required' })}
            onChange={(e) => handleFieldChange('date', e.target.value)}
          />
          {errors.date && <p className="form-error">{errors.date.message}</p>}
        </div>

        <div className="form-group">
          <label className="form-label form-label-required">Salutation</label>
          <input
            type="text"
            className={`form-input ${errors.salutation ? 'form-input-error' : ''}`}
            placeholder="Dear Hiring Manager"
            {...register('salutation', { required: 'Salutation is required' })}
            onChange={(e) => handleFieldChange('salutation', e.target.value)}
          />
          {errors.salutation && <p className="form-error">{errors.salutation.message}</p>}
        </div>
      </div>

      {/* Associated Resume */}
      <div className="form-group">
        <label className="form-label">Associated Resume Version</label>
        <select
          className="form-select"
          {...register('associatedResumeId')}
          onChange={(e) => handleFieldChange('associatedResumeId', e.target.value || null)}
        >
          <option value="">None</option>
          <option value="current">Current Resume</option>
        </select>
        <p className="form-hint">Link this cover letter to a specific resume version for reference</p>
      </div>

      {/* Template Selection */}
      <div className="form-group">
        <label className="form-label form-label-required">Template</label>
        <select
          className={`form-select ${errors.templateId ? 'form-select-error' : ''}`}
          {...register('templateId', { required: 'Template is required' })}
          onChange={(e) => handleFieldChange('templateId', e.target.value)}
        >
          <option value="formal">Formal</option>
          <option value="modern">Modern</option>
          <option value="minimal">Minimal</option>
        </select>
        {errors.templateId && <p className="form-error">{errors.templateId.message}</p>}
      </div>

      {/* Body Paragraphs */}
      <div className="form-group">
        <label className="form-label form-label-required">Body Paragraphs</label>
        <div className="space-y-4">
          {bodyFields.map((field, index) => (
            <div key={field.id} className="relative">
              <div className="flex items-start justify-between gap-2 mb-1">
                <label className="text-sm font-medium text-slate-700">
                  Paragraph {index + 1}
                </label>
                {bodyFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeBodyParagraph(index)}
                    className="text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    Remove
                  </button>
                )}
              </div>
              <textarea
                className="form-textarea h-24"
                placeholder={`Enter paragraph ${index + 1} here...`}
                {...register(`bodyParagraphs.${index}.text`)}
                onChange={(e) => handleBodyParagraphChange(index, e.target.value)}
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addBodyParagraph}
          className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          + Add Paragraph
        </button>
      </div>

      {/* Closing & Signature */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label form-label-required">Closing</label>
          <input
            type="text"
            className={`form-input ${errors.closing ? 'form-input-error' : ''}`}
            placeholder="Sincerely"
            {...register('closing', { required: 'Closing is required' })}
            onChange={(e) => handleFieldChange('closing', e.target.value)}
          />
          {errors.closing && <p className="form-error">{errors.closing.message}</p>}
        </div>

        <div className="form-group">
          <label className="form-label form-label-required">Signature</label>
          <input
            type="text"
            className={`form-input ${errors.signature ? 'form-input-error' : ''}`}
            placeholder="Your Name"
            {...register('signature', { required: 'Signature is required' })}
            onChange={(e) => handleFieldChange('signature', e.target.value)}
          />
          {errors.signature && <p className="form-error">{errors.signature.message}</p>}
        </div>
      </div>
    </form>
  );
}
