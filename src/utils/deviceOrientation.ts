// Utility functions for device orientation support detection

export interface DeviceOrientationSupport {
    isSupported: boolean;
    requiresPermission: boolean;
    hasPermission: boolean;
}

/**
 * Checks if device orientation is supported and if permission is required
 */
export const checkDeviceOrientationSupport = (): DeviceOrientationSupport => {
    const result: DeviceOrientationSupport = {
        isSupported: false,
        requiresPermission: false,
        hasPermission: false
    };

    // Check if DeviceOrientationEvent is available
    if (typeof DeviceOrientationEvent === 'undefined') {
        return result;
    }

    result.isSupported = true;

    // Check if permission is required (iOS 13+)
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        result.requiresPermission = true;
        // We can't check permission status synchronously, so assume false
        result.hasPermission = false;
    } else {
        result.requiresPermission = false;
        result.hasPermission = true;
    }

    return result;
};

/**
 * Requests permission for device orientation (iOS 13+)
 */
export const requestDeviceOrientationPermission = async (): Promise<boolean> => {
    if (typeof DeviceOrientationEvent === 'undefined') {
        return false;
    }

    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
            const permission = await (DeviceOrientationEvent as any).requestPermission();
            return permission === 'granted';
        } catch (error) {
            console.error('Error requesting device orientation permission:', error);
            return false;
        }
    }

    // Permission not required, assume granted
    return true;
};

/**
 * Normalizes device orientation values for consistent behavior
 */
export const normalizeOrientationValues = (
    gamma: number | null,
    beta: number | null,
    maxTilt: number = 30
): { normalizedGamma: number; normalizedBeta: number } => {
    const safeGamma = gamma ?? 0;
    const safeBeta = beta ?? 0;

    const normalizedGamma = Math.max(Math.min(safeGamma, maxTilt), -maxTilt) / maxTilt;
    const normalizedBeta = Math.max(Math.min(safeBeta, maxTilt), -maxTilt) / maxTilt;

    return { normalizedGamma, normalizedBeta };
};

/**
 * Detects if device is mobile
 */
export const isMobileDevice = (): boolean => {
    return window.innerWidth <= 768 || 'ontouchstart' in window;
};
