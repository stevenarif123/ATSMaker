'use client'

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useResumeStore } from '../../../store/resumeStore';
import { useCoverLetterStore } from '../../../store/coverLetterStore';
import { exportCoverLetterToPDF, exportCoverLetterToDOCX } from '../../../lib/pdfExport';
import CoverLetterPreview, { COVER_LETTER_TEMPLATES } from '../../../components/CoverLetterPreview';
import OfflineIndicator from '../../../components/OfflineIndicator';
import CoverLetterForm from '../../../components/sections/CoverLetterForm';

export default function CoverLetterBuilder() {
  const [isOffline, setIsOffline] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(50);
  const [showPreview, setShowPreview] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [importStatus, setImportStatus] = useState(null); // 'success' | 'no-resume' | null
  const [isHydrated, setIsHydrated] = useState(false);
  
  const resumeData = useResumeStore();
  const coverLetterStore = useCoverLetterStore();
  
  // Access resume state directly to avoid getter issues
  const activeResumeId = useResumeStore((s) => s.activeResumeId);
  const versions = useResumeStore((s) => s.versions);
  const activeResume = versions[activeResumeId];
  const personalInfo = activeResume?.personalInfo || {};
  
  // Use state for values that differ between server and client
  const activeCoverLetter = isHydrated ? coverLetterStore.getActiveCoverLetter() : null;
  const selectedTemplate = activeCoverLetter?.templateId || 'formal';
  
  // Mark as hydrated after mount
  useEffect(() => {
    setIsHydrated(true);
  }, []);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExportMenu && !event.target.closest('.export-dropdown-container')) {
        setShowExportMenu(false);
      }
    };

    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportMenu]);

  const handleCreateCoverLetter = () => {
    const newCoverLetter = {
      recipientName: '',
      company: '',
      date: new Date().toISOString().split('T')[0],
      salutation: 'Dear Hiring Manager',
      bodyParagraphs: [{ text: '' }, { text: '' }, { text: '' }],
      closing: 'Sincerely',
      signature: personalInfo.fullName || '',
      associatedResumeId: null,
      templateId: 'formal'
    };
    coverLetterStore.addCoverLetter(newCoverLetter);
  };

  const handleImportFromResume = () => {
    if (!activeCoverLetter) return;
    
    // Check if there's resume data to import
    if (!activeResume || !personalInfo.fullName) {
      setImportStatus('no-resume');
      setTimeout(() => setImportStatus(null), 3000);
      return;
    }
    
    coverLetterStore.updateCoverLetter(activeCoverLetter.id, {
      signature: personalInfo.fullName || activeCoverLetter.signature,
      associatedResumeId: activeResumeId || null
    });
    
    setImportStatus('success');
    setTimeout(() => setImportStatus(null), 3000);
  };

  const handleExportPDF = async () => {
    if (!activeCoverLetter) return;
    setIsExporting(true);
    try {
      const filename = `${activeCoverLetter.company || 'cover-letter'}.pdf`;
      await exportCoverLetterToPDF(filename, activeCoverLetter, personalInfo);
    } catch (error) {
      console.error('Cover letter PDF export failed:', error);
    } finally {
      setIsExporting(false);
      setShowExportMenu(false);
    }
  };

  const handleExportDOCX = async () => {
    if (!activeCoverLetter) return;
    setIsExporting(true);
    try {
      const filename = `${activeCoverLetter.company || 'cover-letter'}.docx`;
      await exportCoverLetterToDOCX(filename, activeCoverLetter, personalInfo);
    } catch (error) {
      console.error('Cover letter DOCX export failed:', error);
    } finally {
      setIsExporting(false);
      setShowExportMenu(false);
    }
  };

  const handleTemplateSelect = (templateId) => {
    if (activeCoverLetter) {
      coverLetterStore.updateCoverLetter(activeCoverLetter.id, { templateId });
    }
    setShowTemplateSelector(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <OfflineIndicator isOffline={isOffline} />
      
      {/* Import Status Toast */}
      {importStatus && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg animate-slide-up ${
          importStatus === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-amber-50 text-amber-800 border border-amber-200'
        }`}>
          <div className="flex items-center gap-2">
            {importStatus === 'success' ? (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Resume data imported successfully!</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>No resume data found. Create a resume first.</span>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-40">
        <div className="container-center py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-all">
              <div className="w-9 h-9 bg-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="font-bold text-slate-900 hidden sm:inline">Cover Letter</span>
            </Link>

            {/* Navigation */}
            <div className="flex items-center gap-2">
              <Link
                href="/builder"
                className="btn btn-ghost btn-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="hidden sm:inline">Resume Builder</span>
              </Link>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Mobile Preview Toggle */}
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="btn btn-ghost btn-sm lg:hidden"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>

              {activeCoverLetter && (
                <>
                  <button
                    onClick={handleImportFromResume}
                    className="btn btn-ghost btn-sm"
                    title="Import data from resume"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span className="hidden sm:inline">Import from Resume</span>
                  </button>

                  <div className="relative export-dropdown-container">
                    <button
                      onClick={() => setShowExportMenu(!showExportMenu)}
                      disabled={isExporting}
                      className="btn btn-primary btn-sm"
                    >
                      {isExporting ? (
                        <>
                          <span className="loading loading-spinner loading-sm"></span>
                          <span className="hidden sm:inline">Exporting...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="hidden sm:inline">Export</span>
                          <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </>
                      )}
                    </button>

                    {showExportMenu && (
                      <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl z-50 min-w-[140px] animate-slide-up">
                        <button
                          onClick={handleExportPDF}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 flex items-center gap-2 first:rounded-t-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Export PDF
                        </button>
                        <button
                          onClick={handleExportDOCX}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 flex items-center gap-2 last:rounded-b-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Export DOCX
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
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
              <div className="card-body">
                {coverLetterStore.coverLetters.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No Cover Letters Yet</h3>
                    <p className="text-slate-500 mb-6">Create your first cover letter to get started</p>
                    <button
                      onClick={handleCreateCoverLetter}
                      className="btn btn-primary"
                    >
                      Create Cover Letter
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">Cover Letters</h3>
                        <p className="text-sm text-slate-500">Select or create a new cover letter</p>
                      </div>
                      <button
                        onClick={handleCreateCoverLetter}
                        className="btn btn-primary btn-sm"
                      >
                        + New Letter
                      </button>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Select Cover Letter
                      </label>
                      <select
                        value={coverLetterStore.activeCoverLetterId || ''}
                        onChange={(e) => coverLetterStore.setActiveCoverLetter(e.target.value)}
                        className="select select-bordered w-full"
                      >
                        <option value="">-- Select a letter --</option>
                        {coverLetterStore.coverLetters.map((cl) => (
                          <option key={cl.id} value={cl.id}>
                            {cl.company || 'Unnamed'} - {cl.recipientName || 'No recipient'}
                          </option>
                        ))}
                      </select>
                    </div>

                    {activeCoverLetter && (
                      <>
                        <CoverLetterForm key={coverLetterStore.activeCoverLetterId} />
                        <div className="mt-6 pt-6 border-t border-slate-200 flex gap-2">
                          <button
                            onClick={() => {
                              if (window.confirm('Delete this cover letter?')) {
                                coverLetterStore.deleteCoverLetter(coverLetterStore.activeCoverLetterId);
                              }
                            }}
                            className="btn btn-ghost btn-sm text-red-600 hover:bg-red-50"
                          >
                            Delete Letter
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className={`lg:w-[45%] flex-shrink-0 ${showPreview ? 'block' : 'hidden lg:block'}`}>
            <div className="card sticky top-20">
              <div className="px-4 py-3 border-b border-slate-200/50 flex items-center justify-between gap-3">
                <h2 className="font-semibold text-slate-900">Preview</h2>

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
                      className="btn btn-ghost btn-sm"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                      </svg>
                      <span className="hidden sm:inline">Template</span>
                    </button>

                    {showTemplateSelector && (
                      <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl z-50 animate-slide-up">
                        <div className="p-3">
                          <p className="text-xs font-medium text-slate-500 uppercase px-2 py-1 mb-2">Choose Template</p>
                          <div className="space-y-1">
                            {COVER_LETTER_TEMPLATES.map((template) => (
                              <button
                                key={template.id}
                                onClick={() => handleTemplateSelect(template.id)}
                                className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 ${
                                  selectedTemplate === template.id
                                    ? 'bg-purple-50 text-purple-700 ring-2 ring-purple-500 shadow-sm'
                                    : 'hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                <div className="font-medium text-sm">{template.name}</div>
                                <div className="text-xs text-slate-500">{template.description}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => setShowPreview(false)}
                    className="lg:hidden btn btn-ghost btn-sm"
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
                    <CoverLetterPreview
                      id="cover-letter-preview"
                      template={selectedTemplate}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
