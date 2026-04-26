# AssetGuard

A cross-platform mobile and desktop application for field engineers to create, view, and complete inspection jobs. Built with React Native supporting Android and Windows 10+ platforms with offline-first local SQLite storage.

## Features

- 📱 **Cross-Platform Support**: Android and Windows 10+ (React Native for Windows)
- 🔄 **Offline-First Architecture**: Local SQLite database with automatic synchronization
- 💼 **Job Management**: Create, view, and complete inspection jobs
- 📍 **Location Tracking**: Track job locations and assignments
- 📸 **Image Support**: Attach images to jobs
- 🔔 **Smart Notifications**: Due date tracking and overdue alerts
- ⚡ **Real-time Sync**: Automatic background synchronization with backend
- 🎨 **Native UI**: Platform-appropriate UI with responsive design

## Project Structure

```
AssetGuard/
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/             # Screen components
│   │   ├── JobsListScreen.tsx
│   │   ├── JobDetailScreen.tsx
│   │   ├── CreateJobScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── database/            # SQLite database setup and queries
│   │   ├── init.ts         # Database initialization
│   │   └── JobRepository.ts # Job CRUD operations
│   ├── services/            # Business logic services
│   │   ├── apiService.ts   # Backend API communication
│   │   └── syncService.ts  # Offline-first sync logic
│   ├── store/              # Zustand state management
│   │   └── jobStore.ts
│   ├── navigation/         # React Navigation setup
│   │   └── Navigation.tsx
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/              # Utility functions
│   │   └── dateUtils.ts
│   ├── hooks/              # Custom React hooks
│   ├── assets/             # Images, fonts, etc.
│   └── App.tsx             # Root component
├── package.json
├── tsconfig.json
├── metro.config.js
├── .babelrc
├── .env.example
├── app.json
├── index.js
└── README.md
```

## Prerequisites

- Node.js 16+ and npm/yarn
- React Native development environment:
  - **Android**: Java Development Kit (JDK) 11+, Android SDK
  - **Windows**: Visual Studio with C++ build tools, Windows SDK
- Git

## Installation

1. **Clone the repository and navigate to the project**
   ```bash
   cd AssetGuard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   or
   ```bash
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **For Android development**
   ```bash
   # Install Android SDK and tools
   # Set ANDROID_HOME environment variable
   # Run on emulator or connected device
   npm run android
   ```

5. **For Windows development**
   ```bash
   # Install React Native for Windows CLI
   # Run the app
   npm run windows
   ```

## Development

### Running the development server

```bash
npm start
```

### Running on specific platforms

**Android:**
```bash
npm run android
```

**Windows:**
```bash
npm run windows
```

### Type checking

```bash
npm run typecheck
```

### Linting

```bash
npm run lint
```

## Architecture

### Offline-First Strategy

The app uses a three-tier data synchronization strategy:

1. **Local Storage (SQLite)**
   - All changes are immediately saved to the local database
   - Provides instant UI feedback and offline capability

2. **Sync Queue**
   - Tracks all create, update, and delete operations
   - Each operation is stored with a sync status

3. **Backend Synchronization**
   - Automatic sync when backend is available
   - Periodic sync every 30 seconds
   - Graceful handling of sync failures

### State Management

Uses **Zustand** for lightweight state management with:
- Job list state
- Selected job state
- Sync status tracking
- Error handling

### Database Schema

**jobs table**
- `id`: Unique identifier
- `title`: Job title
- `description`: Job description
- `location`: Job location
- `status`: Current job status (pending, in-progress, completed, cancelled)
- `priority`: Priority level (low, medium, high)
- `assignedTo`: Assigned engineer
- `dueDate`: Due date in ISO 8601 format
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp
- `completedAt`: Completion timestamp
- `notes`: Job completion notes

**job_attachments table**
- `id`: Unique identifier
- `jobId`: Reference to parent job
- `imageUri`: Local or remote image URI
- `uploadedAt`: Upload timestamp
- `syncStatus`: Sync status

**sync_queue table**
- `id`: Unique identifier
- `operation`: Type of operation (CREATE, UPDATE, DELETE)
- `table_name`: Target table
- `record_id`: Target record ID
- `payload`: Operation payload
- `createdAt`: Creation timestamp
- `synced`: Sync completion flag

## API Integration

The app communicates with a backend API for synchronization. Expected API endpoints:

- `GET /api/jobs` - Fetch all jobs
- `GET /api/jobs/{id}` - Fetch single job
- `POST /api/jobs` - Create job
- `PUT /api/jobs/{id}` - Update job
- `DELETE /api/jobs/{id}` - Delete job
- `POST /api/uploads/image` - Upload image
- `GET /api/health` - Health check

## Security Considerations

- [ ] Implement token-based authentication
- [ ] Add SSL pinning for secure communications
- [ ] Encrypt sensitive data in SQLite
- [ ] Implement user session management
- [ ] Add role-based access control (RBAC)

## Performance Optimization

- Lazy loading of job images
- Pagination for large job lists
- Debounced search functionality
- Optimized SQLite queries with indexes
- Background sync to prevent blocking UI

## Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
- Test offline functionality
- Test sync queue processing
- Test API communication

### E2E Tests
- Test complete job creation workflow
- Test job completion workflow
- Test offline-first behavior

## Deployment

### Android
1. Generate signed APK or AAB
2. Upload to Google Play Store

### Windows
1. Generate MSIX package
2. Submit to Microsoft Store or distribute directly

## Troubleshooting

### Database Issues
```bash
# Clear database (development only)
npm run dev:clear-db
```

### Sync Issues
- Check backend connectivity
- Verify API endpoint in .env
- Check sync queue status in database

### Build Issues
- Clear node_modules and reinstall
- Clear Metro bundler cache: `npm start -- --reset-cache`

## Future Enhancements

- [ ] Push notifications for job updates
- [ ] GPS tracking for field engineers
- [ ] Offline map support
- [ ] Batch job operations
- [ ] Advanced filtering and search
- [ ] Job templates
- [ ] Time tracking per job
- [ ] Photo gallery view
- [ ] Job history and audit logs
- [ ] Multi-language support

## Contributing

1. Create a feature branch
2. Implement changes with proper TypeScript types
3. Add tests for new functionality
4. Ensure linting passes
5. Submit pull request

## License

MIT

## Support

For issues or questions, please create an issue in the repository.

---

**Last Updated:** April 2026
**React Native Version:** 0.73.0
**Platform Support:** Android, Windows 10+
