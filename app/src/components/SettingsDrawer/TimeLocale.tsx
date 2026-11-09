import * as React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Box, Typography } from '@mui/material'
import moment from 'moment'
import { settingsActions } from '../../actions'
import { AppState } from '../../reducers'
import DateFormatter from '../helper/DateFormatter'
import SettingsDropdown from './SettingsDropdown'

function importAll(r: any) {
  r.keys().forEach(r)
}
// @ts-expect-error -- webpack require
importAll(require.context('moment/locale', true, /\.js$/))

interface FormatOption {
  locale: string
  label: string
  numberExample: string
}

const exampleDate = new Date(2025, 10, 23, 16, 5, 9, 123)
const exampleNumber = 1234.56

function numberExample(locale: string) {
  try {
    return new Intl.NumberFormat(locale || undefined, { useGrouping: false }).format(exampleNumber)
  } catch {
    return new Intl.NumberFormat(undefined, { useGrouping: false }).format(exampleNumber)
  }
}

const formats: FormatOption[] = moment
  .locales()
  .sort((a, b) => a.localeCompare(b, 'en'))
  .map(locale => ({ locale, label: locale, numberExample: numberExample(locale) }))

interface Props {
  actions: {
    settings: typeof settingsActions
  }
  timeLocale: string
}

function TimeLocaleSettings({ timeLocale, actions }: Props) {
  const locale = timeLocale.toLowerCase()
  const existing = formats.find(option => option.locale === locale)
  const selected = existing || {
    locale: timeLocale,
    label: timeLocale || 'System default',
    numberExample: numberExample(timeLocale),
  }
  const options = existing ? formats : [selected, ...formats]

  return (
    <SettingsDropdown
      id="time-locale"
      label="Format"
      options={options}
      value={selected}
      isOptionEqualToValue={(option, value) => option.locale === value.locale}
      getOptionLabel={option => option.label}
      getOptionKey={option => option.locale}
      onChange={(_, option) => actions.settings.setTimeLocale(option.locale)}
      helperText={
        <>
          <DateFormatter date={exampleDate} /> · {selected.numberExample}
        </>
      }
      renderOption={(props, option) => {
        const { key, ...liProps } = props
        return (
          <li key={key} {...liProps}>
            <Box component="span" sx={{ display: 'grid', gridTemplateColumns: '5.5rem minmax(0, 1fr)', gap: 1 }}>
              <Typography component="span" variant="body2" sx={{ fontWeight: 'bold', overflowWrap: 'anywhere' }}>
                {option.label}
              </Typography>
              <Typography component="span" variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                <DateFormatter date={exampleDate} overrideLocale={option.locale} />
                <Typography component="span" variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  {option.numberExample}
                </Typography>
              </Typography>
            </Box>
          </li>
        )
      }}
    />
  )
}

const mapStateToProps = (state: AppState) => ({
  timeLocale: state.settings.get('timeLocale'),
})

const mapDispatchToProps = (dispatch: any) => ({
  actions: {
    settings: bindActionCreators(settingsActions, dispatch),
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(TimeLocaleSettings)
