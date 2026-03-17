# Stripe Cancel URL UX Fix — Design Spec

## Problem

When a logged-in user initiates a Stripe Checkout from any screen (UpgradePlanCard, SubscriptionBlocker, or billing page) and clicks the Stripe back button, they are redirected to `/login` instead of back into the app. Additionally, the current `cancel_url` appends `?canceled=true` which is semantically wrong — the user did not cancel their plan, they merely abandoned the checkout flow.

## Desired Behavior

| Event | Redirect target | UI feedback |
|-------|----------------|-------------|
| User abandons Stripe checkout (back button) | `/settings/billing` | None — lands cleanly |
| Checkout completes successfully | `/settings/billing?success=true` | Success toast + subscription refetch |
| Actual plan cancellation (Stripe portal / webhook) | Handled server-side via webhook | Not via `cancel_url` |

## Changes Required

### 1. API — `subscription.service.ts`
- Default `cancel_url` changes from `${FRONTEND_URL}/settings/billing?canceled=true` to `${FRONTEND_URL}/settings/billing`.
- Note: the current `cancelUrl` parameter on `createCheckoutSession` has no open-redirect validation. This is a pre-existing issue and out of scope for this fix — the parameter will remain accepted as-is.

### 2a. Frontend — `SubscriptionContext.tsx`

- `upgradeToPro` currently passes `cancelUrl = window.location.href` to `createCheckoutSession`.
- Remove these two lines: pass no `cancelUrl`, letting the API use its safe default.

### 2b. Frontend — `settings/billing/page.tsx` (checkout button)

- The billing page calls `checkoutMutation.mutate(window.location.href)` directly (bypasses `upgradeToPro`).
- Change to `checkoutMutation.mutate()` (no argument) so the API default is used consistently.

### 3. Frontend — `settings/billing/page.tsx` (search params handler)

- The `useEffect` currently handles both `?success=true` and `?canceled=true` branches.
- Remove **only** the `canceled` branch (toast + history.replaceState for that param).
- Leave the `success` branch, the `hasToasted` ref guard, and all other logic untouched.
- The `canceled` search param will no longer be emitted by the checkout flow, so no handler is needed.

## Out of Scope
- Stripe Customer Portal cancel flow (separate feature, handled via webhook `customer.subscription.deleted`).
- Re-authentication / token refresh on Stripe return (separate concern).
- Open-redirect validation on the `cancelUrl` API parameter (pre-existing gap, separate task).
