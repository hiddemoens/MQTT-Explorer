import * as React from 'react'
import CloudOff from '@mui/icons-material/CloudOff'
import Logout from '@mui/icons-material/Logout'
import { AppBar, Button, IconButton, SvgIcon, Toolbar, Typography } from '@mui/material'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Theme } from '@mui/material/styles'
import { withStyles } from '@mui/styles'
import { connectionActions, globalActions, settingsActions } from '../../actions'
import { AppState } from '../../reducers'
import SearchBar from './SearchBar'
import PauseButton from './PauseButton'
import ConnectionHealthIndicator from '../helper/ConnectionHealthIndicator'
import { isBrowserMode } from '../../utils/browserMode'
import { useAuth } from '../../contexts/AuthContext'

const ConnectionHealthIndicatorAny = ConnectionHealthIndicator as any

const styles = (theme: Theme) => ({
  title: {
    display: 'none' as const,
    [theme.breakpoints.up(750)]: {
      display: 'block' as const,
    },
    [theme.breakpoints.up('md')]: {
      display: 'block' as const,
    },
    whiteSpace: 'nowrap' as const,
  },
  disconnectIcon: {
    [theme.breakpoints.down('xs')]: {
      display: 'none' as const,
    },
    marginRight: '8px',
    paddingLeft: '8px',
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
  menuLine: {
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.enteringScreen,
      easing: theme.transitions.easing.easeOut,
    }),
    '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
  },
  disconnect: {
    margin: 0,
    // Hide on mobile (<=768px)
    [theme.breakpoints.down('md')]: {
      display: 'none' as const,
    },
  },
  logout: {
    margin: 0,
    // Hide on mobile (<=768px)
    [theme.breakpoints.down('md')]: {
      display: 'none' as const,
    },
  },
  connectionActions: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginLeft: 'auto',
    flexShrink: 0,
    color: 'inherit',
  },
})

interface Props {
  classes: any
  actions: {
    settings: typeof settingsActions
    connection: typeof connectionActions
    global: typeof globalActions
  }
  settingsVisible: boolean
}

class TitleBar extends React.PureComponent<Props, {}> {
  constructor(props: any) {
    super(props)
    this.state = {}
  }

  private handleLogout = async () => {
    // Disconnect first
    this.props.actions.connection.disconnect()

    // Clear credentials from sessionStorage
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('mqtt-explorer-username')
      sessionStorage.removeItem('mqtt-explorer-password')
    }

    // Reload page to reset all state and show login dialog
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  public render() {
    const { actions, classes, settingsVisible } = this.props

    return (
      <AppBar position="static">
        <Toolbar>
          <IconButton
            className={classes.menuButton}
            color="inherit"
            aria-label={settingsVisible ? 'Close settings' : 'Open settings'}
            aria-expanded={settingsVisible}
            aria-controls="settings-drawer"
            onClick={actions.global.toggleSettingsVisibility}
          >
            <SvgIcon>
              <g fill="none" stroke="currentColor" strokeWidth="2">
                <path
                  d="M4 6h16"
                  className={classes.menuLine}
                  style={{
                    transformOrigin: '4px 6px',
                    transform: settingsVisible ? 'translateY(6px) rotate(-45deg) scaleX(.57)' : undefined,
                  }}
                />
                <path d="M4 12h16" />
                <path
                  d="M4 18h16"
                  className={classes.menuLine}
                  style={{
                    transformOrigin: '4px 18px',
                    transform: settingsVisible ? 'translateY(-6px) rotate(45deg) scaleX(.57)' : undefined,
                  }}
                />
              </g>
            </SvgIcon>
          </IconButton>
          <Typography className={classes.title} variant="h6" color="inherit">
            MQTT Explorer
          </Typography>
          <SearchBar />
          <div className={classes.connectionActions} role="group" aria-label="Connection controls">
            <PauseButton />
            <Button
              className={classes.disconnect}
              color="inherit"
              onClick={actions.connection.disconnect}
              data-testid="disconnect-button"
            >
              Disconnect <CloudOff className={classes.disconnectIcon} />
            </Button>
            <LogoutButton classes={classes} onLogout={this.handleLogout} />
            <ConnectionHealthIndicatorAny withBackground />
          </div>
        </Toolbar>
      </AppBar>
    )
  }
}

// Separate component to use hooks
function LogoutButton({ classes, onLogout }: { classes: any; onLogout: () => void }) {
  const { authDisabled } = useAuth()

  if (!isBrowserMode || authDisabled) {
    return null
  }

  return (
    <Button className={classes.logout} color="inherit" onClick={onLogout}>
      Logout <Logout className={classes.disconnectIcon} />
    </Button>
  )
}

const mapStateToProps = (state: AppState) => ({
  settingsVisible: state.globalState.get('settingsVisible'),
})

const mapDispatchToProps = (dispatch: any) => ({
  actions: {
    settings: bindActionCreators(settingsActions, dispatch),
    global: bindActionCreators(globalActions, dispatch),
    connection: bindActionCreators(connectionActions, dispatch),
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(TitleBar))
