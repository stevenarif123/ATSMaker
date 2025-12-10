'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Home() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="container-center py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-slate-900">ATS Maker</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/builder')}
              className="btn btn-primary"
            >
              Get Started
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container-center py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-blue-700 text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            Free & Open Source
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Build Your Perfect
            <span className="text-gradient block mt-2">ATS-Friendly Resume</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Create professional resumes that pass Applicant Tracking Systems. 
            Free, simple, and designed to help you land your dream job.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => router.push('/builder')}
              className="btn btn-primary btn-lg group"
            >
              <span>Start Building</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <button 
              onClick={() => router.push('/cover-letter')}
              className="btn btn-outline btn-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>Cover Letter</span>
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container-center py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Choose ATS Maker?</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Everything you need to create a professional resume that gets noticed
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="card p-8 text-center hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-500/30">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">ATS Optimized</h3>
            <p className="text-slate-600">
              Clean, parseable format that passes through Applicant Tracking Systems with ease
            </p>
          </div>
          
          <div className="card p-8 text-center hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/30">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Fast & Easy</h3>
            <p className="text-slate-600">
              Intuitive interface with real-time preview. Build your resume in minutes, not hours
            </p>
          </div>
          
          <div className="card p-8 text-center hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-violet-500/30">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Export Anywhere</h3>
            <p className="text-slate-600">
              Download as PDF or save your data as JSON for easy editing later
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container-center py-20">
        <div className="bg-gradient-to-r from-blue-600 to-violet-600 rounded-3xl p-12 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-bold text-white mb-2">100%</div>
              <div className="text-blue-100">Free to Use</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">ATS</div>
              <div className="text-blue-100">Friendly Format</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">PDF</div>
              <div className="text-blue-100">Export Ready</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">∞</div>
              <div className="text-blue-100">Unlimited Resumes</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container-center py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Ready to Build Your Resume?
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Start creating your professional, ATS-friendly resume today. No signup required.
          </p>
          <button 
            onClick={() => router.push('/builder')}
            className="btn btn-primary btn-lg"
          >
            Start Building Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="container-center py-8 border-t border-slate-200/50">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span>ATS Maker</span>
          </div>
          <div>
            © 2025 ATS Maker. Free & Open Source.
          </div>
        </div>
      </footer>
    </main>
  )
}