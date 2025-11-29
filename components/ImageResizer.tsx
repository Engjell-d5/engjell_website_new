'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Maximize2, Minimize2 } from 'lucide-react';

interface ImageResizerProps {
  imageUrl: string;
  onUpdate: (url: string, width?: string, height?: string, align?: string, fullWidth?: boolean) => void;
  onClose: () => void;
}

export default function ImageResizer({ imageUrl, onUpdate, onClose }: ImageResizerProps) {
  const [width, setWidth] = useState('100%');
  const [height, setHeight] = useState('auto');
  const [align, setAlign] = useState('left');
  const [aspectRatio, setAspectRatio] = useState(true);
  const [fullWidth, setFullWidth] = useState(false);
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setOriginalWidth(img.width);
      setOriginalHeight(img.height);
      setWidth(`${img.width}px`);
      setHeight(`${img.height}px`);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const handleWidthChange = (value: string) => {
    setWidth(value);
    if (aspectRatio && originalWidth && originalHeight) {
      const numValue = parseInt(value);
      if (!isNaN(numValue)) {
        const ratio = originalHeight / originalWidth;
        setHeight(`${Math.round(numValue * ratio)}px`);
      }
    }
  };

  const handleHeightChange = (value: string) => {
    setHeight(value);
    if (aspectRatio && originalWidth && originalHeight) {
      const numValue = parseInt(value);
      if (!isNaN(numValue)) {
        const ratio = originalWidth / originalHeight;
        setWidth(`${Math.round(numValue * ratio)}px`);
      }
    }
  };

  const handleFullWidthToggle = () => {
    const newFullWidth = !fullWidth;
    setFullWidth(newFullWidth);
    if (newFullWidth) {
      setWidth('100%');
      setHeight('auto');
      setAlign('center');
    }
  };

  const handleApply = () => {
    onUpdate(imageUrl, fullWidth ? '100%' : width, fullWidth ? 'auto' : height, align, fullWidth);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-[99999] p-4 overflow-y-auto" style={{ zIndex: 99999 }}>
      <div className="classic-panel w-full max-w-2xl p-6 my-8 relative z-[99999] min-h-fit">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl text-white font-bebas">EDIT IMAGE PROPERTIES</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className={`mb-6 border border-[#1a3a4a] p-4 bg-[var(--rich-black)] ${fullWidth ? '' : ''}`}>
          <img
            ref={imgRef}
            src={imageUrl}
            alt="Preview"
            style={{
              width: fullWidth ? '100%' : (width === '100%' ? '100%' : width),
              height: fullWidth ? 'auto' : (height === 'auto' ? 'auto' : height),
              maxWidth: '100%',
              objectFit: 'contain',
              display: 'block',
              margin: fullWidth ? '0' : '0 auto',
            }}
            className={fullWidth ? 'w-full' : 'mx-auto'}
          />
        </div>

        <div className="space-y-4">
          {!fullWidth && (
            <>
              <div>
                <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">
                  Width
                </label>
                <input
                  type="text"
                  value={width}
                  onChange={(e) => handleWidthChange(e.target.value)}
                  placeholder="e.g., 500px, 50%, 100%"
                  className="w-full bg-[var(--rich-black)] border border-[#1a3a4a] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all"
                />
              </div>

              <div>
                <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">
                  Height
                </label>
                <input
                  type="text"
                  value={height}
                  onChange={(e) => handleHeightChange(e.target.value)}
                  placeholder="e.g., 300px, auto"
                  className="w-full bg-[var(--rich-black)] border border-[#1a3a4a] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all"
                />
              </div>

              <div>
                <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">
                  Alignment
                </label>
                <select
                  value={align}
                  onChange={(e) => setAlign(e.target.value)}
                  className="w-full bg-[var(--rich-black)] border border-[#1a3a4a] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="fullWidth"
                checked={fullWidth}
                onChange={handleFullWidthToggle}
                className="w-4 h-4"
              />
              <label htmlFor="fullWidth" className="text-sm text-white">
                Full Width
              </label>
            </div>
            {!fullWidth && (
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="aspectRatio"
                  checked={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="aspectRatio" className="text-sm text-white">
                  Maintain aspect ratio
                </label>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handleApply}
              className="flex-1 bg-[var(--primary-mint)] text-black hover:bg-white font-bold py-3 uppercase tracking-widest text-xs transition-colors"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-[#1a3a4a] text-white hover:bg-[var(--primary-mint)] hover:text-black font-bold py-3 uppercase tracking-widest text-xs transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

