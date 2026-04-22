# 🖼️ Parallel Image Convolution System

A high-performance image processing system that applies convolution filters using GPU-accelerated parallel computing (CuPy/CUDA), exposed via a Flask REST API and visualised through a modern React dashboard.

---

## ✨ Features

- **GPU-Accelerated Convolution** — Uses CuPy (CUDA) for massively parallel per-channel 2D convolution; gracefully falls back to SciPy on CPU if no GPU is available
- **Multiple Filters** — Sharpen, Gaussian Blur (5×5 / 15×15), Sobel Edge Detection (combined magnitude, X, Y), Laplacian, and a Gaussian→Sobel combo
- **Live Performance Metrics** — Backend returns kernel execution time (seconds) and throughput (Megapixels/second) for every request
- **Premium React Dashboard** — Dark/light mode, drag-and-drop upload, side-by-side image comparison, animated processing overlay, and a stats bar
- **REST API** — Single `/process` endpoint — send an image + filter name, receive a base64-encoded result plus metrics

---

## 🏗️ Architecture

```
HPC_Hackathon/
├── backend/
│   ├── app.py          # Flask REST API (CORS-enabled)
│   └── hpc.py          # Core convolution engine (GPU + CPU fallback)
└── frontend/
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── App.jsx                     # Main app, state management
        └── components/
            ├── Header.jsx              # Logo + theme toggle
            ├── UploadBox.jsx           # Drag-and-drop file input
            ├── Controls.jsx            # Filter selector + process button
            └── ResultDisplay.jsx       # Side-by-side image comparison
```

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|------------|
| GPU Compute | CuPy (CUDA) / SciPy (CPU fallback) |
| Image I/O | Pillow, NumPy |
| Backend API | Python · Flask · Flask-CORS |
| Frontend | React 18 · Vite · Axios |
| Styling | Vanilla CSS (custom design system) + Tailwind |
| Icons | Lucide React |

---

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- Node.js 18+
- *(Optional)* NVIDIA GPU with CUDA + [CuPy](https://docs.cupy.dev/en/stable/install.html) for GPU acceleration

---

### Backend Setup

```bash
cd backend

# Install dependencies
pip install flask flask-cors pillow numpy scipy

# (Optional) Install CuPy for GPU support — pick the right CUDA version
pip install cupy-cuda12x   # e.g. for CUDA 12.x

# Start the API server
python app.py
```

The API will be available at `http://localhost:5000`.

---

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 📡 API Reference

### `POST /process`

Applies a convolution filter to an uploaded image.

**Request** — `multipart/form-data`

| Field | Type | Description |
|-------|------|-------------|
| `image` | File | Input image (JPEG, PNG, etc.) |
| `filter` | String | Filter name (see below) |

**Supported filter values**

| Value | Effect |
|-------|--------|
| `sharpen` | Sharpens edges using a 3×3 kernel |
| `blur` / `gaussian5` | Gaussian blur (5×5, σ=1.0) |
| `gaussian15` | Gaussian blur (15×15, σ=3.0) |
| `edge` / `sobel` | Sobel edge magnitude (grayscale) |
| `sobelx` | Sobel horizontal edges |
| `laplacian` | Laplacian edge detection |
| `combo` | Gaussian blur → Sobel (pipeline) |
| `original` | No-op pass-through |

**Response** — `application/json`

```json
{
  "image": "<base64-encoded JPEG>",
  "runtime": 0.042,
  "throughput": 49.83
}
```

| Field | Description |
|-------|-------------|
| `image` | Base64-encoded processed image |
| `runtime` | Kernel execution time in **seconds** |
| `throughput` | Processing speed in **Megapixels / second** |

---

## ⚡ Performance Details

The backend measures wall-clock time around the convolution call and computes:

```
throughput (MP/s) = (width × height / 1 000 000) / runtime
```

On CPU (SciPy), typical throughput for a 1080p image is **~5–15 MP/s**.  
On GPU (CuPy/CUDA), throughput can exceed **200+ MP/s** depending on the card.

Utility functions in `hpc.py` also expose:

- `verify_correctness(image, filter)` — Compares GPU vs serial output (mean absolute error)
- `benchmark_runtime()` — Benchmarks convolution across 256 / 512 / 1024 / 2048 px images

---

## 🖥️ UI Walkthrough

1. **Upload** — Drag and drop or click to select any image
2. **Choose a filter** — Sharpen, Blur, Edge Detect, Laplacian, Combo, or Original
3. **Process** — Click *Process Image*; an animated overlay appears while the GPU works
4. **View Results** — Side-by-side comparison of original vs processed image
5. **Stats Bar** — See the applied filter, round-trip time, backend kernel time, and throughput

---

## 📄 License

MIT — free to use, modify, and distribute.
