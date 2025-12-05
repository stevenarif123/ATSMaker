import { useState } from 'react';
import PersonalInfoForm from './components/forms/PersonalInfoForm';
import ResumeStoreDemo from './components/ResumeStoreDemo';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('demo');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ATS Resume Maker</h1>
              <p className="text-gray-600 mt-1">Build your ATS-optimized resume with type safety</p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('demo')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'demo'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Store Demo
            </button>
            <button
              onClick={() => setActiveTab('form')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'form'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Personal Info Form
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {activeTab === 'demo' && <ResumeStoreDemo />}
          {activeTab === 'form' && <PersonalInfoForm />}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500 text-sm">
            <p>Built with React, TypeScript, Zod, Zustand, and IndexedDB</p>
            <p className="mt-2">✨ Fully typed resume schema with ATS optimization</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;