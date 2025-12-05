'use client'

import { useServiceWorker } from '@/lib/use-service-worker'
import { useEffect, useState } from 'react'

export function PWAInstallPrompt() {
  const { isSupported, isReady, registration, update } = useServiceWorker()
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)

  // Handle install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as any)
      setShowInstallPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  // Handle update prompt
  useEffect(() => {
    if (registration) {
      const handleUpdate = () => {
        setShowUpdatePrompt(true)
      }

      registration.addEventListener('updatefound', handleUpdate)
      
      if (registration.active) {
        registration.addEventListener('controllerchange', handleUpdate)
      }
      
      return () => {
        registration.removeEventListener('updatefound', handleUpdate)
        registration.active?.removeEventListener('controllerchange', handleUpdate)
      }
    }
  }, [registration])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return
    
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setShowInstallPrompt(false)
    
    console.log(`User response to the install prompt: ${outcome}`)
  }

  const handleUpdateClick = () => {
    update()
    setShowUpdatePrompt(false)
  }

  if (!isReady) return null

  return (
    <>
      {/* Install Prompt */}
      {showInstallPrompt && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-lg max-w-md">
            <div className="flex items-center justify-between w-full">
              <span className="text-blue-800">Install ATS Maker for a better experience!</span>
              <div className="flex gap-2 ml-4">
                <button 
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                  onClick={handleInstallClick}
                >
                  Install
                </button>
                <button 
                  className="text-gray-600 hover:text-gray-800 px-3 py-1 text-sm transition-colors"
                  onClick={() => setShowInstallPrompt(false)}
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Prompt */}
      {showUpdatePrompt && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg max-w-md">
            <div className="flex items-center justify-between w-full">
              <span className="text-green-800">A new version is available!</span>
              <div className="flex gap-2 ml-4">
                <button 
                  className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"
                  onClick={handleUpdateClick}
                >
                  Update Now
                </button>
                <button 
                  className="text-gray-600 hover:text-gray-800 px-3 py-1 text-sm transition-colors"
                  onClick={() => setShowUpdatePrompt(false)}
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}