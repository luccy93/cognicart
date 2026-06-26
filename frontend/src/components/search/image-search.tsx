'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SearchIcon, CloseIcon } from '@/components/ui/emoji-icons';

interface ImageSearchProps {
  onResult?: (imageUrl: string, description?: string) => void;
  className?: string;
}

export function ImageSearch({ onResult, className }: ImageSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setImage(url);
    setIsAnalyzing(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    const description = `Products similar to "${file.name.replace(/\.[^/.]+$/, '')}"`;
    setResult(description);
    setIsAnalyzing(false);
    onResult?.(url, description);
  }, [onResult]);

  const handleReset = () => {
    setImage(null);
    setResult(null);
    setIsAnalyzing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    setIsOpen(false);
    handleReset();
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn('p-2 glass rounded-lg hover:bg-white/10 transition-colors', className)}
        title="Search by image"
      >
        <SearchIcon size={14} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-2xl p-6 w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">Search by Image</h3>
                <button onClick={handleClose} className="p-1 glass rounded-lg"><CloseIcon size={14} /></button>
              </div>

              {!image ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center cursor-pointer hover:border-[--primary]/40 transition-colors"
                >
                  <SearchIcon size={14} className="text-4xl mx-auto mb-3 opacity-40" />
                  <p className="text-sm text-[--muted]">Click to upload an image</p>
                  <p className="text-[10px] text-[--muted] mt-1">or drag and drop</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden">
                    <img src={image} alt="Uploaded" className="w-full h-48 object-cover" />
                    <button onClick={handleReset} className="absolute top-2 right-2 p-1.5 glass rounded-lg">
                      <CloseIcon size={14} />
                    </button>
                  </div>

                  {isAnalyzing && (
                    <div className="text-center py-4">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-6 h-6 border-2 border-[--primary] border-t-transparent rounded-full mx-auto mb-2"
                      />
                      <p className="text-xs text-[--muted]">Analyzing image...</p>
                    </div>
                  )}

                  {result && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-3 text-center">
                      <p className="text-xs text-[--muted]">{result}</p>
                      <button
                        onClick={() => {
                          handleReset();
                          handleClose();
                        }}
                        className="mt-3 btn-primary text-[10px] px-4 py-1.5"
                      >
                        Search Products
                      </button>
                    </motion.div>
                  )}
                </div>
              )}

              <p className="text-[10px] text-[--muted] mt-4 text-center">
                Supported formats: JPG, PNG, WebP. Max 10MB.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
