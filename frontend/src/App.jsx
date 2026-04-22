import { useState, useEffect } from 'react'
import axios from 'axios'
import { Header } from './components/Header'
import { UploadBox } from './components/UploadBox'
import { Controls } from './components/Controls'
import { ResultDisplay } from './components/ResultDisplay'
import { AlertTriangle, Clock, Zap } from 'lucide-react'

/* ── Processing overlay ─────────────────── */
function ProcessingOverlay() {
  return (
    <div className="card anim-fade-in" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="processing-center">
        <div className="processing-spinner-ring" />
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontWeight: 700, fontSize: '.95rem', color: 'var(--text-primary)', marginBottom: 4 }}>
            Processing with GPU...
          </p>
          <p style={{ fontSize: '.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>
            Running parallel CUDA kernels across all cores
          </p>
        </div>
      </div>
    </div>
  )
}

/* ── Stats bar ──────────────────────────── */
function StatsBar({ processingTime, filter, runtime, throughput }) {
  return (
    <div className="anim-fade-up"
      style={{
        display: 'flex', flexDirection: 'column', gap: 8,
        padding: '14px 18px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        marginBottom: 4,
      }}
    >
      {/* Row 1: filter + total round-trip time */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Zap size={15} style={{ color: 'var(--accent)', flexShrink: 0 }} />
        <p style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--text-muted)', flex: 1 }}>
          Filter applied:&nbsp;
          <span style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>{filter}</span>
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Clock size={13} style={{ color: 'var(--text-subtle)' }} />
          <span style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {processingTime}s
          </span>
          <span className="badge badge-blue" style={{ fontSize: '.72rem' }}>GPU</span>
        </div>
      </div>

      {/* Row 2: backend kernel metrics */}
      {(runtime != null && throughput != null) && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 20,
          paddingTop: 8,
          borderTop: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={13} style={{ color: 'var(--accent)' }} />
            <span style={{ fontSize: '.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Kernel time:&nbsp;
              <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                {runtime.toFixed(3)} s
              </span>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Zap size={13} style={{ color: 'var(--accent)' }} />
            <span style={{ fontSize: '.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Throughput:&nbsp;
              <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                {throughput.toFixed(2)} MP/s
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Main App ───────────────────────────── */
function App() {
  const [isDark, setIsDark] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [filterType, setFilterType] = useState('sharpen')
  const [processedImage, setProcessedImage] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingTime, setProcessingTime] = useState(null)
  const [appliedFilter, setAppliedFilter] = useState(null)
  const [error, setError] = useState(null)
  const [runtime, setRuntime] = useState(null)
  const [throughput, setThroughput] = useState(null)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  const handleClear = () => {
    setSelectedFile(null)
    setProcessedImage(null)
    setProcessingTime(null)
    setAppliedFilter(null)
    setError(null)
    setRuntime(null)
    setThroughput(null)
  }

  const handleProcess = async () => {
    if (!selectedFile) return
    setIsProcessing(true)
    setError(null)
    setProcessingTime(null)
    setProcessedImage(null)

    const formData = new FormData()
    formData.append('image', selectedFile)
    formData.append('filter', filterType)

    try {
      const t0 = performance.now()
      const res = await axios.post('http://localhost:5000/process', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const elapsed = ((performance.now() - t0) / 1000).toFixed(2)

      if (res.data?.image) {
        setProcessedImage(res.data.image)
        setProcessingTime(elapsed)
        setAppliedFilter(filterType)
        // TASK 2 / TASK 5: store backend metrics
        setRuntime(res.data.runtime ?? null)
        setThroughput(res.data.throughput ?? null)
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Processing failed')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: 'clamp(20px, 4vw, 48px) clamp(16px, 4vw, 32px)',
        background: 'var(--bg)',
        transition: 'background .3s ease',
      }}
    >
      <div style={{ width: '100%', maxWidth: 900, display: 'flex', flexDirection: 'column', gap: 0 }}>
        {/* ── Header ── */}
        <Header isDark={isDark} toggleTheme={() => setIsDark(!isDark)} />

        {/* ── Body ── */}
        <main style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 28 }}>

          {/* Upload */}
          <UploadBox
            onFileSelect={(f) => { setSelectedFile(f); setError(null) }}
            selectedFile={selectedFile}
            onClear={handleClear}
          />

          {/* Controls */}
          <Controls
            filterType={filterType}
            setFilterType={setFilterType}
            onProcess={handleProcess}
            isProcessing={isProcessing}
            disabled={!selectedFile}
          />

          {/* Error */}
          {error && (
            <div className="error-banner anim-fade-up">
              <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Processing overlay */}
          {isProcessing && <ProcessingOverlay />}

          {/* Results */}
          {(selectedFile || processedImage) && !isProcessing && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
              {processingTime && appliedFilter && (
                <StatsBar
                  processingTime={processingTime}
                  filter={appliedFilter}
                  runtime={runtime}
                  throughput={throughput}
                />
              )}
              <ResultDisplay originalImage={selectedFile} processedImage={processedImage} />
            </div>
          )}
        </main>

        {/* ── Footer ── */}
        <p
          style={{
            textAlign: 'center',
            fontSize: '.75rem',
            color: 'var(--text-subtle)',
            fontWeight: 500,
            marginTop: 40,
          }}
        >
          Parallel Image Processing System · MPI + OpenMP + CUDA
        </p>
      </div>
    </div>
  )
}

export default App
