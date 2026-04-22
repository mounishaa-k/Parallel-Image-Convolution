#!/usr/bin/env python
# coding: utf-8

import subprocess, sys
import time
import numpy as np
from PIL import Image
import os
from scipy.ndimage import convolve

# ── Kernel definitions ──────────────────────────────────────
def gaussian_kernel(size=5, sigma=1.0):
    k = size // 2
    x, y = np.mgrid[-k:k+1, -k:k+1]
    g = np.exp(-(x**2 + y**2) / (2 * sigma**2))
    return g / g.sum()

KERNELS = {
    'gaussian_5':  gaussian_kernel(5, 1.0),
    'gaussian_7':  gaussian_kernel(7, 1.5),
    'gaussian_15': gaussian_kernel(15, 3.0),
    'sobel_x': np.array([[-1,0,1],[-2,0,2],[-1,0,1]], dtype=np.float32),
    'sobel_y': np.array([[-1,-2,-1],[0,0,0],[1,2,1]], dtype=np.float32),
    'laplacian': np.array([[0,-1,0],[-1,4,-1],[0,-1,0]], dtype=np.float32),
    'sharpen':  np.array([[0,-1,0],[-1,5,-1],[0,-1,0]], dtype=np.float32),
}

def serial_convolve(image, kernel_name):
    """Pure serial 2D convolution using scipy. Ground truth."""
    kernel = KERNELS[kernel_name].astype(np.float64)
    if image.ndim == 3:
        channels = []
        for c in range(image.shape[2]):
            ch = convolve(image[:,:,c].astype(np.float64), kernel, mode='reflect')
            channels.append(ch)
        result = np.stack(channels, axis=2)
    else:
        result = convolve(image.astype(np.float64), kernel, mode='reflect')
    return np.clip(result, 0, 255).astype(np.uint8)

def serial_sobel_combined(image):
    """Compute Sobel magnitude."""
    gray = np.mean(image, axis=2) if image.ndim == 3 else image
    gx = serial_convolve(gray.astype(np.uint8), 'sobel_x').astype(np.float32)
    gy = serial_convolve(gray.astype(np.uint8), 'sobel_y').astype(np.float32)
    mag = np.sqrt(gx**2 + gy**2)
    return np.clip(mag / mag.max() * 255, 0, 255).astype(np.uint8)


# ============================================================
# CuPy GPU convolution wrapper
# ============================================================
try:
    import cupy as cp
    from cupyx.scipy.ndimage import convolve as gpu_convolve
    HAS_CUPY = True
except ImportError:
    HAS_CUPY = False
    try:
        import cupy as cp
        from cupyx.scipy.ndimage import convolve as gpu_convolve
        HAS_CUPY = True
    except:
        HAS_CUPY = False

# ── Kernel factory ───────────────────────────────────────────
def gaussian_kernel(size=5, sigma=1.0):
    k = size // 2
    x, y = np.mgrid[-k:k+1, -k:k+1]
    g = np.exp(-(x**2 + y**2) / (2 * sigma**2))
    return (g / g.sum()).astype(np.float32)

KERNELS_NP = {
    'gaussian_5':  gaussian_kernel(5, 1.0),
    'gaussian_7':  gaussian_kernel(7, 1.5),
    'gaussian_15': gaussian_kernel(15, 3.0),
    'sobel_x':     np.array([[-1,0,1],[-2,0,2],[-1,0,1]], dtype=np.float32),
    'sobel_y':     np.array([[-1,-2,-1],[0,0,0],[1,2,1]], dtype=np.float32),
    'laplacian':   np.array([[0,-1,0],[-1,4,-1],[0,-1,0]], dtype=np.float32),
    'sharpen':     np.array([[0,-1,0],[-1,5,-1],[0,-1,0]], dtype=np.float32),
}

# ── GPU convolution via CuPy ─────────────────────────────────
def gpu_conv2d(image_np, kernel_name, use_gpu=True):
    """2D convolution on GPU using CuPy. Falls back to scipy on CPU."""
    kernel_np = KERNELS_NP[kernel_name]

    if use_gpu and HAS_CUPY:
        img_gpu = cp.asarray(image_np, dtype=cp.float32)
        ker_gpu = cp.asarray(kernel_np)

        if img_gpu.ndim == 3:
            channels = []
            for c in range(img_gpu.shape[2]):
                ch = gpu_convolve(img_gpu[:,:,c], ker_gpu, mode='reflect')
                channels.append(ch)
            result_gpu = cp.stack(channels, axis=2)
        else:
            result_gpu = gpu_convolve(img_gpu, ker_gpu, mode='reflect')

        result_gpu = cp.clip(result_gpu, 0, 255)
        cp.cuda.Stream.null.synchronize()
        return cp.asnumpy(result_gpu).astype(np.uint8)
    else:
        from scipy.ndimage import convolve
        img_f = image_np.astype(np.float32)
        if img_f.ndim == 3:
            result = np.stack([convolve(img_f[:,:,c], kernel_np, mode='reflect')
                               for c in range(img_f.shape[2])], axis=2)
        else:
            result = convolve(img_f, kernel_np, mode='reflect')
        return np.clip(result, 0, 255).astype(np.uint8)

def gpu_sobel_combined(image_np):
    gray = np.mean(image_np, axis=2).astype(np.float32) if image_np.ndim==3 else image_np
    gx = gpu_conv2d(gray, 'sobel_x').astype(np.float32)
    gy = gpu_conv2d(gray, 'sobel_y').astype(np.float32)
    mag = np.sqrt(gx**2 + gy**2)
    return np.clip(mag / (mag.max() + 1e-8) * 255, 0, 255).astype(np.uint8)


def image_to_raw_planar(img_np, path):
    """Save image as planar raw: [R_plane | G_plane | B_plane]"""
    h, w, c = img_np.shape
    planar = np.transpose(img_np, (2, 0, 1)).flatten()
    planar.tofile(path)
    return h, w, c

def image_to_raw_interleaved(img_np, path):
    """Save image as interleaved raw: RGBRGBRGB..."""
    img_np.flatten().tofile(path)
    return img_np.shape

def raw_interleaved_to_image(path, h, w, c):
    data = np.fromfile(path, dtype=np.uint8)
    return data.reshape(h, w, c) if c > 1 else data.reshape(h, w)


def serial_conv_ref(image, kernel):
    img_f = image.astype(np.float64)
    if img_f.ndim == 3:
        chs = [convolve(img_f[:,:,c], kernel.astype(np.float64), mode='reflect')
               for c in range(img_f.shape[2])]
        return np.clip(np.stack(chs, 2), 0, 255).astype(np.uint8)
    return np.clip(convolve(img_f, kernel.astype(np.float64), mode='reflect'),
                   0, 255).astype(np.uint8)


def process_image(input_path, filter_name, output_path):
    from PIL import Image
    import numpy as np

    image = np.array(Image.open(input_path).convert("RGB"))

    filter_map = {
        'original': lambda x: x,
        'gaussian5': lambda x: gpu_conv2d(x, 'gaussian_5'),
        'gaussian15': lambda x: gpu_conv2d(x, 'gaussian_15'),
        'sobel': lambda x: gpu_sobel_combined(x),
        'sobelx': lambda x: gpu_conv2d(x, 'sobel_x'),
        'sharpen': lambda x: gpu_conv2d(x, 'sharpen'),
        'laplacian': lambda x: gpu_conv2d(x, 'laplacian'),
        'combo': lambda x: gpu_sobel_combined(gpu_conv2d(x, 'gaussian_5')),
    }

    # 🔥 Fix frontend-backend mismatch
    alias_map = {
        "blur": "gaussian5",
        "edge": "sobel",
        "sharpen": "sharpen"
    }

    filter_name = alias_map.get(filter_name, filter_name)

    # ── TASK 1: measure runtime & throughput ─────────────────
    start = time.time()

    # ✅ THESE MUST BE INSIDE FUNCTION
    result = filter_map[filter_name](image)

    end = time.time()
    runtime = end - start

    pixels = image.shape[0] * image.shape[1]
    if runtime > 0:                              # TASK 6: safety guard
        throughput = (pixels / 1e6) / runtime
    else:
        throughput = 0.0

    result = np.clip(result, 0, 255).astype(np.uint8)

    Image.fromarray(result).save(output_path)

    return runtime, throughput


# ── TASK 3: correctness check (standalone – not wired to API) ────────────────
def verify_correctness(image, filter_name):
    import numpy as np
    serial   = serial_convolve(image, 'gaussian_5')
    parallel = gpu_conv2d(image, 'gaussian_5')
    diff = np.mean(np.abs(serial.astype(np.float32) - parallel.astype(np.float32)))
    return diff


# ── TASK 4: runtime-vs-size benchmark (standalone – not auto-run) ────────────
def benchmark_runtime():
    import time
    import numpy as np

    sizes = [256, 512, 1024, 2048]
    results = []

    for s in sizes:
        img = np.random.randint(0, 255, (s, s, 3), dtype=np.uint8)

        start = time.time()
        gpu_conv2d(img, 'gaussian_5')
        end = time.time()

        results.append((s, end - start))

    return results
