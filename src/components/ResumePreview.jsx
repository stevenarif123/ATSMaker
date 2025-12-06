import { TEMPLATE_CONFIGS } from '../lib/templateConfig';

export default function ResumePreview({ id, data, template = 'classic' }) {
  const { personalInfo, experience, education, skills, projects, certifications, languages, links, customSections } = data;

  const colors = TEMPLATE_CONFIGS[template] || TEMPLATE_CONFIGS.classic;
  const layout = colors.layout || 'single-column';

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
          color: colors.accentColorColor,
          borderLeft: `3px solid ${colors.accentColorColor}`,
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

  // Render sidebar layout
  const renderSidebarLayout = () => (
    <div 
      id={id} 
      style={{ 
        fontFamily: '"Times New Roman", Times, serif', 
        width: '816px', 
        minHeight: '1056px',
        display: 'flex',
        backgroundColor: '#ffffff',
        color: colors.text,
        lineHeight: '1.4'
      }}
    >
      {/* Sidebar */}
      <aside style={{
        width: colors.sidebarWidth || '25%',
        backgroundColor: colors.sidebarBg || '#f3f4f6',
        padding: '40px 25px',
        color: colors.text,
        borderRight: `1px solid ${colors.border}`,
      }}>
        <h1 style={{ 
          fontSize: colors.nameSize, 
          fontWeight: 'bold', 
          color: colors.accentColor,
          marginBottom: '16px',
          letterSpacing: '0.5px'
        }}>
          {personalInfo.fullName || 'Your Name'}
        </h1>
        
        {/* Contact Info in Sidebar */}
        <div style={{ fontSize: '9px', color: colors.textMuted, marginBottom: '16px', lineHeight: '1.6' }}>
          {personalInfo.email && <div>{personalInfo.email}</div>}
          {personalInfo.phone && <div>{personalInfo.phone}</div>}
          {personalInfo.location && <div>{personalInfo.location}</div>}
          {personalInfo.linkedin && <div><a href={formatUrl(personalInfo.linkedin, 'linkedin')} style={{ color: colors.accentColor, textDecoration: 'none' }}>LinkedIn</a></div>}
          {personalInfo.github && <div><a href={formatUrl(personalInfo.github, 'github')} style={{ color: colors.accentColor, textDecoration: 'none' }}>GitHub</a></div>}
        </div>

        {/* Skills in Sidebar */}
        {skills.length > 0 && (
          <section style={{ marginBottom: '16px' }}>
            <h2 style={{ ...getSectionTitleStyle(), fontSize: colors.sectionTitleSize, marginBottom: '8px' }}>
              Skills
            </h2>
            <div style={{ fontSize: '9px', color: colors.text, lineHeight: '1.6' }}>
              {skills.map((skill, index) => (
                <div key={skill.id} style={{ marginBottom: '4px' }}>
                  {skill.name}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Languages in Sidebar */}
        {languages && languages.length > 0 && (
          <section style={{ marginBottom: '16px' }}>
            <h2 style={{ ...getSectionTitleStyle(), fontSize: colors.sectionTitleSize, marginBottom: '8px' }}>
              Languages
            </h2>
            <div style={{ fontSize: '9px', color: colors.text, lineHeight: '1.6' }}>
              {languages.map((lang, index) => (
                <div key={lang.id || index} style={{ marginBottom: '4px' }}>
                  {lang.name}{lang.level && ` (${lang.level})`}
                </div>
              ))}
            </div>
          </section>
        )}
      </aside>

      {/* Main Content */}
      <main style={{
        flex: 1,
        padding: '40px 35px',
      }}>
        {/* Summary */}
        {personalInfo.summary && (
          <section style={{ marginBottom: '12px' }}>
            <h2 style={getSectionTitleStyle()}>
              Professional Summary
            </h2>
            <p style={{ fontSize: '9px', lineHeight: '1.4', color: colors.text, textAlign: 'left', marginBottom: '0' }}>{normalizeText(personalInfo.summary)}</p>
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <section style={{ marginBottom: '12px' }}>
            <h2 style={getSectionTitleStyle()}>
              Professional Experience
            </h2>
            <div>
              {experience.map((exp, expIndex) => (
                <div key={exp.id} style={{ marginBottom: expIndex < experience.length - 1 ? '8px' : '0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h3 style={{ fontSize: '10px', fontWeight: 'bold', color: colors.textDark, margin: '0 0 2px 0' }}>{exp.position}</h3>
                    <span style={{ fontSize: '9px', color: colors.textLight }}>
                      {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <div style={{ fontSize: '9px', color: colors.textMuted, fontStyle: 'italic', marginBottom: '2px' }}>
                    {exp.company}{exp.location ? `, ${exp.location}` : ''}
                  </div>
                  {exp.bullets && exp.bullets.length > 0 && (
                    <ul style={{ fontSize: '9px', color: colors.text, margin: '0', paddingLeft: '14px', listStyleType: 'disc' }}>
                      {exp.bullets.map((bullet, index) => (
                        <li key={index} style={{ marginBottom: '1px', lineHeight: '1.3', textAlign: 'left' }}>
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
          <section style={{ marginBottom: '12px' }}>
            <h2 style={getSectionTitleStyle()}>
              Education
            </h2>
            <div>
              {education.map((edu, eduIndex) => (
                <div key={edu.id} style={{ marginBottom: eduIndex < education.length - 1 ? '6px' : '0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h3 style={{ fontSize: '10px', fontWeight: 'bold', color: colors.textDark, margin: '0 0 2px 0' }}>{edu.degree}</h3>
                    <span style={{ fontSize: '9px', color: colors.textLight }}>
                      {edu.startDate} – {edu.endDate}
                    </span>
                  </div>
                  <div style={{ fontSize: '9px', color: colors.textMuted }}>
                    {edu.school}{edu.location ? `, ${edu.location}` : ''}
                    {edu.gpa && <span> | GPA: {edu.gpa}</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <section style={{ marginBottom: '12px' }}>
            <h2 style={getSectionTitleStyle()}>
              Projects
            </h2>
            <div>
              {projects.map((project, projIndex) => (
                <div key={project.id} style={{ marginBottom: projIndex < projects.length - 1 ? '8px' : '0' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '10px', fontWeight: 'bold', color: colors.textDark, margin: '0' }}>{project.name}</h3>
                    {project.url && (
                      <a 
                        href={project.url.startsWith('http') ? project.url : `https://${project.url}`}
                        style={{ fontSize: '8px', color: colors.accentColor, textDecoration: 'none' }}
                      >
                        {project.url}
                      </a>
                    )}
                  </div>
                  <p style={{ fontSize: '9px', color: colors.text, marginTop: '1px', lineHeight: '1.3', textAlign: 'left', margin: '0' }}>{normalizeText(project.description)}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );

  // Render two-column layout
  const renderTwoColumnLayout = () => (
    <div 
      id={id} 
      style={{ 
        fontFamily: '"Times New Roman", Times, serif', 
        width: '816px', 
        minHeight: '1056px',
        display: 'flex',
        backgroundColor: '#ffffff',
        color: colors.text,
        lineHeight: '1.4'
      }}
    >
      {/* Left Column */}
      <aside style={{
        width: colors.sidebarWidth || '35%',
        padding: '40px 25px',
        color: colors.text,
        borderRight: `1px solid ${colors.border}`,
      }}>
        <h1 style={{ 
          fontSize: colors.nameSize, 
          fontWeight: 'bold', 
          color: colors.textDark,
          marginBottom: '12px',
          letterSpacing: '0.5px'
        }}>
          {personalInfo.fullName || 'Your Name'}
        </h1>
        
        {/* Contact Info */}
        <div style={{ fontSize: '8px', color: colors.textMuted, marginBottom: '12px', lineHeight: '1.5' }}>
          {personalInfo.email && <div>{personalInfo.email}</div>}
          {personalInfo.phone && <div>{personalInfo.phone}</div>}
          {personalInfo.location && <div>{personalInfo.location}</div>}
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <section style={{ marginBottom: '12px' }}>
            <h2 style={{ ...getSectionTitleStyle(), fontSize: '9px', marginBottom: '6px' }}>
              Skills
            </h2>
            <div style={{ fontSize: '8px', color: colors.text, lineHeight: '1.5' }}>
              {skills.map((skill) => (
                <div key={skill.id} style={{ marginBottom: '3px' }}>
                  {skill.name}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Languages */}
        {languages && languages.length > 0 && (
          <section style={{ marginBottom: '12px' }}>
            <h2 style={{ ...getSectionTitleStyle(), fontSize: '9px', marginBottom: '6px' }}>
              Languages
            </h2>
            <div style={{ fontSize: '8px', color: colors.text, lineHeight: '1.5' }}>
              {languages.map((lang) => (
                <div key={lang.id} style={{ marginBottom: '3px' }}>
                  {lang.name}{lang.level && ` (${lang.level})`}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Summary */}
        {personalInfo.summary && (
          <section style={{ marginBottom: '12px' }}>
            <h2 style={{ ...getSectionTitleStyle(), fontSize: '9px', marginBottom: '6px' }}>
              Summary
            </h2>
            <p style={{ fontSize: '8px', lineHeight: '1.3', color: colors.text, textAlign: 'left', margin: '0' }}>{normalizeText(personalInfo.summary)}</p>
          </section>
        )}
      </aside>

      {/* Right Column */}
      <main style={{
        flex: 1,
        padding: '40px 30px',
      }}>
        {/* Experience */}
        {experience.length > 0 && (
          <section style={{ marginBottom: '12px' }}>
            <h2 style={getSectionTitleStyle()}>
              Experience
            </h2>
            <div>
              {experience.map((exp, expIndex) => (
                <div key={exp.id} style={{ marginBottom: expIndex < experience.length - 1 ? '8px' : '0' }}>
                  <h3 style={{ fontSize: '10px', fontWeight: 'bold', color: colors.textDark, margin: '0 0 2px 0' }}>{exp.position}</h3>
                  <div style={{ fontSize: '9px', color: colors.textMuted, fontStyle: 'italic', marginBottom: '2px' }}>
                    {exp.company} {exp.location && `• ${exp.location}`}
                  </div>
                  <div style={{ fontSize: '9px', color: colors.textLight, marginBottom: '3px' }}>
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </div>
                  {exp.bullets && exp.bullets.length > 0 && (
                    <ul style={{ fontSize: '9px', color: colors.text, margin: '0', paddingLeft: '14px', listStyleType: 'disc' }}>
                      {exp.bullets.map((bullet, index) => (
                        <li key={index} style={{ marginBottom: '1px', lineHeight: '1.3' }}>
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
          <section style={{ marginBottom: '12px' }}>
            <h2 style={getSectionTitleStyle()}>
              Education
            </h2>
            <div>
              {education.map((edu, eduIndex) => (
                <div key={edu.id} style={{ marginBottom: eduIndex < education.length - 1 ? '6px' : '0' }}>
                  <h3 style={{ fontSize: '10px', fontWeight: 'bold', color: colors.textDark, margin: '0 0 2px 0' }}>{edu.degree}</h3>
                  <div style={{ fontSize: '9px', color: colors.textMuted }}>
                    {edu.school}{edu.location && ` • ${edu.location}`}
                  </div>
                  <div style={{ fontSize: '9px', color: colors.textLight }}>
                    {edu.startDate} – {edu.endDate}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <section style={{ marginBottom: '12px' }}>
            <h2 style={getSectionTitleStyle()}>
              Projects
            </h2>
            <div>
              {projects.map((project, projIndex) => (
                <div key={project.id} style={{ marginBottom: projIndex < projects.length - 1 ? '8px' : '0' }}>
                  <h3 style={{ fontSize: '10px', fontWeight: 'bold', color: colors.textDark, margin: '0 0 2px 0' }}>{project.name}</h3>
                  <p style={{ fontSize: '9px', color: colors.text, margin: '0 0 2px 0', lineHeight: '1.3' }}>{normalizeText(project.description)}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );

  // Render single-column layout (default)
  const singleColumnLayout = (
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
          <div style={{ fontSize: '10px', color: colors.accentColor }}>
            {personalInfo.linkedin && (
              <a 
                href={formatUrl(personalInfo.linkedin, 'linkedin')} 
                style={{ color: colors.accentColor, textDecoration: 'none' }}
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
                style={{ color: colors.accentColor, textDecoration: 'none' }}
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
                      style={{ fontSize: '9px', color: colors.accentColor, textDecoration: 'none' }}
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
                    style={{ fontSize: '9px', color: colors.accentColor, textDecoration: 'none' }}
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
                  style={{ color: colors.accentColor, textDecoration: 'none' }}
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

  // Route to appropriate layout renderer
  if (layout === 'sidebar') {
    return renderSidebarLayout();
  } else if (layout === 'two-column') {
    return renderTwoColumnLayout();
  } else {
    return singleColumnLayout;
  }
}

// Export template options for use in other components
export const RESUME_TEMPLATES = Object.values(TEMPLATE_CONFIGS).map(config => ({
  id: config.id,
  name: config.name,
  description: config.description,
  category: config.category,
  layout: config.layout,
  accentColor: config.accentColor,
}));

// Also export full config for template selector if needed
export { TEMPLATE_CONFIGS, TEMPLATE_CATEGORIES } from '../lib/templateConfig';