import 'jsdom-global/register'
import React from 'react'
import { expect } from 'chai'
import { render, act, cleanup } from '@testing-library/react'
import { List } from 'immutable'

// Keep real layout/hooks; isolate panes that would otherwise start MQTT/event-bus services.
const Module = require('module')
const load = Module._load
const separator = require('path').sep
const pane = () => <div>Pane</div>
Module._load = function (name: string, parent: any, ...args: any[]) {
  if (parent?.filename.split(separator).join('/').endsWith('/Layout/ContentView.tsx')) {
    if (['../Tree', '../ChartPanel', '../Sidebar/PublishTab'].includes(name)) return { __esModule: true, default: pane }
    if (name === '../Sidebar') return { Sidebar: pane }
    if (name === 'react-split-pane') return { __esModule: true, default: ({ children }: any) => <div>{children}</div> }
    if (name === './MobileTabs') return { __esModule: true, default: () => <div>Mobile tabs</div> }
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

describe('ContentView responsive hooks', () => {
  afterEach(cleanup)
  it('crosses desktop/mobile breakpoint repeatedly without changing hook order', () => {
    resize(1200)
    const view = render(<ContentView chartPanelItems={List()} paneDefaults="" heightProperty="" />)
    for (const width of [600, 1200, 768, 769, 500, 1400]) {
      resize(width)
      expect(Boolean(view.queryByText('Mobile tabs'))).to.equal(width <= 768)
    }
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
})
