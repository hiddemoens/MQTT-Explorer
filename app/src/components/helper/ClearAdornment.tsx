import * as React from 'react'
import Clear from '@mui/icons-material/Clear'
import { IconButton } from '@mui/material'

interface Props {
  value?: string
  action: any
  style?: React.CSSProperties
  variant?: 'primary'
}

/**
 * Clear button for text input fields
 */
function ClearAdornment(props: Props) {
  if (!props.value) {
    return null
  }

  const color = props.variant === 'primary' ? 'inherit' : undefined
  return (
    <IconButton color="inherit" style={{ ...props.style, padding: '1px' }} onClick={props.action}>
      <Clear style={{ color, fontSize: '16px' }} />
    </IconButton>
  )
}

export default ClearAdornment
