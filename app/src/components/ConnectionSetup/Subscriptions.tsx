import React from 'react'
import Delete from '@mui/icons-material/Delete'
import { IconButton, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Typography } from '@mui/material'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { ConnectionOptions } from '../../model/ConnectionOptions'
import { connectionManagerActions } from '../../actions'

function Subscriptions({
  connection,
  managerActions,
}: {
  connection: ConnectionOptions
  managerActions: typeof connectionManagerActions
}) {
  if (connection.subscriptions.length === 0) {
    return <Typography color="text.secondary">No subscriptions added.</Typography>
  }

  return (
    <TableContainer
      className="advanced-connection-settings-topic-list"
      sx={{ maxHeight: 200, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: 'background.default' }}
    >
      <Table size="small" stickyHeader aria-label="Subscriptions for this connection">
        <TableHead>
          <TableRow>
            <TableCell>Topic filter</TableCell>
            <TableCell align="right">QoS</TableCell>
            <TableCell align="right" sx={{ width: 1, whiteSpace: 'nowrap' }}>
              Remove
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {connection.subscriptions.map(subscription => (
            <TableRow key={`${subscription.topic}_qos_${subscription.qos}`}>
              <TableCell component="th" scope="row" sx={{ overflowWrap: 'anywhere' }}>
                {subscription.topic}
              </TableCell>
              <TableCell align="right">{subscription.qos}</TableCell>
              <TableCell align="right">
                <IconButton
                  size="small"
                  aria-label={`Remove subscription ${subscription.topic}`}
                  onClick={() => managerActions.deleteSubscription(subscription, connection.id)}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

const mapDispatchToProps = (dispatch: any) => ({
  managerActions: bindActionCreators(connectionManagerActions, dispatch),
})

export default connect(undefined, mapDispatchToProps)(Subscriptions)
