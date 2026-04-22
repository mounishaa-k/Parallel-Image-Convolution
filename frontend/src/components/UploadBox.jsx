import { useCallback, useState } from 'react'
import { UploadCloud, FileImage, X, CheckCircle2 } from 'lucide-react'

export function UploadBox({ onFileSelect, selectedFile, onClear }) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) onFileSelect(file)
  }, [onFileSelect])

  const handleDragOver = useCallback((e) => { e.preventDefault(); setIsDragOver(true) }, [])
  const handleDragLeave = useCallback((e) => { e.preventDefault(); setIsDragOver(false) }, [])

  const handleFileInput = (e) => {
    const file = e.target.files?.[0]
    if (file) onFileSelect(file)
  }

  /* ── File selected state ── */
  if (selectedFile) {
    return (
      <div className="card anim-fade-up anim-fade-up-delay-1" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
            {/* Thumbnail */}
            <div
              style={{
                width: 52, height: 52, borderRadius: 10, overflow: 'hidden',
                background: 'var(--bg-muted)', border: '1px solid var(--border)',
                flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            {/* Meta */}
            <div style={{ minWidth: 0 }}>
              <p style={{
                fontSize: '.9rem', fontWeight: 600,
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                maxWidth: '380px',
              }}>
                {selectedFile.name}
              </p>
              <p style={{ fontSize: '.78rem', color: 'var(--text-muted)', marginTop: 3, fontWeight: 500 }}>
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <span className="badge badge-blue">
              <CheckCircle2 size={13} />
              Ready
            </span>
            <button
              onClick={onClear}
              title="Remove"
              style={{
                width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)',
                background: 'var(--bg-muted)', color: 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all .2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#fef2f2'
                e.currentTarget.style.borderColor = '#fecaca'
                e.currentTarget.style.color = '#b91c1c'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--bg-muted)'
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.color = 'var(--text-muted)'
              }}
            >
              <X size={15} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ── Empty / drop zone state ── */
  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`drop-zone anim-fade-up anim-fade-up-delay-1${isDragOver ? ' drag-active' : ''}`}
      style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '56px 32px', textAlign: 'center',
        position: 'relative',
      }}
    >
      {/* Upload icon */}
      <div style={{
        width: 64, height: 64, borderRadius: 16,
        background: 'color-mix(in srgb, var(--accent) 10%, var(--bg-muted))',
        border: '1px solid color-mix(in srgb, var(--accent) 20%, var(--border))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20,
        transition: 'transform .25s ease',
        transform: isDragOver ? 'scale(1.12)' : 'scale(1)',
      }}>
        <UploadCloud size={28} style={{ color: 'var(--accent)' }} />
      </div>

      <p style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
        {isDragOver ? 'Drop it here!' : 'Drag & drop your image'}
      </p>
      <p style={{ fontSize: '.85rem', color: 'var(--text-muted)', fontWeight: 400, marginBottom: 24 }}>
        or click to browse your files
      </p>

      {/* Pill of accepted formats */}
      <div style={{ display: 'flex', gap: 8 }}>
        {['JPG', 'PNG', 'WEBP'].map(fmt => (
          <span key={fmt} className="tag">{fmt}</span>
        ))}
        <span className="tag" style={{ opacity: .7 }}>max 10 MB</span>
      </div>

      {/* Invisible full-area file input */}
      <label style={{ position: 'absolute', inset: 0, cursor: 'pointer', fontSize: 0 }}>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileInput}
          style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
        />
        Select file
      </label>
    </div>
  )
}
