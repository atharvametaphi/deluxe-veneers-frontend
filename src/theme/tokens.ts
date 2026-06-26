import type { Shadows } from "@mui/material/styles";

const brandPalette = {
  walnutBrown: "#7A5A3A",
  walnutBrownDark: "#61472C",
  naturalOak: "#A67C52",
  softGold: "#C9A46A",
  warmIvory: "#F6F3EE",
  warmSurface: "#FBF9F5",
  white: "#FFFFFF",
  darkCharcoal: "#1E1E1E",
  mutedCharcoal: "#5F574D",
  disabledTaupe: "#9B9084",
  inverseText: "#F8F5F0",
  lightNeutralGray: "#E6DED4",
  softNeutralGray: "#F0E9DF",
  strongNeutralGray: "#CBBEAF",
  successGreen: "#587A61",
  warningAmber: "#AA7934",
  errorRose: "#A45A52",
  infoSlate: "#627C96",
  navActiveBackground: "#EFE5D8",
  navHoverBackground: "#F4EDE4",
} as const;

const elevationNone = "none";
const elevationXs =
  "0px 1px 2px rgba(45, 32, 18, 0.05), 0px 2px 4px rgba(45, 32, 18, 0.04)";
const elevationSm =
  "0px 2px 6px rgba(45, 32, 18, 0.06), 0px 6px 12px rgba(45, 32, 18, 0.05)";
const elevationMd =
  "0px 4px 10px rgba(45, 32, 18, 0.07), 0px 10px 20px rgba(45, 32, 18, 0.06)";
const elevationLg =
  "0px 8px 18px rgba(45, 32, 18, 0.08), 0px 16px 30px rgba(45, 32, 18, 0.07)";

const shadows: Shadows = [
  elevationNone,
  elevationXs,
  elevationSm,
  elevationMd,
  elevationLg,
  elevationLg,
  "none",
  "none",
  "none",
  "none",
  "none",
  "none",
  "none",
  "none",
  "none",
  "none",
  "none",
  "none",
  "none",
  "none",
  "none",
  "none",
  "none",
  "none",
  "none",
];

const typographyScale = {
  display: {
    fontSize: "2.5rem",
    fontWeight: 700,
    lineHeight: 1.15,
    letterSpacing: "-0.03em",
  },
  h1: {
    fontSize: "2rem",
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: "-0.03em",
  },
  h2: {
    fontSize: "1.5rem",
    fontWeight: 700,
    lineHeight: 1.25,
    letterSpacing: "-0.02em",
  },
  h3: {
    fontSize: "1.25rem",
    fontWeight: 600,
    lineHeight: 1.3,
  },
  title: {
    fontSize: "1rem",
    fontWeight: 600,
    lineHeight: 1.5,
    letterSpacing: "0.01em",
  },
  bodyLarge: {
    fontSize: "0.95rem",
    fontWeight: 500,
    lineHeight: 1.6,
  },
  body: {
    fontSize: "0.875rem",
    fontWeight: 500,
    lineHeight: 1.55,
  },
  caption: {
    fontSize: "0.75rem",
    fontWeight: 500,
    lineHeight: 1.45,
    letterSpacing: "0.01em",
  },
  label: {
    fontSize: "0.8125rem",
    fontWeight: 600,
    lineHeight: 1.35,
    letterSpacing: "0.02em",
  },
} as const;

const spacingScale = [
  { value: 4, multiplier: 0.5, tokenName: "theme.spacing(0.5)" },
  { value: 8, multiplier: 1, tokenName: "theme.spacing(1)" },
  { value: 12, multiplier: 1.5, tokenName: "theme.spacing(1.5)" },
  { value: 16, multiplier: 2, tokenName: "theme.spacing(2)" },
  { value: 20, multiplier: 2.5, tokenName: "theme.spacing(2.5)" },
  { value: 24, multiplier: 3, tokenName: "theme.spacing(3)" },
  { value: 32, multiplier: 4, tokenName: "theme.spacing(4)" },
  { value: 40, multiplier: 5, tokenName: "theme.spacing(5)" },
  { value: 48, multiplier: 6, tokenName: "theme.spacing(6)" },
  { value: 64, multiplier: 8, tokenName: "theme.spacing(8)" },
] as const;

export const deluxeTokens = {
  colors: brandPalette,
  spacingUnit: 8,
  radius: {
    sm: 10,
    md: 12,
    lg: 18,
    xl: 24,
    pill: 999,
  },
  layout: {
    sidebarExpandedWidth: 260,
    sidebarCollapsedWidth: 92,
    mobileHeaderHeight: 72,
  },
  iconSizes: {
    sm: 18,
    md: 20,
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
  },
  navigation: {
    surface: brandPalette.warmSurface,
    activeBackground: brandPalette.navActiveBackground,
    hoverBackground: brandPalette.navHoverBackground,
    activeIndicator: brandPalette.walnutBrown,
    activeText: brandPalette.walnutBrown,
    inactiveText: "#4F463D",
    indicatorWidth: 4,
    sectionLabelColor: "#7D705F",
  },
  surfaces: {
    background: brandPalette.warmIvory,
    surface: brandPalette.warmSurface,
    paper: brandPalette.white,
  },
  text: {
    primary: brandPalette.darkCharcoal,
    secondary: brandPalette.mutedCharcoal,
    disabled: brandPalette.disabledTaupe,
    inverse: brandPalette.inverseText,
  },
  semantic: {
    success: brandPalette.successGreen,
    warning: brandPalette.warningAmber,
    error: brandPalette.errorRose,
    info: brandPalette.infoSlate,
  },
  borders: {
    subtle: brandPalette.lightNeutralGray,
    light: brandPalette.softNeutralGray,
    strong: brandPalette.strongNeutralGray,
  },
  elevation: {
    none: elevationNone,
    xs: elevationXs,
    sm: elevationSm,
    md: elevationMd,
    lg: elevationLg,
  },
  spacingScale,
  typographyScale,
  shadows,
} as const;
