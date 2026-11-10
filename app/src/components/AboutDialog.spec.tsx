import 'jsdom-global/register'
import React from 'react'
import { expect } from 'chai'
import 'mocha'
import * as fs from 'fs'
import * as path from 'path'
import { cleanup, fireEvent, render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { applyMiddleware, combineReducers, createStore } from 'redux'
import { thunk } from 'redux-thunk'
import { ThemeProvider } from '@mui/material/styles'
import { ThemeProvider as LegacyThemeProvider } from '@mui/styles'
import { themes } from '../theme'
import { globalState, ActionTypes as GlobalActionTypes } from '../reducers/Global'
import { settingsReducer } from '../reducers/Settings'

// Locale module discovery uses webpack's require.context; it is unrelated to About navigation.
const Module = require('module')
const load = Module._load
Module._load = function (name: string, parent: any, ...args: any[]) {
  if (parent?.filename.endsWith('/SettingsDrawer/Settings.tsx') && name === './TimeLocale') {
    return { __esModule: true, default: () => null }
  }
  return load.call(this, name, parent, ...args)
}
let Settings: any
try {
  Settings = require('./SettingsDrawer/Settings').default
} finally {
  Module._load = load
}

/**
 * AboutDialog License Compliance Tests
 *
 * These tests verify that the About dialog properly displays required
 * attribution information as mandated by the CC-BY-ND-4.0 license.
 *
 * CC-BY-ND-4.0 (Creative Commons Attribution-NoDerivatives 4.0 International):
 * - BY (Attribution): Must credit the original author (Thomas Nordquist)
 * - ND (NoDerivatives): Cannot create derivative works without permission
 * - Requires: Author name, license notice, and LICENSE NOTICE comment
 */
describe('AboutDialog License Compliance', () => {
  const aboutDialogPath = path.join(__dirname, 'AboutDialog.tsx')
  let aboutDialogContent: string

  before(() => {
    aboutDialogContent = fs.readFileSync(aboutDialogPath, 'utf-8')
  })

  it('should contain the license notice in the component file', () => {
    expect(aboutDialogContent).to.include('LICENSE NOTICE')
    expect(aboutDialogContent).to.include('CC-BY-ND-4.0')
  })

  it('should display author attribution (Thomas Nordquist)', () => {
    // Verify the author is displayed in the component
    expect(aboutDialogContent).to.match(/Author.*Thomas Nordquist/)
  })

  it('should display CC-BY-ND-4.0 license', () => {
    // Verify the license is displayed in the component
    expect(aboutDialogContent).to.match(/License.*CC-BY-ND-4.0/)
  })

  it('should have data-testid attributes for license verification', () => {
    // These attributes allow automated testing of the rendered component
    expect(aboutDialogContent).to.include('data-testid="about-author"')
    expect(aboutDialogContent).to.include('data-testid="about-license"')
  })

  describe('License Violation Detection', () => {
    it('removing author attribution violates CC-BY-ND-4.0 license', () => {
      // CC-BY-ND-4.0 Attribution (BY) requirement:
      // Must credit the original author "Thomas Nordquist"
      const hasAuthor = aboutDialogContent.includes('Thomas Nordquist')

      if (!hasAuthor) {
        throw new Error(
          'LICENSE VIOLATION: Author attribution "Thomas Nordquist" is missing. ' +
            'This violates the CC-BY-ND-4.0 Attribution (BY) requirement. ' +
            'The author must be properly credited in the About dialog.'
        )
      }

      expect(hasAuthor).to.be.true
    })

    it('removing license notice violates CC-BY-ND-4.0 license', () => {
      // CC-BY-ND-4.0 requires the license identifier to be displayed
      const hasLicense = aboutDialogContent.includes('CC-BY-ND-4.0')

      if (!hasLicense) {
        throw new Error(
          'LICENSE VIOLATION: License notice "CC-BY-ND-4.0" is missing. ' +
            'This violates CC-BY-ND-4.0 license notice requirements. ' +
            'The license identifier must be displayed in the About dialog.'
        )
      }

      expect(hasLicense).to.be.true
    })

    it('removing LICENSE NOTICE comment violates CC-BY-ND-4.0 license', () => {
      // CC-BY-ND-4.0 requires attribution notice in source code
      const hasLicenseNotice = aboutDialogContent.includes('LICENSE NOTICE')

      if (!hasLicenseNotice) {
        throw new Error(
          'LICENSE VIOLATION: LICENSE NOTICE comment is missing from source code. ' +
            'This violates CC-BY-ND-4.0 source code attribution requirements. ' +
            'The LICENSE NOTICE comment must be retained in the component source.'
        )
      }

      expect(hasLicenseNotice).to.be.true
    })
  })
})

/**
 * AboutDialog Functionality Tests
 *
 * These tests verify that the About dialog is accessible and functional.
 */
describe('AboutDialog Accessibility', () => {
  afterEach(cleanup)

  it('opens About from Settings', () => {
    const store = createStore(
      combineReducers({ settings: settingsReducer, globalState, connection: () => ({}) }),
      applyMiddleware(thunk)
    )
    store.dispatch({ type: GlobalActionTypes.toggleSettingsVisibility })
    const view = render(
      <Provider store={store}>
        <ThemeProvider theme={themes.darkTheme}>
          <LegacyThemeProvider theme={themes.darkTheme}>
            <Settings />
          </LegacyThemeProvider>
        </ThemeProvider>
      </Provider>
    )
    expect(store.getState().globalState.get('aboutDialogVisible')).to.equal(false)
    fireEvent.click(view.getByRole('button', { name: 'About MQTT Explorer' }))
    expect(store.getState().globalState.get('aboutDialogVisible')).to.equal(true)
  })
})
