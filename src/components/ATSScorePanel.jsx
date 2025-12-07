import { useMemo, useState } from 'react';
import { calculateATSScore } from '../lib/atsScoring';

export default function ATSScorePanel({ resume, jobDescription, onJobDescriptionChange }) {
  const [showKeywords, setShowKeywords] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});

  const scoreData = useMemo(() => {
    return calculateATSScore(resume, jobDescription);
  }, [resume, jobDescription]);

  const toggleCategory = (categoryKey) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryKey]: !prev[categoryKey]
    }));
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-4">
      {/* Overall Score */}
      <div className="card">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">ATS Score</h3>
            <div className={`text-3xl font-bold ${getScoreColor(scoreData.overallScore)}`}>
              {scoreData.overallScore}
              <span className="text-xl">/100</span>
            </div>
          </div>

          {/* Score Indicator */}
          <div className="w-full bg-slate-200 rounded-full h-3 mb-2">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(scoreData.overallScore)}`}
              style={{ width: `${scoreData.overallScore}%` }}
            />
          </div>

          <p className="text-sm text-slate-600">
            {scoreData.overallScore >= 80 && 'Excellent! Your resume is highly ATS-friendly.'}
            {scoreData.overallScore >= 60 && scoreData.overallScore < 80 && 'Good! Your resume passes most ATS checks.'}
            {scoreData.overallScore < 60 && 'Needs improvement. Follow the recommendations below.'}
          </p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="card">
        <div className="card-body">
          <h4 className="font-semibold text-slate-900 mb-3">Category Breakdown</h4>
          <div className="space-y-3">
            {Object.entries(scoreData.categories).map(([key, category]) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <button
                    onClick={() => toggleCategory(key)}
                    className="text-sm font-medium text-slate-700 hover:text-slate-900 flex items-center gap-1"
                  >
                    <svg
                      className={`w-4 h-4 transition-transform ${expandedCategories[key] ? 'rotate-90' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {category.label}
                  </button>
                  <span className="text-sm text-slate-600">
                    {category.score}/{category.maxScore}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(category.percentage)}`}
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {scoreData.recommendations.length > 0 && (
        <div className="card">
          <div className="card-body">
            <h4 className="font-semibold text-slate-900 mb-3">Recommendations</h4>
            <ul className="space-y-2">
              {scoreData.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
                  <svg
                    className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Job Description Input */}
      <div className="card">
        <div className="card-body">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-slate-900">Job Description</h4>
            {jobDescription && (
              <button
                onClick={() => setShowKeywords(!showKeywords)}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                {showKeywords ? 'Hide' : 'Show'} Keywords
              </button>
            )}
          </div>
          <textarea
            value={jobDescription}
            onChange={(e) => onJobDescriptionChange(e.target.value)}
            placeholder="Paste the job description here to see keyword matches..."
            className="textarea textarea-bordered w-full h-32 text-sm"
            rows={6}
          />

          {jobDescription && (
            <div className="mt-3">
              <div className="flex items-center gap-2 mb-2">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(scoreData.keywordAnalysis.matchRate)} ${getScoreColor(scoreData.keywordAnalysis.matchRate)}`}>
                  {scoreData.keywordAnalysis.matchRate}% Match
                </div>
                <span className="text-xs text-slate-600">
                  {scoreData.keywordAnalysis.matchedKeywords.length} of {scoreData.keywordAnalysis.jobKeywords.length} keywords
                </span>
              </div>

              {showKeywords && (
                <div className="space-y-3 mt-3">
                  {/* Matched Keywords */}
                  {scoreData.keywordAnalysis.matchedKeywords.length > 0 && (
                    <div>
                      <h5 className="text-xs font-semibold text-green-700 mb-2 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Matched Keywords ({scoreData.keywordAnalysis.matchedKeywords.length})
                      </h5>
                      <div className="flex flex-wrap gap-1.5">
                        {scoreData.keywordAnalysis.matchedKeywords.map((keyword, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing Keywords */}
                  {scoreData.keywordAnalysis.missingKeywords.length > 0 && (
                    <div>
                      <h5 className="text-xs font-semibold text-red-700 mb-2 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Missing Keywords ({scoreData.keywordAnalysis.missingKeywords.length})
                      </h5>
                      <div className="flex flex-wrap gap-1.5">
                        {scoreData.keywordAnalysis.missingKeywords.map((keyword, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-md"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-slate-600 mt-2">
                        💡 Consider adding these keywords to your resume where relevant
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
