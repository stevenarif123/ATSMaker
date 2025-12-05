import { useRef, useState } from 'react'
import { ACCEPTED_EXTENSIONS } from '../hooks/useOfflineParser.js'

const ACCEPT_ATTRIBUTE = [
  '.pdf',
  'application/pdf',
  '.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.txt',
  'text/plain',
  '.json',
  'application/json',
].join(',')

export function Dropzone({ status, progress, error, onFiles, lastFileMeta }) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef(null)

  const disabled = status === 'uploading'

  const handleFiles = (fileList) => {
    if (!fileList?.length || disabled) return
    onFiles?.(fileList)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    handleFiles(event.dataTransfer?.files)
  }

  const handleDragOver = (event) => {
    event.preventDefault()
    if (!isDragging) setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleChange = (event) => {
    handleFiles(event.target.files)
    event.target.value = ''
  }

  return (
    <section
      className={`dropzone ${isDragging ? 'dropzone--dragging' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      data-testid="import-dropzone"
    >
      <input
        ref={inputRef}
        data-testid="import-file-input"
        type="file"
        accept={ACCEPT_ATTRIBUTE}
        onChange={handleChange}
        disabled={disabled}
        aria-label="Upload resume"
        className="dropzone__input"
      />
      <div className="dropzone__body">
        <p className="dropzone__label">Drop your resume here</p>
        <p className="dropzone__hint">PDF, DOCX, TXT or JSON · offline parsing</p>
        <button type="button" className="btn btn--primary" onClick={() => inputRef.current?.click()} disabled={disabled}>
          Browse files
        </button>
      </div>
      <div className="dropzone__meta">
        <span>Allowed: {ACCEPTED_EXTENSIONS.join(', ').toUpperCase()}</span>
        {lastFileMeta ? <span>Last file: {lastFileMeta.name}</span> : null}
      </div>
      {status === 'uploading' ? (
        <div className="dropzone__progress" aria-live="polite">
          <label htmlFor="import-progress">Parsing locally…</label>
          <progress id="import-progress" max="100" value={progress}>
            {progress}%
          </progress>
        </div>
      ) : null}
      {error ? (
        <p className="dropzone__error" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  )
}
