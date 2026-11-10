import 'jsdom-global/register'
import React from 'react'
import { expect } from 'chai'
import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { ThemeProvider as LegacyThemeProvider } from '@mui/styles'
import { Provider } from 'react-redux'
import { applyMiddleware, combineReducers, createStore } from 'redux'
import { thunk } from 'redux-thunk'
import { Base64Message } from '../../../../../backend/src/Model/Base64Message'
import { RingBuffer } from '../../../../../backend/src/Model/RingBuffer'
import { Tree, TreeNode, TreeNodeFactory } from '../../../../../backend/src/Model'
import { Map } from 'immutable'
import { settingsReducer, ActionTypes } from '../../../reducers/Settings'
import { sidebarReducer } from '../../../reducers/Sidebar'
import { themes } from '../../../theme'

// Isolate decoder lifecycle and chart services; render the real payload and diff UI.
const Module = require('module')
const load = Module._load
Module._load = function (name: string, parent: any, ...args: any[]) {
  if (parent?.filename.endsWith('/Sidebar/DetailsTab.tsx') && name === './AIAssistant') {
    return { __esModule: true, default: () => null }
  }
  if (parent?.filename.endsWith('/Sidebar/Sidebar.tsx') && name === './PublishTab') {
    return { __esModule: true, default: () => null }
  }
  if (parent?.filename.endsWith('/SettingsDrawer/Settings.tsx') && name === './TimeLocale') {
    return { __esModule: true, default: () => null }
  }
  if (parent?.filename.endsWith('/actions/Settings.ts') && name === '../utils/PersistentStorage') {
    return { __esModule: true, default: { store: async () => undefined } }
  }
  if (/\/ValueRenderer\/(ValueRenderer|MessageHistory)\.tsx$/.test(parent?.filename ?? '')) {
    if (name === '../../hooks/useDecoder') {
      return { useDecoder: () => (message: any) => ({ message: message.payload }) }
    }
    if (name === '../../helper/Copy' || name === '../../TopicPlot') {
      return { __esModule: true, default: () => null }
    }
  }
  if (parent?.filename.endsWith('/CodeDiff/Gutters.tsx') && name === './ChartPreview') {
    return { __esModule: true, default: () => null }
  }
  return load.call(this, name, parent, ...args)
}
let ValueRenderer: any
let MessageHistory: any
let ConnectedValueRenderer: any
let ActionButtons: any
let ConnectedSidebar: any
const sidebarModulePath = require.resolve('../Sidebar')
const cachedSidebar = require.cache[sidebarModulePath]
try {
  ValueRenderer = require('./ValueRenderer').ValueRenderer
  ConnectedValueRenderer = require('./ValueRenderer').default
  MessageHistory = require('./MessageHistory').MessageHistory
  ActionButtons = require('./ActionButtons').default
  delete require.cache[sidebarModulePath]
  ConnectedSidebar = require('../Sidebar').default
} finally {
  if (cachedSidebar) require.cache[sidebarModulePath] = cachedSidebar
  else delete require.cache[sidebarModulePath]
  Module._load = load
}

describe('Current message display', () => {
  afterEach(cleanup)

  const message = (text: string, messageNumber: number) => ({
    payload: Base64Message.fromString(text),
    received: new Date(2026, 10, 10, 12, 0, messageNumber),
    retain: false,
    qos: 0,
    length: text.length,
    messageNumber,
  })
  const previous = message('previous payload', 1)
  const latest = message('latest payload', 2)
  const selected = message('selected older payload', 0)

  function display(renderMode: string, compareWith?: any, current = latest, type = 'string') {
    const theme = createTheme()
    const history = new RingBuffer<ReturnType<typeof message>>(20000, 100)
    for (const value of [selected, previous, current]) history.add(value)
    return render(
      <ThemeProvider theme={theme}>
        <LegacyThemeProvider theme={theme}>
          <ValueRenderer
            treeNode={{ type, messageHistory: history }}
            message={current}
            renderMode={renderMode}
            compareWith={compareWith}
          />
        </LegacyThemeProvider>
      </ThemeProvider>
    )
  }

  it('shows only latest payload in raw view', () => {
    const view = display('raw')
    expect(view.queryByText('latest payload')).not.to.equal(null)
    expect(view.queryByText('previous payload')).to.equal(null)
  })

  it('keeps history selection out of raw view', () => {
    const view = display('raw', selected)
    expect(view.queryByText('latest payload')).not.to.equal(null)
    expect(view.queryByText('selected older payload')).to.equal(null)
  })

  it('compares against previous message in diff view', () => {
    const view = display('diff')
    expect(view.queryByText('latest payload')).not.to.equal(null)
    expect(view.queryByText('previous payload')).not.to.equal(null)
    expect(view.getByText('previous', { selector: 'b' })).not.to.equal(null)
  })

  it('shows stored differences immediately when switching Raw to Diff despite earlier History selection', () => {
    const store = createStore(combineReducers({ settings: settingsReducer }), applyMiddleware(thunk))
    store.dispatch({ type: ActionTypes.SETTINGS_SET_VALUE_RENDERER_DISPLAY_MODE, valueRendererDisplayMode: 'raw' })
    const node = new TreeNode()
    for (const [index, text] of [
      'OTA: connecting to update server (attempt 1/3)',
      'OTA: pausing telemetry transport and workers',
      'OTA: connecting to update server (attempt 1/3)',
    ].entries()) {
      node.setMessage(message(text, index))
    }
    const view = render(
      <Provider store={store}>
        <ThemeProvider theme={themes.darkTheme}>
          <LegacyThemeProvider theme={themes.darkTheme}>
            <ActionButtons />
            <ConnectedValueRenderer
              treeNode={node}
              message={node.message!}
              compareWith={node.messageHistory.toArray()[0]}
            />
          </LegacyThemeProvider>
        </ThemeProvider>
      </Provider>
    )
    expect(view.queryByText('OTA: pausing telemetry transport and workers')).to.equal(null)
    fireEvent.click(view.getByText('Diff'))
    expect(store.getState().settings.get('valueRendererDisplayMode')).to.equal('diff')
    const removed = view.getByText('OTA: pausing telemetry transport and workers')
    const added = view.getByText('OTA: connecting to update server (attempt 1/3)')
    expect(removed.closest('div')!.style.backgroundColor).to.equal('rgba(248, 81, 73, 0.18)')
    expect(added.closest('div')!.style.backgroundColor).to.equal('rgba(46, 160, 67, 0.18)')
  })

  it('wraps both added and removed payload lines in diff view', () => {
    const view = display('diff')
    for (const value of ['latest payload', 'previous payload']) {
      const line = view.getByText(value)
      expect(window.getComputedStyle(line).whiteSpace).to.equal('pre-wrap')
      expect(window.getComputedStyle(line).overflowWrap).to.equal('anywhere')
    }
  })

  it('places green latest line above red previous line in diff view', () => {
    const view = display('diff')
    const added = view.getByText('latest payload')
    const removed = view.getByText('previous payload')
    expect(added.compareDocumentPosition(removed) & Node.DOCUMENT_POSITION_FOLLOWING).not.to.equal(0)
  })

  it('always compares latest against second-latest even when older history message is selected', () => {
    const view = display('diff', selected)
    expect(view.queryByText('selected older payload')).to.equal(null)
    expect(view.queryByText('previous payload')).not.to.equal(null)
    expect(view.getByText('previous', { selector: 'b' })).not.to.equal(null)
  })

  it('compares latest with second-latest when history selection points at latest itself', () => {
    const view = display('diff', latest)
    expect(view.queryByText('latest payload')).not.to.equal(null)
    expect(view.queryByText('previous payload')).not.to.equal(null)
    expect(view.getByText('previous', { selector: 'b' })).not.to.equal(null)
  })

  it('ignores history selection from another topic', () => {
    const view = display('diff', message('another topic payload', 4))
    expect(view.queryByText('another topic payload')).to.equal(null)
    expect(view.queryByText('previous payload')).not.to.equal(null)
    expect(view.getByText('previous', { selector: 'b' })).not.to.equal(null)
  })

  it('advances comparison to latest and second-latest as new messages arrive', () => {
    const theme = createTheme()
    const history = new RingBuffer<ReturnType<typeof message>>(20000, 100)
    history.add(previous)
    history.add(latest)
    const node = { type: 'string', messageHistory: history }
    const content = (current: ReturnType<typeof message>) => (
      <ThemeProvider theme={theme}>
        <LegacyThemeProvider theme={theme}>
          <ValueRenderer treeNode={node} message={current} renderMode="diff" />
        </LegacyThemeProvider>
      </ThemeProvider>
    )
    const view = render(content(latest))
    const next = message('newest payload', 3)
    history.add(next)
    view.rerender(content(next))
    expect(view.queryByText('previous payload')).to.equal(null)
    expect(view.getByText('latest payload').closest('div')!.style.backgroundColor).to.equal('rgba(248, 81, 73, 0.18)')
    expect(view.getByText('newest payload').closest('div')!.style.backgroundColor).to.equal('rgba(46, 160, 67, 0.18)')
    expect(view.getAllByRole('img', { name: 'Removed line' })).to.have.length(1)
    expect(view.getAllByRole('img', { name: 'Added line' })).to.have.length(1)
  })

  it('keeps complete long multiline payload selectable', () => {
    const text = `${'long payload '.repeat(100)}\nlast line`
    const view = display('raw', undefined, message(text, 3))
    const payload = view.container.querySelector('[data-message-payload]')!
    expect(payload.textContent).to.contain('last line')
    expect(payload.textContent).to.contain('long payload '.repeat(100))
    fireEvent.keyDown(payload.parentElement!, { key: 'a', ctrlKey: true })
    expect(window.getSelection()?.toString()).to.contain('last line')
    expect(window.getSelection()?.toString()).to.contain('long payload '.repeat(100))
  })

  it('preserves JSON formatting and syntax highlighting in raw view', () => {
    const view = display('raw', undefined, message('{"value":42,"enabled":true}', 3), 'json')
    expect(view.container.querySelector('.token.property')?.textContent).to.equal('"value"')
    expect(view.container.querySelector('.token.number')?.textContent).to.equal('42')
    expect(view.container.querySelector('.token.boolean')?.textContent).to.equal('true')
  })

  it('keeps older messages in history and selects correct message after excluding latest', () => {
    const theme = createTheme()
    let picked: any
    const view = render(
      <ThemeProvider theme={theme}>
        <LegacyThemeProvider theme={theme}>
          <Provider store={createStore(() => ({ settings: { get: () => undefined } }))}>
            <MessageHistory
              node={{ message: latest, messageHistory: { toArray: () => [selected, previous, latest] } }}
              onSelect={(value: any) => {
                picked = value
              }}
            />
          </Provider>
        </LegacyThemeProvider>
      </ThemeProvider>
    )
    fireEvent.click(view.getByText('▶ History'))
    expect(view.queryByText('latest payload')).to.equal(null)
    expect(view.queryByText('previous payload')).not.to.equal(null)
    fireEvent.click(view.getByText('selected older payload'))
    expect(picked).to.equal(selected)
    expect(view.getAllByText('· QoS 0')).to.have.length(2)
  })

  it('refreshes History when incoming messages update existing topic', async () => {
    const theme = createTheme()
    const node = new TreeNode(undefined, latest)
    const view = render(
      <ThemeProvider theme={theme}>
        <LegacyThemeProvider theme={theme}>
          <Provider store={createStore(() => ({ settings: { get: () => undefined } }))}>
            <MessageHistory node={node} onSelect={() => undefined} />
          </Provider>
        </LegacyThemeProvider>
      </ThemeProvider>
    )
    fireEvent.click(view.getByText('▶ History'))
    expect(view.queryByText('latest payload')).to.equal(null)
    act(() => {
      node.updateWithNode(new TreeNode(undefined, message('newest payload', 3)))
    })
    expect(view.queryByText('latest payload')).not.to.equal(null)
    expect(view.queryByText('newest payload')).to.equal(null)
    await act(async () => {
      node.updateWithNode(new TreeNode(undefined, message('another incoming payload', 4)))
      await new Promise(resolve => setTimeout(resolve, 350))
    })
    expect(view.queryByText('latest payload')).not.to.equal(null)
    expect(view.queryByText('newest payload')).not.to.equal(null)
    expect(view.queryByText('another incoming payload')).to.equal(null)
  })

  for (const section of [undefined, 'details']) {
    for (const mode of ['raw', 'diff']) {
      it(`keeps ${section ? 'mobile' : 'desktop'} ${mode} and History current as messages arrive without user interaction`, async () => {
        const tree = new Tree()
        let count = 0
        const receive = (text: string, qos: 0 | 1 | 2 = 0, retain = false) => {
          const payload = Base64Message.fromString(text)
          const incoming = TreeNodeFactory.fromMessage(
            { topic: 'demo/value', payload, qos, retain, messageId: undefined },
            new Date(2026, 10, 10, 12, 0, count++)
          )
          tree.updateWithNode(incoming.firstNode())
        }
        receive('first live payload')
        receive('second live payload')
        const node = tree.findNode('demo/value')!
        const store = createStore(
          combineReducers({
            settings: settingsReducer,
            sidebar: sidebarReducer,
            tree: () => Map({ selectedTopic: node }),
            connection: () => ({ tree }),
          }),
          applyMiddleware(thunk)
        )
        store.dispatch({ type: ActionTypes.SETTINGS_SET_VALUE_RENDERER_DISPLAY_MODE, valueRendererDisplayMode: mode })
        const view = render(
          <Provider store={store}>
            <ThemeProvider theme={themes.darkTheme}>
              <LegacyThemeProvider theme={themes.darkTheme}>
                <ConnectedSidebar section={section} />
              </LegacyThemeProvider>
            </ThemeProvider>
          </Provider>
        )
        fireEvent.click(view.getByText('▶ History'))
        await act(async () => {
          receive('third live payload', 1, true)
          receive('fourth live payload', 2)
          await new Promise(resolve => setTimeout(resolve, 350))
        })
        expect(tree.findNode('demo/value')).to.equal(node)
        let payload = view.container.querySelector('[data-message-payload]')!
        expect(payload.textContent).to.contain('fourth live payload')
        expect(payload.textContent).not.to.contain('second live payload')
        if (mode === 'diff') {
          expect(payload.textContent).to.contain('third live payload')
          expect(view.getByRole('img', { name: 'Added line' })).not.to.equal(null)
          expect(view.getByRole('img', { name: 'Removed line' })).not.to.equal(null)
        } else {
          expect(payload.textContent).not.to.contain('third live payload')
        }
        expect(view.queryAllByText('third live payload')).to.have.length(mode === 'diff' ? 2 : 1)
        expect(view.queryAllByText('second live payload')).to.have.length(1)
        expect(view.getByText('QoS 2')).not.to.equal(null)

        const nextMode = mode === 'raw' ? 'diff' : 'raw'
        fireEvent.click(view.getByText(nextMode === 'diff' ? 'Diff' : 'Raw'))
        payload = view.container.querySelector('[data-message-payload]')!
        expect(payload.textContent).to.contain('fourth live payload')
        expect(payload.textContent.includes('third live payload')).to.equal(nextMode === 'diff')
        await act(async () => {
          receive('fifth live payload', 1, true)
          await new Promise(resolve => setTimeout(resolve, 350))
        })
        expect(payload.textContent).to.contain('fifth live payload')
        expect(payload.textContent.includes('fourth live payload')).to.equal(nextMode === 'diff')
        expect(view.getByText('QoS 1')).not.to.equal(null)
        expect(view.getByRole('button', { name: /retained/i })).not.to.equal(null)
        expect(view.queryAllByText('fourth live payload')).to.have.length(nextMode === 'diff' ? 2 : 1)
      })
    }
  }
})
