import { Theme } from '@mui/material'
import { CodeBlockColors, CodeBlockColorsBraceMonokai } from '../CodeBlockColors'

export const style = (theme: Theme) => {
  const codeBlockColors = theme.palette.mode === 'light' ? CodeBlockColors : CodeBlockColorsBraceMonokai
  const codeBaseStyle = {
    font: "12px/normal 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace",
    display: 'inline-grid' as const,
    margin: '0',
    padding: '1px 0 0 0',
  }

  return {
    title: {
      font: codeBaseStyle.font,
      paddingLeft: '4px',
      backgroundColor: codeBlockColors.gutters,
    },
    line: {
      lineHeight: 'normal' as const,
      paddingLeft: '4px',
      width: '100%',
      height: '16px',
    },
    codeWrapper: {
      display: 'flex',
      maxHeight: '15em',
      overflow: 'auto',
      backgroundColor: `${codeBlockColors.background}`,
    },
    wrappedCodeWrapper: {
      minWidth: 0,
      backgroundColor: codeBlockColors.background,
      borderRadius: theme.shape.borderRadius,
      overflow: 'hidden',
    },
    wrappedCodeBlock: {
      '&&': {
        display: 'block',
        width: '100%',
        minWidth: 0,
        lineHeight: '20px',
        padding: 0,
      },
    },
    wrappedLine: {
      display: 'flex',
      minHeight: '24px',
      width: '100%',
      padding: '2px 0',
      boxSizing: 'border-box' as const,
    },
    lineContent: {
      flex: 1,
      minWidth: 0,
      padding: '0 8px 0 4px',
      lineHeight: '20px',
      whiteSpace: 'pre-wrap' as const,
      overflowWrap: 'anywhere' as const,
    },
    wrappedGutters: {
      display: 'flex',
      alignItems: 'flex-start',
      width: '36px',
      padding: '0 4px',
      boxSizing: 'border-box' as const,
      flexShrink: 0,
      userSelect: 'none' as const,
      whiteSpace: 'normal' as const,
    },
    gutters: {
      ...codeBaseStyle,
      width: '33px',
      flexShrink: 0,
      backgroundColor: codeBlockColors.gutters,
      userSelect: 'none' as const,
    },
    codeBlock: {
      ...codeBaseStyle,
      width: 'calc(100% - 33px)',
      backgroundColor: 'inherit !important',
      '& span': {
        color: codeBlockColors.text,
      },
      '& .token.number': {
        color: codeBlockColors.numeric,
      },
      '& .token.boolean': {
        color: codeBlockColors.numeric,
      },
      '& .token.property': {
        color: codeBlockColors.variable,
      },
      '& .token.string': {
        color: codeBlockColors.string,
      },
      '& .token': {
        color: codeBlockColors.text,
      },
      '& .token.operator': {
        color: codeBlockColors.text,
      },
      '& .token.punctuation': {
        color: codeBlockColors.text,
      },
    },
  }
}
