const { execFileSync } = require('node:child_process')
const { mkdirSync } = require('node:fs')
const path = require('node:path')

if (process.platform === 'darwin') {
  const root = path.resolve(__dirname, '..')
  const output = path.join(root, 'build')
  mkdirSync(output, { recursive: true })
  const trust = path.join(root, 'native/CertificateTrust.swift')
  const source = path.join(root, 'native/main.swift')
  if (process.argv.includes('--test')) {
    const test = path.join(output, 'test-certificate-trust')
    execFileSync(
      '/usr/bin/xcrun',
      [
        'swiftc',
        '-module-cache-path',
        path.join(output, 'swift-cache'),
        trust,
        path.join(root, 'native/spec/main.swift'),
        '-o',
        test,
      ],
      { stdio: 'inherit' }
    )
    execFileSync(test, [], { stdio: 'inherit' })
    return
  }
  const binaries = ['arm64-apple-macos12.0', 'x86_64-apple-macos12.0'].map(target => {
    const binary = path.join(output, `system-certificates-${target}`)
    execFileSync(
      '/usr/bin/xcrun',
      [
        'swiftc',
        '-O',
        '-module-cache-path',
        path.join(output, 'swift-cache'),
        '-target',
        target,
        '-runtime-compatibility-version',
        'none',
        trust,
        source,
        '-o',
        binary,
      ],
      { stdio: 'inherit' }
    )
    return binary
  })
  execFileSync('/usr/bin/lipo', ['-create', ...binaries, '-output', path.join(output, 'system-certificates')])
}
