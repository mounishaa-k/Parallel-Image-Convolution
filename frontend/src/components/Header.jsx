import { Sun, Moon, Cpu } from 'lucide-react'

export function Header({ isDark, toggleTheme }) {
  return (
    <div className="anim-fade-up">
      <div className="flex items-start justify-between gap-4 pb-7">
        {/* Left: branding */}
        <div className="flex items-start gap-4">
          <div
            style={{
              background: 'color-mix(in srgb, var(--accent) 12%, transparent)',
              border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
              borderRadius: 12,
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Cpu size={24} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <h1
              style={{
                fontSize: 'clamp(1.25rem, 3vw, 1.7rem)',
                fontWeight: 800,
                color: 'var(--text-primary)',
                letterSpacing: '-0.025em',
                lineHeight: 1.15,
                marginBottom: 6,
              }}
            >
              Parallel Image Processing System
            </h1>
            <p
              style={{
                fontSize: '.85rem',
                color: 'var(--text-muted)',
                fontWeight: 500,
                lineHeight: 1.4,
              }}
            >
              GPU Accelerated Image Filtering&nbsp;
              <span className="tag" style={{ marginLeft: 4 }}>MPI</span>
              <span className="tag" style={{ margin: '0 4px' }}>OpenMP</span>
              <span className="tag">CUDA</span>
            </p>
          </div>
        </div>

        {/* Right: theme toggle */}
        <button
          onClick={toggleTheme}
          className="theme-btn"
          aria-label="Toggle Theme"
          style={{ flexShrink: 0 }}
        >
          {isDark
            ? <Sun size={16} />
            : <Moon size={16} />
          }
        </button>
      </div>
      <div className="divider" />
    </div>
  )
}
