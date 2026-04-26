# Implementation Guide

This document outlines the next steps and priorities for developing the AssetGuard application.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment configuration
cp .env.example .env

# 3. Follow SETUP.md for platform-specific setup
# (Android SDK, Windows SDK, emulator configuration)

# 4. Start development
npm start                    # Terminal 1: Metro bundler
npm run android             # Terminal 2: Android
# OR
npm run windows             # Terminal 2: Windows
```

## Phase 1: Core Screens Implementation (Priority: HIGH)

### 1.1 JobsListScreen ✅ (Template Created)
- **Status:** Template created, needs refinement
- **Tasks:**
  - [ ] Add search/filter functionality
  - [ ] Add pull-to-refresh
  - [ ] Add job status badges with proper colors
  - [ ] Add priority indicators
  - [ ] Implement job sorting options
  - [ ] Add empty state UI improvements
  - [ ] Add error retry mechanism

**File:** [src/screens/JobsListScreen.tsx](src/screens/JobsListScreen.tsx)

### 1.2 JobDetailScreen ✅ (Template Created)
- **Status:** Template created with basic functionality
- **Tasks:**
  - [ ] Add image gallery component
  - [ ] Add photo upload functionality
  - [ ] Add notes editor
  - [ ] Add status change UI
  - [ ] Add job assignment UI
  - [ ] Implement edit mode
  - [ ] Add activity timeline

**File:** [src/screens/JobDetailScreen.tsx](src/screens/JobDetailScreen.tsx)

### 1.3 CreateJobScreen ✅ (Template Created)
- **Status:** Template created with basic form
- **Tasks:**
  - [ ] Implement date picker (iOS/Android/Windows)
  - [ ] Add image attachment
  - [ ] Add location picker
  - [ ] Add form validation improvements
  - [ ] Add form autosave to prevent data loss
  - [ ] Implement worker/team assignment
  - [ ] Add priority/category selection

**File:** [src/screens/CreateJobScreen.tsx](src/screens/CreateJobScreen.tsx)

### 1.4 SettingsScreen ✅ (Template Created)
- **Status:** Template created with basic settings
- **Tasks:**
  - [ ] Implement actual sync status display
  - [ ] Add user profile management
  - [ ] Add notification preferences
  - [ ] Add offline/online indicator
  - [ ] Implement theme selection
  - [ ] Add about section
  - [ ] Add help/support

**File:** [src/screens/SettingsScreen.tsx](src/screens/SettingsScreen.tsx)

## Phase 2: UI Components (Priority: MEDIUM)

### 2.1 Core Components to Create

**JobCard Component**
```typescript
// src/components/JobCard.tsx
- Reusable job card display
- Status badge
- Priority indicator
- Quick action buttons
```

**StatusBadge Component**
```typescript
// src/components/StatusBadge.tsx
- Display job status
- Color coding
- Icon support
```

**PriorityBadge Component**
```typescript
// src/components/PriorityBadge.tsx
- Display priority level
- Color coding
```

**ImageGallery Component**
```typescript
// src/components/ImageGallery.tsx
- Display job images
- Image upload
- Delete functionality
```

**LocationPicker Component**
```typescript
// src/components/LocationPicker.tsx
- Select job location
- Map integration (future)
```

**NotesEditor Component**
```typescript
// src/components/NotesEditor.tsx
- Edit job notes
- Character count
- Auto-save
```

## Phase 3: Backend Integration (Priority: MEDIUM-HIGH)

### 3.1 API Endpoint Configuration
- [ ] Configure API base URL in `.env`
- [ ] Implement authentication/token management
- [ ] Add error handling middleware
- [ ] Add request/response logging

**File:** [src/services/apiService.ts](src/services/apiService.ts)

### 3.2 Sync Service Enhancement
- [ ] Test offline-first sync functionality
- [ ] Implement retry logic with exponential backoff
- [ ] Add sync progress tracking
- [ ] Handle conflict resolution
- [ ] Add sync history logging

**File:** [src/services/syncService.ts](src/services/syncService.ts)

### 3.3 Backend API Endpoints Required
Your backend should implement:

```
GET    /api/health                    # Health check
GET    /api/jobs                      # List all jobs
GET    /api/jobs/{id}                 # Get single job
POST   /api/jobs                      # Create job
PUT    /api/jobs/{id}                 # Update job
DELETE /api/jobs/{id}                 # Delete job
POST   /api/uploads/image             # Upload image
POST   /api/sync                      # Batch sync endpoint (optional)
```

## Phase 4: Features & Enhancements (Priority: LOW-MEDIUM)

### 4.1 Photo/Image Management
- [ ] Implement image picker
- [ ] Add image compression
- [ ] Add image upload to backend
- [ ] Implement offline image storage
- [ ] Add image gallery view

### 4.2 Location Services
- [ ] Add GPS location tracking
- [ ] Implement location picker
- [ ] Add location search/autocomplete
- [ ] Store location history

### 4.3 Notifications
- [ ] Add push notification support
- [ ] Implement due date reminders
- [ ] Add job status change notifications
- [ ] Add offline notification queue

### 4.4 Advanced Filtering
- [ ] Status filter
- [ ] Priority filter
- [ ] Date range filter
- [ ] Search functionality
- [ ] Save filter presets

### 4.5 Job Templates
- [ ] Create job from template
- [ ] Save job as template
- [ ] Manage templates

## Phase 5: Testing & Quality (Priority: HIGH)

### 5.1 Unit Tests
```bash
npm test
```

- [ ] Test JobRepository CRUD operations
- [ ] Test store actions
- [ ] Test utility functions
- [ ] Test API service
- [ ] Test sync service

### 5.2 Integration Tests
- [ ] Test offline-first workflow
- [ ] Test sync queue processing
- [ ] Test API communication
- [ ] Test data persistence

### 5.3 E2E Tests
- [ ] Test complete job creation workflow
- [ ] Test job completion workflow
- [ ] Test offline functionality

## Phase 6: Deployment (Priority: MEDIUM)

### 6.1 Android Build & Release
```bash
cd android
./gradlew bundleRelease
cd ..
```

- [ ] Configure signing keys
- [ ] Create Play Store account
- [ ] Set up CI/CD pipeline
- [ ] Generate release notes

### 6.2 Windows Build & Release
```bash
npm run windows -- --release
```

- [ ] Generate MSIX package
- [ ] Set up Microsoft Store account
- [ ] Configure code signing

## Development Tips

### Code Style & Standards
- Always use TypeScript types
- Follow naming conventions: PascalCase for components, camelCase for functions
- Add JSDoc comments for complex functions
- Keep components under 300 lines

### Performance Optimization
- Use React.memo for expensive components
- Implement list virtualization for large lists
- Lazy load images
- Minimize re-renders using proper memoization
- Profile using React Native Debugger

### Security Best Practices
- Never store sensitive data in plaintext
- Use secure async storage for tokens
- Validate all user inputs
- Implement rate limiting
- Use HTTPS for all API calls

### Debugging
```bash
# Enable verbose logging
REACT_APP_ENABLE_LOGGING=true npm start

# Use React Native Debugger
# Press Cmd+M (Android) or Cmd+D (iOS) to open developer menu
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Backend API
REACT_APP_API_URL=http://localhost:3000/api

# Features
REACT_APP_ENABLE_LOGGING=true
REACT_APP_ENABLE_DEBUG=false

# Sync
REACT_APP_SYNC_INTERVAL_MS=30000
```

## Useful Commands

```bash
# Development
npm start                   # Start Metro bundler
npm run android            # Run on Android
npm run windows            # Run on Windows
npm run lint               # Lint code
npm run typecheck          # Check TypeScript

# Debugging
npm start -- --reset-cache # Clear Metro cache
npm run test               # Run tests

# Database
# TODO: Add clear database command

# Build & Release
npm run build:android      # Build Android APK
npm run build:windows      # Build Windows MSIX
```

## Resources & Documentation

- [React Native Documentation](https://reactnative.dev/)
- [React Native for Windows](https://microsoft.github.io/react-native-windows/)
- [React Navigation](https://reactnavigation.org/)
- [Zustand](https://github.com/pmndrs/zustand)
- [SQLite React Native](https://github.com/andpor/react-native-sqlite-storage)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Support & Questions

- Check [SETUP.md](./SETUP.md) for environment setup issues
- Check [README.md](./README.md) for architecture details
- Open an issue for bugs and feature requests
- Review error logs in device/emulator console

---

**Last Updated:** April 2026
**Version:** 0.0.1
**Status:** Initial Setup Complete - Ready for Development
