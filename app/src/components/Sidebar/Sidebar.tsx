import React, { useState, useEffect, useCallback } from 'react'
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
}

function useUpdateNodeWhenNodeReceivesUpdates(node?: q.TreeNode<any>) {
  const [, setLastUpdate] = useState(0)
  const updateNode = useCallback(
    throttle(() => {
      setLastUpdate(node ? node.lastUpdate : 0)
    }, 300),
    [node]
  )

  useEffect(() => {
    const updateCallback = updateNode
    node && node.onMerge.subscribe(updateCallback)
    node && node.onMessage.subscribe(updateCallback)

    return function cleanup() {
      node && node.onMerge.unsubscribe(updateCallback)
      node && node.onMessage.unsubscribe(updateCallback)
    }
  }, [node])
}

function Sidebar(props: Props) {
  const { classes, tree, nodePath } = props
  const node = usePollingToFetchTreeNode(tree, nodePath || '')
  useUpdateNodeWhenNodeReceivesUpdates(node)
  return (
    <div id="Sidebar" className={classes.root}>
      <Panel>
        <span>Details</span>
        <DetailsTab node={node} connectionId={props.connectionId} />
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
})

export default withStyles(styles)(connect(mapStateToProps)(Sidebar))
