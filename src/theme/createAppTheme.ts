import { createTheme, responsiveFontSizes } from "@mui/material/styles";

import { deluxeTokens } from "./tokens";

let theme = createTheme({
  cssVariables: true,
  spacing: deluxeTokens.spacingUnit,
  shape: {
    borderRadius: deluxeTokens.radius.md,
  },
  palette: {
    mode: "light",
    primary: {
      main: deluxeTokens.brand.primary,
      light: deluxeTokens.brand.primaryScale[500],
      dark: deluxeTokens.brand.primaryScale[800],
      contrastText: deluxeTokens.colors.white,
    },
    secondary: {
      main: deluxeTokens.brand.secondary,
      light: deluxeTokens.brand.accent,
      dark: deluxeTokens.brand.primaryScale[700],
      contrastText: deluxeTokens.colors.white,
    },
    grey: deluxeTokens.neutrals,
    background: {
      default: deluxeTokens.surfaces.background,
      paper: deluxeTokens.surfaces.surface,
    },
    text: {
      primary: deluxeTokens.text.primary,
      secondary: deluxeTokens.text.secondary,
      disabled: deluxeTokens.text.disabled,
    },
    divider: deluxeTokens.borders.divider,
    success: {
      main: deluxeTokens.semantic.success,
      contrastText: deluxeTokens.colors.white,
    },
    warning: {
      main: deluxeTokens.semantic.warning,
      contrastText: deluxeTokens.colors.white,
    },
    error: {
      main: deluxeTokens.semantic.error,
      contrastText: deluxeTokens.colors.white,
    },
    info: {
      main: deluxeTokens.semantic.info,
      contrastText: deluxeTokens.colors.white,
    },
    action: {
      hover: deluxeTokens.navigation.hoverBackground,
      selected: deluxeTokens.navigation.activeBackground,
      focus: deluxeTokens.navigation.activeBackground,
      disabled: deluxeTokens.text.disabled,
      disabledBackground: deluxeTokens.navigation.hoverBackground,
    },
  },
  typography: {
    fontFamily: deluxeTokens.typography.fontFamily,
    h1: deluxeTokens.typographyScale.h1,
    h2: deluxeTokens.typographyScale.h2,
    h3: deluxeTokens.typographyScale.h3,
    body1: deluxeTokens.typographyScale.bodyLarge,
    body2: deluxeTokens.typographyScale.body,
    subtitle1: deluxeTokens.typographyScale.title,
    subtitle2: deluxeTokens.typographyScale.label,
    caption: deluxeTokens.typographyScale.caption,
    overline: {
      fontSize: "0.72rem",
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
    },
    button: {
      fontSize: "0.9rem",
      fontWeight: 600,
      letterSpacing: "0.01em",
      textTransform: "none",
    },
  },
  shadows: deluxeTokens.shadows,
  navigation: deluxeTokens.themeNavigation,
  customTokens: {
    brand: deluxeTokens.brand,
    layout: deluxeTokens.layout,
    radius: deluxeTokens.radius,
    iconSizes: deluxeTokens.iconSizes,
    navigation: deluxeTokens.navigation,
    surfaces: deluxeTokens.surfaces,
    text: deluxeTokens.text,
    semantic: deluxeTokens.semantic,
    semanticScale: deluxeTokens.semanticScale,
    neutrals: deluxeTokens.neutrals,
    borders: deluxeTokens.borders,
    elevation: deluxeTokens.elevation,
    spacingScale: deluxeTokens.spacingScale,
    typographyScale: deluxeTokens.typographyScale,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          minHeight: "100%",
        },
        body: {
          minHeight: "100%",
          backgroundColor: deluxeTokens.surfaces.background,
        },
        "#root": {
          minHeight: "100dvh",
        },
      },
    },
    MuiDrawer: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        paper: {
          backgroundColor: deluxeTokens.navigation.surface,
          backgroundImage: "none",
          borderRight: `1px solid ${deluxeTokens.borders.divider}`,
          boxShadow: "none",
        },
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
        color: "inherit",
      },
      styleOverrides: {
        root: {
          backgroundImage: "none",
          borderBottom: `1px solid ${deluxeTokens.borders.divider}`,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: deluxeTokens.radius.md,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: deluxeTokens.radius.md,
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme);

export const appTheme = theme;
