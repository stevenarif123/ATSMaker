'use client';

import { useState, useMemo } from 'react';
import { useResumeStore } from '../../store/resumeStore';

export default function VersionManager({ onClose }) {
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Access state directly to avoid infinite loops
  const versionsMap = useResumeStore((s) => s.versions);
  const activeResumeId = useResumeStore((s) => s.activeResumeId);
  const switchVersion = useResumeStore((s) => s.switchVersion);
  const renameVersion = useResumeStore((s) => s.renameVersion);
  const deleteVersion = useResumeStore((s) => s.deleteVersion);
  const duplicateVersion = useResumeStore((s) => s.duplicateVersion);
  const createVersion = useResumeStore((s) => s.createVersion);

  // Convert versions object to array using useMemo
  const versions = useMemo(() => Object.values(versionsMap || {}), [versionsMap]);

  const handleRename = (id, currentName) => {
    setEditingId(id);
    setEditingName(currentName);
  };

  const handleSaveRename = (id) => {
    if (editingName.trim()) {
      renameVersion(id, editingName.trim());
    }
    setEditingId(null);
    setEditingName('');
  };

  const handleDeleteConfirm = (id) => {
    const versionCount = versions.length;
    if (versionCount <= 1) {
      alert('Cannot delete the last resume version');
      return;
    }
    deleteVersion(id);
    setConfirmDeleteId(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Resume Versions</h2>
            <p className="text-sm text-slate-500 mt-1">Manage your resume versions</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Create New Button */}
          <div className="mb-6">
            <button
              onClick={() => createVersion()}
              className="btn btn-primary btn-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Version
            </button>
          </div>

          {/* Versions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {versions.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-slate-500">No resume versions yet</p>
              </div>
            ) : (
              versions.map((version) => (
                <div
                  key={version.id}
                  className={`border-2 rounded-lg p-4 transition-all ${
                    activeResumeId === version.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Version Name */}
                  <div className="mb-3">
                    {editingId === version.id ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="input input-sm input-bordered flex-1"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveRename(version.id);
                            } else if (e.key === 'Escape') {
                              setEditingId(null);
                            }
                          }}
                        />
                        <button
                          onClick={() => handleSaveRename(version.id)}
                          className="btn btn-sm btn-success"
                        >
                          ✓
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-slate-900">{version.name}</h3>
                          {activeResumeId === version.id && (
                            <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                              Active
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Timestamp */}
                  <p className="text-xs text-slate-500 mb-4">
                    Last updated: {formatDate(version.updatedAt)}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap">
                    {activeResumeId !== version.id && (
                      <button
                        onClick={() => switchVersion(version.id)}
                        className="btn btn-sm btn-outline text-xs"
                      >
                        Switch
                      </button>
                    )}
                    <button
                      onClick={() => handleRename(version.id, version.name)}
                      className="btn btn-sm btn-outline text-xs"
                    >
                      Rename
                    </button>
                    <button
                      onClick={() => duplicateVersion(version.id)}
                      className="btn btn-sm btn-outline text-xs"
                    >
                      Duplicate
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(version.id)}
                      className="btn btn-sm btn-outline btn-error text-xs"
                      disabled={versions.length === 1}
                    >
                      Delete
                    </button>
                  </div>

                  {/* Delete Confirmation */}
                  {confirmDeleteId === version.id && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                      <p className="text-sm text-red-700 mb-3">
                        Are you sure? This cannot be undone.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDeleteConfirm(version.id)}
                          className="btn btn-sm btn-error text-xs"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="btn btn-sm btn-outline text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
