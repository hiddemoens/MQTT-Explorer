import { expect } from 'chai'
import { getCertificateAuthority } from '../CertificateAuthority'

describe('MQTT certificate authority selection', () => {
  it('uses only system authorities by default', () => {
    const authorities = ['system-root']
    expect(getCertificateAuthority(undefined, () => authorities)).to.deep.equal(['system-root'])
  })

  it('uses explicit custom CA without accessing system trust', () => {
    const custom = Buffer.from('custom-root').toString('base64')
    const result = getCertificateAuthority(custom, () => {
      throw new Error('must not load system trust')
    })
    expect(Buffer.isBuffer(result)).to.equal(true)
    expect(result.toString()).to.equal('custom-root')
  })

  it('rejects an empty system store instead of falling back to bundled roots', () => {
    expect(() => getCertificateAuthority(undefined, () => [])).to.throw(/system.*certificates/i)
  })

  it('reports native trust loading failures', () => {
    expect(() =>
      getCertificateAuthority(undefined, () => {
        throw new Error('access denied')
      })
    ).to.throw(/system.*access denied/i)
  })
})
