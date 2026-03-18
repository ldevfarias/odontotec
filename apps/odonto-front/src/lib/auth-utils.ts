/**
 * Authentication utilities for token validation
 */

/**
 * Decode JWT token payload without verification
 * @param token - JWT token
 * @returns Decoded payload or null if invalid
 */
function decodeJWT(token: string): { exp?: number } | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }

        const payload = parts[1];
        const decoded = JSON.parse(atob(payload));
        return decoded;
    } catch {
        return null;
    }
}

/**
 * Validate if JWT token is not expired
 * @param token - JWT token to validate
 * @returns true if token is valid and not expired
 */
export function isTokenValid(token: string | null): boolean {
    if (!token) {
        return false;
    }

    const decoded = decodeJWT(token);

    if (!decoded || !decoded.exp) {
        // If no expiration, consider invalid for security
        return false;
    }

    // Check if token is expired (exp is in seconds, Date.now() is in milliseconds)
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp > currentTime;
}
