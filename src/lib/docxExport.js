import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, convertInchesToTwip, BorderStyle } from 'docx';
import { TEMPLATE_COLORS, normalizeText, formatDateRange, formatLocation, generateFilename } from './templateMetadata.js';

// Convert RGB array to hex string for docx
const rgbToHex = (rgb) => {
  return rgb.map(x => x.toString(16).padStart(2, '0')).join('');
};

// ATS-friendly DOCX export using docx library
export const exportToDOCX = async (element, filename = 'resume.docx', resumeData) => {
  try {
    if (!resumeData) {
      throw new Error('Resume data not provided');
    }

    const { 
      personalInfo, 
      experience, 
      education, 
      skills, 
      projects, 
      certifications, 
      languages, 
      links, 
      customSections, 
      template = 'classic' 
    } = resumeData;
    
    const colors = TEMPLATE_COLORS[template] || TEMPLATE_COLORS.classic;
    const accentHex = rgbToHex(colors.accent);
    const textHex = rgbToHex(colors.text);
    const textDarkHex = rgbToHex(colors.textDark);
    const textMutedHex = rgbToHex(colors.textMuted);
    
    const children = [];
    
    // ============ HEADER ============
    // Name
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: personalInfo.fullName || 'Your Name',
            color: textDarkHex,
            bold: true,
            size: 32,
          }),
        ],
        alignment: colors.headerAlign === 'left' ? AlignmentType.LEFT : AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );

    // Contact Info
    const contactParts = [];
    if (personalInfo.email) contactParts.push(personalInfo.email);
    if (personalInfo.phone) contactParts.push(personalInfo.phone);
    if (personalInfo.location) contactParts.push(personalInfo.location);
    
    if (contactParts.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: contactParts.join('  |  '),
              color: textMutedHex,
              size: 20,
            }),
          ],
          alignment: colors.headerAlign === 'left' ? AlignmentType.LEFT : AlignmentType.CENTER,
          spacing: { after: 200 },
        })
      );
    }

    // Links (LinkedIn & GitHub)
    const linkParts = [];
    if (personalInfo.linkedin) {
      const linkedinUrl = personalInfo.linkedin.startsWith('http') 
        ? personalInfo.linkedin 
        : `https://linkedin.com/in/${personalInfo.linkedin}`;
      linkParts.push(linkedinUrl);
    }
    if (personalInfo.github) {
      const githubUrl = personalInfo.github.startsWith('http') 
        ? personalInfo.github 
        : `https://github.com/${personalInfo.github}`;
      linkParts.push(githubUrl);
    }
    
    if (linkParts.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: linkParts.join('  |  '),
              color: accentHex,
              size: 20,
              italics: true,
            }),
          ],
          alignment: colors.headerAlign === 'left' ? AlignmentType.LEFT : AlignmentType.CENTER,
          spacing: { after: 400 },
        })
      );
    }

    // Divider line
    children.push(
      new Paragraph({
        children: [new TextRun({ text: '' })],
        border: {
          bottom: {
            color: textDarkHex,
            size: 12,
            style: BorderStyle.SINGLE,
          },
        },
        spacing: { after: 400 },
      })
    );

    // ============ PROFESSIONAL SUMMARY ============
    if (personalInfo.summary) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'PROFESSIONAL SUMMARY',
              color: template === 'modern' ? accentHex : textDarkHex,
              bold: true,
              size: 22,
            }),
          ],
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 200 },
        })
      );
      
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: normalizeText(personalInfo.summary),
              color: textHex,
              size: 20,
            }),
          ],
          spacing: { after: 400 },
        })
      );
    }

    // ============ EXPERIENCE ============
    if (experience && experience.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'PROFESSIONAL EXPERIENCE',
              color: template === 'modern' ? accentHex : textDarkHex,
              bold: true,
              size: 22,
            }),
          ],
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 200 },
        })
      );

      experience.forEach((exp) => {
        // Job Title and Date
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: exp.position || '',
                color: textDarkHex,
                bold: true,
                size: 20,
              }),
              new TextRun({
                text: `\t${formatDateRange(exp.startDate, exp.endDate, exp.current)}`,
                color: textMutedHex,
                size: 20,
              }),
            ],
            spacing: { after: 200 },
          })
        );
        
        // Company and Location
        const companyLocation = [exp.company, exp.location].filter(Boolean).join(', ');
        if (companyLocation) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: companyLocation,
                  color: textMutedHex,
                  italics: true,
                  size: 20,
                }),
              ],
              spacing: { after: 200 },
            })
          );
        }
        
        // Bullet points
        if (exp.bullets && exp.bullets.length > 0) {
          exp.bullets.forEach(bullet => {
            if (bullet && bullet.trim()) {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `• ${normalizeText(bullet)}`,
                      color: textHex,
                      size: 20,
                    }),
                  ],
                  spacing: { after: 200 },
                })
              );
            }
          });
        }
        
        children.push(
          new Paragraph({
            children: [new TextRun({ text: '' })],
            spacing: { after: 200 },
          })
        );
      });
    }

    // ============ EDUCATION ============
    if (education && education.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'EDUCATION',
              color: template === 'modern' ? accentHex : textDarkHex,
              bold: true,
              size: 22,
            }),
          ],
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 200 },
        })
      );

      education.forEach((edu) => {
        // Degree and Date
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: edu.degree || '',
                color: textDarkHex,
                bold: true,
                size: 20,
              }),
              new TextRun({
                text: `\t${formatDateRange(edu.startDate, edu.endDate, false)}`,
                color: textMutedHex,
                size: 20,
              }),
            ],
            spacing: { after: 200 },
          })
        );
        
        // School, Location, GPA
        let schoolInfo = [edu.school, edu.location].filter(Boolean).join(', ');
        if (edu.gpa) schoolInfo += ` | GPA: ${edu.gpa}`;
        
        if (schoolInfo) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: schoolInfo,
                  color: textMutedHex,
                  size: 20,
                }),
              ],
              spacing: { after: 200 },
            })
          );
        }
        
        children.push(
          new Paragraph({
            children: [new TextRun({ text: '' })],
            spacing: { after: 200 },
          })
        );
      });
    }

    // ============ SKILLS ============
    if (skills && skills.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'SKILLS',
              color: template === 'modern' ? accentHex : textDarkHex,
              bold: true,
              size: 22,
            }),
          ],
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 200 },
        })
      );
      
      const skillsText = skills.map(s => s.name).filter(Boolean).join('  •  ');
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: skillsText,
              color: textHex,
              size: 20,
            }),
          ],
          spacing: { after: 400 },
        })
      );
    }

    // ============ PROJECTS ============
    if (projects && projects.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'PROJECTS',
              color: template === 'modern' ? accentHex : textDarkHex,
              bold: true,
              size: 22,
            }),
          ],
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 200 },
        })
      );

      projects.forEach((project) => {
        // Project Name and URL
        const projectChildren = [
          new TextRun({
            text: project.name || '',
            color: textDarkHex,
            bold: true,
            size: 20,
          }),
        ];
        
        if (project.url) {
          projectChildren.push(
            new TextRun({
              text: `  (${project.url})`,
              color: accentHex,
              italics: true,
              size: 20,
            })
          );
        }
        
        children.push(
          new Paragraph({
            children: projectChildren,
            spacing: { after: 200 },
          })
        );
        
        // Description
        if (project.description) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: normalizeText(project.description),
                  color: textHex,
                  size: 20,
                }),
              ],
              spacing: { after: 200 },
            })
          );
        }
        
        // Technologies
        if (project.technologies && project.technologies.length > 0) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Technologies: ' + project.technologies.join(', '),
                  color: textMutedHex,
                  italics: true,
                  size: 18,
                }),
              ],
              spacing: { after: 200 },
            })
          );
        }
        
        children.push(
          new Paragraph({
            children: [new TextRun({ text: '' })],
            spacing: { after: 200 },
          })
        );
      });
    }

    // ============ CERTIFICATIONS ============
    if (certifications && certifications.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'CERTIFICATIONS',
              color: template === 'modern' ? accentHex : textDarkHex,
              bold: true,
              size: 22,
            }),
          ],
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 200 },
        })
      );

      certifications.forEach((cert) => {
        // Certification Name and Date
        const certChildren = [
          new TextRun({
            text: cert.name || '',
            color: textDarkHex,
            bold: true,
            size: 20,
          }),
        ];
        
        if (cert.date) {
          certChildren.push(
            new TextRun({
              text: `\t${cert.date}`,
              color: textMutedHex,
              size: 20,
            })
          );
        }
        
        children.push(
          new Paragraph({
            children: certChildren,
            spacing: { after: 200 },
          })
        );
        
        // Issuer
        if (cert.issuer) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: cert.issuer,
                  color: textMutedHex,
                  size: 18,
                }),
              ],
              spacing: { after: 200 },
            })
          );
        }
        
        // URL
        if (cert.url) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: cert.url,
                  color: accentHex,
                  italics: true,
                  size: 18,
                }),
              ],
              spacing: { after: 200 },
            })
          );
        }
        
        children.push(
          new Paragraph({
            children: [new TextRun({ text: '' })],
            spacing: { after: 200 },
          })
        );
      });
    }

    // ============ LANGUAGES ============
    if (languages && languages.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'LANGUAGES',
              color: template === 'modern' ? accentHex : textDarkHex,
              bold: true,
              size: 22,
            }),
          ],
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 200 },
        })
      );
      
      const langText = languages.map(l => l.level ? `${l.name} (${l.level})` : l.name).filter(Boolean).join('  •  ');
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: langText,
              color: textHex,
              size: 20,
            }),
          ],
          spacing: { after: 400 },
        })
      );
    }

    // ============ LINKS ============
    if (links && links.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'LINKS',
              color: template === 'modern' ? accentHex : textDarkHex,
              bold: true,
              size: 22,
            }),
          ],
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 200 },
        })
      );
      
      links.forEach((link) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${link.label}: `,
                color: textDarkHex,
                bold: true,
                size: 20,
              }),
              new TextRun({
                text: link.url,
                color: accentHex,
                italics: true,
                size: 20,
              }),
            ],
            spacing: { after: 200 },
          })
        );
      });
    }

    // ============ CUSTOM SECTIONS ============
    if (customSections && customSections.length > 0) {
      customSections.forEach(section => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: (section.title || 'ADDITIONAL').toUpperCase(),
                color: template === 'modern' ? accentHex : textDarkHex,
                bold: true,
                size: 22,
              }),
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 200 },
          })
        );
        
        if (section.content) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: normalizeText(section.content),
                  color: textHex,
                  size: 20,
                }),
              ],
              spacing: { after: 200 },
            })
          );
        }
        
        if (section.items && section.items.length > 0) {
          section.items.forEach(item => {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `• ${normalizeText(item)}`,
                    color: textHex,
                    size: 20,
                  }),
                ],
                spacing: { after: 200 },
              })
            );
          });
        }
      });
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
    const a = document.createElement('a');
    a.href = url;
    a.download = generateFilename(personalInfo.fullName, '', 'docx');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('DOCX export failed:', error);
    throw error;
  }
};
