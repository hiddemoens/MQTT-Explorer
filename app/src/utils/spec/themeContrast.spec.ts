import { expect } from 'chai'
import { getContrastRatio, getLuminance } from '@mui/material/styles'
import { themes } from '../../theme'
import { styles as treeStyles } from '../../components/Tree/TreeNode/styles'

describe('Dark theme readability', () => {
  const { palette } = themes.darkTheme
  it('uses charcoal rather than near-black surfaces', () => {
    expect(getLuminance(palette.background.default)).to.be.greaterThan(0.015)
    expect(getLuminance(palette.background.paper)).to.be.greaterThan(getLuminance(palette.background.default))
  })
  it('keeps selected and hovered topic labels, metadata and expanders readable', () => {
    const styles = treeStyles(themes.darkTheme)
    const backgrounds = [
      styles.selected.backgroundColor.replace(' !important', ''),
      styles.title['&:hover'].backgroundColor,
    ]
    for (const background of backgrounds) {
      for (const foreground of [palette.text.primary, palette.text.secondary, '#eeeeee']) {
        expect(getContrastRatio(foreground, background)).to.be.at.least(4.5)
      }
    }
  })
  it('keeps primary and secondary text readable on both surfaces', () => {
    for (const background of [palette.background.default, palette.background.paper]) {
      for (const foreground of [palette.text.primary, palette.text.secondary]) {
        expect(getContrastRatio(foreground, background)).to.be.at.least(4.5)
      }
      expect(getContrastRatio(palette.primary.main, background)).to.be.at.least(4.5)
    }
  })
})
