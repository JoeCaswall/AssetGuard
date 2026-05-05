# AssetGuard

AssetGuard is a cross-platform university project built with Expo and React Native. It demonstrates an offline-first field inspection workflow with local encrypted storage, draft persistence, retention handling, and placeholder backend sync.

## Tech Stack

- Expo SDK 55
- React Native 0.83
- TypeScript
- Expo SQLite for local persistence
- Expo SecureStore and Expo Crypto for key storage and encryption support
- Jest for unit and integration-style tests

## Getting Started

### Prerequisites

- Node.js and npm installed
- Expo CLI available through `npx expo`
- For iOS simulator use: macOS with Xcode installed
- For Android emulator use: Android Studio with an AVD configured

Install dependencies:

```bash
npm install
```

## Running the App with Expo

Start the Expo development server:

```bash
npx expo start --clear
```

This opens the Expo developer interface in the terminal and browser.

### Run on an iOS simulator

Requirements:

- macOS
- Xcode installed
- An iOS simulator available

Steps:

```bash
npx expo start --clear
```

Then press `i` in the Expo terminal to launch the app in the currently selected iOS simulator.

If you want to create or run a native iOS build directly, use:

```bash
npm run ios
```

### Run on an Android emulator

Requirements:

- Android Studio installed
- Android SDK configured
- An Android Virtual Device created and started

Steps:

```bash
npx expo start --clear
```

Then press `a` in the Expo terminal to open the app in the running Android emulator.

If you want to build and run the native Android project directly, use:

```bash
npm run android
```

### Run on a physical device using Expo

Steps:

```bash
npx expo start --clear
```

Then:

- install Expo Go on the device
- ensure the phone and development machine are on the same network
- scan the QR code shown by Expo

This is the fastest option for testing on real hardware.

## Useful Scripts

```bash
npm run test
npm run typecheck
```

You can also run all current tests directly with:

```bash
npx jest __tests__ --verbose
```

To generate coverage:

```bash
npx jest __tests__ --coverage --verbose
```

## Project Structure

The project is intentionally organised so that presentation, state management, persistence, sync, and pure logic are separated.

### Root files

- `App.tsx`: application entry point and lightweight screen routing
- `app.json`: Expo app configuration
- `package.json`: scripts and dependencies
- `jest.config.js`: Jest configuration for Expo
- `tsconfig.json`: TypeScript configuration

### Source modules

- `src/components/`
  Reusable presentational components such as layout wrappers and badges.

- `src/context/`
  Shared application state through `AssetGuardProvider`, including task data, inspection drafts, sync state, and bootstrap logic.

- `src/data/`
  Seed task data used to populate the app locally.

- `src/screens/`
  The main user-facing screens:
  `HomeScreen.tsx`, `TaskDetailScreen.tsx`, and `InspectionFormScreen.tsx`.

- `src/services/`
  External-facing service logic. The `sync/` area contains the placeholder backend sync implementation.

- `src/storage/`
  Local persistence and infrastructure concerns:
  `sqliteStorage.ts` for database access,
  `sqliteMappers.ts` for row mapping,
  `storageCrypto.ts` for encryption support,
  and `retention.ts` for local data retention rules.

- `src/theme/`
  Theme tokens and shared styling values.

- `src/types/`
  Shared domain types such as tasks, drafts, and app snapshots.

- `src/utils/`
  Pure helper functions for date formatting, inspection validation, and sync status formatting.

### Tests

- `__tests__/`
  Unit and integration-style tests for the provider, storage helpers, sync service, retention logic, and form logic.

## Design Choices in the Structure

- State is centralised in the provider rather than spread across screens, which keeps screen components simpler and makes offline persistence easier to coordinate.
- Storage concerns are isolated in `src/storage/`, which keeps encryption, SQLite operations, and retention policy separate from UI code.
- Business logic is extracted into `src/utils/` where possible, so validation and formatting can be tested without rendering screens.
- Sync logic is placed in `src/services/sync/` to keep the backend boundary replaceable. The current implementation uses a mock API, but the architecture allows a real backend URL to be substituted later.
- The app is structured around an offline-first workflow: create or update inspections locally, then sync them later when requested.
