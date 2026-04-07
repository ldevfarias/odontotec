const ALLOWED_STRIPE_HOSTNAMES = [
    'checkout.stripe.com',
    'billing.stripe.com',
    'stripe.com',
];

/**
 * Validates that a URL belongs to Stripe before redirecting.
 * Throws if the URL is invalid, uses non-HTTPS, or hostname isn't a Stripe domain.
 */
export function assertStripeUrl(url: string): string {
    let parsed: URL;
    try {
        parsed = new URL(url);
    } catch {
        throw new Error(`Invalid redirect URL: "${url}"`);
    }

    if (parsed.protocol !== 'https:') {
        throw new Error(`Redirect URL must use HTTPS: "${url}"`);
    }

    const isAllowed = ALLOWED_STRIPE_HOSTNAMES.some(
        (host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`)
    );

    if (!isAllowed) {
        throw new Error(`Redirect URL hostname not allowed: "${parsed.hostname}"`);
    }

    return url;
}
