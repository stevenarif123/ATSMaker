'use client'

import { useEffect, useState } from 'react'

export function useServiceWorker() {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      setIsSupported(true)
      
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('Service worker registered:', reg)
          setRegistration(reg)
          setIsReady(true)
        })
        .catch((error) => {
          console.error('Service worker registration failed:', error)
          setIsReady(true)
        })
    } else {
      setIsReady(true)
    }
  }, [])

  const update = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      registration.waiting.addEventListener('statechange', () => {
        if (registration.waiting?.state === 'activated') {
          window.location.reload()
        }
      })
    }
  }

  return {
    isSupported,
    isReady,
    registration,
    update,
  }
}