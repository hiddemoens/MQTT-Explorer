import * as React from 'react'
import CloudOff from '@mui/icons-material/CloudOff'
import Logout from '@mui/icons-material/Logout'
import Info from '@mui/icons-material/Info'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { shell } from 'electron'
import { darken, Theme } from '@mui/material/styles'
import { withStyles } from '@mui/styles'
import { Button, Drawer, Typography, Tooltip } from '@mui/material'
import TimeLocale from './TimeLocale'
import SettingsDropdown from './SettingsDropdown'
import { AppState } from '../../reducers'
import { settingsActions, connectionActions, globalActions } from '../../actions'
import { TopicOrder } from '../../reducers/Settings'
import { isBrowserMode } from '../../utils/browserMode'
import { useAuth } from '../../contexts/AuthContext'

import BrokerStatistics from './BrokerStatistics'
import BooleanSwitch from './BooleanSwitch'

export const autoExpandLimitSet = [
  {
    limit: 0,
    name: 'Collapsed',
  },
  {
    limit: 2,
    name: 'Few',
  },
  {
    limit: 5,
    name: 'Some',
  },
  {
    limit: 15,
    name: 'Most',
  },
  {
    limit: 30,
    name: 'Most',
  },
  {
    limit: 1e6,
    name: 'All',
  },
]

const autoExpandLimits = autoExpandLimitSet.map(option => option.limit)
const topicOrders = [TopicOrder.none, TopicOrder.abc, TopicOrder.messages, TopicOrder.topics]
const topicOrderLabels = {
  [TopicOrder.none]: 'Default',
  [TopicOrder.abc]: 'A–Z',
  [TopicOrder.messages]: '#messages',
  [TopicOrder.topics]: '#topics',
}

const styles = (theme: Theme) => ({
  title: {
    color: theme.palette.text.primary,
    padding: theme.spacing(2, 2, 1),
    fontWeight: 600,
  },
  author: {
    margin: '8px 8px 8px auto',
    color: theme.palette.text.secondary,
    cursor: 'pointer' as const,
  },
  footer: {
    marginTop: 'auto',
    padding: theme.spacing(1),
    display: 'flex',
    flexDirection: 'column' as const,
  },
  mobileButtons: {
    padding: theme.spacing(1),
    display: 'flex',
    flexDirection: 'column' as const,
    gap: theme.spacing(1),
    // Only show on mobile
    [theme.breakpoints.up('md')]: {
      display: 'none' as const,
    },
  },
  mobileButton: {
    justifyContent: 'flex-start',
  },
})

interface Props {
  actions: {
    settings: typeof settingsActions
    connection: typeof connectionActions
    global: typeof globalActions
  }
  autoExpandLimit: number
  classes: any
  highlightTopicUpdates: boolean
  selectTopicWithMouseOver: boolean
  store?: any
  topicOrder: TopicOrder
  visible: boolean
  theme: 'light' | 'dark'
  forceDesktopLayout: boolean
}

class Settings extends React.PureComponent<Props, {}> {
  constructor(props: any) {
    super(props)
    this.state = {}
  }

  private openGithubPage = () => {
    shell.openExternal('https://github.com/thomasnordquist')
  }

  private renderHighlightTopicUpdates() {
    const { highlightTopicUpdates, actions } = this.props

    return (
      <BooleanSwitch
        title="Show Activity"
        tooltip="Topics blink when a new message arrives"
        value={highlightTopicUpdates}
        action={actions.settings.toggleHighlightTopicUpdates}
      />
    )
  }

  private selectTopicsOnMouseOver() {
    const { actions, selectTopicWithMouseOver } = this.props
    const toggle = () => actions.settings.selectTopicWithMouseOver(!selectTopicWithMouseOver)

    return (
      <BooleanSwitch
        title="Quick Preview"
        tooltip="Select topics on mouse over"
        value={selectTopicWithMouseOver}
        action={toggle}
      />
    )
  }

  private toggleTheme() {
    const { actions, theme } = this.props

    return (
      <BooleanSwitch
        title="Dark Mode"
        tooltip="Enable dark theme"
        value={theme === 'dark'}
        action={actions.settings.toggleTheme}
        data-testid="dark-mode-toggle"
      />
    )
  }

  private renderAutoExpand() {
    const { autoExpandLimit, actions } = this.props

    return (
      <SettingsDropdown
        id="auto-expand"
        label="Auto Expand"
        options={autoExpandLimits}
        value={autoExpandLimit}
        getOptionLabel={limit => {
          if (limit > 0 && limit < 10000) {
            return `≤ ${limit} topics`
          }
          return autoExpandLimitSet.find(option => option.limit === limit)?.name ?? String(limit)
        }}
        onChange={(_, limit) => actions.settings.setAutoExpandLimit(limit)}
      />
    )
  }

  private renderNodeOrder() {
    const { topicOrder, actions } = this.props

    return (
      <SettingsDropdown
        id="node-order"
        label="Topic Order"
        options={topicOrders}
        value={topicOrder}
        getOptionLabel={order => topicOrderLabels[order]}
        onChange={(_, order) => actions.settings.setTopicOrder(order)}
      />
    )
  }

  public render() {
    const { classes, actions, visible } = this.props
    return (
      <Drawer
        anchor="left"
        open={visible}
        variant="persistent"
        slotProps={{
          paper: {
            id: 'settings-drawer',
            role: 'complementary',
            'aria-labelledby': 'settings-heading',
            sx: theme => ({
              position: 'absolute',
              backgroundColor:
                theme.palette.mode === 'dark' ? '#3C4047' : darken(theme.palette.background.default, 0.035),
              width: 'var(--settings-drawer-width)',
              userSelect: 'none',
              '@media (prefers-reduced-motion: reduce)': { transition: 'none !important' },
            }),
          },
        }}
      >
        <Typography id="settings-heading" component="h2" variant="subtitle1" className={classes.title}>
          Settings
        </Typography>
        <MobileActionButtons classes={classes} actions={actions} />
        <div>
          {this.renderAutoExpand()}
          {this.renderNodeOrder()}
          <TimeLocale />
          {this.renderHighlightTopicUpdates()}
          {this.selectTopicsOnMouseOver()}
          {this.toggleTheme()}
          <BooleanSwitch
            title="Force Desktop Layout"
            tooltip="Keep the desktop layout in narrow windows"
            value={this.props.forceDesktopLayout}
            action={() => actions.settings.setForceDesktopLayout(!this.props.forceDesktopLayout)}
            data-testid="force-desktop-layout-toggle"
          />
        </div>
        <div className={classes.footer}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Info />}
            onClick={() => actions.global.toggleAboutDialogVisibility()}
            fullWidth
          >
            About MQTT Explorer
          </Button>
          <Tooltip placement="top" title="App Author">
            <Typography className={classes.author} onClick={this.openGithubPage}>
              by Thomas Nordquist
            </Typography>
          </Tooltip>
          <BrokerStatistics />
        </div>
      </Drawer>
    )
  }
}

// Mobile action buttons component (disconnect/logout)
function MobileActionButtons({ classes, actions }: { classes: any; actions: any }) {
  const { authDisabled } = useAuth()

  const handleLogout = async () => {
    // Disconnect first
    actions.connection.disconnect()

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

  return (
    <div className={classes.mobileButtons}>
      <Button
        variant="outlined"
        startIcon={<CloudOff />}
        onClick={actions.connection.disconnect}
        className={classes.mobileButton}
        data-testid="mobile-disconnect-button"
      >
        Disconnect
      </Button>
      {isBrowserMode && !authDisabled && (
        <Button
          variant="outlined"
          startIcon={<Logout />}
          onClick={handleLogout}
          className={classes.mobileButton}
          data-testid="mobile-logout-button"
        >
          Logout
        </Button>
      )}
    </div>
  )
}

const mapStateToProps = (state: AppState) => ({
  autoExpandLimit: state.settings.get('autoExpandLimit'),
  topicOrder: state.settings.get('topicOrder'),
  visible: state.globalState.get('settingsVisible'),
  highlightTopicUpdates: state.settings.get('highlightTopicUpdates'),
  selectTopicWithMouseOver: state.settings.get('selectTopicWithMouseOver'),
  theme: state.settings.get('theme'),
  forceDesktopLayout: state.settings.get('forceDesktopLayout'),
})

const mapDispatchToProps = (dispatch: any) => ({
  actions: {
    settings: bindActionCreators(settingsActions, dispatch),
    connection: bindActionCreators(connectionActions, dispatch),
    global: bindActionCreators(globalActions, dispatch),
  },
})

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(Settings))
