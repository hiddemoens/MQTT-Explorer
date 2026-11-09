import { expect } from 'chai'
import { readFileSync } from 'fs'
import * as net from 'net'
import * as https from 'https'
import { createWebSocketStream, WebSocketServer } from 'ws'
import * as path from 'path'
import * as tls from 'tls'
import { MqttSource, MqttOptions } from '../MqttSource'
import { getCertificateAuthority } from '../CertificateAuthority'
import { DataSourceState } from '../DataSourceState'

const fixture = (name: string) => readFileSync(path.join(__dirname, 'fixtures', name), 'utf8')
const root = fixture('ca.pem')
const otherRoot = fixture('other-ca.pem')

// Minimal MQTT 3.1.1 broker: accept CONNECT and respond with a successful CONNACK.
function acceptMqtt(socket: net.Socket) {
  socket.on('error', () => {})
  socket.once('data', () => socket.write(Buffer.from([0x20, 0x02, 0x00, 0x00])))
}

async function listen(server: net.Server): Promise<number> {
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  return (server.address() as net.AddressInfo).port
}

function connectionResult(source: MqttSource, options: MqttOptions): Promise<DataSourceState> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Connection did not finish')), 3000)
    source.stateMachine.onUpdate.subscribe(state => {
      if (state.connected || state.error) {
        clearTimeout(timer)
        resolve(state)
      }
    })
    source.connect(options)
  })
}

const optionsFor = (port: number, overrides: Partial<MqttOptions> = {}): MqttOptions => ({
  url: `mqtt://localhost:${port}`,
  tls: true,
  certValidation: true,
  subscriptions: [],
  ...overrides,
})

describe('MQTT system trust connections', function () {
  this.timeout(5000)
  let server: net.Server
  let source: MqttSource
  const sockets = new Set<net.Socket>()

  beforeEach(() => {
    server = tls.createServer({ cert: fixture('server-cert.pem'), key: fixture('server-key.pem') }, acceptMqtt)
    server.on('connection', socket => {
      sockets.add(socket)
      socket.on('close', () => sockets.delete(socket))
    })
    server.on('tlsClientError', () => {})
  })

  afterEach(async () => {
    source?.disconnect()
    sockets.forEach(socket => socket.destroy())
    if (server.listening) await new Promise<void>(resolve => server.close(() => resolve()))
  })

  it('accepts a broker signed by the selected system CA', async () => {
    source = new MqttSource(custom => getCertificateAuthority(custom, () => [root]))
    const state = await connectionResult(source, optionsFor(await listen(server)))
    expect(state.connected).to.equal(true)
  })

  it('keeps a custom CA as an exclusive override', async () => {
    source = new MqttSource(custom => getCertificateAuthority(custom, () => [otherRoot]))
    const state = await connectionResult(
      source,
      optionsFor(await listen(server), {
        certificateAuthority: Buffer.from(root).toString('base64'),
      })
    )
    expect(state.connected).to.equal(true)
  })

  it('rejects a broker outside the selected trust store', async () => {
    source = new MqttSource(custom => getCertificateAuthority(custom, () => [otherRoot]))
    const state = await connectionResult(source, optionsFor(await listen(server)))
    expect(state.connected).to.equal(false)
    expect(state.error).to.match(/issuer|self.signed|certificate/i)
  })

  it('does not supplement a custom CA with system roots', async () => {
    source = new MqttSource(custom => getCertificateAuthority(custom, () => [root]))
    const state = await connectionResult(
      source,
      optionsFor(await listen(server), {
        certificateAuthority: Buffer.from(otherRoot).toString('base64'),
      })
    )
    expect(state.connected).to.equal(false)
    expect(state.error).to.match(/issuer|certificate/i)
  })

  it('still rejects hostname mismatches', async () => {
    const port = await listen(server)
    source = new MqttSource(custom => getCertificateAuthority(custom, () => [root]))
    const state = await connectionResult(source, optionsFor(port, { url: `mqtt://127.0.0.1:${port}` }))
    expect(state.connected).to.equal(false)
    expect(state.error).to.match(/altname|IP|hostname/i)
  })

  it('reports system trust failures and stops connecting without throwing', () => {
    source = new MqttSource(() => {
      throw new Error('System trust unavailable')
    })
    expect(() => source.connect(optionsFor(1))).not.to.throw()
    expect(source.stateMachine.toJSON()).to.include({ connected: false, connecting: false })
    expect(source.stateMachine.toJSON().error).to.match(/System trust unavailable/)
  })

  it('does not load certificates for plain MQTT', async () => {
    server = net.createServer(acceptMqtt)
    source = new MqttSource(() => {
      throw new Error('Unexpected CA access')
    })
    const state = await connectionResult(source, optionsFor(await listen(server), { tls: false }))
    expect(state.connected).to.equal(true)
  })

  it('uses system trust for secure WebSocket MQTT connections', async () => {
    server = https.createServer({ cert: fixture('server-cert.pem'), key: fixture('server-key.pem') })
    server.on('connection', socket => sockets.add(socket))
    const websocket = new WebSocketServer({ server: server as https.Server })
    websocket.on('connection', socket => acceptMqtt(createWebSocketStream(socket) as net.Socket))
    const port = await listen(server)
    source = new MqttSource(custom => getCertificateAuthority(custom, () => [root]))
    const state = await connectionResult(source, optionsFor(port, { url: `ws://localhost:${port}` }))
    expect(state.connected).to.equal(true)
  })

  it('loads trust for an explicit mqtts URL even when TLS toggle is false', async () => {
    const port = await listen(server)
    source = new MqttSource(custom => getCertificateAuthority(custom, () => [root]))
    const state = await connectionResult(source, optionsFor(port, { url: `mqtts://localhost:${port}`, tls: false }))
    expect(state.connected).to.equal(true)
  })
})
