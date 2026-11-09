import React, { useState } from 'react'
import Add from '@mui/icons-material/Add'
import ArrowBack from '@mui/icons-material/ArrowBack'
import Lock from '@mui/icons-material/Lock'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Box, Button, Divider, Stack, TextField, Typography } from '@mui/material'
import { QoS } from 'mqtt-explorer-backend/src/DataSource/MqttSource'
import { connectionManagerActions } from '../../actions'
import { QosSelect } from '../QosSelect'
import { ConnectionOptions } from '../../model/ConnectionOptions'
import Subscriptions from './Subscriptions'

interface Props {
  connection: ConnectionOptions
  managerActions: typeof connectionManagerActions
}

function AdvancedConnectionSettings({ connection, managerActions }: Props) {
  const [qos, setQos] = useState<QoS>(0)
  const [topic, setTopic] = useState('')

  const addSubscription = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!topic) return
    managerActions.addSubscription({ topic, qos }, connection.id)
    setTopic('')
  }

  return (
    <Stack spacing={2} divider={<Divider flexItem />}>
      <Box component="section" aria-labelledby="connection-subscriptions">
        <Typography id="connection-subscriptions" component="h3" variant="subtitle1" fontWeight={600}>
          Subscriptions
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Choose which topics to receive. Use # for all topics or sensors/+ for one level under sensors.
        </Typography>
        <Box
          component="form"
          onSubmit={addSubscription}
          sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, my: 1 }}
        >
          <TextField
            id="subscription-topic-filter"
            className="advanced-connection-settings-topic-input"
            label="Topic filter"
            placeholder="sensors/#"
            value={topic}
            onChange={event => setTopic(event.target.value)}
            sx={{ flex: '1 1 180px' }}
          />
          <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1}>
            <QosSelect label="QoS" selected={qos} onChange={setQos} />
            <Button
              type="submit"
              startIcon={<Add />}
              variant="contained"
              disabled={!topic}
              data-testid="add-subscription-button"
            >
              Add subscription
            </Button>
          </Stack>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          QoS controls delivery: 0 at most once, 1 at least once, 2 exactly once.
        </Typography>
        <Subscriptions connection={connection} />
      </Box>

      <Stack component="section" aria-labelledby="connection-client-identity" spacing={1}>
        <Typography id="connection-client-identity" component="h3" variant="subtitle1" fontWeight={600}>
          Client identity
        </Typography>
        <TextField
          id="connection-client-id"
          label="MQTT Client ID"
          size="small"
          value={connection.clientId ?? ''}
          onChange={event => managerActions.updateConnection(connection.id, { clientId: event.target.value })}
          helperText="Identifies this MQTT client to the broker. Use a unique ID for each active client."
          sx={{ maxWidth: 420 }}
        />
      </Stack>

      <Stack component="section" aria-labelledby="connection-tls-certificates" spacing={1}>
        <Typography id="connection-tls-certificates" component="h3" variant="subtitle1" fontWeight={600}>
          TLS certificates
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configure a custom CA or add a client certificate and key if your broker requires them.
        </Typography>
        <Box>
          <Button variant="outlined" startIcon={<Lock />} onClick={() => managerActions.toggleCertificateSettings()}>
            Manage certificates
          </Button>
        </Box>
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
        <Typography variant="body2" color="text.secondary">
          Use Save on the connection screen to keep your changes.
        </Typography>
        <Button startIcon={<ArrowBack />} onClick={managerActions.toggleAdvancedSettings} data-testid="back-button">
          Back to connection
        </Button>
      </Stack>
    </Stack>
  )
}

const mapDispatchToProps = (dispatch: any) => ({
  managerActions: bindActionCreators(connectionManagerActions, dispatch),
})

export default connect(undefined, mapDispatchToProps)(AdvancedConnectionSettings)
