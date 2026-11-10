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

  function renderSection(section: 'details' | 'publish') {
    const theme = themes.darkTheme
    return render(
      <ThemeProvider theme={theme}>
        <LegacyThemeProvider theme={theme}>
          <Sidebar section={section} />
        </LegacyThemeProvider>
      </ThemeProvider>
    )
  }

  it('shows only topic details when used in mobile Details tab', () => {
    const view = renderSection('details')
    expect(view.queryByText('Topic details')).not.to.equal(null)
    expect(view.queryByText('Publish editor')).to.equal(null)
    expect(view.queryByRole('button', { name: 'Details' })).to.equal(null)
  })

  it('shows only publish editor when used in mobile Publish tab', () => {
    const view = renderSection('publish')
    expect(view.queryByText('Publish editor')).not.to.equal(null)
    expect(view.queryByText('Topic details')).to.equal(null)
    expect(view.queryByRole('button', { name: 'Publish' })).to.equal(null)
  })

  it('keeps mobile Publish topic spacing above general sidebar padding', () => {
    const view = renderSection('publish')
    const sidebar = view.container.querySelector('#Sidebar-publish')!
    expect(parseFloat(window.getComputedStyle(sidebar).paddingTop)).to.be.greaterThan(16)
  })

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
