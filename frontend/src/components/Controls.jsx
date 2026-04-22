import { ChevronDown } from 'lucide-react'

export function Controls({ filterType, setFilterType, onProcess, isProcessing, disabled }) {
  const filters = [
    { value: 'sharpen',    label: 'Sharpen',        desc: 'Enhance fine details' },
    { value: 'blur',       label: 'Gaussian Blur',  desc: 'Smooth noise' },
    { value: 'edge',       label: 'Edge Detection', desc: 'Detect boundaries' },
  ]

  const current = filters.find(f => f.value === filterType)

  return (
    <div className="card anim-fade-up anim-fade-up-delay-2" style={{ padding: '20px 24px' }}>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 16,
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Left: label + select */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14, flex: 1 }}>
          <div>
            <p style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
              Filter Operation
            </p>
            <div style={{ position: 'relative', minWidth: 220 }}>
              <select
                id="filter"
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                disabled={isProcessing}
                className="select-custom"
              >
                {filters.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
              <ChevronDown
                size={16}
                style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--text-subtle)', pointerEvents: 'none',
                }}
              />
            </div>
          </div>

          {/* Description pill */}
          {current && (
            <div style={{ paddingTop: 22 }}>
              <span className="badge badge-blue" style={{ fontSize: '.75rem' }}>
                {current.desc}
              </span>
            </div>
          )}
        </div>

        {/* Right: action button */}
        <div style={{ paddingTop: 22, flexShrink: 0 }}>
          <button
            onClick={onProcess}
            disabled={disabled || isProcessing}
            className="btn-primary"
          >
            {isProcessing && <span className="spinner" />}
            {isProcessing ? 'Processing with GPU...' : 'Process Image'}
          </button>
        </div>
      </div>
    </div>
  )
}
