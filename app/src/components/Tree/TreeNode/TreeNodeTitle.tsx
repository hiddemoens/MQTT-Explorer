import React, { memo } from 'react'
import { Theme } from '@mui/material/styles'
import { withStyles } from '@mui/styles'
import * as q from '../../../../../backend/src/Model'
import { TopicViewModel } from '../../../model/TopicViewModel'
import { useDecoder } from '../../hooks/useDecoder'

export interface TreeNodeProps extends React.HTMLAttributes<HTMLElement> {
  treeNode: q.TreeNode<TopicViewModel>
  lastUpdate: number
  isMobile?: boolean
  name?: string | undefined
  collapsed?: boolean | undefined
  didSelectNode: any
  toggleCollapsed: any
  classes: any
}

export function TreeNodeTitle(props: TreeNodeProps) {
  const decodeMessage = useDecoder(props.treeNode)

  function renderSourceEdge() {
    const name = props.name || (props.treeNode.sourceEdge && props.treeNode.sourceEdge.name)

    return (
      <span key="edge" className={props.classes.sourceEdge} data-test-topic={name}>
        {name}
      </span>
    )
  }

  function truncatedMessage() {
    const limit = 400
    if (!props.treeNode.message || !props.treeNode.message.payload) {
      return ''
    }
    const [value = ''] = decodeMessage(props.treeNode.message)?.message?.format(props.treeNode.type) ?? []

    return value.length > limit ? `${value.slice(0, limit)}…` : value
  }

  function renderValue() {
    return props.treeNode.message && props.treeNode.message.payload && props.treeNode.message.length > 0 ? (
      <span key="value" className={props.classes.value}>
        {' '}
        = {truncatedMessage()}
      </span>
    ) : null
  }

  function renderExpander() {
    if (props.treeNode.edgeCount() === 0) {
      return null
    }

    // On mobile, the expand button has its own click handler separate from topic selection
    // On desktop, clicking anywhere (including expander) selects and toggles via didClickTitle
    const { isMobile } = props
    const onClick = isMobile ? props.toggleCollapsed : undefined

    return (
      <span
        key="expander"
        className={props.classes.expander}
        onClick={onClick}
        role="button"
        aria-label={props.collapsed ? 'Expand topic' : 'Collapse topic'}
        aria-expanded={!props.collapsed}
        tabIndex={isMobile ? 0 : -1}
      >
        {props.collapsed ? '▶' : '▼'}
      </span>
    )
  }

  function renderMetadata() {
    if (props.treeNode.edgeCount() === 0 || !props.collapsed) {
      return null
    }

    const messages = props.treeNode.leafMessageCount()
    const topicCount = props.treeNode.childTopicCount()
    return (
      <span key="metadata" className={props.classes.collapsedSubnodes}>
        {` (${topicCount} ${
          topicCount === 1 ? 'topic' : 'topics'
        }, ${messages} ${messages === 1 ? 'message' : 'messages'})`}
      </span>
    )
  }

  return (
    <>
      {renderExpander()}
      {renderSourceEdge()}
      {renderMetadata()}
      {renderValue()}
    </>
  )
}

const styles = (theme: Theme) => {
  return {
    value: {
      whiteSpace: 'nowrap' as const,
      overflow: 'hidden' as const,
      textOverflow: 'ellipsis' as const,
      padding: '0',
      '.mobile-topic-tree &': { fontSize: '15px' },
    },
    sourceEdge: {
      fontWeight: 'bold' as const,
      overflow: 'hidden' as const,
      '.mobile-topic-tree &': { fontSize: '16px' },
    },
    expander: {
      color: theme.palette.mode === 'light' ? '#222' : '#eee',
      cursor: 'pointer' as const,
      paddingRight: theme.spacing(0.25),
      display: 'inline-block' as const,
      textAlign: 'center' as const,
      userSelect: 'none' as const,
      '.mobile-topic-tree &': {
        paddingRight: theme.spacing(1),
        paddingLeft: theme.spacing(0.5),
        minWidth: '32px',
        fontSize: '18px',
      },
    },
    collapsedSubnodes: {
      color: theme.palette.text.secondary,
      userSelect: 'none' as const,
      '.mobile-topic-tree &': { fontSize: '14px' },
    },
  }
}

export default withStyles(styles)(memo(TreeNodeTitle))
