import React from 'react'
import { Autocomplete, AutocompleteProps, Box, TextField } from '@mui/material'

type Props<Option> = Omit<
  AutocompleteProps<Option, false, true, false>,
  'renderInput' | 'disableClearable' | 'fullWidth' | 'size' | 'slotProps'
> & {
  label: string
  helperText?: React.ReactNode
}

export default function SettingsDropdown<Option>({ label, helperText, ...props }: Props<Option>) {
  return (
    <Box
      sx={theme => ({
        px: 1,
        py: 1.5,
        ...theme.applyStyles('dark', { '& .MuiOutlinedInput-root': { backgroundColor: 'background.paper' } }),
      })}
    >
      <Autocomplete
        {...props}
        size="small"
        fullWidth
        disableClearable
        slotProps={{ paper: { sx: theme => theme.applyStyles('dark', { backgroundImage: 'none' }) } }}
        renderInput={params => <TextField {...params} label={label} helperText={helperText} />}
      />
    </Box>
  )
}
