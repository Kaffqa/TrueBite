/**
 * Checks if the browser supports camera access via getUserMedia.
 */
export function isCameraSupported(): boolean {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

/**
 * Requests camera access and returns the media stream.
 * Prefers the rear camera ('environment') on mobile devices.
 */
export async function getCameraStream(
  facingMode: 'user' | 'environment' = 'environment'
): Promise<MediaStream> {
  const constraints: MediaStreamConstraints = {
    video: {
      facingMode,
      width: { ideal: 1920 },
      height: { ideal: 1080 },
    },
    audio: false,
  };

  try {
    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch (error) {
    // Fallback without facing mode constraint
    return await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
  }
}

/**
 * Stops all tracks in a media stream to release the camera.
 */
export function stopCameraStream(stream: MediaStream | null): void {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }
}

/**
 * Captures a still image from a video element using a canvas.
 * Returns the captured image as a Blob (JPEG format).
 */
export async function captureFrameFromVideo(
  videoElement: HTMLVideoElement,
  quality: number = 0.92
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to capture frame from video'));
        }
      },
      'image/jpeg',
      quality
    );
  });
}

/**
 * Opens the device's file picker for selecting an image from gallery.
 * Returns the selected file or null if cancelled.
 */
export function selectImageFromGallery(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp';
    input.capture = ''; // Hint: prefer camera on mobile

    input.onchange = () => {
      const file = input.files?.[0] ?? null;
      resolve(file);
    };

    // Handle cancel
    input.oncancel = () => resolve(null);

    input.click();
  });
}
