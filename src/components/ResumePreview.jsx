export default function ResumePreview({ id, data }) {
  const { personalInfo, experience, education, skills, projects, certifications, languages, customSections } = data;

  // ATS-friendly colors using standard hex values
  const colors = {
    text: '#333333',
    textDark: '#000000',
    textMuted: '#555555',
    textLight: '#666666',
    border: '#cccccc',
    borderDark: '#000000',
    accent: '#003399',
  };

  // Helper to format URL for display
  const formatUrl = (url, type) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    if (type === 'linkedin') return `https://linkedin.com/in/${url}`;
    if (type === 'github') return `https://github.com/${url}`;
    return `https://${url}`;
  };

  // Helper to normalize text - remove extra newlines and whitespace
  const normalizeText = (text) => {
    if (!text) return '';
    return text.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
  };

  return (
    <div 
      id={id} 
      style={{ 
        fontFamily: '"Times New Roman", Times, serif', 
        width: '816px', 
        minHeight: '1056px',
        padding: '50px',
        backgroundColor: '#ffffff',
        color: colors.text,
        lineHeight: '1.4'
      }}
    >
      {/* Header - Centered */}
      <header style={{ textAlign: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: `1px solid ${colors.borderDark}` }}>
        <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: colors.textDark, marginBottom: '8px', letterSpacing: '0.5px' }}>
          {personalInfo.fullName || 'Your Name'}
        </h1>
        
        {/* Contact Info Line */}
        <div style={{ fontSize: '10px', color: colors.textMuted, marginBottom: '4px' }}>
          {[personalInfo.email, personalInfo.phone, personalInfo.location].filter(Boolean).join('  |  ')}
        </div>
        
        {/* Links Line */}
        {(personalInfo.linkedin || personalInfo.github) && (
          <div style={{ fontSize: '10px', color: colors.accent }}>
            {personalInfo.linkedin && (
              <a 
                href={formatUrl(personalInfo.linkedin, 'linkedin')} 
                style={{ color: colors.accent, textDecoration: 'none' }}
              >
                {formatUrl(personalInfo.linkedin, 'linkedin')}
              </a>
            )}
            {personalInfo.linkedin && personalInfo.github && (
              <span style={{ color: colors.textMuted }}>{'  |  '}</span>
            )}
            {personalInfo.github && (
              <a 
                href={formatUrl(personalInfo.github, 'github')} 
                style={{ color: colors.accent, textDecoration: 'none' }}
              >
                {formatUrl(personalInfo.github, 'github')}
              </a>
            )}
          </div>
        )}
      </header>
      {/* Summary */}
      {personalInfo.summary && (
        <section style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', color: colors.textDark, marginBottom: '6px', borderBottom: `1px solid ${colors.border}`, paddingBottom: '3px' }}>
            Professional Summary
          </h2>
          <p style={{ fontSize: '10px', lineHeight: '1.5', color: colors.text, textAlign: 'left' }}>{normalizeText(personalInfo.summary)}</p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', color: colors.textDark, marginBottom: '8px', borderBottom: `1px solid ${colors.border}`, paddingBottom: '3px' }}>
            Professional Experience
          </h2>
          <div>
            {experience.map((exp, expIndex) => (
              <div key={exp.id} style={{ marginBottom: expIndex < experience.length - 1 ? '12px' : '0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h3 style={{ fontSize: '11px', fontWeight: 'bold', color: colors.textDark }}>{exp.position}</h3>
                  <span style={{ fontSize: '10px', color: colors.textLight }}>
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                <div style={{ fontSize: '10px', color: colors.textMuted, fontStyle: 'italic', marginBottom: '4px' }}>
                  {exp.company}{exp.location ? `, ${exp.location}` : ''}
                </div>
                {exp.bullets && exp.bullets.length > 0 && (
                  <ul style={{ fontSize: '10px', color: colors.text, margin: '0', paddingLeft: '16px', listStyleType: 'disc' }}>
                    {exp.bullets.map((bullet, index) => (
                      <li key={index} style={{ marginBottom: '2px', lineHeight: '1.4', textAlign: 'left' }}>
                        {normalizeText(bullet)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', color: colors.textDark, marginBottom: '8px', borderBottom: `1px solid ${colors.border}`, paddingBottom: '3px' }}>
            Education
          </h2>
          <div>
            {education.map((edu, eduIndex) => (
              <div key={edu.id} style={{ marginBottom: eduIndex < education.length - 1 ? '8px' : '0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h3 style={{ fontSize: '11px', fontWeight: 'bold', color: colors.textDark }}>{edu.degree}</h3>
                  <span style={{ fontSize: '10px', color: colors.textLight }}>
                    {edu.startDate} – {edu.endDate}
                  </span>
                </div>
                <div style={{ fontSize: '10px', color: colors.textMuted }}>
                  {edu.school}{edu.location ? `, ${edu.location}` : ''}
                  {edu.gpa && <span> | GPA: {edu.gpa}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', color: colors.textDark, marginBottom: '6px', borderBottom: `1px solid ${colors.border}`, paddingBottom: '3px' }}>
            Skills
          </h2>
          <div style={{ fontSize: '10px', color: colors.text, lineHeight: '1.5' }}>
            {skills.map((skill, index) => (
              <span key={skill.id}>
                {skill.name}
                {index < skills.length - 1 && <span style={{ color: colors.textLight }}> • </span>}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <section style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', color: colors.textDark, marginBottom: '8px', borderBottom: `1px solid ${colors.border}`, paddingBottom: '3px' }}>
            Projects
          </h2>
          <div>
            {projects.map((project, projIndex) => (
              <div key={project.id} style={{ marginBottom: projIndex < projects.length - 1 ? '10px' : '0' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '11px', fontWeight: 'bold', color: colors.textDark }}>{project.name}</h3>
                  {project.url && (
                    <a 
                      href={project.url.startsWith('http') ? project.url : `https://${project.url}`}
                      style={{ fontSize: '9px', color: colors.accent, textDecoration: 'none' }}
                    >
                      {project.url}
                    </a>
                  )}
                </div>
                <p style={{ fontSize: '10px', color: colors.text, marginTop: '2px', lineHeight: '1.4', textAlign: 'left' }}>{normalizeText(project.description)}</p>
                {project.technologies && project.technologies.length > 0 && (
                  <div style={{ fontSize: '9px', color: colors.textLight, marginTop: '2px', fontStyle: 'italic' }}>
                    Technologies: {project.technologies.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
        <section style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', color: colors.textDark, marginBottom: '6px', borderBottom: `1px solid ${colors.border}`, paddingBottom: '3px' }}>
            Certifications
          </h2>
          <div>
            {certifications.map((cert, certIndex) => (
              <div key={cert.id || certIndex} style={{ marginBottom: certIndex < certifications.length - 1 ? '6px' : '0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h3 style={{ fontSize: '10px', fontWeight: 'bold', color: colors.textDark }}>{cert.name}</h3>
                  {cert.date && (
                    <span style={{ fontSize: '9px', color: colors.textLight }}>{cert.date}</span>
                  )}
                </div>
                {cert.issuer && (
                  <div style={{ fontSize: '9px', color: colors.textMuted }}>{cert.issuer}</div>
                )}
                {cert.url && (
                  <a 
                    href={cert.url.startsWith('http') ? cert.url : `https://${cert.url}`}
                    style={{ fontSize: '9px', color: colors.accent, textDecoration: 'none' }}
                  >
                    View Certificate
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Languages */}
      {languages && languages.length > 0 && (
        <section style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', color: colors.textDark, marginBottom: '6px', borderBottom: `1px solid ${colors.border}`, paddingBottom: '3px' }}>
            Languages
          </h2>
          <div style={{ fontSize: '10px', color: colors.text, lineHeight: '1.5' }}>
            {languages.map((lang, index) => (
              <span key={lang.id || index}>
                {lang.name}{lang.level && ` (${lang.level})`}
                {index < languages.length - 1 && <span style={{ color: colors.textLight }}> • </span>}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Custom Sections */}
      {customSections && customSections.length > 0 && (
        customSections.map((section, sectionIndex) => (
          <section key={section.id || sectionIndex} style={{ marginBottom: '16px' }}>
            <h2 style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', color: colors.textDark, marginBottom: '6px', borderBottom: `1px solid ${colors.border}`, paddingBottom: '3px' }}>
              {section.title}
            </h2>
            {section.content && (
              <p style={{ fontSize: '10px', lineHeight: '1.5', color: colors.text, textAlign: 'left' }}>
                {normalizeText(section.content)}
              </p>
            )}
            {section.items && section.items.length > 0 && (
              <ul style={{ fontSize: '10px', color: colors.text, margin: '0', paddingLeft: '16px', listStyleType: 'disc' }}>
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} style={{ marginBottom: '2px', lineHeight: '1.4' }}>
                    {normalizeText(typeof item === 'string' ? item : item.text || item.name || '')}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))
      )}
    </div>
  );
}