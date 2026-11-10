import React, { useState, useEffect, useMemo } from 'react'
import { connect } from 'react-redux'
import { Theme } from '@mui/material/styles'
import { withStyles } from '@mui/styles'
import * as q from '../../../../backend/src/Model'
import { TopicViewModel } from '../../model/TopicViewModel'
import { usePollingToFetchTreeNode } from '../helper/usePollingToFetchTreeNode'
import { AppState } from '../../reducers'
import DetailsTab from './DetailsTab'
import PublishTab from './PublishTab'
import Panel from './Panel'

const throttle = require('lodash.throttle')

interface Props {
  nodePath?: string
  tree?: q.Tree<TopicViewModel>
  classes: any
  connectionId?: string
  section?: 'details' | 'publish'
}

function useUpdateNodeWhenNodeReceivesUpdates(node?: q.TreeNode<any>) {
  const [lastUpdate, setLastUpdate] = useState(0)
  const updateNode = useMemo(
    () =>
      throttle(() => {
        setLastUpdate(update => update + 1)
      }, 300),
    []
  )

  useEffect(() => {
    const updateCallback = updateNode
    node && node.onMerge.subscribe(updateCallback)
    node && node.onMessage.subscribe(updateCallback)

    return function cleanup() {
      node && node.onMerge.unsubscribe(updateCallback)
      node && node.onMessage.unsubscribe(updateCallback)
      updateCallback.cancel()
    }
  }, [node, updateNode])

  return lastUpdate
}

function Sidebar(props: Props) {
  const { classes, tree, nodePath } = props
  const node = usePollingToFetchTreeNode(tree, nodePath || '')
  const lastUpdate = useUpdateNodeWhenNodeReceivesUpdates(node)

  if (props.section) {
    return (
      <div
        id={`Sidebar-${props.section}`}
        className={`${classes.root} ${props.section === 'publish' ? classes.publishSection : ''}`}
      >
        {props.section === 'details' ? (
          <DetailsTab node={node} lastUpdate={lastUpdate} connectionId={props.connectionId} />
        ) : (
          <PublishTab connectionId={props.connectionId} />
        )}
      </div>
    )
  }

  return (
    <div id="Sidebar" className={classes.root}>
      <Panel>
        <span>Details</span>
        <DetailsTab node={node} lastUpdate={lastUpdate} connectionId={props.connectionId} />
      </Panel>
      <Panel>
        <span>Publish</span>
        <PublishTab connectionId={props.connectionId} />
      </Panel>
    </div>
  )
}

const mapStateToProps = (state: AppState) => {
  const node = state.tree.get('selectedTopic')
  return {
    tree: state.connection.tree,
    nodePath: node && node.path(),
  }
}

const styles = (theme: Theme) => ({
  root: {
    width: '100%',
    boxSizing: 'border-box' as const,
    padding: theme.spacing(1),
  },
  publishSection: {
    paddingTop: theme.spacing(3),
  },
})

export default withStyles(styles)(connect(mapStateToProps)(Sidebar))
