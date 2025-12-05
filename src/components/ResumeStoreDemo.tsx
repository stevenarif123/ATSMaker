import React, { useEffect } from 'react';
import { useResumeState, useResumeActions, useResumeValidation } from '../stores/resume-store';
import { Resume } from '../lib/schema';

const ResumeStoreDemo: React.FC = () => {
  const { resume, isDirty, error, lastSaved } = useResumeState();
  const { resetResume, exportResume, importResume, mergeImportedData } = useResumeActions();
  const { validate, getScore, getKeywords } = useResumeValidation();

  const [validationResult, setValidationResult] = React.useState<{ isValid: boolean; errors: string[] } | null>(null);
  const [completenessScore, setCompletenessScore] = React.useState<number>(0);
  const [keywords, setKeywords] = React.useState<string[]>([]);
  const [exportedData, setExportedData] = React.useState<string>('');

  useEffect(() => {
    if (resume) {
      setValidationResult(validate());
      setCompletenessScore(getScore());
      setKeywords(getKeywords());
    }
  }, [resume, validate, getScore, getKeywords]);

  const handleExport = () => {
    const data = exportResume();
    setExportedData(data);
  };

  const handleImport = () => {
    const sampleResume: Resume = {
      personalInfo: {
        fullName: 'John Doe',
        title: 'Senior Software Engineer',
        summary: 'Experienced software engineer with a passion for building scalable applications.',
        contact: {
          email: 'john.doe@example.com',
          phone: '+1 (555) 123-4567',
          location: 'San Francisco, CA',
          linkedin: 'https://linkedin.com/in/johndoe',
          github: 'https://github.com/johndoe',
        },
      },
      summary: 'Senior Software Engineer with 8+ years of experience in full-stack development.',
      workExperience: [
        {
          id: '1',
          company: 'Tech Corp',
          position: 'Senior Software Engineer',
          location: 'San Francisco, CA',
          dateRange: {
            startDate: '2020-01-01',
            endDate: null,
            current: true,
          },
          description: 'Leading development of enterprise applications.',
          achievements: [
            {
              title: 'Performance Optimization',
              description: 'Improved application performance by 40%',
              metrics: '40% performance improvement',
            },
          ],
          technologies: ['React', 'TypeScript', 'Node.js', 'AWS'],
        },
      ],
      education: [
        {
          id: '1',
          institution: 'University of California, Berkeley',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          location: 'Berkeley, CA',
          dateRange: {
            startDate: '2014-09-01',
            endDate: '2018-05-31',
            current: false,
          },
          gpa: '3.8',
          honors: [],
        },
      ],
      projects: [
        {
          id: '1',
          name: 'E-commerce Platform',
          description: 'Built a full-stack e-commerce platform with React and Node.js.',
          technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
          url: 'https://example.com',
          github: 'https://github.com/johndoe/ecommerce',
          highlights: ['Real-time inventory', 'Payment processing', 'Admin dashboard'],
        },
      ],
      skills: {
        technical: [
          {
            category: 'Frontend',
            skills: ['React', 'TypeScript', 'HTML', 'CSS', 'Tailwind CSS'],
          },
          {
            category: 'Backend',
            skills: ['Node.js', 'Express', 'Python', 'PostgreSQL', 'MongoDB'],
          },
          {
            category: 'Cloud',
            skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
          },
        ],
        soft: [
          {
            category: 'Leadership',
            skills: ['Team Management', 'Mentoring', 'Project Planning'],
          },
          {
            category: 'Communication',
            skills: ['Public Speaking', 'Technical Writing', 'Client Relations'],
          },
        ],
        languages: [
          {
            language: 'English',
            proficiency: 'Native',
          },
          {
            language: 'Spanish',
            proficiency: 'Intermediate',
          },
        ],
      },
      certifications: [
        {
          id: '1',
          name: 'AWS Solutions Architect',
          issuer: 'Amazon Web Services',
          date: '2022-06-01',
          url: 'https://aws.amazon.com/certification/',
        },
      ],
      languages: [
        {
          language: 'English',
          proficiency: 'Native',
        },
        {
          language: 'Spanish',
          proficiency: 'Conversational',
        },
      ],
      lastModified: new Date().toISOString(),
    };

    const result = importResume(JSON.stringify(sampleResume));
    if (result.success) {
      alert('Sample resume imported successfully!');
    } else {
      alert(`Import failed: ${result.error}`);
    }
  };

  const handleMerge = () => {
    const additionalData = {
      workExperience: [
        {
          id: '2',
          company: 'StartupXYZ',
          position: 'Full Stack Developer',
          location: 'Austin, TX',
          dateRange: {
            startDate: '2018-06-01',
            endDate: '2019-12-31',
            current: false,
          },
          description: 'Developed web applications for various clients.',
          achievements: [
            {
              title: 'Client Project',
              description: 'Successfully delivered 10+ client projects',
              metrics: '100% client satisfaction',
            },
          ],
          technologies: ['Vue.js', 'Laravel', 'MySQL'],
        },
      ],
    };

    mergeImportedData(additionalData);
    alert('Additional work experience merged!');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Resume Store Demo</h1>
      
      {/* Store Status */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Store Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded ${isDirty ? 'bg-yellow-100' : 'bg-green-100'}`}>
            <p className="font-medium">Status</p>
            <p className="text-sm">{isDirty ? 'Unsaved Changes' : 'Saved'}</p>
          </div>
          <div className="p-4 bg-blue-100 rounded">
            <p className="font-medium">Last Saved</p>
            <p className="text-sm">{lastSaved ? new Date(lastSaved).toLocaleString() : 'Never'}</p>
          </div>
          <div className="p-4 bg-purple-100 rounded">
            <p className="font-medium">Resume Data</p>
            <p className="text-sm">{resume ? 'Loaded' : 'Empty'}</p>
          </div>
        </div>
        
        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <p className="font-medium">Error:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Actions</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={resetResume}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Reset Resume
          </button>
          <button
            onClick={handleImport}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Import Sample
          </button>
          <button
            onClick={handleMerge}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            disabled={!resume}
          >
            Merge Additional Data
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            disabled={!resume}
          >
            Export Resume
          </button>
        </div>
      </div>

      {/* Validation and Analytics */}
      {resume && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Validation & Analytics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Validation Result</h3>
              <div className={`p-4 rounded ${validationResult?.isValid ? 'bg-green-100' : 'bg-red-100'}`}>
                <p className="font-medium">
                  {validationResult?.isValid ? '✅ Valid' : '❌ Invalid'}
                </p>
                {validationResult?.errors && validationResult.errors.length > 0 && (
                  <ul className="mt-2 text-sm list-disc list-inside">
                    {validationResult.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Completeness Score</h3>
              <div className="p-4 bg-blue-100 rounded">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{completenessScore}%</span>
                  <div className="w-32 bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                      style={{ width: `${completenessScore}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-medium mb-2">Extracted Keywords ({keywords.length})</h3>
            <div className="p-4 bg-gray-100 rounded max-h-32 overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exported Data */}
      {exportedData && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Exported Resume Data</h2>
          <div className="bg-gray-100 p-4 rounded max-h-96 overflow-y-auto">
            <pre className="text-xs">{exportedData}</pre>
          </div>
        </div>
      )}

      {/* Type Safety Demo */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Type Safety Demo</h2>
        <p className="text-sm text-gray-600 mb-4">
          This demo showcases full TypeScript type safety. All resume data is validated against Zod schemas,
          and React Hook Form automatically infers types from the schemas.
        </p>
        <div className="bg-gray-100 p-4 rounded">
          <p className="text-sm font-mono">
            ✅ PersonalInfo type inferred from Zod schema<br/>
            ✅ Form validation with runtime type checking<br/>
            ✅ Auto-completion for all resume fields<br/>
            ✅ Type-safe store actions and selectors<br/>
            ✅ IndexedDB and localStorage persistence
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResumeStoreDemo;