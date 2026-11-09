import * as React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Theme } from '@mui/material/styles'
import { withStyles } from '@mui/styles'
import { Modal, Paper, Toolbar, Typography, Collapse } from '@mui/material'
import ConnectionSettings from './ConnectionSettings'
import ProfileList from './ProfileList'
import MobileConnectionSelector from './MobileConnectionSelector'
import { AppState } from '../../reducers'
import { connectionManagerActions } from '../../actions'
import { ConnectionOptions, toMqttConnection } from '../../model/ConnectionOptions'
import AdvancedConnectionSettings from './AdvancedConnectionSettings'
import Certificates from './Certificates'

const ConnectionSettingsAny = ConnectionSettings as any
const CertificatesAny = Certificates as any

interface Props {
  actions: any
  classes: any
  connection?: ConnectionOptions
  visible: boolean
  showAdvancedSettings: boolean
  showCertificateSettings: boolean
}

class ConnectionSetup extends React.PureComponent<Props, {}> {
  constructor(props: Props) {
    super(props)
  }

  private renderSettings() {
    const { connection, showAdvancedSettings, showCertificateSettings } = this.props
    if (!connection) {
      return null
    }

    return (
      <div>
        <Collapse in={!showAdvancedSettings && !showCertificateSettings}>
          <ConnectionSettingsAny connection={connection} />
        </Collapse>
        <Collapse in={showAdvancedSettings && !showCertificateSettings}>
          <AdvancedConnectionSettings connection={connection} />
        </Collapse>
        <Collapse in={showCertificateSettings}>
          <CertificatesAny connection={connection} />
        </Collapse>
      </div>
    )
  }

  public componentDidMount() {
    this.props.actions.loadConnectionSettings()
  }

  public render() {
    const { classes, visible, connection, showAdvancedSettings, showCertificateSettings } = this.props
    const title = showCertificateSettings
      ? 'TLS certificates'
      : showAdvancedSettings
        ? 'Advanced connection settings'
        : 'MQTT Connection'
    const mqttConnection = connection && toMqttConnection(connection)
    return (
      <div>
        <Modal open={visible} disableAutoFocus>
          <Paper className={`${classes.root} ${showAdvancedSettings ? classes.advancedRoot : ''}`}>
            <div className={classes.left}>
              <ProfileList />
            </div>
            <div className={classes.right} key={connection && connection.id}>
              <Toolbar>
                <div className={classes.toolbarContent}>
                  <div className={classes.desktopTitle}>
                    <Typography className={classes.title} variant="h6" color="inherit">
                      {title}
                    </Typography>
                    <Typography className={classes.connectionUri}>{mqttConnection && mqttConnection.url}</Typography>
                  </div>
                  <MobileConnectionSelector />
                </div>
              </Toolbar>
              {this.renderSettings()}
            </div>
          </Paper>
        </Modal>
      </div>
    )
  }
}

const connectionHeight = '440px'
const styles = (theme: Theme) => ({
  title: {
    color: theme.palette.text.primary,
    whiteSpace: 'nowrap' as const,
  },
  toolbarContent: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
  },
  desktopTitle: {
    display: 'flex',
    flexDirection: 'column' as const,
    minWidth: 0,
    flex: 1,
    // Hide on mobile - connection selector will take its place
    [theme.breakpoints.down('md')]: {
      display: 'none' as const,
    },
  },
  root: {
    margin: `calc((100vh - ${connectionHeight}) / 2) auto 0 auto`,
    minWidth: '800px',
    maxWidth: '850px',
    height: connectionHeight,
    outline: 'none' as const,
    display: 'flex' as const,
    // Mobile responsive adjustments
    [theme.breakpoints.down('md')]: {
      minWidth: '95vw',
      maxWidth: '95vw',
      height: '85vh',
      margin: '7.5vh auto 0 auto',
      flexDirection: 'column' as const,
    },
  },
  advancedRoot: {
    height: 'min(650px, 85vh)',
    margin: 'max(7.5vh, calc((100vh - 650px) / 2)) auto 0',
  },
  left: {
    borderRight: `1px solid ${theme.palette.divider}`,
    borderRadius: `${theme.shape.borderRadius}px 0 0 ${theme.shape.borderRadius}px`,
    paddingTop: theme.spacing(2),
    flex: 3,
    overflow: 'hidden' as const,
    backgroundColor: theme.palette.background.default,
    color: theme.palette.text.primary,
    overflowY: 'auto' as const,
    // Mobile: hide profile list to save space
    [theme.breakpoints.down('md')]: {
      display: 'none' as const,
    },
  },
  right: {
    borderRadius: `0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0`,
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2),
    flex: 10,
    minWidth: 0,
    overflowY: 'auto' as const,
    // Mobile: keep all corners rounded
    [theme.breakpoints.down('md')]: {
      borderRadius: `${theme.shape.borderRadius}px`,
    },
  },
  connectionUri: {
    maxWidth: '100%',
    textOverflow: 'ellipsis' as const,
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden' as const,
    color: theme.palette.text.secondary,
    fontSize: '0.9em',
  },
})

const mapStateToProps = (state: AppState) => ({
  visible: !state.connection.connected,
  showAdvancedSettings: state.connectionManager.showAdvancedSettings,
  showCertificateSettings: state.connectionManager.showCertificateSettings,
  connection: state.connectionManager.selected
    ? state.connectionManager.connections[state.connectionManager.selected]
    : undefined,
})

const mapDispatchToProps = (dispatch: any) => ({
  actions: bindActionCreators(connectionManagerActions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ConnectionSetup) as any)
