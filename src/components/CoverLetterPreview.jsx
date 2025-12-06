import { useCoverLetterStore } from '../store/coverLetterStore';
import { useResumeStore } from '../store/resumeStore';

export const COVER_LETTER_TEMPLATES = [
  { id: 'formal', name: 'Formal', description: 'Traditional business format' },
  { id: 'modern', name: 'Modern', description: 'Contemporary style' },
  { id: 'minimal', name: 'Minimal', description: 'Clean and simple' }
];

export default function CoverLetterPreview({ id, template = 'formal' }) {
  const activeCoverLetter = useCoverLetterStore().getActiveCoverLetter();
  const personalInfo = useResumeStore().personalInfo;

  if (!activeCoverLetter) {
    return (
      <div id={id} className="p-8 bg-white text-center text-slate-500">
        <p>No cover letter selected</p>
      </div>
    );
  }

  const templateStyles = {
    formal: {
      container: 'font-serif',
      letterSpacing: 'tracking-wide',
      lineHeight: 'leading-relaxed',
      paragraph: 'mb-4 text-justify',
      margins: 'p-12',
      fontSize: 'text-sm'
    },
    modern: {
      container: 'font-sans',
      letterSpacing: 'tracking-normal',
      lineHeight: 'leading-relaxed',
      paragraph: 'mb-4',
      margins: 'p-10',
      fontSize: 'text-sm'
    },
    minimal: {
      container: 'font-sans',
      letterSpacing: 'tracking-tight',
      lineHeight: 'leading-relaxed',
      paragraph: 'mb-3 text-sm',
      margins: 'p-8',
      fontSize: 'text-xs'
    }
  };

  const styles = templateStyles[template] || templateStyles.formal;

  return (
    <div 
      id={id}
      className={`bg-white ${styles.margins} ${styles.container} ${styles.fontSize} min-h-[11in] w-full max-w-4xl mx-auto`}
    >
      {/* Header */}
      <div className={`mb-8 ${template === 'formal' ? 'text-center' : ''}`}>
        {personalInfo.fullName && (
          <div className="font-bold text-lg">{personalInfo.fullName}</div>
        )}
        <div className="text-xs text-gray-600 space-y-px">
          {personalInfo.email && <div>{personalInfo.email}</div>}
          {personalInfo.phone && <div>{personalInfo.phone}</div>}
          {personalInfo.location && <div>{personalInfo.location}</div>}
        </div>
      </div>

      {/* Date */}
      {activeCoverLetter.date && (
        <div className="mb-6 text-xs">
          {new Date(activeCoverLetter.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      )}

      {/* Recipient */}
      <div className="mb-6 space-y-px text-xs">
        {activeCoverLetter.recipientName && (
          <div>{activeCoverLetter.recipientName}</div>
        )}
        {activeCoverLetter.company && (
          <div>{activeCoverLetter.company}</div>
        )}
      </div>

      {/* Salutation */}
      {activeCoverLetter.salutation && (
        <div className="mb-4 text-xs">
          {activeCoverLetter.salutation}
        </div>
      )}

      {/* Body Paragraphs */}
      <div className={styles.lineHeight}>
        {activeCoverLetter.bodyParagraphs && activeCoverLetter.bodyParagraphs.map((para, idx) => (
          para.text && (
            <div key={idx} className={styles.paragraph}>
              {para.text}
            </div>
          )
        ))}
      </div>

      {/* Closing */}
      {activeCoverLetter.closing && (
        <div className="mt-6 text-xs">
          {activeCoverLetter.closing}
        </div>
      )}

      {/* Signature */}
      {activeCoverLetter.signature && (
        <div className="mt-4 text-xs">
          <div className="mb-12">
            {/* Space for handwritten signature */}
          </div>
          <div>{activeCoverLetter.signature}</div>
        </div>
      )}
    </div>
  );
}
