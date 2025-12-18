'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAnalyticsSummary } from '../../lib/analytics';

// Country flag emoji from country code
const getFlagEmoji = (countryCode) => {
  if (!countryCode || countryCode === 'XX') return '🌍';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
};

// Format number with commas
const formatNumber = (num) => {
  return new Intl.NumberFormat('id-ID').format(num || 0);
};

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  
  const handleLogin = (e) => {
    e.preventDefault();
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';
    
    if (password === adminPassword) {
      setIsAuthenticated(true);
      setError('');
      sessionStorage.setItem('atsmaker_admin', 'true');
    } else {
      setError('Password salah!');
    }
  };
  
  useEffect(() => {
    // Check if already authenticated
    if (sessionStorage.getItem('atsmaker_admin') === 'true') {
      setIsAuthenticated(true);
    }
  }, []);
  
  useEffect(() => {
    if (isAuthenticated) {
      loadAnalytics();
    }
  }, [isAuthenticated]);
  
  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await getAnalyticsSummary();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
    setLoading(false);
  };
  
  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('atsmaker_admin');
  };
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-500 mt-2">ATS Maker Analytics</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Masukkan password admin"
              />
            </div>
            
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Login
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <Link href="/atsmaker" className="text-blue-600 hover:underline text-sm">
              ← Kembali ke ATS Maker
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-slate-900">ATS Maker Analytics</h1>
              <p className="text-xs text-slate-500">Admin Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={loadAnalytics}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        ) : analytics ? (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-3xl font-bold text-blue-600">{formatNumber(analytics.totalVisits)}</div>
                <div className="text-sm text-slate-500 mt-1">Total Kunjungan</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-3xl font-bold text-green-600">{formatNumber(analytics.totalUniqueVisitors)}</div>
                <div className="text-sm text-slate-500 mt-1">Pengunjung Unik</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-3xl font-bold text-purple-600">{formatNumber(analytics.totalPdfExports)}</div>
                <div className="text-sm text-slate-500 mt-1">PDF Export</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-3xl font-bold text-orange-600">{formatNumber(analytics.totalDocxExports)}</div>
                <div className="text-sm text-slate-500 mt-1">DOCX Export</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-3xl font-bold text-teal-600">{formatNumber(analytics.totalResumesCreated)}</div>
                <div className="text-sm text-slate-500 mt-1">Resume Dibuat</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-3xl font-bold text-pink-600">{formatNumber(analytics.totalCoverLettersCreated)}</div>
                <div className="text-sm text-slate-500 mt-1">Cover Letter</div>
              </div>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Countries */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                  <h2 className="font-semibold text-slate-900">🌍 Pengunjung per Negara</h2>
                </div>
                <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                  {analytics.topCountries.length > 0 ? (
                    analytics.topCountries.map((country, index) => (
                      <div key={country.countryCode} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getFlagEmoji(country.countryCode)}</span>
                          <div>
                            <div className="font-medium text-slate-900">{country.country}</div>
                            <div className="text-xs text-slate-500">{country.countryCode}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-slate-900">{formatNumber(country.visits)}</div>
                          <div className="text-xs text-slate-500">kunjungan</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-8 text-center text-slate-500">
                      Belum ada data negara
                    </div>
                  )}
                </div>
              </div>
              
              {/* Daily Stats */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                  <h2 className="font-semibold text-slate-900">📅 Statistik Harian (30 Hari Terakhir)</h2>
                </div>
                <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                  {analytics.last30Days.length > 0 ? (
                    analytics.last30Days.map((day) => (
                      <div key={day.date} className="px-6 py-3 hover:bg-slate-50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-slate-900">
                            {new Date(day.date).toLocaleDateString('id-ID', { 
                              weekday: 'short', 
                              day: 'numeric', 
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="text-sm font-semibold text-blue-600">
                            {formatNumber(day.pageViews)} views
                          </div>
                        </div>
                        <div className="flex gap-4 text-xs text-slate-500">
                          <span>👤 {day.uniqueVisitors || 0} unik</span>
                          <span>📄 {day.pdfExports || 0} PDF</span>
                          <span>📝 {day.docxExports || 0} DOCX</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-8 text-center text-slate-500">
                      Belum ada data harian
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Informasi</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Data diambil dari Firebase Firestore</li>
                <li>• Lokasi pengunjung dideteksi berdasarkan IP address</li>
                <li>• Pengunjung unik dihitung per hari berdasarkan browser storage</li>
                <li>• Statistik akan terakumulasi seiring waktu</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
            <p className="text-yellow-800">Tidak dapat memuat data analytics. Pastikan Firebase sudah dikonfigurasi dengan benar.</p>
          </div>
        )}
      </main>
    </div>
  );
}
