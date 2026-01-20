# Deployment Guide

This guide covers how to deploy Desktop Ethereal for distribution and installation.

## Building for Distribution

### Prerequisites for Building

Before building for distribution, ensure you have:

1. **Rust Toolchain**: Latest stable version
2. **Node.js**: LTS version recommended
3. **Tauri CLI**: Installed globally or as a project dependency
4. **Target Platforms**: Access to all platforms you want to build for (if cross-compiling)

### Build Process

#### 1. Prepare the Environment

```bash
# Navigate to project root
cd ethereal

# Install dependencies
pnpm install

# Verify Tauri setup
pnpm tauri info
```

#### 2. Build for Current Platform

```bash
# Development build
pnpm tauri build

# Production build with optimizations
pnpm tauri build -- --release
```

#### 3. Build for Specific Platforms

**Windows (.msi, .exe):**

```bash
pnpm tauri build -- --target x86_64-pc-windows-msvc
```

**macOS (.app, .dmg):**

```bash
pnpm tauri build -- --release
```

**Linux (.deb, .appimage):**

```bash
pnpm tauri build -- --target x86_64-unknown-linux-gnu
```

### Build Configuration

The build process is configured in `src-tauri/tauri.conf.json`:

```json
{
  "build": {
    "beforeDevCommand": "pnpm dev",
    "beforeBuildCommand": "pnpm build",
    "devUrl": "http://localhost:1420",
    "frontendDist": "../dist"
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ]
  }
}
```

## Bundle Types

### Windows

- **NSIS Installer (.exe)**: Standard installer with customizable installation process
- **MSI Installer (.msi)**: Windows Installer package for enterprise deployment
- **Portable Executable**: Standalone executable without installer

### macOS

- **Application Bundle (.app)**: Standard macOS application bundle
- **Disk Image (.dmg)**: Disk image with drag-and-drop installation
- **Apple Silicon**: Native ARM64 builds for M1/M2 Macs

### Linux

- **Debian Package (.deb)**: For Debian-based distributions (Ubuntu, Mint)
- **AppImage**: Universal Linux package that runs on most distributions
- **RPM Package (.rpm)**: For Red Hat-based distributions (Fedora, CentOS)

## Customizing the Bundle

### Icons

Replace the default icons in `src-tauri/icons/`:

- 32x32.png
- 128x128.png
- <128x128@2x.png>
- icon.icns (macOS)
- icon.ico (Windows)

### Application Metadata

Update `src-tauri/tauri.conf.json`:

```json
{
  "productName": "Desktop Ethereal",
  "version": "1.0.0",
  "identifier": "com.ethereal.app",
  "app": {
    "windows": [
      {
        "title": "Desktop Ethereal",
        "width": 300,
        "height": 300
      }
    ]
  }
}
```

### Code Signing

For production distribution, code signing is recommended:

**Windows:**

```bash
# Set environment variables
set TAURI_SIGNING_PRIVATE_KEY=password
set TAURI_SIGNING_PRIVATE_KEY_PATH=path/to/private.key

# Build with signing
pnpm tauri build
```

**macOS:**

```bash
# Set environment variables
export APPLE_CERTIFICATE="certificate-content"
export APPLE_CERTIFICATE_PASSWORD="certificate-password"
export APPLE_ID="apple-id"
export APPLE_PASSWORD="app-specific-password"

# Build with signing
pnpm tauri build
```

## Distribution Channels

### Direct Download

Host the built packages on your website or file hosting service.

### Package Managers

#### Windows Package Manager (winget)

Create a manifest file and submit to the Windows Package Manager repository.

#### Homebrew (macOS)

Create a formula and submit to homebrew-core or maintain your own tap.

#### Snap/Apt (Linux)

Publish to the Snap Store or maintain your own apt repository.

### Application Stores

#### Microsoft Store

Package as MSIX and submit to Microsoft Partner Center.

#### Mac App Store

Package and submit through Apple App Store Connect (requires Apple Developer account).

#### Linux Application Stores

Submit to Flathub (Flatpak) or Snap Store.

## Installation Instructions

### Windows

1. Download the installer (.exe or .msi)
2. Run the installer
3. Follow the installation wizard
4. Launch Desktop Ethereal from the Start menu

**Silent Installation:**

```bash
DesktopEthereal-installer.exe /S
```

### macOS

1. Download the .dmg file
2. Open the disk image
3. Drag the application to Applications folder
4. Launch from Applications or Spotlight

**Command Line Installation:**

```bash
# Mount the DMG
hdiutil attach DesktopEthereal.dmg

# Copy to Applications
cp -r /Volumes/DesktopEthereal/Desktop\ Ethereal.app /Applications/

# Unmount
hdiutil detach /Volumes/DesktopEthereal
```

### Linux

#### Debian/Ubuntu (.deb)

```bash
sudo dpkg -i ethereal.deb
sudo apt-get install -f  # Fix dependencies if needed
```

#### AppImage

```bash
# Make executable
chmod +x Desktop_Ethereal.AppImage

# Run
./Desktop_Ethereal.AppImage
```

## Post-Installation Setup

### First Run

On first run, users should:

1. **Verify System Requirements**: Ensure GPU drivers and Ollama are installed
2. **Add Sprites**: Place sprite images in the appropriate directory
3. **Configure Preferences**: Adjust settings through the configuration UI (when implemented)

### System Integration

The application integrates with the system through:

1. **Startup**: Optional auto-start with system boot
2. **Notifications**: System notification integration
3. **Shortcuts**: Desktop and start menu shortcuts
4. **File Associations**: Sprite directory integration

## Updates and Maintenance

### Automatic Updates

Tauri supports automatic updates through the updater plugin:

1. **Configure Update Endpoint**: Set up a server to host update information
2. **Sign Updates**: Use private keys to sign update bundles
3. **Implement Update Logic**: Add update checking to the application

### Manual Updates

Users can manually update by:

1. Downloading the latest version
2. Installing over the existing installation
3. Preserving user data and settings

### Data Migration

When updating between versions:

1. **Settings Preservation**: Ensure user preferences are maintained
2. **Cache Management**: Clear or migrate cached data as needed
3. **Configuration Updates**: Handle configuration schema changes

## Troubleshooting Installation Issues

### Common Installation Problems

#### 1. Windows SmartScreen Warning

**Solution**:

- Click "More info"
- Select "Run anyway"
- Or sign the application with a code signing certificate

#### 2. macOS Gatekeeper Blocking

**Solution**:

```bash
# Remove quarantine attribute
xattr -rd com.apple.quarantine /Applications/Desktop\ Ethereal.app
```

#### 3. Linux Dependency Issues

**Solution**:

```bash
# Install missing dependencies
sudo apt-get update
sudo apt-get install libwebkit2gtk-4.0 libgtk-3-0
```

### Platform-Specific Considerations

#### Windows

- **Antivirus False Positives**: Submit to antivirus vendors as false positive
- **Administrator Rights**: Some installations may require admin privileges
- **Windows Defender**: May need to add exclusion for application directory

#### macOS

- **Notarization**: Required for distribution outside App Store
- **Hardened Runtime**: Enable for additional security
- **Entitlements**: Configure appropriate entitlements

#### Linux

- **Distribution Compatibility**: Test on multiple distributions
- **Dependencies**: Document required system libraries
- **Permissions**: Ensure proper file permissions

## Security Considerations

### Secure Distribution

1. **HTTPS Downloads**: Host files on HTTPS-enabled servers
2. **Checksums**: Provide SHA256 checksums for verification
3. **Digital Signatures**: Sign packages with code signing certificates
4. **Reproducible Builds**: Enable verification of build integrity

### Installation Security

1. **Sandboxing**: Implement appropriate sandboxing (where possible)
2. **Permissions**: Request only necessary permissions
3. **Data Protection**: Encrypt sensitive user data
4. **Network Security**: Use secure connections for online features

## Performance Optimization for Distribution

### Bundle Size Reduction

1. **Tree Shaking**: Remove unused code from frontend dependencies
2. **Asset Compression**: Optimize images and other assets
3. **Rust Optimization**: Use release profiles for smaller binaries
4. **Feature Flags**: Disable unnecessary features in production

### Startup Performance

1. **Lazy Loading**: Defer non-essential module loading
2. **Caching**: Cache expensive computations
3. **Splash Screen**: Show splash during initialization
4. **Parallel Initialization**: Initialize components in parallel where possible

## Analytics and Telemetry

### Optional Usage Tracking

Implement anonymous usage analytics:

1. **Opt-in Only**: Require explicit user consent
2. **Minimal Data**: Collect only essential usage metrics
3. **Local Processing**: Process data locally when possible
4. **Data Encryption**: Encrypt telemetry data in transit

### Crash Reporting

Implement crash reporting for stability improvements:

1. **Anonymous Reports**: Don't collect personally identifiable information
2. **User Consent**: Require opt-in for crash reporting
3. **Secure Transmission**: Use encrypted connections for reports
4. **Data Retention**: Implement appropriate data retention policies

## Legal and Compliance

### Licensing

Ensure compliance with all licenses:

1. **Third-Party Licenses**: Include all required license attributions
2. **Open Source Compliance**: Follow requirements of open source licenses
3. **Proprietary Components**: Properly license proprietary code
4. **Attribution**: Provide proper attribution in about dialog or documentation

### Privacy Regulations

Comply with privacy regulations:

1. **GDPR**: If distributing in EU
2. **CCPA**: If distributing in California
3. **PIPEDA**: If distributing in Canada
4. **Data Minimization**: Collect only necessary data

## Support and Documentation

### User Documentation

Provide comprehensive documentation:

1. **Installation Guide**: Platform-specific installation instructions
2. **User Manual**: Detailed usage instructions
3. **Troubleshooting**: Common issues and solutions
4. **FAQ**: Frequently asked questions

### Developer Documentation

Provide developer resources:

1. **API Documentation**: Interface documentation
2. **Development Guide**: Contribution guidelines
3. **Release Notes**: Version-specific changes
4. **Migration Guides**: Upgrade instructions between major versions

## Continuous Integration/Deployment

### Automated Builds

Set up CI/CD pipeline:

1. **Source Control**: Git repository with tagged releases
2. **Build Automation**: GitHub Actions, GitLab CI, or similar
3. **Testing**: Automated testing on all target platforms
4. **Deployment**: Automated deployment to distribution channels

### Release Management

Implement release management process:

1. **Versioning**: Semantic versioning scheme
2. **Changelog**: Maintain detailed changelog
3. **Release Notes**: User-friendly release notes
4. **Rollback Plan**: Process for reverting releases if needed

This deployment guide provides a comprehensive overview of packaging, distributing, and maintaining Desktop Ethereal across different platforms and environments.
