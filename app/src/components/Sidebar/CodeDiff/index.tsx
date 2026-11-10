import * as diff from 'diff'
import * as Prism from 'prismjs'
import * as React from 'react'
import { JsonPropertyLocation, literalsMappedByLines } from '../../../../../backend/src/JsonAstParser'
import { Typography } from '@mui/material'
import { withStyles } from '@mui/styles'
import * as q from '../../../../../backend/src/Model'
import DiffCount from './DiffCount'
import Gutters from './Gutters'
import { isPlottable, lineChangeStyle, trimNewlineRight } from './util'
import { selectTextWithCtrlA } from '../../../utils/handleTextSelectWithCtrlA'
import { style } from './style'
import 'prismjs/components/prism-json'

interface Props {
  treeNode: q.TreeNode<any>
  previous: string
  current: string
  nameOfCompareMessage: string
  language?: 'json'
  title?: string
  classes: any
  wrapLines?: boolean
}

interface State {}

class CodeDiff extends React.PureComponent<Props, State> {
  private handleCtrlA = selectTextWithCtrlA({ targetSelector: '[data-message-payload]' })

  constructor(props: Props) {
    super(props)
    this.state = {}
  }

  private isValidJson(str: string) {
    try {
      JSON.parse(str)
      return true
    } catch (error) {
      return false
    }
  }

  private plottableLiteralsIndexedWithLineNumbers() {
    const allLiterals = this.isValidJson(this.props.current) ? literalsMappedByLines(this.props.current) || [] : []

    return allLiterals.map((l: JsonPropertyLocation) =>
      isPlottable(l.value) ? l : undefined
    ) as Array<JsonPropertyLocation>
  }

  private renderStyledCodeLines(changes: Array<diff.Change>, literalPositions: Array<JsonPropertyLocation>) {
    const sourceLines = this.props.current.split('\n')
    const styledLines = Prism.highlight(this.props.current, Prism.languages.json, 'json').split('\n')
    let lineNumber = 0

    const renderLine = (content: React.ReactNode, line: string, change: diff.Change, key: string, index: number) => (
      <div
        key={key}
        style={lineChangeStyle(change)}
        className={this.props.wrapLines ? this.props.classes.wrappedLine : this.props.classes.line}
      >
        {this.props.wrapLines && (
          <Gutters
            inline
            className={this.props.classes.wrappedGutters}
            changes={[{ ...change, value: line, count: 1 }]}
            treeNode={this.props.treeNode}
            literalPositions={[literalPositions[index]]}
          />
        )}
        <span className={this.props.wrapLines ? this.props.classes.lineContent : undefined}>{content}</span>
      </div>
    )

    return changes
      .map((change, key) => {
        const hasStyledCode = change.removed !== true
        const changedLines = change.count || 0
        if (hasStyledCode && this.props.language === 'json') {
          const currentLines = styledLines.slice(lineNumber, lineNumber + changedLines)
          const lines = currentLines.map((html: string, idx: number) =>
            renderLine(
              <span dangerouslySetInnerHTML={{ __html: html }} />,
              sourceLines[lineNumber + idx],
              change,
              `${key}-${idx}`,
              lineNumber + idx
            )
          )
          lineNumber += changedLines

          return [<div key={key}>{lines}</div>]
        }

        const lines = trimNewlineRight(change.value)
          .split('\n')
          .map((line, idx) => renderLine(line, line, change, `${key}-${idx}`, lineNumber + idx))
        if (hasStyledCode) lineNumber += changedLines
        return lines
      })
      .reduce((a, b) => a.concat(b), [])
  }

  public render() {
    const changes = diff.diffLines(this.props.previous, this.props.current)
    // Keep each replacement's latest lines above its previous lines.
    for (let index = 0; index < changes.length - 1; index++) {
      if (changes[index].removed && changes[index + 1].added) {
        ;[changes[index], changes[index + 1]] = [changes[index + 1], changes[index]]
        index++
      }
    }
    const literalPositions = this.plottableLiteralsIndexedWithLineNumbers()
    const code = this.renderStyledCodeLines(changes, literalPositions)

    return (
      <div style={{ marginTop: '8px' }}>
        {this.props.title ? <Typography className={this.props.classes.title}>{this.props.title}</Typography> : null}
        <div
          tabIndex={0}
          onKeyDown={this.handleCtrlA}
          className={this.props.wrapLines ? this.props.classes.wrappedCodeWrapper : this.props.classes.codeWrapper}
        >
          {!this.props.wrapLines && (
            <Gutters
              className={this.props.classes.gutters}
              changes={changes}
              treeNode={this.props.treeNode}
              literalPositions={literalPositions}
            />
          )}
          <pre
            data-message-payload
            className={`${this.props.classes.codeBlock} ${this.props.wrapLines ? this.props.classes.wrappedCodeBlock : ''}`}
          >
            {code}
          </pre>
        </div>
        <DiffCount changes={changes} nameOfCompareMessage={this.props.nameOfCompareMessage} />
      </div>
    )
  }
}

export default withStyles(style)(CodeDiff)
