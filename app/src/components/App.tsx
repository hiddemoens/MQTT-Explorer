import CssBaseline from '@mui/material/CssBaseline'
import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Theme } from '@mui/material/styles'
import { withStyles } from '@mui/styles'
import ConfirmationDialog from './ConfirmationDialog'
import ConnectionSetup from './ConnectionSetup/ConnectionSetup'
import ErrorBoundary from './ErrorBoundary'
import Notification from './Layout/Notification'
import TitleBar from './Layout/TitleBar'
import UpdateNotifier from './UpdateNotifier'
import { AboutDialog } from './AboutDialog'
import { AppState } from '../reducers'
import { ConfirmationRequest } from '../reducers/Global'
import { globalActions, settingsActions } from '../actions'
;(window as any).global = window

const Settings = React.lazy(() => import('./SettingsDrawer/Settings'))
const ContentView = React.lazy(() => import('./Layout/ContentView'))

interface Props {
  connectionId: string
  classes: any
  forceDesktopLayout: boolean
  error?: string
  notification?: string
  actions: typeof globalActions
  settingsActions: typeof settingsActions
  launching: boolean
  confirmationRequests: Array<ConfirmationRequest>
  aboutDialogVisible: boolean
}

class App extends React.PureComponent<Props, {}> {
  constructor(props: any) {
    super(props)
    this.state = {}
  }

  private renderNotification() {
    const message = this.props.error || this.props.notification
    const isError = message === this.props.error
    if (message) {
      // Guard in case someone ever calls showError with an error instead of a string
      const str = typeof message === 'string' ? message : JSON.stringify(message)
      return (
        <Notification
          message={str}
          type={isError ? 'error' : 'notification'}
          onClose={() => {
            isError ? this.props.actions.showError(undefined) : this.props.actions.showNotification(undefined)
          }}
        />
      )
    }

    return null
  }

  public componentDidMount() {
    this.props.settingsActions.loadSettings()
  }

  public render() {
    const { content, layout, centerContent, paneDefaults, heightProperty } = this.props.classes

    if (this.props.launching) {
      return null
    }

    const anyProps: any = {}

    return (
      <div className={`${centerContent}${this.props.forceDesktopLayout ? ' force-desktop-layout' : ''}`}>
        <CssBaseline />
        <ErrorBoundary>
          <ConfirmationDialog confirmationRequests={this.props.confirmationRequests} />
          <AboutDialog
            open={this.props.aboutDialogVisible}
            onClose={() => this.props.actions.toggleAboutDialogVisibility()}
          />
          {this.renderNotification()}
          <div className={layout}>
            <TitleBar />
            <div className={content}>
              <React.Suspense fallback={<div />}>
                <Settings {...anyProps} />
                <ContentView
                  heightProperty={heightProperty}
                  connectionId={this.props.connectionId}
                  paneDefaults={paneDefaults}
                />
              </React.Suspense>
            </div>
          </div>
          <UpdateNotifier />
          <ConnectionSetup />
        </ErrorBoundary>
      </div>
    )
  }
}

const styles = (theme: Theme) => ({
  heightProperty: {
    height: '100%',
  },
  paneDefaults: {
    backgroundColor: theme.palette.background.default,
    color: theme.palette.text.primary,
    display: 'block' as const,
    height: '100%',
  },
  centerContent: {
    width: '100vw',
    overflow: 'hidden' as const,
  },
  layout: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100vh',
  },
  content: {
    '--settings-drawer-width': 'min(300px, 100%)',
    position: 'relative' as const,
    flex: 1,
    minHeight: 0,
    overflow: 'hidden' as const,
    backgroundColor: theme.palette.background.default,
  },
})

const mapDispatchToProps = (dispatch: any) => ({
  actions: bindActionCreators(globalActions, dispatch),
  settingsActions: bindActionCreators(settingsActions, dispatch),
})

const mapStateToProps = (state: AppState) => ({
  forceDesktopLayout: state.settings.get('forceDesktopLayout'),
  connectionId: state.connection.connectionId,
  error: state.globalState.get('error'),
  notification: state.globalState.get('notification'),
  highlightTopicUpdates: state.settings.get('highlightTopicUpdates'),
  launching: state.globalState.get('launching'),
  confirmationRequests: state.globalState.get('confirmationRequests'),
  aboutDialogVisible: state.globalState.get('aboutDialogVisible'),
})

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(App))
