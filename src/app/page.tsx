'use client'

export default function Home() {
  return (
    <main className="container-center">
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-5xl font-bold text-gradient mb-6">
            ATS Maker
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Create professional ATS-friendly resumes with our free online CV builder
          </p>
          <div className="space-y-4">
            <button className="btn-primary-custom w-full text-lg">
              Get Started
            </button>
            <button className="border-2 border-gray-300 text-gray-700 px-6 py-3 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-200 w-full text-lg">
              View Templates
            </button>
          </div>
          <div className="mt-12 grid grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-2xl font-bold text-blue-500">50+</div>
              <div className="text-sm text-gray-600">Templates</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-2xl font-bold text-slate-600">10K+</div>
              <div className="text-sm text-gray-600">Downloads</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-2xl font-bold text-purple-500">98%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}