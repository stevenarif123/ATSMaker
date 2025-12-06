export function SectionEditor({ section, sectionIndex, register }) {
  const fieldPrefix = `sections.${sectionIndex}`

  return (
    <article className={`section-editor ${section.accepted ? '' : 'section-editor--muted'}`}>
      <header className="section-editor__header">
        <div>
          <p className="section-editor__eyebrow">Section</p>
          <h3>{section.title}</h3>
        </div>
        <label className="switch">
          <input type="checkbox" {...register(`${fieldPrefix}.accepted`)} aria-label={`Accept ${section.title}`} />
          <span className="switch__control" aria-hidden="true" />
          <span className="switch__label">{section.accepted ? 'Accepted' : 'Rejected'}</span>
        </label>
      </header>
      {section.fields?.map((field, fieldIndex) => {
        const fieldName = `${fieldPrefix}.fields.${fieldIndex}.value`
        const htmlId = `${fieldPrefix}-${field.id}`
        return (
          <div key={field.id} className="section-editor__field">
            <label htmlFor={htmlId}>{field.label}</label>
            {renderField(field, fieldName, htmlId, register)}
            {field.placeholder ? <p className="section-editor__hint">{field.placeholder}</p> : null}
          </div>
        )
      })}
    </article>
  )
}

function renderField(field, name, htmlId, register) {
  switch (field.type) {
    case 'textarea':
      return <textarea id={htmlId} rows={4} {...register(name)} />
    case 'list':
      return <textarea id={htmlId} rows={3} {...register(name)} placeholder="Enter one per line" />
    default:
      return <input id={htmlId} type="text" {...register(name)} />
  }
}
