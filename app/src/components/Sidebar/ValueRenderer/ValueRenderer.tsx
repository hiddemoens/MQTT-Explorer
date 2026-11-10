import React, { useMemo } from 'react'
import { connect } from 'react-redux'
import { Decoder } from '../../../../../backend/src/Model/Decoder'
import * as q from '../../../../../backend/src/Model'
import CodeDiff from '../CodeDiff'
import { AppState } from '../../../reducers'
import { ValueRendererDisplayMode } from '../../../reducers/Settings'
import { useDecoder } from '../../hooks/useDecoder'
import { TopicViewModel } from '../../../model/TopicViewModel'

interface Props {
  message: q.Message
  treeNode: q.TreeNode<any>
  compareWith?: q.Message
  renderMode: ValueRendererDisplayMode
}

type Language = 'json'

function renderDiff(
  treeNode: q.TreeNode<TopicViewModel>,
  compareWithPreviousMessage: boolean,
  current: string = '',
  previous: string = '',
  title?: string,
  language?: Language,
  wrapLines = false
) {
  return (
    <CodeDiff
      treeNode={treeNode}
      previous={previous}
      current={current}
      title={title}
      language={language}
      wrapLines={wrapLines}
      nameOfCompareMessage={compareWithPreviousMessage ? 'selected' : 'previous'}
    />
  )
}

function renderDiffMode(
  treeNode: q.TreeNode<TopicViewModel>,
  currentStr: string | undefined,
  compareStr: string | undefined,
  currentType: Language | undefined,
  compareType: Language | undefined,
  compareWithPreviousMessage: boolean
) {
  const language = currentType === compareType && compareType === 'json' ? 'json' : undefined

  return (
    <div>{renderDiff(treeNode, compareWithPreviousMessage, currentStr, compareStr, undefined, language, true)}</div>
  )
}

function renderRawMode(
  treeNode: q.TreeNode<TopicViewModel>,
  currentStr: string | undefined,
  currentType: Language | undefined
) {
  return renderDiff(treeNode, false, currentStr, currentStr, undefined, currentType, true)
}

export const ValueRenderer: React.FC<Props> = ({ treeNode, message, renderMode }) => {
  const decodeMessage = useDecoder(treeNode)
  const decodedMessage = useMemo(() => decodeMessage(message), [decodeMessage, message])

  const previousMessages = treeNode.messageHistory.toArray()
  const previousMessage = previousMessages[previousMessages.length - 2]
  const compareMessage = previousMessage || message
  const compareWithPreviousMessage = false

  const [currentStr, currentType] = useMemo(
    () => decodedMessage?.message?.format(treeNode.type) ?? [],
    [decodedMessage, treeNode.type]
  )
  const [compareStr, compareType] = useMemo(
    () => decodeMessage(compareMessage)?.message?.format(treeNode.type) ?? [],
    [compareMessage, decodeMessage, treeNode.type]
  )

  function renderValue(
    treeNode: q.TreeNode<TopicViewModel>,
    currentStr: string | undefined,
    compareStr: string | undefined,
    currentType: Language | undefined,
    compareType: Language | undefined,
    renderMode: string,
    compareWithPreviousMessage: boolean
  ) {
    if (!decodedMessage) {
      return null
    }

    switch (renderMode) {
      case 'diff':
        return renderDiffMode(treeNode, currentStr, compareStr, currentType, compareType, compareWithPreviousMessage)
      default:
        return renderRawMode(treeNode, currentStr, currentType)
    }
  }

  const renderedValue = useMemo(
    () =>
      renderValue(treeNode, currentStr, compareStr, currentType, compareType, renderMode, compareWithPreviousMessage),
    [treeNode, currentStr, compareStr, currentType, compareType, renderMode, compareWithPreviousMessage]
  )

  return (
    <div style={{ padding: '0px 0px 8px 0px', width: '100%' }}>
      {decodedMessage?.decoder === Decoder.SPARKPLUG && 'Decoded SparkplugB'}
      {renderedValue}
    </div>
  )
}

const mapStateToProps = (state: AppState) => ({
  renderMode: state.settings.get('valueRendererDisplayMode'),
})

export default connect(mapStateToProps)(ValueRenderer)
