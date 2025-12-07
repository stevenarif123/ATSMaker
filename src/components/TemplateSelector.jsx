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
        className="btn btn-outline btn-sm"
        title="Choose template"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
        <span className="hidden sm:inline">Template</span>
      </button>

      {showSelector && (
        <div 
          className="absolute right-0 top-full mt-2 w-96 max-h-96 bg-white rounded-lg shadow-xl border border-slate-200 z-50 flex flex-col"
          onKeyDown={handleKeyDown}
          role="menu"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Resume Templates</h3>
            <button
              onClick={() => setShowSelector(false)}
              className="text-slate-500 hover:text-slate-700"
              aria-label="Close"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1 px-3 pt-3 border-b border-slate-200 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-2 text-xs font-medium whitespace-nowrap rounded-t-md transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                role="tab"
              >
                {category}
              </button>
            ))}
          </div>

          {/* Templates Grid */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
            {TEMPLATE_CATEGORIES[selectedCategory]?.map((template) => (
              <button
                key={template.id}
                onClick={() => handleSelectTemplate(template.id)}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                  selectedTemplate === template.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
                role="menuitem"
              >
                {/* Template Preview */}
                <div className="mb-2 h-20 rounded border border-slate-300 bg-white overflow-hidden flex items-center justify-center">
                  <div className="text-center px-2 w-full">
                    {/* Accent color indicator */}
                    <div 
                      className="w-2 h-2 rounded-full mx-auto mb-2"
                      style={{ backgroundColor: template.accentColor }}
                    ></div>
                    {/* Layout indicator */}
                    <div className="flex justify-center gap-1 mb-2">
                      {template.layout === 'single-column' && (
                        <div className="flex gap-1">
                          <div className="w-1 h-3 bg-slate-300 rounded"></div>
                        </div>
                      )}
                      {template.layout === 'sidebar' && (
                        <div className="flex gap-1">
                          <div className="w-2 h-3 rounded" style={{ backgroundColor: template.accentColor }}></div>
                          <div className="w-1 h-3 bg-slate-300 rounded"></div>
                        </div>
                      )}
                      {template.layout === 'two-column' && (
                        <div className="flex gap-1">
                          <div className="w-1.5 h-3 bg-slate-300 rounded"></div>
                          <div className="w-1.5 h-3 bg-slate-300 rounded"></div>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-slate-600 line-clamp-2">{template.description}</div>
                  </div>
                </div>
                {/* Template Info */}
                <div>
                  <div className="font-medium text-sm text-slate-900">{template.name}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <span className="px-1.5 py-0.5 bg-slate-100 rounded text-xs">
                      {template.layout === 'single-column' ? '📄' : template.layout === 'sidebar' ? '📋' : '📑'} {template.layout === 'single-column' ? 'Single' : template.layout === 'sidebar' ? 'Sidebar' : 'Two Col'}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
