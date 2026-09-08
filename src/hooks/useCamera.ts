import { useState, useEffect, RefObject, useCallback, useRef } from 'react';
import { getCameraStream, stopCameraStream, captureFrameFromVideo } from '@/lib/image-utils';

type FacingMode = 'user' | 'environment';

/**
 * Hook for managing WebRTC camera stream and capture.
 */
export function useCamera() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<FacingMode>('environment');

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      stopCameraStream(streamRef.current);
      streamRef.current = null;
      setStream(null);
      setIsActive(false);
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      // Stop existing stream if any
      if (streamRef.current) {
        stopCameraStream(streamRef.current);
      }
      const newStream = await getCameraStream(facingMode);
      streamRef.current = newStream;
      setStream(newStream);
      setIsActive(true);
    } catch (err: any) {
      setError(err.message || 'Could not start camera');
      setIsActive(false);
    }
  }, [facingMode]);

  const capturePhoto = useCallback(async (videoRef: RefObject<HTMLVideoElement>): Promise<Blob> => {
    if (!videoRef.current || !streamRef.current) {
      throw new Error('Camera not ready');
    }
    return captureFrameFromVideo(videoRef.current);
  }, []);

  const toggleFacingMode = useCallback(() => {
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Restart camera when facing mode changes
  useEffect(() => {
    if (isActive) {
      startCamera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  return {
    stream,
    isActive,
    error,
    startCamera,
    stopCamera,
    capturePhoto,
    toggleFacingMode,
    facingMode,
  };
}
