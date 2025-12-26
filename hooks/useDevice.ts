
import { useState, useEffect, useRef } from 'react';

export function useWakeLock() {
  const [isActive, setIsActive] = useState(false);
  const wakeLockRef = useRef<any>(null);

  useEffect(() => {
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator) {
        try {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
          setIsActive(true);
        } catch (err) {
          setIsActive(false);
        }
      }
    };
    requestWakeLock();
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };
  }, []);

  return isActive;
}

export function useAirGestures(enabled: boolean, onLeft: () => void, onRight: () => void) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prevFrameRef = useRef<Uint8ClampedArray | null>(null);
  const lastGestureTime = useRef<number>(0);
  const accumulatedVelocity = useRef<number>(0);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let animationId: number;

    const processFrame = () => {
      if (!videoRef.current || !canvasRef.current || !enabled) return;
      const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      // Draw video to canvas (small resolution for performance)
      ctx.drawImage(videoRef.current, 0, 0, 160, 120);
      const currentFrame = ctx.getImageData(0, 0, 160, 120).data;

      if (prevFrameRef.current) {
        let mass = 0;
        let sumX = 0;
        // Simple motion detection by pixel differencing
        for (let i = 0; i < currentFrame.length; i += 8) { // Sample every 8th pixel (4 channels * 2 steps)
          if (Math.abs(currentFrame[i] - prevFrameRef.current[i]) > 35) {
            mass++;
            sumX += (i / 4) % 160;
          }
        }

        if (mass > 200) {
          // Calculate center of motion and velocity
          accumulatedVelocity.current += (sumX / mass) - (accumulatedVelocity.current / 5);
        } else {
          accumulatedVelocity.current *= 0.8;
        }

        const now = Date.now();
        if (now - lastGestureTime.current > 1200) {
          // Thresholds for gestures
          if (accumulatedVelocity.current < -25) {
            onRight();
            lastGestureTime.current = now;
            accumulatedVelocity.current = 0;
          } else if (accumulatedVelocity.current > 25) {
            onLeft();
            lastGestureTime.current = now;
            accumulatedVelocity.current = 0;
          }
        }
      }
      prevFrameRef.current = currentFrame;
      animationId = requestAnimationFrame(processFrame);
    };

    if (enabled) {
      navigator.mediaDevices.getUserMedia({ video: { width: 160, height: 120, facingMode: 'user' } })
        .then(s => {
          stream = s;
          if (videoRef.current) videoRef.current.srcObject = s;
          animationId = requestAnimationFrame(processFrame);
        })
        .catch(err => console.error("Camera access denied", err));
    }

    return () => {
      stream?.getTracks().forEach(t => t.stop());
      cancelAnimationFrame(animationId);
      prevFrameRef.current = null;
    };
  }, [enabled, onLeft, onRight]);

  return { videoRef, canvasRef };
}
