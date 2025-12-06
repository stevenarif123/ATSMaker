import jsPDF from 'jspdf';

// Helper to normalize text - remove extra newlines and whitespace
const normalizeText = (text) => {
  if (!text) return '';
  return text.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
};

// ATS-friendly PDF export using native text rendering (small file size, selectable text)
export const exportToPDF = async (element, filename = 'resume.pdf', resumeData) => {
  try {
    if (!resumeData) {
      throw new Error('Resume data not provided');
    }

    const { personalInfo, experience, education, skills, projects, certifications, languages, customSections } = resumeData;
    
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
    pdf.setFontSize(20);
    pdf.setTextColor(0, 0, 0);
    pdf.text(personalInfo.fullName || 'Your Name', pageWidth / 2, y, { align: 'center' });
    y += 24;

    // Contact Info Line
    pdf.setFont('times', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(51, 51, 51);
    
    const contactParts = [];
    if (personalInfo.email) contactParts.push(personalInfo.email);
    if (personalInfo.phone) contactParts.push(personalInfo.phone);
    if (personalInfo.location) contactParts.push(personalInfo.location);
    
    if (contactParts.length > 0) {
      pdf.text(contactParts.join('  |  '), pageWidth / 2, y, { align: 'center' });
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
      pdf.setTextColor(0, 51, 153); // Blue for links
      const linksText = linkParts.map(l => l.text).join('  |  ');
      const linksWidth = pdf.getTextWidth(linksText);
      const linksX = (pageWidth - linksWidth) / 2;
      
      let currentX = linksX;
      linkParts.forEach((link, index) => {
        const linkWidth = pdf.getTextWidth(link.text);
        pdf.textWithLink(link.text, currentX, y, { url: link.url });
        currentX += linkWidth;
        if (index < linkParts.length - 1) {
          pdf.setTextColor(51, 51, 51);
          pdf.text('  |  ', currentX, y);
          currentX += pdf.getTextWidth('  |  ');
          pdf.setTextColor(0, 51, 153);
        }
      });
      y += 16;
    }

    // Divider line
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.5);
    pdf.line(marginLeft, y, pageWidth - marginRight, y);
    y += 16;

    // ============ PROFESSIONAL SUMMARY ============
    if (personalInfo.summary) {
      checkNewPage(60);
      
      pdf.setFont('times', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);
      pdf.text('PROFESSIONAL SUMMARY', marginLeft, y);
      y += 14;
      
      pdf.setFont('times', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(51, 51, 51);
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
      pdf.setTextColor(0, 0, 0);
      pdf.text('PROFESSIONAL EXPERIENCE', marginLeft, y);
      y += 14;

      experience.forEach((exp, expIndex) => {
        checkNewPage(50);
        
        // Job Title and Date on same line
        pdf.setFont('times', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        pdf.text(exp.position || '', marginLeft, y);
        
        const dateText = `${exp.startDate || ''} – ${exp.current ? 'Present' : exp.endDate || ''}`;
        pdf.setFont('times', 'normal');
        pdf.text(dateText, pageWidth - marginRight, y, { align: 'right' });
        y += 12;
        
        // Company and Location
        pdf.setFont('times', 'italic');
        pdf.setFontSize(10);
        pdf.setTextColor(51, 51, 51);
        const companyLocation = [exp.company, exp.location].filter(Boolean).join(', ');
        pdf.text(companyLocation, marginLeft, y);
        y += 14;
        
        // Bullet points
        if (exp.bullets && exp.bullets.length > 0) {
          pdf.setFont('times', 'normal');
          pdf.setFontSize(10);
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
      pdf.setTextColor(0, 0, 0);
      pdf.text('EDUCATION', marginLeft, y);
      y += 14;

      education.forEach((edu, eduIndex) => {
        checkNewPage(30);
        
        // Degree and Date
        pdf.setFont('times', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        pdf.text(edu.degree || '', marginLeft, y);
        
        const eduDateText = `${edu.startDate || ''} – ${edu.endDate || ''}`;
        pdf.setFont('times', 'normal');
        pdf.text(eduDateText, pageWidth - marginRight, y, { align: 'right' });
        y += 12;
        
        // School, Location, GPA
        pdf.setFont('times', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(51, 51, 51);
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
      pdf.setTextColor(0, 0, 0);
      pdf.text('SKILLS', marginLeft, y);
      y += 14;
      
      pdf.setFont('times', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(51, 51, 51);
      
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
      pdf.setTextColor(0, 0, 0);
      pdf.text('PROJECTS', marginLeft, y);
      y += 14;

      projects.forEach((project, projIndex) => {
        checkNewPage(40);
        
        // Project Name
        pdf.setFont('times', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        pdf.text(project.name || '', marginLeft, y);
        
        // Project URL as clickable link
        if (project.url) {
          const nameWidth = pdf.getTextWidth(project.name + '  ');
          pdf.setFont('times', 'normal');
          pdf.setTextColor(0, 51, 153);
          const projectUrl = project.url.startsWith('http') ? project.url : `https://${project.url}`;
          pdf.textWithLink(project.url, marginLeft + nameWidth, y, { url: projectUrl });
        }
        y += 12;
        
        // Description
        if (project.description) {
          pdf.setFont('times', 'normal');
          pdf.setFontSize(10);
          pdf.setTextColor(51, 51, 51);
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
          pdf.setTextColor(102, 102, 102);
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
      pdf.setTextColor(0, 0, 0);
      pdf.text('CERTIFICATIONS', marginLeft, y);
      y += 14;

      certifications.forEach((cert, certIndex) => {
        checkNewPage(25);
        
        pdf.setFont('times', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        pdf.text(cert.name || '', marginLeft, y);
        
        if (cert.date) {
          pdf.setFont('times', 'normal');
          pdf.text(cert.date, pageWidth - marginRight, y, { align: 'right' });
        }
        y += 12;
        
        if (cert.issuer) {
          pdf.setFont('times', 'normal');
          pdf.setFontSize(9);
          pdf.setTextColor(51, 51, 51);
          pdf.text(cert.issuer, marginLeft, y);
          y += 11;
        }
        
        if (cert.url) {
          pdf.setFont('times', 'normal');
          pdf.setFontSize(9);
          pdf.setTextColor(0, 51, 153);
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
      pdf.setTextColor(0, 0, 0);
      pdf.text('LANGUAGES', marginLeft, y);
      y += 14;
      
      pdf.setFont('times', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(51, 51, 51);
      
      const langText = languages.map(l => l.level ? `${l.name} (${l.level})` : l.name).filter(Boolean).join('  •  ');
      const langLines = wrapText(langText, contentWidth, 10);
      langLines.forEach(line => {
        checkNewPage();
        pdf.text(line, marginLeft, y);
        y += 12;
      });
      y += 8;
    }

    // ============ CUSTOM SECTIONS ============
    if (customSections && customSections.length > 0) {
      customSections.forEach(section => {
        checkNewPage(40);
        
        pdf.setFont('times', 'bold');
        pdf.setFontSize(11);
        pdf.setTextColor(0, 0, 0);
        pdf.text((section.title || 'ADDITIONAL').toUpperCase(), marginLeft, y);
        y += 14;
        
        if (section.content) {
          pdf.setFont('times', 'normal');
          pdf.setFontSize(10);
          pdf.setTextColor(51, 51, 51);
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
          pdf.setTextColor(51, 51, 51);
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