'use client'

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { DndContext } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useResumeStore } from '../../../store/resumeStore';
import { exportToPDF, exportToJSON } from '../../../lib/pdfExport';
import { calculateATSScore } from '../../../lib/atsScoring';
import PersonalInfoSection from '../../../components/sections/PersonalInfoSection';
import ExperienceSection from '../../../components/sections/ExperienceSection';
import EducationSection from '../../../components/sections/EducationSection';
import SkillsSection from '../../../components/sections/SkillsSection';
import ProjectsSection from '../../../components/sections/ProjectsSection';
import CertificationsSection from '../../../components/sections/CertificationsSection';
import LanguagesSection from '../../../components/sections/LanguagesSection';
import LinksSection from '../../../components/sections/LinksSection';
import ResumePreview, { RESUME_TEMPLATES } from '../../../components/ResumePreview';
import OfflineIndicator from '../../../components/OfflineIndicator';
import ATSScorePanel from '../../../components/ATSScorePanel';

export default function Builder() {
  const [activeTab, setActiveTab] = useState('personal');
  const [isOffline, setIsOffline] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(50);
  const [showATSPanel, setShowATSPanel] = useState(true);
  
  const resumeData = useResumeStore();
  
  // Calculate ATS score with memoization
  const atsScore = useMemo(() => {
    const score = calculateATSScore(resumeData, resumeData.jobDescription || '');
    return score.overallScore;
  }, [
    resumeData.personalInfo,
    resumeData.experience,
    resumeData.education,
    resumeData.skills,
    resumeData.projects,
    resumeData.certifications,
    resumeData.languages,
    resumeData.jobDescription
  ]);
  
  // Throttled job description handler
  const handleJobDescriptionChange = useCallback((description) => {
    resumeData.setJobDescription(description);
  }, [resumeData]);

  useEffect(() => {
    setIsOffline(!navigator.onLine);
    
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const previewElement = document.getElementById('resume-preview');
      await exportToPDF(previewElement, `${resumeData.personalInfo.fullName || 'resume'}.pdf`, {
        personalInfo: resumeData.personalInfo,
        experience: resumeData.experience,
        education: resumeData.education,
        skills: resumeData.skills,
        projects: resumeData.projects,
        certifications: resumeData.certifications || [],
        languages: resumeData.languages || [],
        links: resumeData.links || [],
        customSections: resumeData.customSections || [],
        template: selectedTemplate
      });
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJSON = () => {
    try {
      exportToJSON(resumeData.exportResume(), `${resumeData.personalInfo.fullName || 'resume'}.json`);
    } catch (error) {
      console.error('JSON export failed:', error);
    }
  };

  const handleImportJSON = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          resumeData.importResume(data);
          setShowImportDialog(false);
        } catch (error) {
          console.error('Import failed:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = resumeData.experience.findIndex(exp => exp.id === active.id);
      const newIndex = resumeData.experience.findIndex(exp => exp.id === over.id);
      
      const newOrder = arrayMove(resumeData.experience, oldIndex, newIndex);
      resumeData.reorderExperience(newOrder);
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )},
    { id: 'experience', label: 'Experience', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )},
    { id: 'education', label: 'Education', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M12 14l9-5-9-5-9 5 9 5z" />
        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
      </svg>
    )},
    { id: 'skills', label: 'Skills', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    )},
    { id: 'projects', label: 'Projects', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    )},
    { id: 'certifications', label: 'Certifications', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    )},
    { id: 'languages', label: 'Languages', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>
    )},
    { id: 'links', label: 'Links', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    )}
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <OfflineIndicator isOffline={isOffline} />
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="container-center py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="font-bold text-slate-900 hidden sm:inline">ATS Maker</span>
              </Link>
              
              {/* ATS Score Badge */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${
                atsScore >= 80 ? 'bg-green-100 text-green-700' :
                atsScore >= 60 ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden sm:inline">Score:</span> {atsScore}/100
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile Preview Toggle */}
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="btn btn-outline btn-sm lg:hidden"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="hidden sm:inline">Preview</span>
              </button>

              <button 
                onClick={() => setShowImportDialog(true)}
                className="btn btn-ghost btn-sm"
                title="Import JSON"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span className="hidden sm:inline">Import</span>
              </button>
              
              <button 
                onClick={handleExportJSON}
                className="btn btn-ghost btn-sm"
                title="Export JSON"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                <span className="hidden sm:inline">Save</span>
              </button>

              <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="btn btn-primary btn-sm"
              >
                {isExporting ? (
                  <>
                    <span className="spinner spinner-sm"></span>
                    <span className="hidden sm:inline">Exporting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="hidden sm:inline">Export PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-center py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Editor Panel */}
          <div className={`flex-1 min-w-0 ${showPreview ? 'hidden lg:block' : 'block'}`}>
            <div className="card">
              {/* Tabs */}
              <div className="border-b border-slate-200 px-4 pt-4">
                <div className="flex gap-1 overflow-x-auto pb-px custom-scrollbar">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap rounded-t-lg transition-all duration-200 border-b-2 -mb-px ${
                        activeTab === tab.id 
                          ? 'text-blue-600 border-blue-600 bg-blue-50/50' 
                          : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      {tab.icon}
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="card-body min-h-[500px]">
                <div className="animate-fade-in">
                  {activeTab === 'personal' && (
                    <PersonalInfoSection data={resumeData.personalInfo} />
                  )}
                  {activeTab === 'experience' && (
                    <DndContext onDragEnd={handleDragEnd}>
                      <SortableContext 
                        items={resumeData.experience.map(exp => exp.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <ExperienceSection experience={resumeData.experience} />
                      </SortableContext>
                    </DndContext>
                  )}
                  {activeTab === 'education' && (
                    <EducationSection education={resumeData.education} />
                  )}
                  {activeTab === 'skills' && (
                    <SkillsSection skills={resumeData.skills} />
                  )}
                  {activeTab === 'projects' && (
                    <ProjectsSection projects={resumeData.projects} />
                  )}
                  {activeTab === 'certifications' && (
                    <CertificationsSection certifications={resumeData.certifications || []} />
                  )}
                  {activeTab === 'languages' && (
                    <LanguagesSection languages={resumeData.languages || []} />
                  )}
                  {activeTab === 'links' && (
                    <LinksSection links={resumeData.links || []} />
                  )}
                </div>
              </div>
            </div>

            {/* Clear Data Button */}
            <div className="mt-4 text-center">
              <button 
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                    resumeData.resetResume();
                  }
                }}
                className="text-sm text-slate-500 hover:text-red-600 transition-colors"
              >
                Clear all data
              </button>
            </div>
          </div>

          {/* Preview Panel */}
          <div className={`lg:w-[40%] flex-shrink-0 ${showPreview ? 'block' : 'hidden lg:block'}`}>
            <div className="space-y-4">
              {/* ATS Score Panel */}
              {showATSPanel && (
                <ATSScorePanel
                  resume={resumeData}
                  jobDescription={resumeData.jobDescription || ''}
                  onJobDescriptionChange={handleJobDescriptionChange}
                />
              )}
              
              {/* Resume Preview */}
              <div className="card">
                <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3">
                  <h2 className="font-semibold text-slate-900">Live Preview</h2>
                  
                  <div className="flex items-center gap-2">
                    {/* Zoom Controls */}
                    <div className="flex items-center gap-1 bg-slate-100 rounded-lg px-2 py-1">
                      <button
                        onClick={() => setPreviewZoom(Math.max(25, previewZoom - 10))}
                        className="p-1 text-slate-500 hover:text-slate-700 disabled:opacity-50"
                        disabled={previewZoom <= 25}
                        title="Zoom Out"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="text-xs font-medium text-slate-600 w-10 text-center">{previewZoom}%</span>
                      <button
                        onClick={() => setPreviewZoom(Math.min(100, previewZoom + 10))}
                        className="p-1 text-slate-500 hover:text-slate-700 disabled:opacity-50"
                        disabled={previewZoom >= 100}
                        title="Zoom In"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Template Selector */}
                    <div className="relative">
                      <button
                        onClick={() => setShowTemplateSelector(!showTemplateSelector)}
                        className="btn btn-outline btn-sm"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                        </svg>
                        <span className="hidden sm:inline">Template</span>
                      </button>
                      
                      {showTemplateSelector && (
                        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
                          <div className="p-2">
                            <p className="text-xs font-medium text-slate-500 uppercase px-2 py-1 mb-1">Choose Template</p>
                            {RESUME_TEMPLATES.map((template) => (
                              <button
                                key={template.id}
                                onClick={() => {
                                  setSelectedTemplate(template.id);
                                  setShowTemplateSelector(false);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                                  selectedTemplate === template.id
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                <div className="font-medium text-sm">{template.name}</div>
                                <div className="text-xs text-slate-500">{template.description}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => setShowPreview(false)}
                      className="lg:hidden btn btn-ghost btn-sm btn-icon"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="p-3 bg-slate-100">
                  <div className="bg-white rounded-lg shadow-sm overflow-auto max-h-[calc(100vh-200px)] custom-scrollbar">
                    <div 
                      className="transform origin-top-left transition-transform duration-200" 
                      style={{ 
                        transform: `scale(${previewZoom / 100})`,
                        width: `${10000 / previewZoom}%`,
                        marginBottom: `${-100 + previewZoom}%`
                      }}
                    >
                      <ResumePreview id="resume-preview" data={resumeData} template={selectedTemplate} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Import Dialog */}
      {showImportDialog && (
        <div className="modal-overlay" onClick={() => setShowImportDialog(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-semibold text-slate-900">Import Resume Data</h3>
            </div>
            <div className="modal-body">
              <p className="text-sm text-slate-600 mb-4">
                Select a previously exported JSON file to restore your resume data.
              </p>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="file-input w-full"
              />
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => setShowImportDialog(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}