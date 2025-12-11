import jsPDF from 'jspdf';
import { normalizeText, generateFilename } from './templateMetadata.js';
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
const getTemplateConfig = (templateId) => {
  const template = TEMPLATE_CONFIGS[templateId] || TEMPLATE_CONFIGS.classic;
  return {
    text: hexToRgb(template.text),
    textDark: hexToRgb(template.textDark),
    textMuted: hexToRgb(template.textMuted),
    textLight: hexToRgb(template.textLight || '#9ca3af'),
    accent: hexToRgb(template.accentColor),
    headerAlign: template.headerStyle === 'centered' ? 'center' : 'left',
    layout: template.layout || 'single-column',
    sectionStyle: template.sectionStyle,
    bulletStyle: template.bulletStyle,
    nameSize: parseInt(template.nameSize) || 22,
    sectionTitleSize: parseInt(template.sectionTitleSize) || 11,
    borderWidth: parseFloat(template.borderWidth) || 1,
    border: hexToRgb(template.border || '#cccccc'),
    borderDark: hexToRgb(template.borderDark || '#000000'),
    sidebarWidth: template.sidebarWidth ? parseFloat(template.sidebarWidth) / 100 : 0.25,
    sidebarBg: template.sidebarBg ? hexToRgb(template.sidebarBg) : [243, 244, 246],
  };
};

// Get bullet character based on style
const getBulletChar = (bulletStyle) => {
  switch (bulletStyle) {
    case 'arrow': return 'â–¸';
    case 'dash': return 'â€“';
    default: return 'â€¢';
  }
};

// ATS-friendly PDF export using native text rendering (small file size, selectable text)
export const exportToPDF = async (element, filename = 'resume.pdf', resumeData) => {
  try {
    if (!resumeData) {
      throw new Error('Resume data not provided');
    }

    const { personalInfo, experience, education, skills, projects, certifications, languages, links, customSections, template = 'classic' } = resumeData;
    const config = getTemplateConfig(template);
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'letter' // Standard US Letter (612 x 792 pt)
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Route to appropriate layout renderer
    if (config.layout === 'sidebar') {
      renderSidebarLayout(pdf, resumeData, config, pageWidth, pageHeight);
    } else if (config.layout === 'two-column') {
      renderTwoColumnLayout(pdf, resumeData, config, pageWidth, pageHeight);
    } else {
      renderSingleColumnLayout(pdf, resumeData, config, pageWidth, pageHeight);
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

// ============ SIDEBAR LAYOUT RENDERER ============
const renderSidebarLayout = (pdf, resumeData, config, pageWidth, pageHeight) => {
  const { personalInfo, experience, education, skills, projects, certifications, languages, links } = resumeData;
  
  const sidebarWidth = pageWidth * config.sidebarWidth;
  const mainWidth = pageWidth - sidebarWidth;
  const marginTop = 40;
  const marginBottom = 50;
  const padding = 20;
  
  // Draw sidebar background for current page
  const drawSidebarBackground = () => {
    pdf.setFillColor(...config.sidebarBg);
    pdf.rect(0, 0, sidebarWidth, pageHeight, 'F');
    pdf.setDrawColor(...config.border);
    pdf.setLineWidth(0.5);
    pdf.line(sidebarWidth, 0, sidebarWidth, pageHeight);
  };
  
  // Initial sidebar background
  drawSidebarBackground();
  
  let sidebarY = marginTop;
  let mainY = marginTop;
  
  // Helper functions
  const wrapText = (text, maxWidth, fontSize) => {
    pdf.setFontSize(fontSize);
    return pdf.splitTextToSize(text, maxWidth);
  };
  
  // Check and handle page overflow for main content
  const checkMainPageOverflow = (neededHeight = 15) => {
    if (mainY + neededHeight > pageHeight - marginBottom) {
      pdf.addPage();
      drawSidebarBackground();
      mainY = marginTop;
      return true;
    }
    return false;
  };
  
  const drawSidebarSectionTitle = (title, x) => {
    pdf.setFont('times', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(...config.accent);
    pdf.text(title.toUpperCase(), x, sidebarY);
    sidebarY += 12;
  };
  
  const drawMainSectionTitle = (title, x) => {
    checkMainPageOverflow(40);
    
    pdf.setFont('times', 'bold');
    pdf.setFontSize(10);
    
    if (config.sectionStyle === 'colorbar') {
      pdf.setFillColor(...config.accent);
      pdf.rect(x, mainY - 8, 2, 11, 'F');
      pdf.setTextColor(...config.accent);
      pdf.text(title.toUpperCase(), x + 6, mainY);
    } else {
      pdf.setTextColor(...config.textDark);
      pdf.text(title.toUpperCase(), x, mainY);
    }
    mainY += 14;
  };
  
  // ===== SIDEBAR CONTENT =====
  
  // Name
  pdf.setFont('times', 'bold');
  pdf.setFontSize(16);
  pdf.setTextColor(...config.accent);
  const nameLines = wrapText(personalInfo.fullName || 'Your Name', sidebarWidth - padding * 2, 16);
  nameLines.forEach(line => {
    pdf.text(line, padding, sidebarY);
    sidebarY += 18;
  });
  sidebarY += 8;
  
  // Contact Info
  pdf.setFont('times', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(...config.textMuted);
  
  if (personalInfo.email) {
    pdf.text(personalInfo.email, padding, sidebarY);
    sidebarY += 10;
  }
  if (personalInfo.phone) {
    pdf.text(personalInfo.phone, padding, sidebarY);
    sidebarY += 10;
  }
  if (personalInfo.location) {
    pdf.text(personalInfo.location, padding, sidebarY);
    sidebarY += 10;
  }
  if (personalInfo.linkedin) {
    pdf.setTextColor(...config.accent);
    pdf.text('LinkedIn', padding, sidebarY);
    sidebarY += 10;
  }
  if (personalInfo.github) {
    pdf.setTextColor(...config.accent);
    pdf.text('GitHub', padding, sidebarY);
    sidebarY += 10;
  }
  sidebarY += 12;
  
  // Skills in sidebar
  if (skills && skills.length > 0) {
    drawSidebarSectionTitle('Skills', padding);
    pdf.setFont('times', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(...config.text);
    skills.forEach(skill => {
      const lines = wrapText(skill.name, sidebarWidth - padding * 2, 8);
      lines.forEach(line => {
        pdf.text(line, padding, sidebarY);
        sidebarY += 10;
      });
    });
    sidebarY += 10;
  }
  
  // Languages in sidebar
  if (languages && languages.length > 0) {
    drawSidebarSectionTitle('Languages', padding);
    pdf.setFont('times', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(...config.text);
    languages.forEach(lang => {
      const text = lang.level ? `${lang.name} (${lang.level})` : lang.name;
      pdf.text(text, padding, sidebarY);
      sidebarY += 10;
    });
    sidebarY += 10;
  }
  
  // ===== MAIN CONTENT =====
  const mainX = sidebarWidth + padding;
  const mainContentWidth = mainWidth - padding * 2;
  
  // Summary
  if (personalInfo.summary) {
    drawMainSectionTitle('Professional Summary', mainX);
    pdf.setFont('times', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(...config.text);
    const summaryLines = wrapText(normalizeText(personalInfo.summary), mainContentWidth, 9);
    summaryLines.forEach(line => {
      checkMainPageOverflow(11);
      pdf.text(line, mainX, mainY);
      mainY += 11;
    });
    mainY += 10;
  }
  
  // Experience
  if (experience && experience.length > 0) {
    drawMainSectionTitle('Professional Experience', mainX);
    experience.forEach((exp, idx) => {
      // Check if we have room for at least the header (position + company = ~25)
      checkMainPageOverflow(25);
      
      // Position and dates
      pdf.setFont('times', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(...config.textDark);
      pdf.text(exp.position || '', mainX, mainY);
      
      const dateText = `${exp.startDate || ''} - ${exp.current ? 'Present' : exp.endDate || ''}`;
      pdf.setFont('times', 'normal');
      pdf.setTextColor(...config.textLight);
      const dateWidth = pdf.getTextWidth(dateText);
      pdf.text(dateText, sidebarWidth + mainWidth - padding - dateWidth, mainY);
      mainY += 11;
      
      // Company
      checkMainPageOverflow(11);
      pdf.setFont('times', 'italic');
      pdf.setFontSize(9);
      pdf.setTextColor(...config.textMuted);
      pdf.text(`${exp.company || ''}${exp.location ? ', ' + exp.location : ''}`, mainX, mainY);
      mainY += 11;
      
      // Bullets
      if (exp.bullets && exp.bullets.length > 0) {
        pdf.setFont('times', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(...config.text);
        exp.bullets.forEach(bullet => {
          if (bullet && bullet.trim()) {
            const bulletLines = wrapText(normalizeText(bullet), mainContentWidth - 12, 9);
            bulletLines.forEach((line, lineIdx) => {
              checkMainPageOverflow(11);
              if (lineIdx === 0) {
                pdf.text('•', mainX + 4, mainY);
              }
              pdf.text(line, mainX + 12, mainY);
              mainY += 11;
            });
          }
        });
      }
      if (idx < experience.length - 1) mainY += 6;
    });
    mainY += 10;
  }
  
  // Education
  if (education && education.length > 0) {
    drawMainSectionTitle('Education', mainX);
    education.forEach((edu, idx) => {
      checkMainPageOverflow(25);
      
      pdf.setFont('times', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(...config.textDark);
      pdf.text(edu.degree || '', mainX, mainY);
      
      const dateText = `${edu.startDate || ''} - ${edu.endDate || ''}`;
      pdf.setFont('times', 'normal');
      pdf.setTextColor(...config.textLight);
      const dateWidth = pdf.getTextWidth(dateText);
      pdf.text(dateText, sidebarWidth + mainWidth - padding - dateWidth, mainY);
      mainY += 11;
      
      checkMainPageOverflow(13);
      pdf.setFont('times', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(...config.textMuted);
      let schoolText = edu.school || '';
      if (edu.location) schoolText += ', ' + edu.location;
      if (edu.gpa) schoolText += ' | GPA: ' + edu.gpa;
      pdf.text(schoolText, mainX, mainY);
      mainY += 13;
    });
    mainY += 10;
  }
  
  // Projects
  if (projects && projects.length > 0) {
    drawMainSectionTitle('Projects', mainX);
    projects.forEach((project, idx) => {
      checkMainPageOverflow(22);
      
      pdf.setFont('times', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(...config.textDark);
      pdf.text(project.name || '', mainX, mainY);
      mainY += 11;
      
      if (project.description) {
        pdf.setFont('times', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(...config.text);
        const descLines = wrapText(normalizeText(project.description), mainContentWidth, 9);
        descLines.forEach(line => {
          checkMainPageOverflow(11);
          pdf.text(line, mainX, mainY);
          mainY += 11;
        });
      }
      if (idx < projects.length - 1) mainY += 6;
    });
  }
};

// ============ TWO-COLUMN LAYOUT RENDERER ============
const renderTwoColumnLayout = (pdf, resumeData, config, pageWidth, pageHeight) => {
  const { personalInfo, experience, education, skills, projects, certifications, languages, links } = resumeData;
  
  const leftWidth = pageWidth * config.sidebarWidth;
  const rightWidth = pageWidth - leftWidth;
  const marginTop = 40;
  const marginBottom = 50;
  const padding = 25;
  
  // Draw divider line for current page
  const drawDivider = () => {
    pdf.setDrawColor(...config.border);
    pdf.setLineWidth(0.5);
    pdf.line(leftWidth, marginTop, leftWidth, pageHeight - marginBottom);
  };
  
  // Initial divider
  drawDivider();
  
  let leftY = marginTop;
  let rightY = marginTop;
  
  // Helper functions
  const wrapText = (text, maxWidth, fontSize) => {
    pdf.setFontSize(fontSize);
    return pdf.splitTextToSize(text, maxWidth);
  };
  
  // Check and handle page overflow for right column
  const checkRightPageOverflow = (neededHeight = 15) => {
    if (rightY + neededHeight > pageHeight - marginBottom) {
      pdf.addPage();
      drawDivider();
      rightY = marginTop;
      return true;
    }
    return false;
  };
  
  const drawLeftSectionTitle = (title) => {
    pdf.setFont('times', 'bold');
    pdf.setFontSize(9);
    if (config.sectionStyle === 'colorbar') {
      pdf.setFillColor(...config.accent);
      pdf.rect(padding, leftY - 8, 2, 10, 'F');
      pdf.setTextColor(...config.accent);
      pdf.text(title.toUpperCase(), padding + 6, leftY);
    } else {
      pdf.setTextColor(...config.textDark);
      pdf.text(title.toUpperCase(), padding, leftY);
    }
    leftY += 12;
  };
  
  const drawRightSectionTitle = (title) => {
    checkRightPageOverflow(40);
    
    pdf.setFont('times', 'bold');
    pdf.setFontSize(10);
    if (config.sectionStyle === 'colorbar') {
      pdf.setFillColor(...config.accent);
      pdf.rect(leftWidth + padding, rightY - 8, 2, 12, 'F');
      pdf.setTextColor(...config.accent);
      pdf.text(title.toUpperCase(), leftWidth + padding + 6, rightY);
    } else {
      pdf.setTextColor(...config.textDark);
      pdf.text(title.toUpperCase(), leftWidth + padding, rightY);
    }
    rightY += 14;
  };
  
  // ===== LEFT COLUMN =====
  const leftContentWidth = leftWidth - padding * 2;
  
  // Name
  pdf.setFont('times', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(...config.textDark);
  const nameLines = wrapText(personalInfo.fullName || 'Your Name', leftContentWidth, 14);
  nameLines.forEach(line => {
    pdf.text(line, padding, leftY);
    leftY += 16;
  });
  leftY += 6;
  
  // Contact Info
  pdf.setFont('times', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(...config.textMuted);
  
  if (personalInfo.email) {
    pdf.text(personalInfo.email, padding, leftY);
    leftY += 10;
  }
  if (personalInfo.phone) {
    pdf.text(personalInfo.phone, padding, leftY);
    leftY += 10;
  }
  if (personalInfo.location) {
    pdf.text(personalInfo.location, padding, leftY);
    leftY += 10;
  }
  leftY += 10;
  
  // Skills
  if (skills && skills.length > 0) {
    drawLeftSectionTitle('Skills');
    pdf.setFont('times', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(...config.text);
    skills.forEach(skill => {
      const lines = wrapText(skill.name, leftContentWidth, 8);
      lines.forEach(line => {
        pdf.text(line, padding, leftY);
        leftY += 10;
      });
    });
    leftY += 8;
  }
  
  // Languages
  if (languages && languages.length > 0) {
    drawLeftSectionTitle('Languages');
    pdf.setFont('times', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(...config.text);
    languages.forEach(lang => {
      const text = lang.level ? `${lang.name} (${lang.level})` : lang.name;
      pdf.text(text, padding, leftY);
      leftY += 10;
    });
    leftY += 8;
  }
  
  // Summary in left column
  if (personalInfo.summary) {
    drawLeftSectionTitle('Summary');
    pdf.setFont('times', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(...config.text);
    const summaryLines = wrapText(normalizeText(personalInfo.summary), leftContentWidth, 8);
    summaryLines.forEach(line => {
      pdf.text(line, padding, leftY);
      leftY += 10;
    });
  }
  
  // ===== RIGHT COLUMN =====
  const rightX = leftWidth + padding;
  const rightContentWidth = rightWidth - padding * 2;
  
  // Experience
  if (experience && experience.length > 0) {
    drawRightSectionTitle('Experience');
    experience.forEach((exp, idx) => {
      checkRightPageOverflow(35);
      
      pdf.setFont('times', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(...config.textDark);
      pdf.text(exp.position || '', rightX, rightY);
      rightY += 11;
      
      checkRightPageOverflow(10);
      pdf.setFont('times', 'italic');
      pdf.setFontSize(8);
      pdf.setTextColor(...config.textMuted);
      pdf.text(`${exp.company || ''} ${exp.location ? '• ' + exp.location : ''}`, rightX, rightY);
      rightY += 10;
      
      checkRightPageOverflow(11);
      pdf.setFont('times', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(...config.textLight);
      pdf.text(`${exp.startDate || ''} - ${exp.current ? 'Present' : exp.endDate || ''}`, rightX, rightY);
      rightY += 11;
      
      if (exp.bullets && exp.bullets.length > 0) {
        pdf.setFont('times', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(...config.text);
        exp.bullets.forEach(bullet => {
          if (bullet && bullet.trim()) {
            const bulletLines = wrapText(normalizeText(bullet), rightContentWidth - 10, 8);
            bulletLines.forEach((line, lineIdx) => {
              checkRightPageOverflow(10);
              if (lineIdx === 0) pdf.text('•', rightX + 3, rightY);
              pdf.text(line, rightX + 10, rightY);
              rightY += 10;
            });
          }
        });
      }
      if (idx < experience.length - 1) rightY += 6;
    });
    rightY += 10;
  }
  
  // Education
  if (education && education.length > 0) {
    drawRightSectionTitle('Education');
    education.forEach((edu, idx) => {
      checkRightPageOverflow(25);
      
      pdf.setFont('times', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(...config.textDark);
      pdf.text(edu.degree || '', rightX, rightY);
      rightY += 11;
      
      checkRightPageOverflow(10);
      pdf.setFont('times', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(...config.textMuted);
      pdf.text(`${edu.school || ''} ${edu.location ? '• ' + edu.location : ''}`, rightX, rightY);
      rightY += 10;
      
      checkRightPageOverflow(10);
      pdf.setFont('times', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(...config.textLight);
      pdf.text(`${edu.startDate || ''} - ${edu.endDate || ''}`, rightX, rightY);
      rightY += 12;
    });
    rightY += 10;
  }
  
  // Projects
  if (projects && projects.length > 0) {
    drawRightSectionTitle('Projects');
    projects.forEach((project, idx) => {
      checkRightPageOverflow(22);
      
      pdf.setFont('times', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(...config.textDark);
      pdf.text(project.name || '', rightX, rightY);
      rightY += 11;
      
      if (project.description) {
        pdf.setFont('times', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(...config.text);
        const descLines = wrapText(normalizeText(project.description), rightContentWidth, 8);
        descLines.forEach(line => {
          checkRightPageOverflow(10);
          pdf.text(line, rightX, rightY);
          rightY += 10;
        });
      }
      if (idx < projects.length - 1) rightY += 6;
    });
  }
};

// ============ SINGLE-COLUMN LAYOUT RENDERER ============
const renderSingleColumnLayout = (pdf, resumeData, config, pageWidth, pageHeight) => {
  const { personalInfo, experience, education, skills, projects, certifications, languages, links, customSections, template = 'classic' } = resumeData;
  
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
    
    // Helper function to draw section title with proper styling
    const drawSectionTitle = (title, startX = marginLeft) => {
      checkNewPage(40);
      
      const titleFontSize = config.sectionTitleSize || 11;
      pdf.setFont('times', 'bold');
      pdf.setFontSize(titleFontSize);
      
      switch (config.sectionStyle) {
        case 'colorbar':
          // Draw color bar on left
          pdf.setFillColor(...config.accent);
          pdf.rect(startX, y - 10, 3, 14, 'F');
          pdf.setTextColor(...config.accent);
          pdf.text(title.toUpperCase(), startX + 8, y);
          break;
        case 'box':
          // Draw background box
          const textW = pdf.getTextWidth(title.toUpperCase()) + 16;
          pdf.setFillColor(243, 244, 246);
          pdf.rect(startX, y - 10, textW, 16, 'F');
          pdf.setTextColor(...config.textDark);
          pdf.text(title.toUpperCase(), startX + 8, y);
          break;
        case 'none':
          pdf.setTextColor(...config.textDark);
          pdf.text(title.toUpperCase(), startX, y);
          break;
        default: // underline
          pdf.setTextColor(...config.textDark);
          pdf.text(title.toUpperCase(), startX, y);
          y += 4;
          pdf.setDrawColor(...config.border);
          pdf.setLineWidth(config.borderWidth || 0.5);
          pdf.line(startX, y, pageWidth - marginRight, y);
          break;
      }
      
      y += 14;
    };
    
    const bulletChar = getBulletChar(config.bulletStyle);

    // ============ HEADER ============
    // Name
    pdf.setFont('times', 'bold');
    pdf.setFontSize(config.headerAlign === 'left' ? 24 : 20);
    pdf.setTextColor(...config.textDark);
    const nameX = config.headerAlign === 'left' ? marginLeft : pageWidth / 2;
    const nameAlign = config.headerAlign === 'left' ? 'left' : 'center';
    pdf.text(personalInfo.fullName || 'Your Name', nameX, y, { align: nameAlign });
    y += config.headerAlign === 'left' ? 28 : 24;

    // Contact Info Line
    pdf.setFont('times', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(...config.textMuted);
    
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
      pdf.setTextColor(...config.accent);
      const linksText = linkParts.map(l => l.text).join('  |  ');
      
      if (config.headerAlign === 'left') {
        let currentX = marginLeft;
        linkParts.forEach((link, index) => {
          const linkWidth = pdf.getTextWidth(link.text);
          pdf.textWithLink(link.text, currentX, y, { url: link.url });
          currentX += linkWidth;
          if (index < linkParts.length - 1) {
            pdf.setTextColor(...config.textMuted);
            pdf.text('  |  ', currentX, y);
            currentX += pdf.getTextWidth('  |  ');
            pdf.setTextColor(...config.accent);
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
            pdf.setTextColor(...config.textMuted);
            pdf.text('  |  ', currentX, y);
            currentX += pdf.getTextWidth('  |  ');
            pdf.setTextColor(...config.accent);
          }
        });
      }
      y += 16;
    }

    // Divider line
    pdf.setDrawColor(...config.textDark);
    pdf.setLineWidth(template === 'modern' ? 1 : 0.5);
    pdf.line(marginLeft, y, pageWidth - marginRight, y);
    y += 16;

    // ============ PROFESSIONAL SUMMARY ============
    if (personalInfo.summary) {
      checkNewPage(60);
      
      pdf.setFont('times', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(...(template === 'modern' ? config.accent : config.textDark));
      pdf.text('PROFESSIONAL SUMMARY', marginLeft, y);
      y += 14;
      
      pdf.setFont('times', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(...config.text);
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
      pdf.setTextColor(...(template === 'modern' ? config.accent : config.textDark));
      pdf.text('PROFESSIONAL EXPERIENCE', marginLeft, y);
      y += 14;

      experience.forEach((exp, expIndex) => {
        checkNewPage(50);
        
        // Job Title and Date on same line
        pdf.setFont('times', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(...config.textDark);
        pdf.text(exp.position || '', marginLeft, y);
        
        const dateText = `${exp.startDate || ''} â€“ ${exp.current ? 'Present' : exp.endDate || ''}`;
        pdf.setFont('times', 'normal');
        pdf.text(dateText, pageWidth - marginRight, y, { align: 'right' });
        y += 12;
        
        // Company and Location
        pdf.setFont('times', 'italic');
        pdf.setFontSize(10);
        pdf.setTextColor(...config.textMuted);
        const companyLocation = [exp.company, exp.location].filter(Boolean).join(', ');
        pdf.text(companyLocation, marginLeft, y);
        y += 14;
        
        // Bullet points
        if (exp.bullets && exp.bullets.length > 0) {
          pdf.setFont('times', 'normal');
          pdf.setFontSize(10);
          pdf.setTextColor(...config.text);
          exp.bullets.forEach(bullet => {
            if (bullet && bullet.trim()) {
              const normalizedBullet = normalizeText(bullet);
              checkNewPage();
              const bulletLines = wrapText(normalizedBullet, contentWidth - 15, 10);
              bulletLines.forEach((line, lineIndex) => {
                checkNewPage();
                if (lineIndex === 0) {
                  pdf.text('â€¢', marginLeft + 5, y);
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
      pdf.setTextColor(...(template === 'modern' ? config.accent : config.textDark));
      pdf.text('EDUCATION', marginLeft, y);
      y += 14;

      education.forEach((edu, eduIndex) => {
        checkNewPage(30);
        
        // Degree and Date
        pdf.setFont('times', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(...config.textDark);
        pdf.text(edu.degree || '', marginLeft, y);
        
        const eduDateText = `${edu.startDate || ''} â€“ ${edu.endDate || ''}`;
        pdf.setFont('times', 'normal');
        pdf.text(eduDateText, pageWidth - marginRight, y, { align: 'right' });
        y += 12;
        
        // School, Location, GPA
        pdf.setFont('times', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(...config.textMuted);
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
      pdf.setTextColor(...(template === 'modern' ? config.accent : config.textDark));
      pdf.text('SKILLS', marginLeft, y);
      y += 14;
      
      pdf.setFont('times', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(...config.text);
      
      const skillsText = skills.map(s => s.name).filter(Boolean).join('  â€¢  ');
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
      pdf.setTextColor(...(template === 'modern' ? config.accent : config.textDark));
      pdf.text('PROJECTS', marginLeft, y);
      y += 14;

      projects.forEach((project, projIndex) => {
        checkNewPage(40);
        
        // Project Name
        pdf.setFont('times', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(...config.textDark);
        pdf.text(project.name || '', marginLeft, y);
        
        // Project URL as clickable link
        if (project.url) {
          const nameWidth = pdf.getTextWidth(project.name + '  ');
          pdf.setFont('times', 'normal');
          pdf.setTextColor(...config.accent);
          const projectUrl = project.url.startsWith('http') ? project.url : `https://${project.url}`;
          pdf.textWithLink(project.url, marginLeft + nameWidth, y, { url: projectUrl });
        }
        y += 12;
        
        // Description
        if (project.description) {
          pdf.setFont('times', 'normal');
          pdf.setFontSize(10);
          pdf.setTextColor(...config.text);
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
          pdf.setTextColor(...config.textMuted);
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
      pdf.setTextColor(...(template === 'modern' ? config.accent : config.textDark));
      pdf.text('CERTIFICATIONS', marginLeft, y);
      y += 14;

      certifications.forEach((cert, certIndex) => {
        checkNewPage(25);
        
        pdf.setFont('times', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(...config.textDark);
        pdf.text(cert.name || '', marginLeft, y);
        
        if (cert.date) {
          pdf.setFont('times', 'normal');
          pdf.text(cert.date, pageWidth - marginRight, y, { align: 'right' });
        }
        y += 12;
        
        if (cert.issuer) {
          pdf.setFont('times', 'normal');
          pdf.setFontSize(9);
          pdf.setTextColor(...config.textMuted);
          pdf.text(cert.issuer, marginLeft, y);
          y += 11;
        }
        
        if (cert.url) {
          pdf.setFont('times', 'normal');
          pdf.setFontSize(9);
          pdf.setTextColor(...config.accent);
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
      pdf.setTextColor(...(template === 'modern' ? config.accent : config.textDark));
      pdf.text('LANGUAGES', marginLeft, y);
      y += 14;
      
      pdf.setFont('times', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(...config.text);
      
      const langText = languages.map(l => l.level ? `${l.name} (${l.level})` : l.name).filter(Boolean).join('  â€¢  ');
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
      pdf.setTextColor(...(template === 'modern' ? config.accent : config.textDark));
      pdf.text('LINKS', marginLeft, y);
      y += 14;
      
      links.forEach((link, linkIndex) => {
        checkNewPage(15);
        
        pdf.setFont('times', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(...config.textDark);
        const labelText = link.label + ': ';
        pdf.text(labelText, marginLeft, y);
        
        const labelWidth = pdf.getTextWidth(labelText);
        pdf.setFont('times', 'normal');
        pdf.setTextColor(...config.accent);
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
        pdf.setTextColor(...(template === 'modern' ? config.accent : config.textDark));
        pdf.text((section.title || 'ADDITIONAL').toUpperCase(), marginLeft, y);
        y += 14;
        
        if (section.content) {
          pdf.setFont('times', 'normal');
          pdf.setFontSize(10);
          pdf.setTextColor(...config.text);
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
          pdf.setTextColor(...config.text);
          section.items.forEach(item => {
            const itemText = typeof item === 'string' ? item : item.text || item.name || '';
            if (itemText) {
              checkNewPage();
              const itemLines = wrapText(normalizeText(itemText), contentWidth - 15, 10);
              itemLines.forEach((line, lineIndex) => {
                checkNewPage();
                if (lineIndex === 0) {
                  pdf.text('â€¢', marginLeft + 5, y);
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

// Cover Letter DOCX Export using docx library (proper Word format)
export const exportCoverLetterToDOCX = async (filename = 'cover-letter.docx', coverLetterData, personalInfo = {}) => {
  try {
    if (!coverLetterData) {
      throw new Error('Cover letter data not provided');
    }

    // Dynamic import of docx library
    const { Document, Packer, Paragraph, TextRun, AlignmentType, convertInchesToTwip } = await import('docx');
    
    const children = [];
    
    // Sender's Information (Header)
    if (personalInfo.fullName) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: personalInfo.fullName,
              bold: true,
              size: 24,
            }),
          ],
          spacing: { after: 100 },
        })
      );
    }
    
    // Contact info line
    const contactParts = [];
    if (personalInfo.email) contactParts.push(personalInfo.email);
    if (personalInfo.phone) contactParts.push(personalInfo.phone);
    if (personalInfo.location) contactParts.push(personalInfo.location);
    
    if (contactParts.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: contactParts.join(' | '),
              size: 20,
              color: '555555',
            }),
          ],
          spacing: { after: 400 },
        })
      );
    }
    
    // Date
    if (coverLetterData.date) {
      const dateObj = new Date(coverLetterData.date);
      const dateStr = dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: dateStr,
              size: 22,
            }),
          ],
          spacing: { after: 400 },
        })
      );
    }
    
    // Recipient Information
    if (coverLetterData.recipientName) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: coverLetterData.recipientName,
              size: 22,
            }),
          ],
          spacing: { after: 100 },
        })
      );
    }
    
    if (coverLetterData.company) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: coverLetterData.company,
              size: 22,
            }),
          ],
          spacing: { after: 400 },
        })
      );
    }
    
    // Salutation
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: coverLetterData.salutation || 'Dear Hiring Manager,',
            size: 22,
          }),
        ],
        spacing: { after: 300 },
      })
    );
    
    // Body Paragraphs
    if (coverLetterData.bodyParagraphs && coverLetterData.bodyParagraphs.length > 0) {
      coverLetterData.bodyParagraphs.forEach((paragraph) => {
        if (paragraph.text && paragraph.text.trim()) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: paragraph.text.trim(),
                  size: 22,
                }),
              ],
              spacing: { after: 300, line: 360 },
              alignment: AlignmentType.JUSTIFIED,
            })
          );
        }
      });
    }
    
    // Closing
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: coverLetterData.closing || 'Sincerely,',
            size: 22,
          }),
        ],
        spacing: { before: 400, after: 600 },
      })
    );
    
    // Signature
    if (coverLetterData.signature) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: coverLetterData.signature,
              size: 22,
            }),
          ],
        })
      );
    }
    
    // Create document
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: convertInchesToTwip(1),
                right: convertInchesToTwip(1),
                bottom: convertInchesToTwip(1),
                left: convertInchesToTwip(1),
              },
            },
          },
          children,
        },
      ],
    });
    
    // Generate and download the file
    const buffer = await Packer.toBuffer(doc);
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Error exporting cover letter DOCX:', error);
    throw new Error('Failed to export DOCX: ' + error.message);
  }
};
