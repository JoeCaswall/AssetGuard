# AssetGuard Setup Guide

Comprehensive setup instructions for developing and running AssetGuard on Android and Windows platforms.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [General Setup](#general-setup)
3. [Android Setup](#android-setup)
4. [Windows Setup](#windows-setup)
5. [Development Workflow](#development-workflow)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- **Git** for version control
- **Visual Studio Code** (recommended IDE)

### Platform-Specific Requirements

#### For Android Development
- **Java Development Kit (JDK)** 11 or higher
- **Android Studio** (includes Android SDK)
- **Android SDK Platform** (API level 28 or higher recommended)
- **Android Emulator** or physical Android device

#### For Windows Development
- **Windows 10** or higher (build 14316+)
- **Visual Studio 2019** or higher with:
  - Desktop development with C++
  - Windows 10 SDK (version 19041 or higher)
- **React Native for Windows CLI**

## General Setup

### 1. Clone and Navigate to Project

```bash
cd AssetGuard
```

### 2. Install Node Modules

```bash
npm install
```

Or with yarn:
```bash
yarn install
```

### 3. Create Environment Configuration

```bash
cp .env.example .env
# Edit .env with your configuration
nano .env
```

### 4. Verify TypeScript Setup

```bash
npm run typecheck
```

### 5. Verify Linting

```bash
npm run lint
```

## Android Setup

### Step 1: Install Android SDK

#### Using Android Studio (Recommended)

1. Download and install [Android Studio](https://developer.android.com/studio)
2. Open Android Studio and go to **Tools → SDK Manager**
3. Install the following:
   - **Android SDK Platform** (API 28 or higher)
   - **Android SDK Build-Tools**
   - **Android Emulator**
   - **Google Play services**

#### Using Command Line

```bash
# Set ANDROID_HOME environment variable
export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS/Linux
set ANDROID_HOME=%USERPROFILE%\AppData\Local\Android\sdk  # Windows

# Download SDK tools via sdkmanager
$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager "platform-tools" "platforms;android-28" "build-tools;34.0.0"
```

### Step 2: Set up Java Development Kit

```bash
# Verify JDK is installed
java -version
javac -version

# If not installed, install via package manager
# macOS
brew install openjdk@11

# Linux
sudo apt-get install openjdk-11-jdk

# Windows
# Download from https://adoptopenjdk.net or use:
choco install openjdk11
```

### Step 3: Configure Environment Variables

#### macOS/Linux

Add to `~/.bash_profile` or `~/.zshrc`:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools

export JAVA_HOME=/Library/Java/JavaVirtualMachines/openjdk-11.jdk/Contents/Home
```

Then reload:
```bash
source ~/.zshrc  # or ~/.bash_profile
```

#### Windows

1. Open **System Properties → Environment Variables**
2. Add/Edit the following system variables:
   - `ANDROID_HOME`: `%USERPROFILE%\AppData\Local\Android\sdk`
   - `JAVA_HOME`: `C:\Program Files\OpenJDK\openjdk-11.x.x` (adjust path as needed)
   - Add to `PATH`: `%ANDROID_HOME%\emulator`, `%ANDROID_HOME%\tools`, `%ANDROID_HOME%\platform-tools`

### Step 4: Create or Start Android Emulator

#### Create Emulator (if not exists)

```bash
# List available AVDs
emulator -list-avds

# Create new emulator
$ANDROID_HOME/cmdline-tools/latest/bin/avdmanager create avd -n MyEmulator -k "system-images;android-30;google_apis;arm64-v8a"
```

#### Start Emulator

```bash
emulator -avd MyEmulator &
```

Or use Android Studio → Virtual Device Manager

### Step 5: Run on Android

```bash
# Terminal 1: Start Metro bundler
npm start

# Terminal 2: Run on emulator/device
npm run android
```

The app should compile and launch on your Android device/emulator.

## Windows Setup

### Step 1: Install Visual Studio

1. Download [Visual Studio Community](https://visualstudio.microsoft.com/downloads/)
2. During installation, select:
   - **Desktop development with C++**
   - Check the Windows 10 SDK (19041+)

### Step 2: Install Windows-Specific Tools

```bash
# Install React Native for Windows CLI
npm install -g @react-native-windows/cli

# Or add to project
npm install @react-native-windows/cli --save-dev

# Install Windows build tools
npm install --global windows-build-tools
```

### Step 3: Add Windows Support to Project

```bash
# Initialize Windows project (if not already done)
react-native init AssetGuard --template react-native-template-typescript
# Or if already initialized
npx @react-native-windows/cli@latest init --help
```

### Step 4: Run on Windows

```bash
# Terminal 1: Start Metro bundler
npm start

# Terminal 2: Run on Windows
npm run windows
```

The app should compile and launch on your Windows machine.

## Development Workflow

### Starting Development

1. **Ensure all prerequisites are installed and configured**

2. **Open separate terminals for:**

   Terminal 1 - Metro Bundler:
   ```bash
   npm start
   ```

   Terminal 2 - Run on platform:
   ```bash
   # For Android
   npm run android

   # For Windows
   npm run windows
   ```

3. **Enable Hot Reload:**
   - On emulator/device: Press `R` twice for hot reload
   - Press `M` to open developer menu

### Debugging

#### Using React Native Debugger

1. Install [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
2. Open React Native Debugger app
3. Press `Cmd+T` (macOS) or `Ctrl+T` (Windows/Linux)
4. Connect to Metro bundler port (default: 19000)

#### Using VS Code Debugger

1. Install VS Code extension: "React Native Tools"
2. Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Attach to Metro",
      "program": "${workspaceFolder}/node_modules/react-native/local-cli/cli.js",
      "type": "node",
      "request": "launch",
      "args": ["start"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Code Quality

```bash
# Type check
npm run typecheck

# Lint
npm run lint

# Run tests (when configured)
npm test
```

### Building for Release

#### Android Release Build

```bash
# Generate signed APK
cd android
./gradlew assembleRelease

# Or AAB for Play Store
./gradlew bundleRelease
cd ..
```

#### Windows Release Build

```bash
# Build for release
npx react-native run-windows --release

# Generate MSIX package (for Store distribution)
cd windows
msbuild AssetGuard.sln /p:Configuration=Release
cd ..
```

## Troubleshooting

### Common Issues

#### 1. "gradlew: command not found"

**Solution:**
```bash
cd android
chmod +x gradlew
cd ..
npm run android
```

#### 2. "Cannot find ANDROID_HOME"

**Solution:**
- Set environment variable correctly
- Verify path exists: `ls $ANDROID_HOME` (macOS/Linux)
- Restart terminal after setting variable

#### 3. "SDK version mismatch"

**Solution:**
```bash
# Update SDK
$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager "platforms;android-33"

# Update build tools
$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager "build-tools;34.0.0"
```

#### 4. "Metro bundler connection refused"

**Solution:**
```bash
# Kill existing Metro process
lsof -ti:19000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :19000  # Windows (then taskkill /PID <PID> /F)

# Restart Metro
npm start -- --reset-cache
```

#### 5. "React Native for Windows not installed"

**Solution:**
```bash
npm install -g @react-native-windows/cli
# Or add locally
npm install --save-dev @react-native-windows/cli
```

### Database Issues

```bash
# Clear SQLite database (development)
# Delete the database file manually:
# Android: /data/data/com.assetguard/databases/assetguard.db
# Windows: App local data folder

# Or implement clear database function in app
```

### Metro Bundler Cache Issues

```bash
npm start -- --reset-cache
```

### Dependency Issues

```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
npm start -- --reset-cache
```

## Next Steps

1. Review the [main README.md](./README.md) for architecture details
2. Start implementing screens in `src/screens/`
3. Add custom components in `src/components/`
4. Implement specific business logic in `src/services/`
5. Configure API endpoint in `.env`

## Resources

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [React Native for Windows](https://microsoft.github.io/react-native-windows/)
- [React Navigation](https://reactnavigation.org/docs/getting-started/)
- [React Native SQLite Storage](https://github.com/andpor/react-native-sqlite-storage)
- [Zustand](https://github.com/pmndrs/zustand)

---

**Last Updated:** April 2026
**Version:** 0.0.1
