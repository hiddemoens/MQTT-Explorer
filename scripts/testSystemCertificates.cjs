// Read-only native-runtime smoke test. No app windows or external broker required.
const assert = require('node:assert/strict')
const { spawnSync } = require('node:child_process')
const { X509Certificate } = require('node:crypto')
const path = require('node:path')

if (!process.argv.includes('--runtime')) {
  const result = spawnSync(require('electron'), [__filename, '--runtime'], {
    cwd: path.resolve(__dirname, '..'),
    env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' },
    stdio: 'inherit',
    timeout: 60000,
  })
  if (result.error) throw result.error
  process.exit(result.status ?? 1)
}

require('tsx/cjs')
const { getCertificateAuthority } = require('../backend/src/DataSource/CertificateAuthority.ts')
const tls = require('node:tls')
const certificates = getCertificateAuthority()
assert(Array.isArray(certificates) && certificates.length > 0, 'System trust store must be nonempty')
certificates.forEach(certificate => new X509Certificate(certificate))
tls.createSecureContext({ ca: certificates })
if (process.platform === 'darwin') {
  // Node 22 alone omits Apple's built-in root keychain: catch regression to that incomplete list.
  assert(
    certificates.some(certificate => new X509Certificate(certificate).subject.includes('ISRG Root X1')),
    'macOS system trust must include public roots, not only locally added certificates'
  )
}
console.log(`Electron ${process.versions.electron}: loaded ${certificates.length} system CAs on ${process.platform}`)
