// Package compiled desktop app without upstream signing credentials or automatic publishing.
const fs = require('node:fs')
const path = require('node:path')
const { execFileSync } = require('node:child_process')
const { build, Platform, Arch } = require('electron-builder')

async function main() {
  const platform = process.argv[2]
  if (!['mac', 'linux', 'win'].includes(platform))
    throw new Error('Usage: node scripts/packageSystemTrust.cjs mac|linux|win [version]')
  const root = path.resolve(__dirname, '..')
  const version = process.argv[3] || '0.4.0-beta.5-system-ca.2'
  const staging = path.join(root, 'build', 'distribution', platform)
  const output = path.join(root, 'build', 'downloads')
  fs.rmSync(staging, { recursive: true, force: true })
  fs.mkdirSync(staging, { recursive: true })
  for (const name of ['dist', 'app/build']) {
    fs.cpSync(path.join(root, name), path.join(staging, name), { recursive: true })
  }
  fs.mkdirSync(path.join(staging, 'res'), { recursive: true })
  for (const name of ['icon.png', 'icon.icns', 'entitlements.mac.plist', 'entitlements.mac.inherit.plist']) {
    fs.copyFileSync(path.join(root, 'res', name), path.join(staging, 'res', name))
  }
  fs.copyFileSync(path.join(root, 'res/icon.png'), path.join(staging, 'icon.png'))
  const metadata = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
  metadata.version = version
  delete metadata.devDependencies
  delete metadata.scripts
  delete metadata.build
  fs.writeFileSync(path.join(staging, 'package.json'), JSON.stringify(metadata, null, 2))
  fs.copyFileSync(path.join(root, 'package-lock.json'), path.join(staging, 'package-lock.json'))
  // These manually distributed prereleases should not enable automatic updates.
  fs.writeFileSync(path.join(staging, 'buildOptions.json'), JSON.stringify({ platform, package: 'portable' }))
  execFileSync('npm', ['ci', '--omit=dev', '--ignore-scripts', '--legacy-peer-deps', '--no-audit', '--no-fund'], {
    cwd: staging,
    shell: process.platform === 'win32',
    stdio: 'inherit',
  })
  const config = {
    appId: 'mqtt-explorer',
    productName: 'MQTT Explorer',
    electronVersion: '39.2.7',
    directories: { output, buildResources: 'res' },
    artifactName: 'MQTT-Explorer-' + version + '-${os}-${arch}.${ext}',
    npmRebuild: false,
    nodeGypRebuild: false,
    files: [
      'dist/**/*',
      '!dist/**/spec/**',
      '!dist/**/*.spec.*',
      'app/build/**/*',
      '!app/build/**/*.map',
      'icon.png',
      'buildOptions.json',
      'package.json',
    ],
    publish: null,
    mac: {
      identity: '-',
      // Ad hoc signatures have no Team ID; hardened library validation rejects Electron frameworks.
      hardenedRuntime: false,
      gatekeeperAssess: false,
      entitlements: 'res/entitlements.mac.plist',
      entitlementsInherit: 'res/entitlements.mac.inherit.plist',
      extraResources: [{ from: path.join(root, 'build/system-certificates'), to: 'system-certificates' }],
      binaries: ['Contents/Resources/system-certificates'],
    },
    win: { signAndEditExecutable: false },
    linux: { category: 'Development', executableName: 'mqtt-explorer' },
    nsis: {
      artifactName: 'MQTT-Explorer-' + version + '-windows-${arch}-setup.${ext}',
      oneClick: false,
      allowToChangeInstallationDirectory: true,
    },
    portable: { artifactName: 'MQTT-Explorer-' + version + '-windows-${arch}-portable.${ext}' },
  }
  const targets =
    platform === 'mac'
      ? Platform.MAC.createTarget(['zip'], Arch.arm64, Arch.x64)
      : platform === 'linux'
        ? Platform.LINUX.createTarget(['AppImage', 'tar.gz'], Arch.x64)
        : Platform.WINDOWS.createTarget(['nsis', 'portable'], Arch.x64)
  await build({ projectDir: staging, config, targets, publish: 'never' })
  if (platform === 'mac') {
    // Avoid Finder-driven DMG customization: create plain drag-and-drop images without opening Finder.
    for (const arch of ['arm64', 'x64']) {
      const imageRoot = path.join(root, 'build/distribution', `dmg-${arch}`)
      fs.rmSync(imageRoot, { recursive: true, force: true })
      fs.mkdirSync(imageRoot, { recursive: true })
      const app = path.join(output, arch === 'arm64' ? 'mac-arm64' : 'mac', 'MQTT Explorer.app')
      execFileSync('/usr/bin/ditto', [app, path.join(imageRoot, 'MQTT Explorer.app')])
      fs.symlinkSync('/Applications', path.join(imageRoot, 'Applications'))
      execFileSync(
        '/usr/bin/hdiutil',
        [
          'create',
          '-ov',
          '-format',
          'UDZO',
          '-volname',
          'MQTT Explorer',
          '-srcfolder',
          imageRoot,
          path.join(output, `MQTT-Explorer-${version}-mac-${arch}.dmg`),
        ],
        { stdio: 'inherit' }
      )
    }
  }
}
main().catch(error => {
  console.error(error)
  process.exit(1)
})
