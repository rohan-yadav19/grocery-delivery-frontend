# Debugging & Failure Log

This document records real debugging investigations, root cause analyses, and verified fixes performed during the development and testing of **FreshCart**.

---

## Issue 1: Vitest CLI Binary Permission Denied (`Permission denied`)

### Symptom
Running `npm run test` failed immediately with shell exit code `126` and error output:
```bash
> frontend-grocery-app@0.0.0 test
> vitest run

sh: /Users/rohan/Desktop/Notes/Frontend-Grocery-App/node_modules/.bin/vitest: Permission denied
```

### Diagnosis
Inspected script execution logs. The system tried to invoke the local Vitest binary at `./node_modules/.bin/vitest`, but the underlying shell shell runner was denied execution rights.

### Root Cause
Executable file permission bits (`+x`) were missing on the CLI binaries inside `node_modules/.bin/` following package extraction or environment initialization.

### Fix
Updated file permissions on binaries in `node_modules/.bin/`:
```bash
chmod +x node_modules/.bin/*
```

### Verification
Re-ran `npm run test`. All 26 test suites and 262 unit/component tests executed and passed without permission errors:
```bash
Test Files  26 passed (26)
     Tests  262 passed (262)
  Duration  9.53s
```

---

## Issue 2: Out-of-Order Search Response Overwriting Fresh Results

### Symptom
When typing rapidly in the product search input (e.g., typing "milk" and immediately changing to "bread"), the UI occasionally rendered search results for "milk" *after* "bread" had already rendered, displaying incorrect items.

### Diagnosis
Analyzed asynchronous search flow in `SearchPage.tsx` and `searchApi.ts`. Because simulated network latency varies between requests (200ms – 1200ms), Request A ("milk", latency 900ms) resolved after Request B ("bread", latency 300ms).

### Root Cause
Search component state was updating unconditionally on promise resolution without checking if a newer search request had already been initiated.

### Fix
1. Added a monotonic `requestId` generator in [searchApi.ts](file:///Users/rohan/Desktop/Notes/Frontend-Grocery-App/src/services/searchApi.ts).
2. Returned `requestId` alongside search results.
3. Updated `SearchPage.tsx` search handler to track `latestAcceptedRequestId.current` and discard any incoming response whose `requestId` is smaller than the latest accepted request ID.

### Verification
Created unit tests in [searchApi.test.ts](file:///Users/rohan/Desktop/Notes/Frontend-Grocery-App/tests/services/searchApi.test.ts) simulating out-of-order response timing (slow Request A vs fast Request B). Verified that stale responses are safely ignored and display state remains accurate.
