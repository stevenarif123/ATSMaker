'use client'

import { useState, useRef, useEffect } from 'react';
import { TEMPLATE_LIST, TEMPLATE_CATEGORIES } from '../lib/templateConfig';

export default function TemplateSelector({ selectedTemplate, onSelectTemplate }) {
  const [showSelector, setShowSelector] = useState(false);
  const containerRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState('Professional');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowSelector(false);
    }
  };

  const handleSelectTemplate = (templateId) => {
    onSelectTemplate(templateId);
    setShowSelector(false);
  };

  const selectedTemplateObj = TEMPLATE_LIST.find(t => t.id === selectedTemplate);
  const categories = Object.keys(TEMPLATE_CATEGORIES);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setShowSelector(!showSelector)}
        onKeyDown={handleKeyDown}
        className="btn btn-ghost btn-sm"
        title="Choose template"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
        <span className="hidden sm:inline">Template</span>
      </button>

      {showSelector && (
        <div 
          className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl z-50 flex flex-col animate-slide-up"
          onKeyDown={handleKeyDown}
          role="menu"
        >
          {/* Header */}
          <div className="px-4 py-3 flex items-center justify-between border-b border-slate-200/50">
            <h3 className="font-semibold text-slate-900">Resume Templates</h3>
            <button
              onClick={() => setShowSelector(false)}
              className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-lg transition-colors"
              aria-label="Close"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Category Tabs - horizontal pills */}
          <div className="flex flex-wrap gap-1.5 px-3 py-3 border-b border-slate-200/50">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                role="tab"
              >
                {category}
              </button>
            ))}
          </div>

          {/* Templates List */}
          <div className="max-h-72 overflow-y-auto custom-scrollbar px-3 py-3 space-y-1.5">
            {TEMPLATE_CATEGORIES[selectedCategory]?.map((template) => (
              <button
                key={template.id}
                onClick={() => handleSelectTemplate(template.id)}
                className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                  selectedTemplate === template.id
                    ? 'bg-blue-50 ring-2 ring-blue-500 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 hover:shadow-sm'
                }`}
                role="menuitem"
              >
                <div className="flex items-center gap-3">
                  {/* Color indicator */}
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: template.accentColor }}
                  ></div>
                  {/* Template Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-slate-900">{template.name}</div>
                    <div className="text-xs text-slate-500 truncate">{template.description}</div>
                  </div>
                  {/* Layout badge */}
                  <span className="text-lg flex-shrink-0">
                    {template.layout === 'single-column' ? '📄' : template.layout === 'sidebar' ? '📋' : '📑'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
