export const SECTION_TEMPLATES = [
  {
    id: 'summary',
    title: 'Professional Summary',
    required: true,
    fields: [
      {
        id: 'headline',
        label: 'Headline',
        type: 'text',
        placeholder: 'Product leader focused on growth and experimentation',
      },
      {
        id: 'overview',
        label: 'Overview',
        type: 'textarea',
        placeholder: '3-4 sentences that describe your focus, scope, and impact.',
      },
    ],
  },
  {
    id: 'experience',
    title: 'Most Recent Role',
    required: true,
    fields: [
      { id: 'role', label: 'Role', type: 'text', placeholder: 'Senior Product Manager' },
      { id: 'company', label: 'Company', type: 'text', placeholder: 'Northwind' },
      { id: 'timeline', label: 'Dates', type: 'text', placeholder: '2019 - Present' },
      {
        id: 'impact',
        label: 'Impact summary',
        type: 'textarea',
        placeholder: 'Summarize scope, org size, and measurable wins.',
      },
    ],
  },
  {
    id: 'education',
    title: 'Education',
    required: false,
    fields: [
      { id: 'school', label: 'School', type: 'text', placeholder: 'University of Example' },
      { id: 'degree', label: 'Degree / Program', type: 'text', placeholder: 'B.S. Computer Science' },
      { id: 'graduation', label: 'Graduation', type: 'text', placeholder: '2021' },
    ],
  },
  {
    id: 'skills',
    title: 'Skills & Keywords',
    required: true,
    fields: [
      {
        id: 'skillsList',
        label: 'Core skills',
        type: 'list',
        placeholder: 'Enter one skill per line or separate with commas',
      },
      {
        id: 'tools',
        label: 'Tools & Platforms',
        type: 'list',
        placeholder: 'Figma, Jira, SQL, Mixpanel',
      },
    ],
  },
  {
    id: 'projects',
    title: 'Highlighted Project',
    required: false,
    fields: [
      {
        id: 'project',
        label: 'Project summary',
        type: 'textarea',
        placeholder: 'Outline the challenge, approach, and impact.',
      },
    ],
  },
]

const SECTION_EXTRACTORS = {
  summary: extractSummary,
  experience: extractExperience,
  education: extractEducation,
  skills: extractSkills,
  projects: extractProjects,
}

export function hydrateSectionsFromText(text) {
  const normalized = normalizeText(text)
  return SECTION_TEMPLATES.map((template) => {
    const extractor = SECTION_EXTRACTORS[template.id]
    const values = extractor ? extractor(normalized) : {}
    return materializeSection(template, values)
  })
}

export function hydrateSectionsFromJson(payload) {
  // Handle legacy format where personalInfo, experience, etc. are at root level
  const normalizedPayload = normalizeLegacyPayload(payload)
  
  return SECTION_TEMPLATES.map((template) => {
    const data = mapJsonValue(normalizedPayload?.[template.id], template)
    return materializeSection(template, data)
  })
}

/**
 * Normalize legacy JSON format (personalInfo at root) to section-based format
 */
function normalizeLegacyPayload(payload) {
  if (!payload) return {}
  
  // If payload already has sections in expected format, return as-is
  if (payload.summary && typeof payload.summary === 'object') {
    return payload
  }
  
  // Handle legacy format with personalInfo, experience, etc. at root level
  const normalized = {}
  
  // Summary section from personalInfo
  if (payload.personalInfo) {
    normalized.summary = {
      headline: payload.personalInfo.fullName || '',
      overview: payload.personalInfo.summary || ''
    }
  }
  
  // Experience section - use first experience entry
  if (payload.experience && Array.isArray(payload.experience) && payload.experience.length > 0) {
    const exp = payload.experience[0]
    normalized.experience = {
      role: exp.position || '',
      company: exp.company || '',
      timeline: formatDateRange(exp.startDate, exp.endDate, exp.current),
      impact: Array.isArray(exp.bullets) ? exp.bullets.join('\n') : ''
    }
  }
  
  // Education section - use first education entry
  if (payload.education && Array.isArray(payload.education) && payload.education.length > 0) {
    const edu = payload.education[0]
    normalized.education = {
      school: edu.school || '',
      degree: edu.degree || '',
      graduation: edu.endDate || ''
    }
  }
  
  // Skills section
  if (payload.skills && Array.isArray(payload.skills)) {
    const skillNames = payload.skills.map(s => typeof s === 'string' ? s : s.name).filter(Boolean)
    normalized.skills = {
      skillsList: skillNames.slice(0, 8),
      tools: skillNames.slice(8)
    }
  }
  
  // Projects section - use first project
  if (payload.projects && Array.isArray(payload.projects) && payload.projects.length > 0) {
    const proj = payload.projects[0]
    normalized.projects = {
      project: proj.description || proj.name || ''
    }
  }
  
  return normalized
}

function formatDateRange(start, end, current) {
  const startStr = start || ''
  const endStr = current ? 'Present' : (end || '')
  if (!startStr && !endStr) return ''
  return `${startStr} - ${endStr}`
}

function mapJsonValue(source, template) {
  if (source == null) return {}
  if (typeof source === 'string') {
    if (template.fields.length === 1) {
      return { [template.fields[0].id]: source }
    }
    if (template.id === 'summary') {
      return { overview: source }
    }
    return {}
  }
  if (Array.isArray(source)) {
    if (!source.length) return {}
    const first = source[0]
    if (typeof first === 'string') {
      return template.fields.length === 1
        ? { [template.fields[0].id]: source.join('\n') }
        : { [template.fields[0].id]: first }
    }
    if (typeof first === 'object') {
      return first
    }
    return {}
  }
  if (typeof source === 'object') {
    return source
  }
  return {}
}

function materializeSection(template, values = {}) {
  return {
    ...template,
    accepted: template.required,
    fields: template.fields.map((field) => ({
      ...field,
      value: deriveFieldValue(field, values[field.id]),
    })),
  }
}

function deriveFieldValue(field, candidate) {
  if (candidate == null) return ''
  if (typeof candidate === 'string') return candidate.trim()
  if (Array.isArray(candidate)) {
    const items = candidate.map((item) => String(item ?? '').trim()).filter(Boolean)
    return field.type === 'list' ? items.join('\n') : items.join(', ')
  }
  if (typeof candidate === 'object') {
    if (candidate[field.id]) return deriveFieldValue(field, candidate[field.id])
    if ('value' in candidate) return deriveFieldValue(field, candidate.value)
  }
  return String(candidate ?? '').trim()
}

function normalizeText(text) {
  return text.replace(/\r\n/g, '\n').trim()
}

function extractSummary(text) {
  const block = extractBlock(text, ['professional summary', 'summary'])
  if (!block) {
    const [firstParagraph = '', ...rest] = text.split('\n\n').map((chunk) => chunk.trim()).filter(Boolean)
    return {
      headline: firstParagraph.split('\n')[0]?.slice(0, 120) ?? '',
      overview: rest.join(' ').slice(0, 600) || firstParagraph,
    }
  }
  const [headlineLine, ...restLines] = block.split('\n').map((line) => line.trim()).filter(Boolean)
  return {
    headline: headlineLine ?? '',
    overview: restLines.join(' ').slice(0, 600) || block,
  }
}

function extractExperience(text) {
  const block = extractBlock(text, ['experience', 'work history', 'employment'])
  if (!block) return {}
  const lines = block.split('\n').map((line) => line.trim()).filter(Boolean)
  if (!lines.length) return {}
  const firstLine = lines[0]
  const [role = firstLine, company = lines[1] ?? ''] = firstLine.includes(' at ')
    ? firstLine.split(' at ').map((chunk) => chunk.trim())
    : [firstLine, lines[1] ?? '']
  const timeline = lines.find((line) => /20\d{2}/.test(line)) ?? ''
  const impact = lines
    .filter((line) => line !== firstLine && line !== company && line !== timeline)
    .join('\n')
  return {
    role,
    company,
    timeline,
    impact,
  }
}

function extractEducation(text) {
  const block = extractBlock(text, ['education', 'academics'])
  if (!block) return {}
  const lines = block.split('\n').map((line) => line.trim()).filter(Boolean)
  return {
    school: lines[0] ?? '',
    degree: lines[1] ?? '',
    graduation: lines.find((line) => /(19|20)\d{2}/.test(line)) ?? '',
  }
}

function extractSkills(text) {
  const block = extractBlock(text, ['skills', 'skills & tools', 'expertise'])
  if (!block) return {}
  const tokens = block
    .replace(/[-•]/g, ' ')
    .split(/[,\n]/)
    .map((token) => token.trim())
    .filter(Boolean)
  const midpoint = Math.min(tokens.length, 8)
  return {
    skillsList: tokens.slice(0, midpoint),
    tools: tokens.slice(midpoint),
  }
}

function extractProjects(text) {
  const block = extractBlock(text, ['projects', 'case studies'])
  return { project: block }
}

function extractBlock(text, labels) {
  for (const label of labels) {
    const pattern = new RegExp(`${label}\\s*(?:\\n|:)([\\s\\S]*?)(?=\\n[A-Z][A-Za-z\\s]{2,}:|\\n{2,}[A-Z][^\\n]+\\n|$)`, 'i')
    const match = pattern.exec(text)
    if (match?.[1]) {
      return match[1].trim()
    }
  }
  return ''
}
