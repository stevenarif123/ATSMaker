import jsPDF from 'jspdf';
import { TEMPLATE_COLORS, normalizeText, generateFilename } from './templateMetadata.js';
import { TEMPLATE_CONFIGS } from './templateConfig';

// Convert hex color to RGB array
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [0, 0, 0];
};

// Convert template config to colors object for PDF generation
const getTemplateColors = (templateId) => {
  const template = TEMPLATE_CONFIGS[templateId] || TEMPLATE_CONFIGS.classic;
  return {
    text: hexToRgb(template.text),
    textDark: hexToRgb(template.textDark),
    textMuted: hexToRgb(template.textMuted),
    accent: hexToRgb(template.accentColor),
    headerAlign: template.headerStyle === 'centered' ? 'center' : 'left',
    layout: template.layout
  };
};

// ATS-friendly PDF export using native text rendering (small file size, selectable text)
export const exportToPDF = async (element, filename = 'resume.pdf', resumeData) => {
  try {
    if (!resumeData) {
      throw new Error('Resume data not provided');
    }

    const { personalInfo, experience, education, skills, projects, certifications, languages, links, customSections, template = 'classic' } = resumeData;
    const colors = getTemplateColors(template);
    
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

    // Save PDF with generated filename
    const generatedFilename = generateFilename(personalInfo.fullName, '', 'pdf');
    pdf.save(generatedFilename);
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

// Cover Letter PDF Export
const COVER_LETTER_TEMPLATE_STYLES = {
  formal: {
    headerAlign: 'left',
    margin: 72,
    lineHeight: 1.5,
    fontFamily: 'times'
  },
  modern: {
    headerAlign: 'left',
    margin: 60,
    lineHeight: 1.4,
    fontFamily: 'helvetica'
  },
  minimal: {
    headerAlign: 'left',
    margin: 50,
    lineHeight: 1.3,
    fontFamily: 'courier'
  }
};

export const exportCoverLetterToPDF = async (filename = 'cover-letter.pdf', coverLetterData, personalInfo = {}) => {
  try {
    if (!coverLetterData) {
      throw new Error('Cover letter data not provided');
    }

    const template = coverLetterData.templateId || 'formal';
    const templateConfig = COVER_LETTER_TEMPLATE_STYLES[template];
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'letter'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = templateConfig.margin;
    const contentWidth = pageWidth - (margin * 2);
    
    let y = margin;
    
    const checkNewPage = (neededHeight = 20) => {
      if (y + neededHeight > pageHeight - margin) {
        pdf.addPage();
        y = margin;
        return true;
      }
      return false;
    };

    const wrapText = (text, maxWidth, fontSize) => {
      pdf.setFontSize(fontSize);
      return pdf.splitTextToSize(text, maxWidth);
    };

    // Header - Sender's Information
    pdf.setFont(templateConfig.fontFamily, 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);

    if (personalInfo.fullName) {
      pdf.setFont(templateConfig.fontFamily, 'bold');
      pdf.text(personalInfo.fullName, margin, y);
      y += 12;
    }

    pdf.setFont(templateConfig.fontFamily, 'normal');
    const contactInfo = [];
    if (personalInfo.email) contactInfo.push(personalInfo.email);
    if (personalInfo.phone) contactInfo.push(personalInfo.phone);
    if (personalInfo.location) contactInfo.push(personalInfo.location);
    
    if (contactInfo.length > 0) {
      pdf.setFontSize(9);
      pdf.text(contactInfo.join(' | '), margin, y);
      y += 10;
    }

    y += 12;

    // Date
    if (coverLetterData.date) {
      const dateObj = new Date(coverLetterData.date);
      const dateStr = dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      pdf.setFontSize(10);
      pdf.text(dateStr, margin, y);
      y += 14;
    }

    y += 12;

    // Recipient Information
    pdf.setFontSize(10);
    if (coverLetterData.recipientName) {
      pdf.text(coverLetterData.recipientName, margin, y);
      y += 12;
    }
    if (coverLetterData.company) {
      pdf.text(coverLetterData.company, margin, y);
      y += 12;
    }

    y += 12;

    // Salutation
    pdf.setFontSize(10);
    if (coverLetterData.salutation) {
      pdf.text(coverLetterData.salutation, margin, y);
      y += 14;
    }

    y += 8;

    // Body Paragraphs
    pdf.setFontSize(10);
    const lineSpacing = templateConfig.lineHeight * 12;
    
    if (coverLetterData.bodyParagraphs && coverLetterData.bodyParagraphs.length > 0) {
      coverLetterData.bodyParagraphs.forEach((paragraph, idx) => {
        if (paragraph.text && paragraph.text.trim()) {
          checkNewPage(lineSpacing * 3);
          const paragraphLines = wrapText(normalizeText(paragraph.text), contentWidth, 10);
          
          paragraphLines.forEach((line) => {
            checkNewPage(lineSpacing);
            pdf.text(line, margin, y);
            y += lineSpacing;
          });
          
          if (idx < coverLetterData.bodyParagraphs.length - 1) {
            y += 8;
          }
        }
      });
    }

    y += 16;

    // Closing
    pdf.setFontSize(10);
    if (coverLetterData.closing) {
      pdf.text(coverLetterData.closing, margin, y);
      y += 24;
    }

    // Signature line
    pdf.setLineWidth(0.5);
    pdf.line(margin, y, margin + 80, y);
    y += 16;

    // Signature name
    if (coverLetterData.signature) {
      pdf.text(coverLetterData.signature, margin, y);
    }

    // Save PDF
    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Error generating cover letter PDF:', error);
    throw new Error('Failed to generate PDF: ' + error.message);
  }
};

// Cover Letter DOCX Export (using basic HTML approach)
export const exportCoverLetterToDOCX = (filename = 'cover-letter.docx', coverLetterData, personalInfo = {}) => {
  try {
    if (!coverLetterData) {
      throw new Error('Cover letter data not provided');
    }

    const html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset='UTF-8'>
          <style>
            body { font-family: Calibri, sans-serif; margin: 1in; line-height: 1.15; }
            .header { text-align: left; margin-bottom: 0.5in; }
            .recipient { margin: 0.5in 0; }
            .body { margin: 0.5in 0; line-height: 1.5; }
            .body p { margin-bottom: 0.5in; text-align: justify; }
            .closing { margin-top: 1in; }
          </style>
        </head>
        <body>
          <div class="header">
            <strong>${personalInfo.fullName || ''}</strong><br/>
            ${personalInfo.email ? personalInfo.email : ''} ${personalInfo.phone ? '| ' + personalInfo.phone : ''} ${personalInfo.location ? '| ' + personalInfo.location : ''}
          </div>

          <div style="margin: 0.5in 0;">
            ${coverLetterData.date ? new Date(coverLetterData.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
          </div>

          <div class="recipient">
            ${coverLetterData.recipientName ? coverLetterData.recipientName + '<br/>' : ''}
            ${coverLetterData.company ? coverLetterData.company : ''}
          </div>

          <div style="margin: 0.5in 0;">
            ${coverLetterData.salutation || 'Dear Hiring Manager'}
          </div>

          <div class="body">
            ${coverLetterData.bodyParagraphs && coverLetterData.bodyParagraphs.length > 0 
              ? coverLetterData.bodyParagraphs
                  .filter(p => p.text && p.text.trim())
                  .map(p => `<p>${p.text}</p>`)
                  .join('')
              : '<p></p>'
            }
          </div>

          <div class="closing">
            <div style="margin-bottom: 1in;">
              ${coverLetterData.closing || 'Sincerely'}
            </div>
            <div style="height: 1in;"></div>
            <div>${coverLetterData.signature || ''}</div>
          </div>
        </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Error exporting cover letter DOCX:', error);
    throw new Error('Failed to export DOCX: ' + error.message);
  }
};