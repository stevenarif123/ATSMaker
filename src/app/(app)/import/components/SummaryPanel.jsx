export function SummaryPanel({ resume, insights, status }) {
  const { warnings = [], keywords = [], stats = {} } = insights ?? {}
  const resumeSections = resume?.sections ?? []

  return (
    <aside className="summary-panel">
      <section>
        <div className="summary-panel__header">
          <h3>ATS Warnings</h3>
          <span className="summary-panel__badge">{warnings.length || '0'}</span>
        </div>
        {warnings.length ? (
          <ul className="summary-panel__list" data-testid="ats-warnings">
            {warnings.map((warning, index) => (
              <li key={`${warning}-${index}`}>{warning}</li>
            ))}
          </ul>
        ) : (
          <p className="summary-panel__empty">No blocking warnings detected.</p>
        )}
      </section>

      <section>
        <div className="summary-panel__header">
          <h3>Keyword &amp; Skills Summary</h3>
          <span className="summary-panel__badge">{keywords.length}</span>
        </div>
        {keywords.length ? (
          <div className="summary-panel__chips">
            {keywords.map((keyword) => (
              <span key={keyword} className="chip">
                {keyword}
              </span>
            ))}
          </div>
        ) : (
          <p className="summary-panel__empty">Keywords will appear as you accept sections.</p>
        )}
      </section>

      <section>
        <div className="summary-panel__header">
          <h3>Resume Store</h3>
          {resume?.lastUpdated ? <small>Updated {new Date(resume.lastUpdated).toLocaleTimeString()}</small> : null}
        </div>
        {status === 'merged' ? <p className="summary-panel__success">Resume updated with {resumeSections.length} sections.</p> : null}
        {resumeSections.length ? (
          <ul className="summary-panel__list">
            {resumeSections.map((section) => (
              <li key={section.id}>
                <strong>{section.title}</strong>
                <span className="summary-panel__meta">{countFilledFields(section)} fields</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="summary-panel__empty">No sections have been merged yet.</p>
        )}
        <div className="summary-panel__stats">
          <span>Total parsed: {stats.totalParsed ?? 0}</span>
          <span>Accepted: {stats.accepted ?? 0}</span>
        </div>
      </section>
    </aside>
  )
}

function countFilledFields(section) {
  if (!section?.fields) return 0
  return section.fields.reduce((count, field) => {
    if (Array.isArray(field.value)) {
      return count + (field.value.filter(Boolean).length ? 1 : 0)
    }
    return count + (field.value ? 1 : 0)
  }, 0)
}
