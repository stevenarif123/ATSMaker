import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useResumeStore } from '../../../store/resumeStore.js'
import { Dropzone } from './components/Dropzone.jsx'
import { ReviewDrawer } from './components/ReviewDrawer.jsx'
import { SummaryPanel } from './components/SummaryPanel.jsx'
import { useOfflineParser } from './hooks/useOfflineParser.js'
import { generateInsights } from './utils/atsInsights.js'

export function ImportWorkflowPage() {
  const [status, setStatus] = useState('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [lastFileMeta, setLastFileMeta] = useState(null)

  const getActiveResume = useResumeStore((s) => s.getActiveResume)
  const mergeSectionsToActiveResume = useResumeStore((s) => s.mergeSectionsToActiveResume)
  const parseFile = useOfflineParser()
  const form = useForm({ defaultValues: { sections: [] } })
  const sections = form.watch('sections') ?? []
  const insights = useMemo(() => generateInsights(sections), [sections])

  const handleFiles = async (fileList) => {
    const file = fileList?.[0]
    if (!file) return
    setStatus('uploading')
    setError('')
    setProgress(5)
    setLastFileMeta({ name: file.name, uploadedAt: new Date().toISOString() })
    try {
      const parsedSections = await parseFile({ file, onProgress: setProgress })
      form.reset({ sections: parsedSections })
      setProgress(100)
      setStatus('ready')
      setDrawerOpen(true)
    } catch (err) {
      setStatus('error')
      setProgress(0)
      setError(describeError(err))
    }
  }

  const handleMerge = (values) => {
    const accepted = values.sections?.filter((section) => section.accepted) ?? []
    if (!accepted.length) {
      setDrawerOpen(true)
      return
    }
    mergeSectionsToActiveResume(accepted)
    setDrawerOpen(false)
    setStatus('merged')
  }

  const openDrawer = () => {
    if (!sections.length) return
    setDrawerOpen(true)
  }

  return (
    <div className="import-page">
      <header className="import-page__header">
        <p className="import-page__eyebrow">Resume tools / Import</p>
        <div className="import-page__heading">
          <div>
            <h1>Import &amp; review resume data</h1>
            <p>Files stay on this device. Parse structured data and merge it into your offline resume store.</p>
          </div>
          {status === 'ready' || status === 'merged' ? (
            <button type="button" className="btn btn--ghost" onClick={openDrawer}>
              Review parsed data
            </button>
          ) : null}
        </div>
        <div className="import-page__status" data-testid="import-status">
          <span>Current state: {status}</span>
          {error && status === 'error' ? <span className="import-page__status-error">{error}</span> : null}
        </div>
      </header>

      <div className="import-page__content">
        <Dropzone status={status} progress={progress} error={status === 'error' ? error : ''} onFiles={handleFiles} lastFileMeta={lastFileMeta} />
        <SummaryPanel resume={getActiveResume()} insights={insights} status={status} />
      </div>

      <ReviewDrawer form={form} isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} onSubmit={handleMerge} />
    </div>
  )
}

function describeError(error) {
  if (!error) return 'Unknown error'
  switch (error.code) {
    case 'IMAGE_PDF':
      return 'This PDF looks like a scanned image. Export a digital PDF or upload TXT/JSON so we can parse the text.'
    case 'INVALID_JSON':
      return error.message
    case 'UNSUPPORTED_TYPE':
      return error.message
    default:
      return error.message || 'Unable to parse file.'
  }
}

export default ImportWorkflowPage
