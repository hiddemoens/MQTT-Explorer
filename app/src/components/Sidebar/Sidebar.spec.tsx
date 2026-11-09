import 'jsdom-global/register'
import React from 'react'
import { expect } from 'chai'
import { cleanup, fireEvent, render } from '@testing-library/react'
import { ThemeProvider } from '@mui/material/styles'
import { ThemeProvider as LegacyThemeProvider } from '@mui/styles'
import { themes } from '../../theme'

// Keep the real sidebar and accordion; isolate the broker-dependent contents.
const Module = require('module')
const load = Module._load
Module._load = function (name: string, parent: any, ...args: any[]) {
  if (parent?.filename.replace(/\\/g, '/').endsWith('/Sidebar/Sidebar.tsx')) {
    if (name === 'react-redux') return { connect: () => (component: any) => component }
    if (name === '../../actions') return {}
    if (name === './DetailsTab') return { __esModule: true, default: () => <p>Topic details</p> }
    if (name === './PublishTab') return { __esModule: true, default: () => <p>Publish editor</p> }
  }
  return load.call(this, name, parent, ...args)
}
let Sidebar: any
try {
  Sidebar = require('./Sidebar').default
} finally {
  Module._load = load
}

describe('Stacked sidebar sections', () => {
  afterEach(cleanup)

  it('shows Details above Publish and collapses each independently', () => {
    const theme = themes.darkTheme
    const view = render(
      <ThemeProvider theme={theme}>
        <LegacyThemeProvider theme={theme}>
          <Sidebar />
        </LegacyThemeProvider>
      </ThemeProvider>
    )
    const details = view.getByRole('button', { name: 'Details' })
    const publish = view.getByRole('button', { name: 'Publish' })
    expect(details.compareDocumentPosition(publish) & Node.DOCUMENT_POSITION_FOLLOWING).not.to.equal(0)
    expect(view.queryByRole('tab')).to.equal(null)
    expect(details.getAttribute('aria-expanded')).to.equal('true')
    expect(publish.getAttribute('aria-expanded')).to.equal('true')
    fireEvent.click(details)
    expect(details.getAttribute('aria-expanded')).to.equal('false')
    expect(publish.getAttribute('aria-expanded')).to.equal('true')
    fireEvent.click(publish)
    fireEvent.click(details)
    expect(details.getAttribute('aria-expanded')).to.equal('true')
    expect(publish.getAttribute('aria-expanded')).to.equal('false')
  })
})
