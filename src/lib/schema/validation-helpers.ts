import { z } from 'zod';

// ATS cleanup utilities
export const atsCleanup = {
  // Normalize whitespace and remove illegal characters
  cleanString: (input: string): string => {
    return input
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
      .trim();
  },

  // Clean array of strings
  cleanStringArray: (input: string[]): string[] => {
    return input
      .map(str => atsCleanup.cleanString(str))
      .filter(str => str.length > 0);
  },

  // Validate email format for ATS
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  },

  // Validate phone number format
  validatePhone: (phone: string): boolean => {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  },

  // Extract keywords from text
  extractKeywords: (text: string): string[] => {
    const cleaned = atsCleanup.cleanString(text.toLowerCase());
    const words = cleaned.split(/\s+/);
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'shall']);
    
    return words
      .filter(word => word.length > 2 && !commonWords.has(word))
      .filter((word, index, array) => array.indexOf(word) === index)
      .sort();
  },
};

// Date validation helpers
export const dateHelpers = {
  // Validate date range
  validateDateRange: (startDate: string, endDate?: string | null, current?: boolean): boolean => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;
    
    if (isNaN(start.getTime())) return false;
    if (end && isNaN(end.getTime())) return false;
    if (end && start > end && !current) return false;
    
    return true;
  },

  // Format date for display
  formatDate: (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  },

  // Format date range for display
  formatDateRange: (startDate: string, endDate?: string | null, current?: boolean): string => {
    const start = dateHelpers.formatDate(startDate);
    if (current) return `${start} - Present`;
    if (endDate) return `${start} - ${dateHelpers.formatDate(endDate)}`;
    return start;
  },
};

// Custom Zod refinements
export const customValidations = {
  // Email validation with ATS cleanup
  emailWithCleanup: z.string().transform(atsCleanup.cleanString).refine(
    (email) => atsCleanup.validateEmail(email),
    { message: 'Invalid email address' }
  ),

  // Phone validation with ATS cleanup
  phoneWithCleanup: z.string().transform(atsCleanup.cleanString).refine(
    (phone) => atsCleanup.validatePhone(phone),
    { message: 'Invalid phone number' }
  ),

  // Date range validation
  dateRangeValidation: z.object({
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().nullable().optional(),
    current: z.boolean().default(false),
  }).refine(
    (data) => dateHelpers.validateDateRange(data.startDate, data.endDate, data.current),
    { message: 'Invalid date range' }
  ),

  // String cleanup validation
  cleanString: z.string().transform(atsCleanup.cleanString),

  // String array cleanup
  cleanStringArray: z.array(z.string()).transform(atsCleanup.cleanStringArray),
};

// Resume validation helpers
export const resumeValidation = {
  // Validate complete resume
  validateResume: (resume: any) => {
    // Check required sections
    const requiredSections = ['personalInfo', 'summary', 'workExperience', 'education', 'skills'];
    const missingSections = requiredSections.filter(section => !resume[section]);
    
    if (missingSections.length > 0) {
      return {
        isValid: false,
        errors: [`Missing required sections: ${missingSections.join(', ')}`]
      };
    }

    // Validate work experience dates
    const invalidDates = resume.workExperience?.filter((exp: any) => 
      !dateHelpers.validateDateRange(exp.dateRange.startDate, exp.dateRange.endDate, exp.dateRange.current)
    ) || [];

    if (invalidDates.length > 0) {
      return {
        isValid: false,
        errors: ['Invalid date ranges in work experience']
      };
    }

    return { isValid: true, errors: [] };
  },

  // Get resume completeness score
  getCompletenessScore: (resume: any): number => {
    let score = 0;
    const maxScore = 100;

    // Personal info (20 points)
    if (resume.personalInfo?.fullName) score += 5;
    if (resume.personalInfo?.title) score += 5;
    if (resume.personalInfo?.summary) score += 5;
    if (resume.personalInfo?.contact?.email && resume.personalInfo?.contact?.phone) score += 5;

    // Work experience (25 points)
    if (resume.workExperience?.length > 0) {
      score += Math.min(15, resume.workExperience.length * 5);
      const hasAchievements = resume.workExperience.some((exp: any) => exp.achievements?.length > 0);
      if (hasAchievements) score += 10;
    }

    // Education (15 points)
    if (resume.education?.length > 0) {
      score += Math.min(15, resume.education.length * 8);
    }

    // Projects (15 points)
    if (resume.projects?.length > 0) {
      score += Math.min(15, resume.projects.length * 5);
    }

    // Skills (15 points)
    if (resume.skills?.technical?.length > 0) score += 8;
    if (resume.skills?.soft?.length > 0) score += 7;

    // Certifications (10 points)
    if (resume.certifications?.length > 0) {
      score += Math.min(10, resume.certifications.length * 3);
    }

    return Math.min(score, maxScore);
  },

  // Extract keywords from resume
  extractKeywords: (resume: any): string[] => {
    const allText = [
      resume.personalInfo?.summary || '',
      resume.summary || '',
      ...(resume.workExperience || []).map((exp: any) => exp.description).join(' '),
      ...(resume.workExperience || []).flatMap((exp: any) => 
        (exp.achievements || []).map((ach: any) => ach.description)
      ).join(' '),
      ...(resume.projects || []).map((proj: any) => proj.description).join(' '),
      ...(resume.skills?.technical || []).flatMap((cat: any) => cat.skills).join(' '),
      ...(resume.skills?.soft || []).flatMap((cat: any) => cat.skills).join(' '),
    ].join(' ');

    return atsCleanup.extractKeywords(allText);
  },
};