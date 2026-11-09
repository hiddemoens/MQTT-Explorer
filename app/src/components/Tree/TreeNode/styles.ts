import { blueGrey } from '@mui/material/colors'
import { Theme } from '@mui/material/styles'

export const styles = (theme: Theme) => {
  return {
    animationLight: {
      willChange: 'auto',
      translateZ: 0,
      animation: 'updateLight 0.5s',
    },
    animationDark: {
      willChange: 'auto',
      translateZ: 0,
      animation: 'updateDark 0.5s',
    },
    collapsedSubnodes: {
      color: theme.palette.text.secondary,
    },
    displayBlock: {
      display: 'block' as const,
    },
    node: {
      display: 'block' as const,
      width: '100%',
      overflow: 'hidden' as const,
      textOverflow: 'ellipsis' as const,
      whiteSpace: 'nowrap' as const,
      padding: '1px 0px 0px 0px',
      '.mobile-topic-tree &': { padding: '1px 0px' },
    },
    topicSelect: {
      float: 'right' as const,
      opacity: 0,
      cursor: 'pointer',
      marginTop: '-1px',
    },
    subnodes: {
      marginLeft: theme.spacing(1.5),
      '.mobile-topic-tree &': { marginLeft: theme.spacing(2) },
    },
    selected: {
      backgroundColor: `${theme.palette.mode === 'light' ? blueGrey[300] : theme.palette.action.selected} !important`,
    },
    hover: {},
    title: {
      borderRadius: '4px',
      lineHeight: '1em',
      display: 'inline-block' as const,
      whiteSpace: 'nowrap' as const,
      minHeight: '14px',
      height: 'auto' as const,
      padding: '1px 4px 0 4px',
      margin: '1px 0px',
      cursor: 'pointer' as const,
      '&:hover': {
        backgroundColor: theme.palette.mode === 'light' ? blueGrey[100] : theme.palette.action.hover,
      },
      // Better touch feedback on mobile
      '.mobile-topic-tree &': {
        lineHeight: '1.3em',
        minHeight: '40px',
        padding: '8px',
        fontSize: '16px',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
      },
    },
  }
}
