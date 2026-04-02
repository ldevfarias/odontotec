export function buildCorsOrigins(frontendUrl: string, nodeEnv: string): string[] {
    return frontendUrl
        .split(',')
        .map((raw) => raw.trim())
        .map((url) => {
            if (!url) throw new Error('CORS origin cannot be empty');
            if (url.includes('*')) throw new Error(`Wildcard CORS origins are not allowed: "${url}"`);

            let parsed: URL;
            try {
                parsed = new URL(url);
            } catch {
                throw new Error(`Invalid CORS origin (not a valid URL): "${url}"`);
            }

            if (nodeEnv === 'production' && parsed.protocol !== 'https:') {
                throw new Error(`Production CORS origins must use HTTPS: "${url}"`);
            }

            return parsed.origin;
        });
}
