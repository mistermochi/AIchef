
import { useCallback } from 'react';

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'error';

/**
 * @hook useHaptics
 * @description Provides a simple interface for triggering haptic feedback (vibration) on supported devices.
 * It checks for the 'chefai_haptics' setting in localStorage to determine if vibration should be active.
 *
 * @returns {Object} { trigger }
 */
export function useHaptics() {
  /**
   * Triggers a specific haptic pattern.
   * @param {HapticPattern} [type='light'] - The intensity or pattern of the haptic feedback.
   */
  const trigger = useCallback((type: HapticPattern = 'light') => {
    if (typeof navigator === 'undefined' || !navigator.vibrate) return;
    
    // Check local storage setting directly to avoid context dependencies in this utility hook
    const enabled = localStorage.getItem('chefai_haptics') !== 'false';
    if (!enabled) return;

    switch (type) {
      case 'light':
        navigator.vibrate(5); // Toggle switches, checks
        break;
      case 'medium':
        navigator.vibrate(10); // Navigation, standard buttons
        break;
      case 'heavy':
        navigator.vibrate(15); // Destructive, confirmations
        break;
      case 'success':
        navigator.vibrate([10, 30, 10]); // Operation complete
        break;
      case 'error':
        navigator.vibrate([15, 50, 15, 50, 15]); // Alerts
        break;
    }
  }, []);

  return { trigger };
}
