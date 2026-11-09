import { execFileSync } from 'child_process'
import * as path from 'path'
import * as tls from 'tls'

let systemCertificates: string[] | undefined

export function readSystemCertificates(): string[] {
  if (systemCertificates) return systemCertificates

  let certificates: string[]
  if (process.platform === 'darwin') {
    // Electron/Node 22 omits Apple's built-in roots from getCACertificates('system').
    // Packaged apps carry a native Security.framework helper outside app.asar.
    const electronProcess = process as NodeJS.Process & { resourcesPath?: string; defaultApp?: boolean; type?: string }
    const { resourcesPath } = electronProcess
    const helper =
      resourcesPath && electronProcess.type === 'browser' && !electronProcess.defaultApp
        ? path.join(resourcesPath, 'system-certificates')
        : path.resolve('build/system-certificates')
    certificates = JSON.parse(
      execFileSync(helper, [], {
        encoding: 'utf8',
        timeout: 30000,
        maxBuffer: 4 * 1024 * 1024,
      })
    )
  } else {
    if (typeof tls.getCACertificates !== 'function') {
      throw new Error('This runtime cannot read system certificates; use Electron 39 or Node 22.15 or newer.')
    }
    certificates = tls.getCACertificates('system')
  }

  if (
    !Array.isArray(certificates) ||
    certificates.length === 0 ||
    certificates.some(
      certificate => typeof certificate !== 'string' || !certificate.includes('-----BEGIN CERTIFICATE-----')
    )
  ) {
    throw new Error('No usable system CA certificates are available.')
  }
  systemCertificates = certificates
  return certificates
}

export function getCertificateAuthority(
  custom?: string,
  loadSystemCertificates: () => string[] = readSystemCertificates
): Buffer | string[] {
  if (custom) return Buffer.from(custom, 'base64')
  try {
    const certificates = loadSystemCertificates()
    if (certificates.length === 0) throw new Error('No system CA certificates are available.')
    return certificates
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    throw new Error(`Unable to load system CA certificates: ${detail}`)
  }
}
