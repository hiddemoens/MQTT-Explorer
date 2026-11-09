import React from 'react'
import { Autocomplete, AutocompleteProps, Box, TextField } from '@mui/material'

type Props<Option> = Omit<
  AutocompleteProps<Option, false, true, false>,
  'renderInput' | 'disableClearable' | 'fullWidth' | 'size'
> & {
  label: string
  helperText?: React.ReactNode
}

export default function SettingsDropdown<Option>({ label, helperText, ...props }: Props<Option>) {
  return (
    <Box sx={{ px: 1, py: 1.5 }}>
      <Autocomplete
        {...props}
        size="small"
        fullWidth
        disableClearable
        renderInput={params => <TextField {...params} label={label} helperText={helperText} />}
      />
    </Box>
  )
}
