import Clear from '@mui/icons-material/Clear'
import React, { useMemo } from 'react'
import { bindActionCreators } from 'redux'
import { Button, Tooltip } from '@mui/material'
import { connect } from 'react-redux'
import { sidebarActions } from '../../../actions'

const DeleteSelectedTopicButton = (props: {
  actions: {
    sidebar: typeof sidebarActions
  }
}) =>
  useMemo(
    () => (
      <Tooltip title="Delete retained topic" placement="top">
        <Button
          size="small"
          color="secondary"
          variant="contained"
          style={{ margin: 0, padding: '0px 4px', minHeight: '20px', minWidth: 0, fontSize: '11px', lineHeight: 1 }}
          onClick={props.actions.sidebar.clearRetainedTopic}
        >
          retained <Clear style={{ fontSize: '12px', marginLeft: '2px' }} />
        </Button>
      </Tooltip>
    ),
    [props.actions.sidebar.clearRetainedTopic]
  )

const mapDispatchToProps = (dispatch: any) => ({
  actions: { sidebar: bindActionCreators(sidebarActions, dispatch) },
})

export default connect(undefined, mapDispatchToProps)(DeleteSelectedTopicButton)
