import { createTheme } from '@mui/material/styles'
import { amber } from '@mui/material/colors'

const baseTheme = {
  typography: {
    allVariants: {
      userSelect: 'none',
    },
    body1: {
      fontSize: '0.9rem',
    },
  },
}

const darkTheme = createTheme({
  ...(baseTheme as any),
  palette: {
    mode: 'dark',
    background: { default: '#26292e', paper: '#32363e' },
    text: { primary: '#f0f3f8', secondary: '#c5ccd6', disabled: '#b0b8c4' },
    primary: { main: '#91caff', light: '#badfff', dark: '#64aceb', contrastText: '#17212b' },
    divider: '#68717f',
    action: {
      active: '#e5ebf3',
      hover: '#3c424b',
      selected: '#3b5067',
      disabled: '#aab3c0',
      disabledBackground: 'rgba(229,235,243,0.12)',
    },
  },
  components: {
    MuiAppBar: { styleOverrides: { root: { backgroundColor: '#32363e', color: '#f0f3f8', backgroundImage: 'none' } } },
    MuiInputBase: { styleOverrides: { input: { '&::placeholder': { color: '#c5ccd6', opacity: 1 } } } },
    MuiOutlinedInput: { styleOverrides: { notchedOutline: { borderColor: '#818b9a' } } },
    MuiCssBaseline: {
      styleOverrides: {
        body: { colorScheme: 'dark' },
        '.ace-monokai': { backgroundColor: '#32363e', color: '#f0f3f8' },
        '.ace-monokai .ace_gutter': { backgroundColor: '#3d424c', color: '#c5ccd6' },
      },
    },
  },
})

const lightTheme = createTheme({
  ...(baseTheme as any),
  palette: {
    mode: 'light',
    background: {
      default: '#fafafa',
    },
    primary: {
      // main: '#931e2e',
      // main: '#172A3A',
      // main: '#004346',
      // main: '#7D4F50',
      // main: '#C14953',
      // main: '#4C4C47',
      // main: '#2D2D2A',
      // main: '#37000A',
      // main: '#56000F',
      // main: '#89023E',
      // main: '#30343F',
      main: '#335C67', // ⭐️
    },
    secondary: amber,
    // secondary: {
    //   main: '#E09F3E',
    // },
    action: {
      disabledBackground: '#fafafa',
    },
  },
})

export const themes = {
  lightTheme,
  darkTheme,
}
