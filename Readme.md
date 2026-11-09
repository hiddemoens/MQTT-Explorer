# MQTT Explorer (system CA fork)

[![Release](https://img.shields.io/github/v/release/hiddemoens/MQTT-Explorer?include_prereleases)](https://github.com/hiddemoens/MQTT-Explorer/releases)
[![Downloads](https://img.shields.io/github/downloads/hiddemoens/MQTT-Explorer/total)](https://github.com/hiddemoens/MQTT-Explorer/releases)

Fork of [thomasnordquist/MQTT-Explorer](https://github.com/thomasnordquist/MQTT-Explorer), an MQTT client for exploring topics and messages.
This fork uses maintained operating system certificate authorities for MQTT TLS connections on Windows, Linux, and macOS, while preserving custom CA overrides and certificate validation.

|                                                                                                                                     |                                                                                                                |                                                                                                                |
| :---------------------------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------: |
| [![screen_composite](https://mqtt-explorer.com/img/screen-composite_small.png)](https://mqtt-explorer.com/img/screen-composite.png) | [![screen2_small](https://mqtt-explorer.com/img/screen2_small.png)](https://mqtt-explorer.com/img/screen2.png) | [![screen3_small](https://mqtt-explorer.com/img/screen3_small.png)](https://mqtt-explorer.com/img/screen3.png) |

## Downloads

Download desktop builds from [this fork's GitHub Releases](https://github.com/hiddemoens/MQTT-Explorer/releases).
Current prerelease: [v0.4.0-beta.5-system-ca.2](https://github.com/hiddemoens/MQTT-Explorer/releases/tag/v0.4.0-beta.5-system-ca.2).

| Platform | Downloads |
| --- | --- |
| macOS 12+ — Apple Silicon (M1 and newer) | [DMG](https://github.com/hiddemoens/MQTT-Explorer/releases/download/v0.4.0-beta.5-system-ca.2/MQTT-Explorer-0.4.0-beta.5-system-ca.2-mac-arm64.dmg) · [ZIP](https://github.com/hiddemoens/MQTT-Explorer/releases/download/v0.4.0-beta.5-system-ca.2/MQTT-Explorer-0.4.0-beta.5-system-ca.2-mac-arm64.zip) |
| macOS 12+ — Intel | [DMG](https://github.com/hiddemoens/MQTT-Explorer/releases/download/v0.4.0-beta.5-system-ca.2/MQTT-Explorer-0.4.0-beta.5-system-ca.2-mac-x64.dmg) · [ZIP](https://github.com/hiddemoens/MQTT-Explorer/releases/download/v0.4.0-beta.5-system-ca.2/MQTT-Explorer-0.4.0-beta.5-system-ca.2-mac-x64.zip) |
| Windows — x64 | [Installer](https://github.com/hiddemoens/MQTT-Explorer/releases/download/v0.4.0-beta.5-system-ca.2/MQTT-Explorer-0.4.0-beta.5-system-ca.2-windows-x64-setup.exe) · [Portable](https://github.com/hiddemoens/MQTT-Explorer/releases/download/v0.4.0-beta.5-system-ca.2/MQTT-Explorer-0.4.0-beta.5-system-ca.2-windows-x64-portable.exe) |
| Linux — x64 | [AppImage](https://github.com/hiddemoens/MQTT-Explorer/releases/download/v0.4.0-beta.5-system-ca.2/MQTT-Explorer-0.4.0-beta.5-system-ca.2-linux-x86_64.AppImage) · [tar.gz](https://github.com/hiddemoens/MQTT-Explorer/releases/download/v0.4.0-beta.5-system-ca.2/MQTT-Explorer-0.4.0-beta.5-system-ca.2-linux-x64.tar.gz) |

[SHA-256 checksums](https://github.com/hiddemoens/MQTT-Explorer/releases/download/v0.4.0-beta.5-system-ca.2/SHA256SUMS.txt) accompany downloads. See release notes for verification status.

### Installation and updates

- **macOS:** open DMG and drag MQTT Explorer into Applications, or extract ZIP. Builds are ad hoc signed and not Apple-notarized, so macOS may block first launch.
- **Windows:** run installer, or use portable executable. Builds are unsigned and may show a SmartScreen warning.
- **Linux:** make AppImage executable (`chmod +x <downloaded-file>.AppImage`) and run it, or extract tar.gz and run `mqtt-explorer`. Keep distribution `ca-certificates` package installed and updated.

These prerelease packages use manual updates: download a newer build from this fork's Releases page.
Restart app after operating system certificate updates. Keep **Validate certificate** enabled.

## Quick Start with GitHub Codespaces

The fastest way to start developing is with GitHub Codespaces:

1. Click the green "Code" button above
2. Select "Codespaces" tab
3. Click "Create codespace on [branch]"
4. Wait for the environment to set up (includes Node.js and MQTT broker)
5. Run `yarn dev:server` to start development

The devcontainer includes a pre-configured MQTT broker and all development tools. See [.devcontainer/README.md](.devcontainer/README.md) for details.

## Run from sources

### Desktop Application (Electron)

```bash
npm install -g yarn
yarn
NODE_ENV=production yarn build
yarn start
```

### Browser Mode (Web Application)

MQTT Explorer can also run as a web application served by a Node.js server:

```bash
npm install -g yarn
yarn
yarn build:server
yarn start:server
```

Then open your browser to `http://localhost:3000`. For more details, see [BROWSER_MODE.md](BROWSER_MODE.md).

### Upstream Docker images (Browser Mode)

[![Try in PWD](https://raw.githubusercontent.com/play-with-docker/stacks/master/assets/images/button.png)](https://labs.play-with-docker.com/?stack=https://raw.githubusercontent.com/thomasnordquist/MQTT-Explorer/master/docker-compose.yml)

The following images are published by upstream and do not include this fork's changes. Fork downloads above are desktop applications.

Run upstream MQTT Explorer in a Docker container:

```bash
docker run -d \
  -p 3000:3000 \
  -e MQTT_EXPLORER_USERNAME=admin \
  -e MQTT_EXPLORER_PASSWORD=your_secure_password \
  -v mqtt-explorer-data:/app/data \
  ghcr.io/thomasnordquist/mqtt-explorer:latest
```

**Supports multiple platforms**: amd64, arm64 (Raspberry Pi 3/4/5), arm/v7 (Raspberry Pi 2/3).

**Enterprise integration**: Set `MQTT_EXPLORER_SKIP_AUTH=true` to disable built-in authentication when deploying behind a secure authentication proxy (e.g., OAuth2 Proxy, SSO).

For complete Docker documentation including authentication options, deployment examples, and security best practices, see [DOCKER.md](DOCKER.md).

## Develop

### Desktop Application

Launch Application

```bash
npm install -g yarn
yarn
yarn dev
```

### Browser Mode

Launch in development mode with hot reload:

```bash
npm install -g yarn
yarn
yarn dev:server
```

The `app` directory contains all the rendering logic, the `backend` directory currently contains the models, tests, connection management, `src` contains all the electron bindings. [mqttjs](https://github.com/mqttjs/MQTT.js) is used to facilitate communication to MQTT brokers.

For information on styling conventions and visual design patterns, see [STYLING.md](STYLING.md).

## Automated Tests

MQTT Explorer uses multiple test suites to ensure reliability and quality:

### Unit Tests

**App tests** - Frontend component and logic tests:
```bash
yarn test:app
```

**Backend tests** - Data model and business logic tests:
```bash
yarn test:backend
```

**Run all unit tests**:
```bash
yarn test
```

### LLM Testing

The AI Assistant feature includes comprehensive tests to validate proposal quality and LLM integration.

**Offline tests** (default - no API key needed):
```bash
yarn test:app
```

**Live LLM integration tests** (requires API key):
```bash
# Set your API key
export OPENAI_API_KEY=sk-your-key-here
# Or use Gemini
export GEMINI_API_KEY=your-key-here

# Opt-in to live tests
export RUN_LLM_TESTS=true

# Run tests
yarn test:app
```

For detailed LLM testing documentation, see [app/src/services/spec/README.md](app/src/services/spec/README.md).

### Integration & UI Tests

**UI test suite** - Independent, deterministic browser tests:
```bash
yarn build
yarn test:ui
```

**Demo video generation** - UI test recording for documentation:
```bash
yarn build
yarn test:demo-video
```
Note: Requires Xvfb, mosquitto broker, tmux, and ffmpeg. For full video recording setup, use `./scripts/uiTests.sh`.

**MCP introspection tests** - Model Context Protocol validation:
```bash
yarn build
yarn test:mcp
```

**Run all tests** (unit tests + demo video):
```bash
yarn build
yarn test:all
```

### Run UI Test Suite

The UI test suite validates core functionality through automated browser tests. Each test is independent and deterministic.

```bash
# Run with automated setup (recommended)
./scripts/runUiTests.sh

# Or run directly (requires manual MQTT broker setup)
yarn build
yarn test:ui
```

See [docs/UI-TEST-SUITE.md](docs/UI-TEST-SUITE.md) for more details.

### Run Demo Video Generation

The demo video is used for documentation and showcases key features. It requires additional dependencies:

```bash
yarn build
yarn test:demo-video
```

**Requirements:**
- mosquitto MQTT broker
- Xvfb (virtual framebuffer)
- tmux (terminal multiplexer)
- ffmpeg (video encoding)

**For full video recording with post-processing:**
```bash
yarn build
./scripts/uiTests.sh
```

This script handles Xvfb setup, mosquitto startup, video recording, and cleanup.

### Mobile Demo Video

A mobile-focused demo video showcases MQTT Explorer in a mobile viewport (Pixel 6: 412x915px):

```bash
yarn build
yarn test:demo-video:mobile
```

Or with full recording setup:
```bash
yarn build
./scripts/uiTestsMobile.sh
```

This demonstrates the mobile compatibility features and responsive design improvements. See [MOBILE_COMPATIBILITY.md](MOBILE_COMPATIBILITY.md) for the mobile strategy and implementation details.

## Mobile Compatibility

MQTT Explorer supports mobile devices through its browser mode with responsive design enhancements:

- **Target Device**: Google Pixel 6 (412x915px viewport)
- **Touch-Friendly UI**: Minimum 44px tap targets for better mobile UX
- **Responsive Layout**: Sidebar and panels adapt to mobile viewports
- **Browser Mode**: Access via mobile browser or install as PWA

For the complete mobile compatibility concept, implementation phases, and future roadmap, see [MOBILE_COMPATIBILITY.md](MOBILE_COMPATIBILITY.md).

## Create a release

Create a PR to `release` branch.
There needs to be a "feat: some new feature" or "fix: some bugfix" commit for a new release to be created

### macOS Notarization

macOS builds are automatically notarized during the release process. To set up notarization credentials, see [NOTARIZATION.md](NOTARIZATION.md).

## Create a beta release

Create a PR to `beta` branch. A "feat" or "fix" commit is necessary to create a new version.

## Write docs

```
git clone --single-branch -b gh-pages https://github.com/thomasnordquist/MQTT-Explorer.git mqtt-explorer-pages
cd mqtt-explorer-pages
bundle install
bundle exec jekyll serve --incremental
```

Readme file: `Readme.tpl.md`

Preview is available at
http://localhost:4000/Readme.tpl

## Update docs

```
npm install
./updateReadme.ts
```

The readme will be generated from the docs.

## License

![CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-blue.svg)  
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)

**Special requirement:** When distributing, the attribution and donation page may not be altered or made less accessible without explicit approval.

The license allows for anyone to adapt, share, and redistribute the material, as long as they give appropriate credit and distribute any derivative works under the same license.

## System certificate trust (this fork)

MQTT TLS and secure WebSocket connections use operating system CA certificates by default.
No CA download, Homebrew package, or manual bundle import is needed:

- **Windows:** Node reads Windows certificate stores.
- **macOS:** a packaged Security.framework helper reads Apple trust anchors and configured user/admin trust settings. This includes public system roots that Electron 39 / Node 22 omits from its system CA enumeration. Explicit SSL denials are excluded; scoped grants are not expanded to unrestricted trust, and scoped denials are conservatively excluded for all connections.
- **Linux:** Node reads system CA files/directories. Install distribution `ca-certificates` package and keep OS updates current. Confined packages/containers need access to their system trust store; host store visibility depends on packaging.

System certificates are cached for process lifetime. **Restart MQTT Explorer after certificate/trust changes.**
A custom Server Certificate (CA) replaces system authorities for that broker only; client certificate/key settings remain independent.
Keep **Validate certificate** enabled: chain and hostname validation remain active.
An unavailable or empty system store produces a connection error instead of falling back to bundled Mozilla roots.
This selects OS authorities for Node TLS; it does not reproduce every native verification policy, including revocation checks.
Other HTTP clients in the application retain upstream trust behavior.

### Building and checking system trust

Use pinned Electron 39 or a compatible Node runtime exposing `tls.getCACertificates` (Node 22.15+).
On macOS, building needs Xcode Command Line Tools; end users need no compiler.
`npm run build` builds a universal macOS certificate helper and includes it in macOS package resources.
For backend development, run commands from repository root and build helper first:

```sh
npm run build:system-certificates
npm run test:system-certificates
node node_modules/mocha/bin/mocha.js --require tsx "backend/src/DataSource/spec/*.spec.ts"
```

System CA trust workflow runs focused TLS tests and pinned Electron native trust checks on Windows, Linux and macOS, without opening app windows.

## Package desktop downloads

Use Node 24 and Yarn 1.22. Build from this fork's source checkout:

```sh
yarn install --frozen-lockfile
NODE_ENV=production yarn build
node scripts/packageSystemTrust.cjs mac 0.4.0-beta.5-system-ca.2
node scripts/packageSystemTrust.cjs linux 0.4.0-beta.5-system-ca.2
node scripts/packageSystemTrust.cjs win 0.4.0-beta.5-system-ca.2
```

Packages are written to `build/downloads/`. macOS packaging requires macOS and Xcode Command Line Tools; macOS builds include both Apple Silicon and Intel variants. Linux and Windows targets currently use x64.
Packaging stages runtime files and dependencies separately, excludes upstream signing credentials, uses ad hoc signing on macOS, and disables automatic publishing and in-app updates for these manually distributed prereleases.
