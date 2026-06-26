import "@mui/material/styles";

declare module "@mui/material/styles" {
  interface DeluxeTypographyScaleToken {
    fontSize: string;
    fontWeight: number;
    lineHeight: number;
    letterSpacing?: string;
  }

  interface DeluxeSpacingScaleToken {
    multiplier: number;
    tokenName: string;
    value: number;
  }

  interface DeluxeThemeTokens {
    layout: {
      sidebarExpandedWidth: number;
      sidebarCollapsedWidth: number;
      mobileHeaderHeight: number;
    };
    radius: {
      sm: number;
      md: number;
      lg: number;
      xl: number;
      pill: number;
    };
    iconSizes: {
      sm: number;
      md: number;
    };
    navigation: {
      surface: string;
      activeBackground: string;
      hoverBackground: string;
      activeIndicator: string;
      activeText: string;
      inactiveText: string;
      indicatorWidth: number;
      sectionLabelColor: string;
    };
    surfaces: {
      background: string;
      surface: string;
      paper: string;
    };
    text: {
      primary: string;
      secondary: string;
      disabled: string;
      inverse: string;
    };
    semantic: {
      success: string;
      warning: string;
      error: string;
      info: string;
    };
    borders: {
      subtle: string;
      light: string;
      strong: string;
    };
    elevation: {
      none: string;
      xs: string;
      sm: string;
      md: string;
      lg: string;
    };
    spacingScale: ReadonlyArray<DeluxeSpacingScaleToken>;
    typographyScale: {
      display: DeluxeTypographyScaleToken;
      h1: DeluxeTypographyScaleToken;
      h2: DeluxeTypographyScaleToken;
      h3: DeluxeTypographyScaleToken;
      title: DeluxeTypographyScaleToken;
      bodyLarge: DeluxeTypographyScaleToken;
      body: DeluxeTypographyScaleToken;
      caption: DeluxeTypographyScaleToken;
      label: DeluxeTypographyScaleToken;
    };
  }

  interface Theme {
    customTokens: DeluxeThemeTokens;
  }

  interface ThemeOptions {
    customTokens?: Partial<DeluxeThemeTokens>;
  }
}
