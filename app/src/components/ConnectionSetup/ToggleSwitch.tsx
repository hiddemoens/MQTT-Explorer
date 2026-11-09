import React from 'react'
import { FormControlLabel, Switch } from '@mui/material'

export function ToggleSwitch(props: { value: boolean; classes: any; toggle: () => void; label: string }) {
  const { classes, value, toggle, label } = props

  return (
    <div className={classes.switch}>
      <FormControlLabel
        control={<Switch checked={value} onChange={toggle} color="primary" />}
        label={label}
        labelPlacement="bottom"
      />
    </div>
  )
}
