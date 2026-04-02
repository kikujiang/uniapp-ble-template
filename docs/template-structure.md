# Template Structure (Phase 1)

## Goals

- Keep existing pages and business behavior unchanged.
- Build a stable layered structure under `src/` for gradual migration.
- Keep `common/` as compatibility bridge during transition.

## Current Layering

- `common/`
  - Legacy compatibility layer used directly by pages.
  - `common/http.js` is now bridged to `src/core/network`.
- `src/shared/`
  - Cross-cutting constants and pure utilities.
  - No page/business state.
- `src/core/`
  - Reusable infrastructure capabilities.
  - Phase 1 includes `core/network` only.
- `src/modules/`
  - Domain/module boundaries for `bushuqi` and `cockroach`.
  - Phase 1 is scaffold only (api/protocol/adapters index placeholders).

## Target Responsibilities

- `src/shared/constants`
  - global constants (`ble-uuids`, timeout baselines)
- `src/shared/utils`
  - stateless utility functions (`hex`, `crc16`, etc.)
- `src/core/network`
  - request/upload abstraction
  - baseURL policy
  - response normalization
  - legacy callback compatibility wrappers
- `src/modules/<module>/api`
  - module-specific API wrappers on top of `core/network`
- `src/modules/<module>/protocol`
  - module-specific protocol parsers/builders
- `src/modules/<module>/adapters`
  - module-specific orchestration between protocol and core capabilities

## Migration Rules

1. New shared/core logic must be added in `src/`, not `common/`.
2. Existing pages may keep `common/*` imports until phased migration.
3. `common/` files should gradually become thin bridge wrappers.
4. Do not move page files in Phase 1.

## Next Recommended Step

- Build `src/core/ble` (`adapter/scanner/connector/gatt/facade`) without touching page behavior.
- Then add module protocol implementations under `src/modules/bushuqi` and `src/modules/cockroach`.
