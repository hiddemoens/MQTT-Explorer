import 'jsdom-global/register'
import React from 'react'
import { expect } from 'chai'
import { render as renderView, act, cleanup, fireEvent } from '@testing-library/react'
import { List } from 'immutable'
import { ThemeProvider } from '@mui/material/styles'
import { ThemeProvider as LegacyThemeProvider } from '@mui/styles'
import { themes } from '../../theme'

// Keep real layout/hooks; isolate panes that would otherwise start MQTT/event-bus services.
const Module = require('module')
const load = Module._load
const separator = require('path').sep
const pane = () => <div>Pane</div>
Module._load = function (name: string, parent: any, ...args: any[]) {
  if (parent?.filename.split(separator).join('/').endsWith('/Layout/ContentView.tsx')) {
    if (['../Tree', '../ChartPanel'].includes(name)) return { __esModule: true, default: pane }
    if (name === '../Sidebar') return { Sidebar: pane }
    if (name === 'react-split-pane') return { __esModule: true, default: ({ children }: any) => <div>{children}</div> }
    if (name === 'react-resize-detector') return { useResizeDetector: () => ({ ref: React.useRef(null) }) }
  }
  return load.call(this, name, parent, ...args)
}
let ContentView: any
try {
  ContentView = require('./ContentView').default.WrappedComponent
} finally {
  Module._load = load
}

function resize(width: number) {
  act(() => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: width })
    window.dispatchEvent(new Event('resize'))
  })
}

function render(ui: React.ReactElement) {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider theme={themes.darkTheme}>
      <LegacyThemeProvider theme={themes.darkTheme}>{children}</LegacyThemeProvider>
    </ThemeProvider>
  )
  return renderView(ui, { wrapper })
}

describe('ContentView responsive hooks', () => {
  afterEach(cleanup)
  it('crosses desktop/mobile breakpoint repeatedly without changing hook order', () => {
    resize(1200)
    const view = render(<ContentView chartPanelItems={List()} paneDefaults="" heightProperty="" />)
    for (const width of [600, 1200, 768, 769, 500, 1400]) {
      resize(width)
      expect(Boolean(view.queryByRole('navigation', { name: 'Mobile navigation tabs' }))).to.equal(width <= 768)
    }
  })
  it('keeps the desktop panes when forced and restores responsive layout when turned off', () => {
    const layout = (forceDesktopLayout: boolean) => (
      <ContentView chartPanelItems={List()} paneDefaults="" heightProperty="" forceDesktopLayout={forceDesktopLayout} />
    )
    resize(600)
    const view = render(layout(false))
    expect(view.queryByRole('navigation', { name: 'Mobile navigation tabs' })).not.to.equal(null)
    view.rerender(layout(true))
    expect(view.queryByRole('navigation', { name: 'Mobile navigation tabs' })).to.equal(null)
    expect((window as any).switchToDetailsTab).to.equal(undefined)
    resize(1200)
    resize(500)
    expect(view.queryByRole('navigation', { name: 'Mobile navigation tabs' })).to.equal(null)
    view.rerender(layout(false))
    expect(view.queryByRole('navigation', { name: 'Mobile navigation tabs' })).not.to.equal(null)
  })
  it('registers working mobile tab callbacks and removes them on desktop/unmount', () => {
    resize(600)
    const view = render(<ContentView chartPanelItems={List()} paneDefaults="" heightProperty="" />)
    act(() => (window as any).switchToDetailsTab())
    act(() => (window as any).switchToTopicsTab())
    resize(1200)
    expect((window as any).switchToTopicsTab).to.equal(undefined)
    resize(600)
    expect((window as any).switchToTopicsTab).to.be.a('function')
    view.unmount()
    expect((window as any).switchToDetailsTab).to.equal(undefined)
  })

  it('switches between separate mobile Details and Publish tabs, keeping Charts reachable', () => {
    resize(600)
    const view = render(<ContentView chartPanelItems={List()} paneDefaults="" heightProperty="" />)
    expect(view.getAllByRole('tab')).to.have.length(4)
    const details = view.getByRole('tab', { name: 'View topic details' })
    const publish = view.getByRole('tab', { name: 'Publish a message' })
    const charts = view.getByRole('tab', { name: 'View charts' })
    const panelFor = (tab: HTMLElement) => document.getElementById(tab.getAttribute('aria-controls')!)!

    fireEvent.click(details)
    expect(details.getAttribute('aria-selected')).to.equal('true')
    expect(panelFor(details).style.display).to.equal('block')
    expect(panelFor(publish).style.display).to.equal('none')
    fireEvent.click(publish)
    expect(publish.getAttribute('aria-selected')).to.equal('true')
    expect(panelFor(publish).style.display).to.equal('block')
    expect(panelFor(details).style.display).to.equal('none')
    act(() => (window as any).switchToChartsTab())
    expect(charts.getAttribute('aria-selected')).to.equal('true')
    expect(panelFor(charts).style.display).to.equal('block')
  })
})
