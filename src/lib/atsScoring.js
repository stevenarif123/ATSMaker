// ATS Scoring Utility
// Rule-based scoring system for resume ATS compatibility

// Common action verbs for bullet point analysis
const ACTION_VERBS = new Set([
  'achieved', 'administered', 'analyzed', 'built', 'collaborated', 'created',
  'designed', 'developed', 'directed', 'established', 'executed', 'generated',
  'implemented', 'improved', 'increased', 'initiated', 'launched', 'led',
  'managed', 'optimized', 'organized', 'planned', 'reduced', 'streamlined',
  'supervised', 'transformed', 'accelerated', 'architected', 'automated',
  'delivered', 'drove', 'engineered', 'enhanced', 'expanded', 'facilitated',
  'founded', 'headed', 'identified', 'integrated', 'maintained', 'maximized',
  'migrated', 'modernized', 'negotiated', 'orchestrated', 'pioneered',
  'produced', 'programmed', 'published', 'redesigned', 'resolved',
  'restructured', 'scaled', 'spearheaded', 'standardized', 'strengthened'
]);

// Common stop words to filter out
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has',
  'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was',
  'will', 'with', 'the', 'this', 'but', 'they', 'have', 'had', 'what',
  'when', 'where', 'who', 'which', 'why', 'how', 'all', 'each', 'every',
  'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor',
  'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'can', 'just',
  'should', 'now'
]);

// Extract keywords from text
function extractKeywords(text) {
  if (!text) return [];
  
  // Convert to lowercase and split into words
  const words = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ') // Remove special chars except hyphens
    .split(/\s+/)
    .filter(word => word.length > 2); // At least 3 characters
  
  // Remove stop words and get unique words
  const keywords = [...new Set(
    words.filter(word => !STOP_WORDS.has(word))
  )];
  
  // Also extract multi-word technical terms (2-3 words)
  const multiWordTerms = [];
  const terms = text.toLowerCase().match(/\b[a-z][a-z0-9]*(?:[-\s][a-z0-9]+){1,2}\b/g) || [];
  terms.forEach(term => {
    if (term.length > 5 && !term.split(/[-\s]/).every(word => STOP_WORDS.has(word))) {
      multiWordTerms.push(term.replace(/\s+/g, '-'));
    }
  });
  
  return [...keywords, ...multiWordTerms];
}

// Score section completeness (0-20 points)
function scoreSectionCompleteness(resume) {
  const recommendations = [];
  let score = 0;
  
  // Personal Info (required fields)
  const { personalInfo } = resume;
  if (personalInfo.fullName) score += 3;
  else recommendations.push('Add your full name');
  
  if (personalInfo.email) score += 2;
  else recommendations.push('Add your email address');
  
  if (personalInfo.phone) score += 2;
  else recommendations.push('Add your phone number');
  
  if (personalInfo.location) score += 1;
  else recommendations.push('Add your location');
  
  // Summary
  if (personalInfo.summary && personalInfo.summary.length >= 50) {
    score += 2;
  } else if (personalInfo.summary) {
    score += 1;
    recommendations.push('Expand your professional summary (at least 50 characters)');
  } else {
    recommendations.push('Add a professional summary');
  }
  
  // Experience
  if (resume.experience && resume.experience.length > 0) {
    score += 4;
  } else {
    recommendations.push('Add at least one work experience entry');
  }
  
  // Education
  if (resume.education && resume.education.length > 0) {
    score += 3;
  } else {
    recommendations.push('Add at least one education entry');
  }
  
  // Skills
  if (resume.skills && resume.skills.length >= 5) {
    score += 3;
  } else if (resume.skills && resume.skills.length > 0) {
    score += 1;
    recommendations.push(`Add more skills (currently ${resume.skills.length}, aim for 5+)`);
  } else {
    recommendations.push('Add your skills');
  }
  
  return { score, recommendations, maxScore: 20 };
}

// Score bullet depth (0-25 points)
function scoreBulletDepth(resume) {
  const recommendations = [];
  let score = 0;
  let totalBullets = 0;
  let bulletsWithActionVerbs = 0;
  let bulletsWithMetrics = 0;
  let bulletsWithGoodLength = 0;
  
  // Analyze experience bullets
  if (resume.experience) {
    resume.experience.forEach((exp, index) => {
      const bullets = exp.bullets || exp.responsibilities || [];
      if (!bullets || bullets.length === 0) {
        recommendations.push(`Add bullet points to "${exp.position || 'experience entry ' + (index + 1)}"`);
        return;
      }
      
      bullets.forEach(bullet => {
        if (!bullet || bullet.trim().length === 0) return;
        
        totalBullets++;
        const bulletLower = bullet.toLowerCase().trim();
        const words = bulletLower.split(/\s+/);
        
        // Check for action verbs at start
        const firstWord = words[0]?.replace(/[^\w]/g, '');
        if (firstWord && ACTION_VERBS.has(firstWord)) {
          bulletsWithActionVerbs++;
        }
        
        // Check for metrics (numbers, percentages, dollar amounts)
        if (/\d+[%$]?|\$\d+|[0-9]+[kK]?\+?/.test(bullet)) {
          bulletsWithMetrics++;
        }
        
        // Check length (ideal: 10-25 words)
        if (words.length >= 10 && words.length <= 30) {
          bulletsWithGoodLength++;
        }
      });
    });
  }
  
  if (totalBullets === 0) {
    recommendations.push('Add bullet points describing your responsibilities and achievements');
    return { score: 0, recommendations, maxScore: 25 };
  }
  
  // Score based on percentages
  const actionVerbPercent = bulletsWithActionVerbs / totalBullets;
  const metricsPercent = bulletsWithMetrics / totalBullets;
  const lengthPercent = bulletsWithGoodLength / totalBullets;
  
  // Action verbs (0-10 points)
  score += Math.round(actionVerbPercent * 10);
  if (actionVerbPercent < 0.5) {
    recommendations.push('Start more bullet points with strong action verbs (achieved, developed, led, etc.)');
  }
  
  // Metrics (0-10 points)
  score += Math.round(metricsPercent * 10);
  if (metricsPercent < 0.3) {
    recommendations.push('Add quantifiable metrics to your bullet points (numbers, percentages, results)');
  }
  
  // Length (0-5 points)
  score += Math.round(lengthPercent * 5);
  if (lengthPercent < 0.5) {
    recommendations.push('Aim for 10-30 words per bullet point for optimal readability');
  }
  
  return { score, recommendations, maxScore: 25 };
}

// Score formatting safety (0-20 points)
function scoreFormattingSafety(resume) {
  const recommendations = [];
  let score = 20; // Start with perfect score, deduct for issues
  
  // Check for special characters
  const allText = JSON.stringify(resume);
  const specialChars = allText.match(/[^\x00-\x7F]/g);
  if (specialChars && specialChars.length > 5) {
    score -= 5;
    recommendations.push('Minimize special characters and unicode symbols for better ATS compatibility');
  }
  
  // Check for excessive formatting markers
  const formattingChars = allText.match(/[•●○◦▪▫■□★☆]/g);
  if (formattingChars && formattingChars.length > 20) {
    score -= 3;
    recommendations.push('Replace decorative bullets with standard dashes or asterisks');
  }
  
  // Check personal info for @ symbols (except in email)
  const { personalInfo } = resume;
  if (personalInfo.fullName && personalInfo.fullName.includes('@')) {
    score -= 2;
    recommendations.push('Remove special characters from your name');
  }
  
  // Warn about empty sections
  let emptySections = 0;
  if (!resume.experience || resume.experience.length === 0) emptySections++;
  if (!resume.education || resume.education.length === 0) emptySections++;
  if (!resume.skills || resume.skills.length === 0) emptySections++;
  
  if (emptySections >= 2) {
    score -= 5;
  }
  
  return { score: Math.max(0, score), recommendations, maxScore: 20 };
}

// Score experience relevance (0-20 points)
function scoreExperienceRelevance(resume) {
  const recommendations = [];
  let score = 0;
  
  if (!resume.experience || resume.experience.length === 0) {
    recommendations.push('Add work experience entries');
    return { score: 0, recommendations, maxScore: 20 };
  }
  
  const currentYear = new Date().getFullYear();
  let totalYears = 0;
  let recentExperience = false;
  let hasDescriptions = 0;
  
  resume.experience.forEach(exp => {
    // Date coverage (0-8 points)
    if (exp.startDate) {
      const startYear = new Date(exp.startDate).getFullYear();
      const endYear = exp.current ? currentYear : (exp.endDate ? new Date(exp.endDate).getFullYear() : startYear);
      
      const years = endYear - startYear;
      totalYears += Math.max(0, years);
      
      // Check if experience is recent (within last 5 years)
      if (endYear >= currentYear - 5) {
        recentExperience = true;
      }
    }
    
    // Description length (0-12 points)
    const bullets = exp.bullets || exp.responsibilities || [];
    if (bullets && bullets.length > 0) {
      const totalLength = bullets.join(' ').length;
      if (totalLength >= 200) hasDescriptions++;
    }
  });
  
  // Score for date coverage
  if (totalYears >= 3) score += 8;
  else if (totalYears >= 2) score += 6;
  else if (totalYears >= 1) score += 4;
  else score += 2;
  
  if (!recentExperience) {
    recommendations.push('Add recent work experience (within last 5 years)');
  }
  
  // Score for descriptions
  const descriptionPercent = hasDescriptions / resume.experience.length;
  score += Math.round(descriptionPercent * 12);
  
  if (descriptionPercent < 0.5) {
    recommendations.push('Add detailed descriptions (200+ characters) to each experience entry');
  }
  
  return { score, recommendations, maxScore: 20 };
}

// Score length optimization (0-15 points)
function scoreLengthOptimization(resume) {
  const recommendations = [];
  let score = 0;
  
  // Calculate total content length
  const allText = JSON.stringify(resume);
  const characterCount = allText.length;
  
  // Count sections
  const sectionCount = [
    resume.experience?.length > 0,
    resume.education?.length > 0,
    resume.skills?.length > 0,
    resume.projects?.length > 0,
    resume.certifications?.length > 0,
    resume.languages?.length > 0
  ].filter(Boolean).length;
  
  // Ideal range: 2000-8000 characters, 3-5 sections
  if (characterCount >= 2000 && characterCount <= 8000) {
    score += 10;
  } else if (characterCount < 2000) {
    score += Math.round((characterCount / 2000) * 10);
    recommendations.push('Add more content to your resume (aim for more detailed descriptions)');
  } else if (characterCount > 8000) {
    score += Math.max(0, 10 - Math.floor((characterCount - 8000) / 1000));
    recommendations.push('Consider condensing your resume (aim for 1-2 pages)');
  }
  
  // Section diversity
  if (sectionCount >= 4) {
    score += 5;
  } else if (sectionCount >= 3) {
    score += 3;
  } else {
    score += 1;
    recommendations.push('Add more sections (projects, certifications, etc.) to showcase your full profile');
  }
  
  return { score, recommendations, maxScore: 15 };
}

// Keyword analysis
export function analyzeKeywords(resume, jobDescription) {
  if (!jobDescription || !jobDescription.trim()) {
    return {
      jobKeywords: [],
      resumeKeywords: [],
      matchedKeywords: [],
      missingKeywords: [],
      matchRate: 0
    };
  }
  
  // Extract keywords from job description
  const jobKeywords = extractKeywords(jobDescription);
  
  // Extract keywords from resume
  const resumeText = [
    resume.personalInfo?.summary,
    ...(resume.experience?.flatMap(exp => [
      exp.position,
      exp.company,
      exp.description,
      ...(exp.bullets || exp.responsibilities || [])
    ]) || []),
    ...(resume.education?.flatMap(edu => [edu.degree, edu.school, edu.field]) || []),
    ...(resume.skills?.map(skill => skill.name) || []),
    ...(resume.projects?.flatMap(proj => [proj.name, proj.description]) || []),
    ...(resume.certifications?.map(cert => cert.name) || [])
  ].filter(Boolean).join(' ');
  
  const resumeKeywords = extractKeywords(resumeText);
  const resumeKeywordSet = new Set(resumeKeywords.map(k => k.toLowerCase()));
  
  // Find matches and misses
  const matchedKeywords = [];
  const missingKeywords = [];
  
  jobKeywords.forEach(keyword => {
    const keywordLower = keyword.toLowerCase();
    if (resumeKeywordSet.has(keywordLower)) {
      matchedKeywords.push(keyword);
    } else {
      missingKeywords.push(keyword);
    }
  });
  
  const matchRate = jobKeywords.length > 0 
    ? Math.round((matchedKeywords.length / jobKeywords.length) * 100) 
    : 0;
  
  return {
    jobKeywords: jobKeywords.slice(0, 50), // Limit to top 50
    resumeKeywords: resumeKeywords.slice(0, 50),
    matchedKeywords,
    missingKeywords: missingKeywords.slice(0, 30), // Top 30 missing
    matchRate
  };
}

// Main scoring function
export function calculateATSScore(resume, jobDescription = '') {
  const categories = {
    completeness: scoreSectionCompleteness(resume),
    bulletDepth: scoreBulletDepth(resume),
    formatting: scoreFormattingSafety(resume),
    experience: scoreExperienceRelevance(resume),
    length: scoreLengthOptimization(resume)
  };
  
  // Calculate total score
  const totalScore = Object.values(categories).reduce((sum, cat) => sum + cat.score, 0);
  const maxScore = Object.values(categories).reduce((sum, cat) => sum + cat.maxScore, 0);
  const overallScore = Math.round((totalScore / maxScore) * 100);
  
  // Collect all recommendations
  const allRecommendations = Object.values(categories)
    .flatMap(cat => cat.recommendations)
    .slice(0, 10); // Top 10 recommendations
  
  // Keyword analysis
  const keywordAnalysis = analyzeKeywords(resume, jobDescription);
  
  // Add keyword recommendations if job description provided
  if (jobDescription && keywordAnalysis.matchRate < 70) {
    allRecommendations.push(
      `Improve keyword match rate (currently ${keywordAnalysis.matchRate}% - aim for 70%+)`
    );
  }
  
  return {
    overallScore,
    categories: {
      completeness: {
        score: categories.completeness.score,
        maxScore: categories.completeness.maxScore,
        percentage: Math.round((categories.completeness.score / categories.completeness.maxScore) * 100),
        label: 'Section Completeness'
      },
      bulletDepth: {
        score: categories.bulletDepth.score,
        maxScore: categories.bulletDepth.maxScore,
        percentage: Math.round((categories.bulletDepth.score / categories.bulletDepth.maxScore) * 100),
        label: 'Bullet Quality'
      },
      formatting: {
        score: categories.formatting.score,
        maxScore: categories.formatting.maxScore,
        percentage: Math.round((categories.formatting.score / categories.formatting.maxScore) * 100),
        label: 'ATS Formatting'
      },
      experience: {
        score: categories.experience.score,
        maxScore: categories.experience.maxScore,
        percentage: Math.round((categories.experience.score / categories.experience.maxScore) * 100),
        label: 'Experience Quality'
      },
      length: {
        score: categories.length.score,
        maxScore: categories.length.maxScore,
        percentage: Math.round((categories.length.score / categories.length.maxScore) * 100),
        label: 'Resume Length'
      }
    },
    recommendations: allRecommendations,
    keywordAnalysis
  };
}
