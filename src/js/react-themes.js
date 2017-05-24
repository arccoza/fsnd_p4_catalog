import {
  cyan700,
  grey600,
  pinkA100, pinkA200, pinkA400,
  redA400,
  purple900, deepPurple700,
  teal500, teal300, teal100,
  lime500,
  fullWhite, white,
  fullBlack, black,
} from 'material-ui/styles/colors'
import {fade, darken, lighten} from 'material-ui/utils/colorManipulator'
import spacing from 'material-ui/styles/spacing'


var lightPalette = {
  primary1Color: teal500,
  primary2Color: teal300,
  primary3Color: teal100,
  accent1Color: teal300,
  accent2Color: teal300,
  accent3Color: teal100,
  textColor: teal500,
  secondaryTextColor: teal500,
  alternateTextColor: white,
  canvasColor: white,
  borderColor: teal300,
  disabledColor: fade(fullBlack, 0.3),
  pickerHeaderColor: teal300,
  clockCircleColor: white,
}

var darkPalette = {
  primary1Color: white,
  primary2Color: teal100,
  primary3Color: teal300,
  accent1Color: teal100,
  accent2Color: teal100,
  accent3Color: teal300,
  textColor: white,
  secondaryTextColor: white,
  alternateTextColor: teal500,
  canvasColor: teal500,
  borderColor: teal100,
  disabledColor: fade(fullBlack, 0.3),
  pickerHeaderColor: white,
  clockCircleColor: teal500,
}

var themeGen = (palette) => {
  return {
    spacing: spacing,
    fontFamily: 'Roboto, sans-serif',
    borderRadius: 2,
    palette: palette,
    // appBar: {
    //   color: 'transparent',
    // },
    bottomNavigation: {
      backgroundColor: palette.primary2Color,
      unselectedColor: fade(palette.alternateTextColor, 0.54),
      selectedColor: palette.alternateTextColor,
    },
    menu: {
      backgroundColor: palette.primary1Color,
      containerBackgroundColor: palette.primary1Color,
    },
    menuItem: {
      textColor: palette.alternateTextColor,
      hoverColor: fade(palette.alternateTextColor, 0.1),
      selectedTextColor: palette.accent1Color,
      rightIconDesktopFill: grey600,
    },
    menuSubheader: {
      color: palette.alternateTextColor,
      borderColor: palette.borderColor,
      textColor: palette.alternateTextColor,
    },
    raisedButton: {
      color: palette.primary2Color,
      textColor: palette.alternateTextColor,
    },
    tableRow: {
      hoverColor: palette.accent2Color,
      stripeColor: fade(lighten(palette.primary1Color, 0.5), 0.4),
      selectedColor: palette.borderColor,
      textColor: palette.textColor,
      selectedTextColor: palette.alternateTextColor,
      borderColor: palette.borderColor,
      height: 48,
    },
    toggle: {
      trackOffColor: fade(palette.primary3Color, 0.5),
    },
  }
}

const lightTheme = themeGen(lightPalette)
const darkTheme = themeGen(darkPalette)

export {lightTheme, darkTheme}
