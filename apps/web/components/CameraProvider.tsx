"use client"
import React, { createContext, useContext, useRef, useState, useEffect } from 'react';

interface CameraContextType {
  stream: MediaStream | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  showVideo: boolean;
  setShowVideo: (show: boolean) => void;
}

const CameraContext = createContext<CameraContextType | undefined>(undefined);

export const useCamera = () => {
  const ctx = useContext(CameraContext);
  if (!ctx) throw new Error('useCamera must be used within CameraProvider');
  return ctx;
};

export const CameraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showVideo, setShowVideoState] = useState(true);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    if (streamRef.current) return;
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      streamRef.current = mediaStream;
    } catch (err) {
      alert('Could not access camera');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setStream(null);
    }
  };

  // Toggle video and handle stream
  const setShowVideo = async (show: boolean) => {
    if (show) {
      await startCamera();
      setShowVideoState(true);
    } else {
      stopCamera();
      setShowVideoState(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <CameraContext.Provider value={{ stream, startCamera, stopCamera, showVideo, setShowVideo }}>
      {children}
    </CameraContext.Provider>
  );
};
