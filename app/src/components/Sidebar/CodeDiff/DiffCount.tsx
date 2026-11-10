import * as React from 'react'
import { Theme } from '@mui/material'
import { withStyles } from '@mui/styles'

interface Props {
  changes: Array<Diff.Change>
  classes: { [s: string]: any }
  nameOfCompareMessage: string
}

function changeAmount(props: Props) {
  const additions = props.changes.map(change => (change.added === true ? change.count || 0 : 0)).reduce((a, b) => a + b)
  const deletions = props.changes
    .map(change => (change.removed === true ? change.count || 0 : 0))
    .reduce((a, b) => a + b)
  if (additions === 0 && deletions === 0) {
    return null
  }

  return (
    <div className={props.classes.summary}>
      <span>
        Compared with <b>{props.nameOfCompareMessage}</b> message
      </span>
      <span className={props.classes.counts}>
        <span className={props.classes.additions}>
          + {additions} line
          {additions === 1 ? '' : 's'}
        </span>
        <span className={props.classes.deletions}>
          − {deletions} line
          {deletions === 1 ? '' : 's'}
        </span>
      </span>
    </div>
  )
}

const style = (theme: Theme) => ({
  summary: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing(0.5, 1),
    marginTop: theme.spacing(1),
    fontSize: '0.75rem',
    lineHeight: 1.5,
    color: theme.palette.text.secondary,
  },
  counts: {
    display: 'flex',
    gap: theme.spacing(1),
  },
  additions: {
    color: theme.palette.mode === 'dark' ? theme.palette.success.light : theme.palette.success.dark,
  },
  deletions: {
    color: theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark,
  },
})

export default withStyles(style)(changeAmount)
