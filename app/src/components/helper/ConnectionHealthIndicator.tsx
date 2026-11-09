import * as React from 'react'
import DeviceHubOutlined from '@mui/icons-material/DeviceHubOutlined'
import { connect } from 'react-redux'
import { green, orange, red } from '@mui/material/colors'
import { Theme } from '@mui/material/styles'
import { withStyles } from '@mui/styles'
import { Tooltip } from '@mui/material'
import { ConnectionHealth } from '../../reducers/Connection'
import { AppState } from '../../reducers'

const styles = (theme: Theme) => ({
  offline: {
    color: theme.palette.mode === 'dark' ? theme.palette.error.light : red[700],
  },
  online: {
    color: green[400],
  },
  connecting: {
    color: theme.palette.mode === 'dark' ? theme.palette.warning.light : orange[600],
  },
  icon: {
    boxShadow: theme.shadows[2]
      .split('),')
      .map(s => `inset ${s}`)
      .join('),'),
    padding: '6px',
    borderRadius: '50%',
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    width: '35px',
    height: '35px',
  },
})

interface Props {
  classes: any
  connected: boolean
  health?: ConnectionHealth
  withBackground?: boolean
}

class ConnectionHealthIndicator extends React.PureComponent<Props, {}> {
  constructor(props: any) {
    super(props)
  }

  public render() {
    const { classes, health, connected } = this.props
    if (!health || !connected) {
      return null
    }

    return (
      <Tooltip title={`Connection health "${health}"`}>
        <div style={{ display: 'inherit' }}>
          <DeviceHubOutlined className={`${[classes[health]]} ${this.props.withBackground ? classes.icon : ''}`} />
        </div>
      </Tooltip>
    )
  }
}

const mapStateToProps = (state: AppState) => ({
  health: state.connection.health,
  connected: state.connection.connected || state.connection.connecting,
})

export default connect(mapStateToProps)(withStyles(styles)(ConnectionHealthIndicator) as any)
