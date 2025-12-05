import { SectionEditor } from './SectionEditor.jsx'

export function ReviewDrawer({ form, isOpen, onClose, onSubmit }) {
  const sections = form.watch?.('sections') ?? []
  if (!sections.length) return null

  const submit = form.handleSubmit(onSubmit)
  const canMerge = sections.some((section) => section.accepted)

  return (
    <div
      className={`review-drawer ${isOpen ? 'review-drawer--open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Review parsed sections"
      aria-hidden={!isOpen}
    >
      <div className="review-drawer__panel">
        <header className="review-drawer__header">
          <div>
            <p className="review-drawer__eyebrow">Review</p>
            <h2>Parsed sections</h2>
          </div>
          <button type="button" className="btn" onClick={onClose}>
            Close
          </button>
        </header>
        <form onSubmit={submit} className="review-drawer__form">
          <div className="review-drawer__sections">
            {sections.map((section, index) => (
              <SectionEditor key={section.id} section={section} sectionIndex={index} register={form.register} />
            ))}
          </div>
          <footer className="review-drawer__footer">
            <div className="review-drawer__footer-left">
              {!canMerge ? <p className="review-drawer__hint">Select at least one section to enable merging.</p> : null}
            </div>
            <div className="review-drawer__footer-actions">
              <button type="button" className="btn" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn--primary" disabled={!canMerge}>
                Accept &amp; Merge
              </button>
            </div>
          </footer>
        </form>
      </div>
      <button type="button" className="review-drawer__scrim" aria-label="Dismiss review" onClick={onClose} />
    </div>
  )
}
