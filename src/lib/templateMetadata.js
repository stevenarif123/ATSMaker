// Shared template metadata for PDF and DOCX exporters
export const TEMPLATE_COLORS = {
  classic: {
    text: [51, 51, 51],
    textDark: [0, 0, 0],
    textMuted: [85, 85, 85],
    accent: [0, 51, 153],
    headerAlign: 'center'
  },
  modern: {
    text: [55, 65, 81],
    textDark: [17, 24, 39],
    textMuted: [107, 114, 128],
    accent: [37, 99, 235],
    headerAlign: 'left'
  },
  professional: {
    text: [31, 41, 55],
    textDark: [17, 24, 39],
    textMuted: [75, 85, 99],
    accent: [5, 150, 105],
    headerAlign: 'center'
  },
  minimal: {
    text: [24, 24, 27],
    textDark: [9, 9, 11],
    textMuted: [82, 82, 91],
    accent: [24, 24, 27],
    headerAlign: 'left'
  }
};

// Helper to normalize text - remove extra newlines and whitespace
export const normalizeText = (text) => {
  if (!text) return '';
  return text.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
};

// Helper to format date range
export const formatDateRange = (startDate, endDate, isCurrent) => {
  const start = startDate || '';
  const end = isCurrent ? 'Present' : (endDate || '');
  return `${start} – ${end}`;
};

// Helper to format location
export const formatLocation = (city, state, country) => {
  const parts = [city, state, country].filter(Boolean);
  return parts.join(', ');
};

// Helper to generate filename
export const generateFilename = (fullName, versionName, extension) => {
  const name = fullName || 'Resume';
  const version = versionName ? `-${versionName}` : '';
  return `${name}${version}.${extension}`;
};