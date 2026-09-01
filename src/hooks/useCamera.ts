import { useState, useEffect, RefObject, useCallback } from 'react';
import { getCameraStream, stopCameraStream, captureFrameFromVideo } from '@/lib/image-utils';

type FacingMode = 'user' | 'environment';

/**
 * Hook for managing WebRTC camera stream and capture.
 */
export function useCamera() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<FacingMode>('environment');

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const newStream = await getCameraStream(facingMode);
      setStream(newStream);
      setIsActive(true);
    } catch (err: any) {
      setError(err.message || 'Could not start camera');
      setIsActive(false);
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stopCameraStream(stream);
      setStream(null);
      setIsActive(false);
    }
  }, [stream]);

  const capturePhoto = useCallback(async (videoRef: RefObject<HTMLVideoElement>): Promise<Blob> => {
    if (!videoRef.current || !stream) {
      throw new Error('Camera not ready');
    }
    return captureFrameFromVideo(videoRef.current);
  }, [stream]);

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
      stopCamera();
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
