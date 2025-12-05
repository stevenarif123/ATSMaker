import { z } from 'zod';

// Helper schemas
const DateRangeSchema = z.object({
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().nullable().optional(),
  current: z.boolean().default(false),
});

const ContactInfoSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  location: z.string().min(1, 'Location is required'),
  linkedin: z.string().url().optional(),
  github: z.string().url().optional(),
  website: z.string().url().optional(),
});

const AchievementSchema = z.object({
  title: z.string().min(1, 'Achievement title is required'),
  description: z.string().min(1, 'Achievement description is required'),
  metrics: z.string().optional(),
});

// Main schemas
const PersonalInfoSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  title: z.string().min(1, 'Professional title is required'),
  summary: z.string().min(1, 'Summary is required'),
  contact: ContactInfoSchema,
});

const WorkExperienceSchema = z.object({
  id: z.string(),
  company: z.string().min(1, 'Company name is required'),
  position: z.string().min(1, 'Position is required'),
  location: z.string().min(1, 'Location is required'),
  dateRange: DateRangeSchema,
  description: z.string().min(1, 'Description is required'),
  achievements: z.array(AchievementSchema),
  technologies: z.array(z.string()),
});

const EducationSchema = z.object({
  id: z.string(),
  institution: z.string().min(1, 'Institution name is required'),
  degree: z.string().min(1, 'Degree is required'),
  field: z.string().min(1, 'Field of study is required'),
  location: z.string().min(1, 'Location is required'),
  dateRange: DateRangeSchema,
  gpa: z.string().optional(),
  honors: z.array(z.string()).default([]),
});

const ProjectSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Project name is required'),
  description: z.string().min(1, 'Project description is required'),
  technologies: z.array(z.string()),
  dateRange: DateRangeSchema.optional(),
  url: z.string().url().optional(),
  github: z.string().url().optional(),
  highlights: z.array(z.string()).default([]),
});

const SkillCategorySchema = z.object({
  category: z.string().min(1, 'Category name is required'),
  skills: z.array(z.string().min(1)),
});

const SkillsSchema = z.object({
  technical: z.array(SkillCategorySchema),
  soft: z.array(SkillCategorySchema),
  languages: z.array(z.object({
    language: z.string().min(1),
    proficiency: z.enum(['Basic', 'Intermediate', 'Advanced', 'Native']),
  })),
});

const CertificationSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Certification name is required'),
  issuer: z.string().min(1, 'Issuer is required'),
  date: z.string().min(1, 'Date is required'),
  url: z.string().url().optional(),
  expires: z.string().optional(),
});

// Main Resume Schema
const ResumeSchema = z.object({
  personalInfo: PersonalInfoSchema,
  summary: z.string().min(1, 'Summary is required'),
  workExperience: z.array(WorkExperienceSchema),
  education: z.array(EducationSchema),
  projects: z.array(ProjectSchema),
  skills: SkillsSchema,
  certifications: z.array(CertificationSchema),
  languages: z.array(z.object({
    language: z.string().min(1),
    proficiency: z.enum(['Basic', 'Conversational', 'Fluent', 'Native']),
  })),
  lastModified: z.string().optional(),
});

// Type exports
export type PersonalInfo = z.infer<typeof PersonalInfoSchema>;
export type WorkExperience = z.infer<typeof WorkExperienceSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type Skills = z.infer<typeof SkillsSchema>;
export type Certification = z.infer<typeof CertificationSchema>;
export type Resume = z.infer<typeof ResumeSchema>;
export type DateRange = z.infer<typeof DateRangeSchema>;
export type ContactInfo = z.infer<typeof ContactInfoSchema>;
export type Achievement = z.infer<typeof AchievementSchema>;
export type SkillCategory = z.infer<typeof SkillCategorySchema>;

// Schema exports
export {
  ResumeSchema,
  PersonalInfoSchema,
  WorkExperienceSchema,
  EducationSchema,
  ProjectSchema,
  SkillsSchema,
  CertificationSchema,
  DateRangeSchema,
  ContactInfoSchema,
  AchievementSchema,
  SkillCategorySchema,
};