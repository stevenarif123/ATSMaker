const CORE_KEYWORDS = ['leadership', 'roadmap', 'data', 'stakeholder', 'experimentation', 'hiring']

export function generateInsights(sections = []) {
  const acceptedSections = sections.filter((section) => section?.accepted)
  const warnings = []
  const keywords = new Set()

  const requiredMissing = sections.filter((section) => section?.required && !section.accepted)
  requiredMissing.forEach((section) => warnings.push(`${section.title} is missing`))

  acceptedSections.forEach((section) => {
    section.fields?.forEach((field) => {
      if (!field?.value) return
      if (field.type === 'list') {
        toList(field.value).forEach((value) => keywords.add(value.toLowerCase()))
        return
      }
      field.value
        .split(/[,/\n]/)
        .map((token) => token.trim())
        .filter(Boolean)
        .forEach((value) => keywords.add(value.toLowerCase()))
    })
  })

  const experienceSection = acceptedSections.find((section) => section.id === 'experience')
  if (experienceSection) {
    const timelineField = experienceSection.fields.find((field) => field.id === 'timeline')
    const years = (timelineField?.value?.match(/(19|20)\d{2}/g) ?? []).map(Number)
    if (years.length >= 2) {
      const sortedYears = years.sort((a, b) => a - b)
      const gap = sortedYears[sortedYears.length - 1] - sortedYears[0]
      if (gap > 8) {
        warnings.push('Experience timeline spans a large gap—highlight promotions or transitions to avoid ATS penalties.')
      }
    } else if (!timelineField?.value) {
      warnings.push('Experience dates look incomplete. Add clear start/end years to avoid ATS confusion.')
    }
  }

  const missingKeywords = CORE_KEYWORDS.filter((keyword) => !keywords.has(keyword))
  if (missingKeywords.length) {
    warnings.push(`Add keywords related to ${missingKeywords.slice(0, 3).join(', ')} to improve scoring.`)
  }

  if (!acceptedSections.length) {
    warnings.push('No sections are selected to merge. Accept at least one section.')
  }

  return {
    keywords: Array.from(keywords)
      .slice(0, 20)
      .map((word) => capitalize(word)),
    warnings,
    stats: {
      totalParsed: sections.length,
      accepted: acceptedSections.length,
      requiredMissing: requiredMissing.map((section) => section.title),
    },
  }
}

function toList(value) {
  if (Array.isArray(value)) return value
  if (!value) return []
  return String(value)
    .split(/[\n,]/)
    .map((token) => token.trim())
    .filter(Boolean)
}

function capitalize(word) {
  if (!word) return ''
  return word.charAt(0).toUpperCase() + word.slice(1)
}
