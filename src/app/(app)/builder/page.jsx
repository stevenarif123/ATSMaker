import { useState, useEffect } from 'react';
import { DndContext } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useResumeStore } from '../../../store/resumeStore';
import { exportToPDF, exportToJSON } from '../../../lib/pdfExport';
import PersonalInfoSection from '../../../components/sections/PersonalInfoSection';
import ExperienceSection from '../../../components/sections/ExperienceSection';
import EducationSection from '../../../components/sections/EducationSection';
import SkillsSection from '../../../components/sections/SkillsSection';
import ProjectsSection from '../../../components/sections/ProjectsSection';
import ResumePreview from '../../../components/ResumePreview';
import OfflineIndicator from '../../../components/OfflineIndicator';

export default function Builder() {
  const [activeTab, setActiveTab] = useState('personal');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isExporting, setIsExporting] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  
  const resumeData = useResumeStore();

  useEffect(() => {
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
      await exportToPDF(previewElement, `${resumeData.personalInfo.fullName || 'resume'}.pdf`);
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
    
    if (active.id !== over.id) {
      const oldIndex = resumeData.experience.findIndex(exp => exp.id === active.id);
      const newIndex = resumeData.experience.findIndex(exp => exp.id === over.id);
      
      const newOrder = arrayMove(resumeData.experience, oldIndex, newIndex);
      resumeData.reorderExperience(newOrder);
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal', icon: '👤' },
    { id: 'experience', label: 'Experience', icon: '💼' },
    { id: 'education', label: 'Education', icon: '🎓' },
    { id: 'skills', label: 'Skills', icon: '🔧' },
    { id: 'projects', label: 'Projects', icon: '🚀' }
  ];

  return (
    <div className="min-h-screen bg-base-200">
      <OfflineIndicator isOffline={isOffline} />
      
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-base-content">Resume Builder</h1>
          <p className="text-base-content/70">Create your ATS-friendly resume</p>
        </div>

        {/* Export Controls */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="btn btn-primary"
          >
            {isExporting ? (
              <><span className="loading loading-spinner loading-sm"></span> Exporting...</>
            ) : (
              <>📄 Export PDF</>
            )}
          </button>
          <button onClick={handleExportJSON} className="btn btn-secondary">
            💾 Export JSON
          </button>
          <button 
            onClick={() => setShowImportDialog(true)}
            className="btn btn-outline"
          >
            📂 Import JSON
          </button>
          <button 
            onClick={resumeData.resetResume}
            className="btn btn-error btn-outline"
          >
            🗑️ Clear All
          </button>
        </div>

        {/* Import Dialog */}
        {showImportDialog && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg">Import Resume Data</h3>
              <p className="py-4">Select a JSON file to import your resume data.</p>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="file-input file-input-bordered w-full"
              />
              <div className="modal-action">
                <button 
                  onClick={() => setShowImportDialog(false)}
                  className="btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Editor */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              {/* Tabs */}
              <div className="tabs tabs-boxed mb-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`tab ${activeTab === tab.id ? 'tab-active' : ''}`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="min-h-[500px]">
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
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Preview</h2>
              <div className="overflow-auto max-h-[800px]">
                <ResumePreview id="resume-preview" data={resumeData} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}