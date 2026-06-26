'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceSearchProps {
  onResult: (text: string) => void;
}

export function VoiceSearch({ onResult }: VoiceSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const recognitionRef = useRef<any>(null);

  const SpeechRecognitionCtor = typeof window !== 'undefined'
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null;

  const startListening = useCallback(() => {
    setError('');
    if (!SpeechRecognitionCtor) {
      setError('Speech recognition not supported in this browser');
      return;
    }
    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: Event) => {
      const evt = event as unknown as { results: Array<{ transcript: string; isFinal?: boolean }> };
      const text = Array.from(evt.results)
        .map((r) => r.transcript)
        .join('');
      setTranscript(text);
      if ((evt.results[0] as { isFinal?: boolean }).isFinal) {
        setIsListening(false);
        setIsOpen(false);
        onResult(text);
      }
    };

    recognition.onerror = (event: Event | string) => {
      const errMsg = typeof event === 'string' ? event : (event as any).error;
      setError(errMsg === 'no-speech' ? 'No speech detected' : `Error: ${errMsg}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [SpeechRecognitionCtor, onResult]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-full glass hover:bg-white/10 transition-colors"
        title="Voice search"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => { stopListening(); setIsOpen(false); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-2xl p-8 max-w-md w-full mx-4 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              {error ? (
                <div className="text-red-400 mb-4">
                  <p className="text-lg font-semibold">Error</p>
                  <p className="text-sm mt-1">{error}</p>
                  <button onClick={() => setError('')} className="btn-ghost mt-4 text-sm">Try Again</button>
                </div>
              ) : (
                <>
                  <motion.div
                    animate={isListening ? { scale: [1, 1.15, 1], opacity: [1, 0.7, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center mx-auto mb-6"
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="white" stroke="none">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" y1="19" x2="12" y2="23" />
                      <line x1="8" y1="23" x2="16" y2="23" />
                    </svg>
                  </motion.div>
                  <p className="text-lg font-semibold mb-2">
                    {isListening ? 'Listening...' : 'Click to Speak'}
                  </p>
                  {transcript && (
                    <p className="text-sm text-[--muted] bg-white/5 rounded-lg p-3 mt-3">
                      &ldquo;{transcript}&rdquo;
                    </p>
                  )}
                  <div className="flex gap-3 justify-center mt-6">
                    {isListening ? (
                      <button onClick={stopListening} className="btn-accent px-6 py-2 text-sm">
                        Stop
                      </button>
                    ) : (
                      <button onClick={startListening} className="btn-primary px-6 py-2 text-sm">
                        Start Recording
                      </button>
                    )}
                    <button onClick={() => setIsOpen(false)} className="btn-ghost px-6 py-2 text-sm">
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
