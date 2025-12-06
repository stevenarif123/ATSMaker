import jsPDF from 'jspdf';

// Helper to normalize text - remove extra newlines and whitespace
const normalizeText = (text) => {
  if (!text) return '';
  return text.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
};

// Template color configurations
const TEMPLATE_COLORS = {
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

// ATS-friendly PDF export using native text rendering (small file size, selectable text)
export const exportToPDF = async (element, filename = 'resume.pdf', resumeData) => {
  try {
    if (!resumeData) {
      throw new Error('Resume data not provided');
    }

    const { personalInfo, experience, education, skills, projects, certifications, languages, links, customSections, template = 'classic' } = resumeData;
    const colors = TEMPLATE_COLORS[template] || TEMPLATE_COLORS.classic;
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'letter' // Standard US Letter (612 x 792 pt)
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Margins
    const marginLeft = 50;
    const marginRight = 50;
    const marginTop = 50;
    const marginBottom = 60;
    const contentWidth = pageWidth - marginLeft - marginRight;
    
    let y = marginTop;
    
    // Helper function to check and add new page if needed
    const checkNewPage = (neededHeight = 20) => {
      if (y + neededHeight > pageHeight - marginBottom) {
        pdf.addPage();
        y = marginTop;
        return true;
      }
      return false;
    };

    // Helper function to wrap text
    const wrapText = (text, maxWidth, fontSize) => {
      pdf.setFontSize(fontSize);
      return pdf.splitTextToSize(text, maxWidth);
    };

    // ============ HEADER ============
    // Name
    pdf.setFont('times', 'bold');
    pdf.setFontSize(colors.headerAlign === 'left' ? 24 : 20);
    pdf.setTextColor(...colors.textDark);
    const nameX = colors.headerAlign === 'left' ? marginLeft : pageWidth / 2;
    const nameAlign = colors.headerAlign === 'left' ? 'left' : 'center';
    pdf.text(personalInfo.fullName || 'Your Name', nameX, y, { align: nameAlign });
    y += colors.headerAlign === 'left' ? 28 : 24;

    // Contact Info Line
    pdf.setFont('times', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(...colors.textMuted);
    
    const contactParts = [];
    if (personalInfo.email) contactParts.push(personalInfo.email);
    if (personalInfo.phone) contactParts.push(personalInfo.phone);
    if (personalInfo.location) contactParts.push(personalInfo.location);
    
    if (contactParts.length > 0) {
      pdf.text(contactParts.join('  |  '), nameX, y, { align: nameAlign });
      y += 14;
    }

    // Links Line (LinkedIn & GitHub with actual URLs)
    const linkParts = [];
    if (personalInfo.linkedin) {
      const linkedinUrl = personalInfo.linkedin.startsWith('http') 
        ? personalInfo.linkedin 
        : `https://linkedin.com/in/${personalInfo.linkedin}`;
      linkParts.push({ text: linkedinUrl, url: linkedinUrl });
    }
    if (personalInfo.github) {
      const githubUrl = personalInfo.github.startsWith('http') 
        ? personalInfo.github 
        : `https://github.com/${personalInfo.github}`;
      linkParts.push({ text: githubUrl, url: githubUrl });
    }
    
    if (linkParts.length > 0) {
      pdf.setTextColor(...colors.accent);
      const linksText = linkParts.map(l => l.text).join('  |  ');
      
      if (colors.headerAlign === 'left') {
        let currentX = marginLeft;
        linkParts.forEach((link, index) => {
          const linkWidth = pdf.getTextWidth(link.text);
          pdf.textWithLink(link.text, currentX, y, { url: link.url });
          currentX += linkWidth;
          if (index < linkParts.length - 1) {
            pdf.setTextColor(...colors.textMuted);
            pdf.text('  |  ', currentX, y);
            currentX += pdf.getTextWidth('  |  ');
            pdf.setTextColor(...colors.accent);
          }
        });
      } else {
        const linksWidth = pdf.getTextWidth(linksText);
        const linksX = (pageWidth - linksWidth) / 2;
        
        let currentX = linksX;
        linkParts.forEach((link, index) => {
          const linkWidth = pdf.getTextWidth(link.text);
          pdf.textWithLink(link.text, currentX, y, { url: link.url });
          currentX += linkWidth;
          if (index < linkParts.length - 1) {
            pdf.setTextColor(...colors.textMuted);
            pdf.text('  |  ', currentX, y);
            currentX += pdf.getTextWidth('  |  ');
            pdf.setTextColor(...colors.accent);
          }
        });
      }
      y += 16;
    }

    // Divider line
    pdf.setDrawColor(...colors.textDark);
    pdf.setLineWidth(template === 'modern' ? 1 : 0.5);
    pdf.line(marginLeft, y, pageWidth - marginRight, y);
    y += 16;

    // ============ PROFESSIONAL SUMMARY ============
    if (personalInfo.summary) {
      checkNewPage(60);
      
      pdf.setFont('times', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(...(template === 'modern' ? colors.accent : colors.textDark));
      pdf.text('PROFESSIONAL SUMMARY', marginLeft, y);
      y += 14;
      
      pdf.setFont('times', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(...colors.text);
      const summaryLines = wrapText(normalizeText(personalInfo.summary), contentWidth, 10);
      summaryLines.forEach(line => {
        checkNewPage();
        pdf.text(line, marginLeft, y);
        y += 12;
      });
      y += 8;
    }

    // ============ EXPERIENCE ============
    if (experience && experience.length > 0) {
      checkNewPage(60);
      
      pdf.setFont('times', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(...(template === 'modern' ? colors.accent : colors.textDark));
      pdf.text('PROFESSIONAL EXPERIENCE', marginLeft, y);
      y += 14;

      experience.forEach((exp, expIndex) => {
        checkNewPage(50);
        
        // Job Title and Date on same line
        pdf.setFont('times', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(...colors.textDark);
        pdf.text(exp.position || '', marginLeft, y);
        
        const dateText = `${exp.startDate || ''} – ${exp.current ? 'Present' : exp.endDate || ''}`;
        pdf.setFont('times', 'normal');
        pdf.text(dateText, pageWidth - marginRight, y, { align: 'right' });
        y += 12;
        
        // Company and Location
        pdf.setFont('times', 'italic');
        pdf.setFontSize(10);
        pdf.setTextColor(...colors.textMuted);
        const companyLocation = [exp.company, exp.location].filter(Boolean).join(', ');
        pdf.text(companyLocation, marginLeft, y);
        y += 14;
        
        // Bullet points
        if (exp.bullets && exp.bullets.length > 0) {
          pdf.setFont('times', 'normal');
          pdf.setFontSize(10);
          pdf.setTextColor(...colors.text);
          exp.bullets.forEach(bullet => {
            if (bullet && bullet.trim()) {
              const normalizedBullet = normalizeText(bullet);
              checkNewPage();
              const bulletLines = wrapText(normalizedBullet, contentWidth - 15, 10);
              bulletLines.forEach((line, lineIndex) => {
                checkNewPage();
                if (lineIndex === 0) {
                  pdf.text('•', marginLeft + 5, y);
                  pdf.text(line, marginLeft + 15, y);
                } else {
                  pdf.text(line, marginLeft + 15, y);
                }
                y += 12;
              });
            }
          });
        }
        
        if (expIndex < experience.length - 1) y += 6;
      });
      y += 8;
    }

    // ============ EDUCATION ============
    if (education && education.length > 0) {
      checkNewPage(50);
      
      pdf.setFont('times', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(...(template === 'modern' ? colors.accent : colors.textDark));
      pdf.text('EDUCATION', marginLeft, y);
      y += 14;

      education.forEach((edu, eduIndex) => {
        checkNewPage(30);
        
        // Degree and Date
        pdf.setFont('times', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(...colors.textDark);
        pdf.text(edu.degree || '', marginLeft, y);
        
        const eduDateText = `${edu.startDate || ''} – ${edu.endDate || ''}`;
        pdf.setFont('times', 'normal');
        pdf.text(eduDateText, pageWidth - marginRight, y, { align: 'right' });
        y += 12;
        
        // School, Location, GPA
        pdf.setFont('times', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(...colors.textMuted);
        let schoolInfo = [edu.school, edu.location].filter(Boolean).join(', ');
        if (edu.gpa) schoolInfo += ` | GPA: ${edu.gpa}`;
        pdf.text(schoolInfo, marginLeft, y);
        y += 14;
        
        if (eduIndex < education.length - 1) y += 4;
      });
      y += 8;
    }

    // ============ SKILLS ============
    if (skills && skills.length > 0) {
      checkNewPage(40);
      
      pdf.setFont('times', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(...(template === 'modern' ? colors.accent : colors.textDark));
      pdf.text('SKILLS', marginLeft, y);
      y += 14;
      
      pdf.setFont('times', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(...colors.text);
      
      const skillsText = skills.map(s => s.name).filter(Boolean).join('  •  ');
      const skillsLines = wrapText(skillsText, contentWidth, 10);
      skillsLines.forEach(line => {
        checkNewPage();
        pdf.text(line, marginLeft, y);
        y += 12;
      });
      y += 8;
    }

    // ============ PROJECTS ============
    if (projects && projects.length > 0) {
      checkNewPage(50);
      
      pdf.setFont('times', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(...(template === 'modern' ? colors.accent : colors.textDark));
      pdf.text('PROJECTS', marginLeft, y);
      y += 14;

      projects.forEach((project, projIndex) => {
        checkNewPage(40);
        
        // Project Name
        pdf.setFont('times', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(...colors.textDark);
        pdf.text(project.name || '', marginLeft, y);
        
        // Project URL as clickable link
        if (project.url) {
          const nameWidth = pdf.getTextWidth(project.name + '  ');
          pdf.setFont('times', 'normal');
          pdf.setTextColor(...colors.accent);
          const projectUrl = project.url.startsWith('http') ? project.url : `https://${project.url}`;
          pdf.textWithLink(project.url, marginLeft + nameWidth, y, { url: projectUrl });
        }
        y += 12;
        
        // Description
        if (project.description) {
          pdf.setFont('times', 'normal');
          pdf.setFontSize(10);
          pdf.setTextColor(...colors.text);
          const descLines = wrapText(normalizeText(project.description), contentWidth, 10);
          descLines.forEach(line => {
            checkNewPage();
            pdf.text(line, marginLeft, y);
            y += 12;
          });
        }
        
        // Technologies
        if (project.technologies && project.technologies.length > 0) {
          pdf.setFont('times', 'italic');
          pdf.setFontSize(9);
          pdf.setTextColor(...colors.textMuted);
          const techText = 'Technologies: ' + project.technologies.join(', ');
          const techLines = wrapText(techText, contentWidth, 9);
          techLines.forEach(line => {
            checkNewPage();
            pdf.text(line, marginLeft, y);
            y += 11;
          });
        }
        
        if (projIndex < projects.length - 1) y += 6;
      });
      y += 8;
    }

    // ============ CERTIFICATIONS ============
    if (certifications && certifications.length > 0) {
      checkNewPage(40);
      
      pdf.setFont('times', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(...(template === 'modern' ? colors.accent : colors.textDark));
      pdf.text('CERTIFICATIONS', marginLeft, y);
      y += 14;

      certifications.forEach((cert, certIndex) => {
        checkNewPage(25);
        
        pdf.setFont('times', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(...colors.textDark);
        pdf.text(cert.name || '', marginLeft, y);
        
        if (cert.date) {
          pdf.setFont('times', 'normal');
          pdf.text(cert.date, pageWidth - marginRight, y, { align: 'right' });
        }
        y += 12;
        
        if (cert.issuer) {
          pdf.setFont('times', 'normal');
          pdf.setFontSize(9);
          pdf.setTextColor(...colors.textMuted);
          pdf.text(cert.issuer, marginLeft, y);
          y += 11;
        }
        
        if (cert.url) {
          pdf.setFont('times', 'normal');
          pdf.setFontSize(9);
          pdf.setTextColor(...colors.accent);
          const certUrl = cert.url.startsWith('http') ? cert.url : `https://${cert.url}`;
          pdf.textWithLink('View Certificate', marginLeft, y, { url: certUrl });
          y += 11;
        }
        
        if (certIndex < certifications.length - 1) y += 4;
      });
      y += 8;
    }

    // ============ LANGUAGES ============
    if (languages && languages.length > 0) {
      checkNewPage(40);
      
      pdf.setFont('times', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(...(template === 'modern' ? colors.accent : colors.textDark));
      pdf.text('LANGUAGES', marginLeft, y);
      y += 14;
      
      pdf.setFont('times', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(...colors.text);
      
      const langText = languages.map(l => l.level ? `${l.name} (${l.level})` : l.name).filter(Boolean).join('  •  ');
      const langLines = wrapText(langText, contentWidth, 10);
      langLines.forEach(line => {
        checkNewPage();
        pdf.text(line, marginLeft, y);
        y += 12;
      });
      y += 8;
    }

    // ============ LINKS ============
    if (links && links.length > 0) {
      checkNewPage(40);
      
      pdf.setFont('times', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(...(template === 'modern' ? colors.accent : colors.textDark));
      pdf.text('LINKS', marginLeft, y);
      y += 14;
      
      links.forEach((link, linkIndex) => {
        checkNewPage(15);
        
        pdf.setFont('times', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(...colors.textDark);
        const labelText = link.label + ': ';
        pdf.text(labelText, marginLeft, y);
        
        const labelWidth = pdf.getTextWidth(labelText);
        pdf.setFont('times', 'normal');
        pdf.setTextColor(...colors.accent);
        const linkUrl = link.url.startsWith('http') ? link.url : `https://${link.url}`;
        pdf.textWithLink(link.url, marginLeft + labelWidth, y, { url: linkUrl });
        y += 14;
      });
      y += 8;
    }

    // ============ CUSTOM SECTIONS ============
    if (customSections && customSections.length > 0) {
      customSections.forEach(section => {
        checkNewPage(40);
        
        pdf.setFont('times', 'bold');
        pdf.setFontSize(11);
        pdf.setTextColor(...(template === 'modern' ? colors.accent : colors.textDark));
        pdf.text((section.title || 'ADDITIONAL').toUpperCase(), marginLeft, y);
        y += 14;
        
        if (section.content) {
          pdf.setFont('times', 'normal');
          pdf.setFontSize(10);
          pdf.setTextColor(...colors.text);
          const contentLines = wrapText(normalizeText(section.content), contentWidth, 10);
          contentLines.forEach(line => {
            checkNewPage();
            pdf.text(line, marginLeft, y);
            y += 12;
          });
        }
        
        if (section.items && section.items.length > 0) {
          pdf.setFont('times', 'normal');
          pdf.setFontSize(10);
          pdf.setTextColor(...colors.text);
          section.items.forEach(item => {
            const itemText = typeof item === 'string' ? item : item.text || item.name || '';
            if (itemText) {
              checkNewPage();
              const itemLines = wrapText(normalizeText(itemText), contentWidth - 15, 10);
              itemLines.forEach((line, lineIndex) => {
                checkNewPage();
                if (lineIndex === 0) {
                  pdf.text('•', marginLeft + 5, y);
                  pdf.text(line, marginLeft + 15, y);
                } else {
                  pdf.text(line, marginLeft + 15, y);
                }
                y += 12;
              });
            }
          });
        }
        y += 8;
      });
    }

    // Save PDF
    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF: ' + error.message);
  }
};

export const exportToJSON = (data, filename = 'resume.json') => {
  try {
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = filename;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    return true;
  } catch (error) {
    console.error('Error exporting JSON:', error);
    throw new Error('Failed to export JSON');
  }
};