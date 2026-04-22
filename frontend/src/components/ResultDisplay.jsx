import { ImageOff } from 'lucide-react'

function ImageCard({ label, accentLabel, children, delay }) {
  return (
    <div
      className="card card-elevated anim-fade-up"
      style={{ animationDelay: delay, overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1 }}
    >
      {/* Card header */}
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'var(--bg-muted)',
      }}>
        <span className="img-card-label">{label}</span>
        {accentLabel && (
          <span className="badge badge-blue" style={{ fontSize: '.7rem', marginLeft: 'auto' }}>
            {accentLabel}
          </span>
        )}
      </div>

      {/* Card body */}
      <div style={{
        flex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: 280,
        padding: 20,
        background: 'var(--bg-card)',
      }}>
        {children}
      </div>
    </div>
  )
}

function Placeholder({ text }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
      color: 'var(--text-subtle)',
    }}>
      <ImageOff size={32} style={{ opacity: 0.4 }} />
      <span style={{ fontSize: '.82rem', fontWeight: 500 }}>{text}</span>
    </div>
  )
}

export function ResultDisplay({ originalImage, processedImage }) {
  if (!originalImage && !processedImage) return null

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: 20,
    }}>
      <ImageCard label="Original" delay=".0s">
        {originalImage ? (
          <img
            src={URL.createObjectURL(originalImage)}
            alt="Original"
            style={{
              maxWidth: '100%', maxHeight: 500, objectFit: 'contain',
              borderRadius: 10,
              boxShadow: '0 2px 12px rgba(0,0,0,.08)',
            }}
          />
        ) : (
          <Placeholder text="No image loaded" />
        )}
      </ImageCard>

      <ImageCard label="Processed" accentLabel="GPU Output" delay=".1s">
        {processedImage ? (
          <img
            src={`data:image/jpeg;base64,${processedImage}`}
            alt="Processed"
            className="anim-fade-in"
            style={{
              maxWidth: '100%', maxHeight: 500, objectFit: 'contain',
              borderRadius: 10,
              boxShadow: '0 2px 12px rgba(0,0,0,.08)',
            }}
          />
        ) : (
          <Placeholder text="Awaiting processing..." />
        )}
      </ImageCard>
    </div>
  )
}
