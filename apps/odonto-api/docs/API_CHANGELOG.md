# API Changelog

## [Unreleased]

### Added
- **Tenancy Safety Net**: Implemented `TenancyInterceptor` to prevent cross-clinic data leakage.
- **Rate Limiting**: Added global throttling (10 req/min).

### Changed
- **Patients Module**:
  - Added `Procedure` entity and endpoints (`/procedures`).
  - Added `Anamnesis` entity and endpoints (`/anamnesis`).
  - Added `Payment` entity and endpoints (`/payments`).
- **Auth Module**:
  - Fixed `refresh-token.strategy.ts` to handle missing Authorization headers gracefully.
- **User Entity**:
  - Fixed `DataTypeNotSupportedError` by explicitly setting `currentHashedRefreshToken` to `varchar`.

## Reference
See `ARCHITECTURE.md` for detailed design implementation.
