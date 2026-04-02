# common Compatibility Layer

This directory is temporarily kept for backward compatibility with existing pages.

## Policy

- Do not add new core logic here.
- New shared/core capabilities must be implemented under `src/`.
- Files in `common/` should be progressively converted into thin bridge adapters.

## Current Status

- `common/http.js` already bridges to `src/core/network`.
- BLE and other legacy helpers are still in `common/` and will be migrated by phase.
