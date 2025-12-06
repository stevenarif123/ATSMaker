export default function ResumePreview({ id, data, template = 'classic' }) {
  const { personalInfo, experience, education, skills, projects, certifications, languages, links, customSections } = data;

  // Template configurations with more visual differences
  const templates = {
    classic: {
      name: 'Classic',
      text: '#333333',
      textDark: '#000000',
      textMuted: '#555555',
      textLight: '#666666',
      border: '#cccccc',
      borderDark: '#000000',
      accent: '#003399',
      headerStyle: 'centered',
      sectionStyle: 'underline', // underline, box, none
      bulletStyle: 'disc', // disc, dash, arrow
      nameSize: '22px',
      sectionTitleSize: '11px',
      borderWidth: '1px',
    },
    modern: {
      name: 'Modern',
      text: '#374151',
      textDark: '#111827',
      textMuted: '#6b7280',
      textLight: '#9ca3af',
      border: '#e5e7eb',
      borderDark: '#2563eb',
      accent: '#2563eb',
      headerStyle: 'left',
      sectionStyle: 'colorbar', // colored left bar
      bulletStyle: 'arrow',
      nameSize: '26px',
      sectionTitleSize: '12px',
      borderWidth: '2px',
    },
    professional: {
      name: 'Professional',
      text: '#1f2937',
      textDark: '#111827',
      textMuted: '#4b5563',
      textLight: '#6b7280',
      border: '#d1d5db',
      borderDark: '#1f2937',
      accent: '#059669',
      headerStyle: 'centered',
      sectionStyle: 'box', // boxed section titles
      bulletStyle: 'dash',
      nameSize: '24px',
      sectionTitleSize: '11px',
      borderWidth: '1px',
    },
    minimal: {
      name: 'Minimal',
      text: '#18181b',
      textDark: '#09090b',
      textMuted: '#52525b',
      textLight: '#71717a',
      border: '#e4e4e7',
      borderDark: '#a1a1aa',
      accent: '#18181b',
      headerStyle: 'left',
      sectionStyle: 'none', // no decoration
      bulletStyle: 'disc',
      nameSize: '20px',
      sectionTitleSize: '10px',
      borderWidth: '0.5px',
    },
  };

  const colors = templates[template] || templates.classic;

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

  const isLeftHeader = colors.headerStyle === 'left';

  // Bullet character based on style
  const getBulletChar = () => {
    switch (colors.bulletStyle) {
      case 'arrow': return '▸';
      case 'dash': return '–';
      default: return '•';
    }
  };

  // Section title style based on template - avoid mixing shorthand and non-shorthand properties
  const getSectionTitleStyle = () => {
    const baseStyle = {
      fontSize: colors.sectionTitleSize,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      marginBottom: '8px',
    };

    switch (colors.sectionStyle) {
      case 'colorbar':
        return {
          ...baseStyle,
          color: colors.accent,
          borderLeft: `3px solid ${colors.accent}`,
          paddingTop: '0',
          paddingRight: '0',
          paddingBottom: '4px',
          paddingLeft: '8px',
          borderBottom: 'none',
        };
      case 'box':
        return {
          ...baseStyle,
          color: colors.textDark,
          backgroundColor: '#f3f4f6',
          paddingTop: '6px',
          paddingRight: '10px',
          paddingBottom: '6px',
          paddingLeft: '10px',
          borderRadius: '2px',
          borderBottom: 'none',
        };
      case 'none':
        return {
          ...baseStyle,
          color: colors.textDark,
          borderBottom: 'none',
          marginBottom: '6px',
          paddingTop: '0',
          paddingRight: '0',
          paddingBottom: '0',
          paddingLeft: '0',
        };
      default: // underline
        return {
          ...baseStyle,
          color: colors.textDark,
          borderBottom: `${colors.borderWidth} solid ${colors.border}`,
          paddingTop: '0',
          paddingRight: '0',
          paddingBottom: '4px',
          paddingLeft: '0',
        };
    }
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
      {/* Header */}
      <header style={{ 
        textAlign: isLeftHeader ? 'left' : 'center', 
        marginBottom: '16px', 
        paddingBottom: '12px', 
        borderBottom: `${colors.borderWidth} solid ${colors.borderDark}` 
      }}>
        <h1 style={{ 
          fontSize: colors.nameSize, 
          fontWeight: 'bold', 
          color: colors.textDark, 
          marginBottom: '8px', 
          letterSpacing: template === 'modern' ? '1px' : '0.5px' 
        }}>
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
          <h2 style={getSectionTitleStyle()}>
            Professional Summary
          </h2>
          <p style={{ fontSize: '10px', lineHeight: '1.5', color: colors.text, textAlign: 'left' }}>{normalizeText(personalInfo.summary)}</p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section style={{ marginBottom: '16px' }}>
          <h2 style={getSectionTitleStyle()}>
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
          <h2 style={getSectionTitleStyle()}>
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
          <h2 style={getSectionTitleStyle()}>
            Skills
          </h2>
          <div style={{ fontSize: '10px', color: colors.text, lineHeight: '1.5' }}>
            {skills.map((skill, index) => (
              <span key={skill.id}>
                {skill.name}
                {index < skills.length - 1 && <span style={{ color: colors.textLight }}> {getBulletChar()} </span>}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <section style={{ marginBottom: '16px' }}>
          <h2 style={getSectionTitleStyle()}>
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
          <h2 style={getSectionTitleStyle()}>
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
          <h2 style={getSectionTitleStyle()}>
            Languages
          </h2>
          <div style={{ fontSize: '10px', color: colors.text, lineHeight: '1.5' }}>
            {languages.map((lang, index) => (
              <span key={lang.id || index}>
                {lang.name}{lang.level && ` (${lang.level})`}
                {index < languages.length - 1 && <span style={{ color: colors.textLight }}> {getBulletChar()} </span>}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Links */}
      {links && links.length > 0 && (
        <section style={{ marginBottom: '16px' }}>
          <h2 style={getSectionTitleStyle()}>
            Links
          </h2>
          <div style={{ fontSize: '10px', color: colors.text, lineHeight: '1.6' }}>
            {links.map((link, index) => (
              <div key={link.id || index} style={{ marginBottom: index < links.length - 1 ? '3px' : '0' }}>
                <span style={{ fontWeight: 'bold', color: colors.textDark }}>{link.label}: </span>
                <a 
                  href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                  style={{ color: colors.accent, textDecoration: 'none' }}
                >
                  {link.url}
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Custom Sections */}
      {customSections && customSections.length > 0 && (
        customSections.map((section, sectionIndex) => (
          <section key={section.id || sectionIndex} style={{ marginBottom: '16px' }}>
            <h2 style={getSectionTitleStyle()}>
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

// Export template options for use in other components
export const RESUME_TEMPLATES = [
  { id: 'classic', name: 'Classic', description: 'Traditional centered header, underline sections' },
  { id: 'modern', name: 'Modern', description: 'Left-aligned, blue color bar sections, arrow bullets' },
  { id: 'professional', name: 'Professional', description: 'Centered header, boxed sections, dash bullets' },
  { id: 'minimal', name: 'Minimal', description: 'Clean left-aligned, no section borders' },
];