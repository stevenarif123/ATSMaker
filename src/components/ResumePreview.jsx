export default function ResumePreview({ data }) {
  const { personalInfo, experience, education, skills, projects } = data;

  return (
    <div className="bg-white text-black p-8 max-w-[210mm] mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{personalInfo.fullName || 'Your Name'}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.website && <span>{personalInfo.website}</span>}
          {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
          {personalInfo.github && <span>{personalInfo.github}</span>}
        </div>
      </header>

      {/* Summary */}
      {personalInfo.summary && (
        <section className="mb-6">
          <h2 className="text-lg font-bold mb-2 border-b-2 border-gray-300 pb-1">Professional Summary</h2>
          <p className="text-sm leading-relaxed">{personalInfo.summary}</p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold mb-3 border-b-2 border-gray-300 pb-1">Professional Experience</h2>
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id} className="mb-4">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="font-bold">{exp.position}</h3>
                    <div className="text-sm italic">{exp.company} • {exp.location}</div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                  </div>
                </div>
                {exp.bullets && exp.bullets.length > 0 && (
                  <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                    {exp.bullets.map((bullet, index) => (
                      <li key={index}>{bullet}</li>
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
        <section className="mb-6">
          <h2 className="text-lg font-bold mb-3 border-b-2 border-gray-300 pb-1">Education</h2>
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id} className="mb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold">{edu.degree}</h3>
                    <div className="text-sm">{edu.school} • {edu.location}</div>
                    {edu.gpa && <div className="text-sm">GPA: {edu.gpa}</div>}
                  </div>
                  <div className="text-sm text-gray-600">
                    {edu.startDate} - {edu.endDate}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold mb-3 border-b-2 border-gray-300 pb-1">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span key={skill.id} className="bg-gray-100 px-2 py-1 text-sm rounded">
                {skill.name}
                {skill.level && ` (${skill.level})`}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold mb-3 border-b-2 border-gray-300 pb-1">Projects</h2>
          <div className="space-y-3">
            {projects.map((project) => (
              <div key={project.id} className="mb-3">
                <h3 className="font-bold">{project.name}</h3>
                {project.description && (
                  <p className="text-sm mt-1">{project.description}</p>
                )}
                {project.technologies && project.technologies.length > 0 && (
                  <div className="text-sm mt-1">
                    <span className="font-medium">Technologies: </span>
                    {project.technologies.join(', ')}
                  </div>
                )}
                {project.url && (
                  <div className="text-sm mt-1">
                    <a href={project.url} className="text-blue-600 hover:underline">
                      {project.url}
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}