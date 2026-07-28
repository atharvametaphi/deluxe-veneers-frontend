import type { SxProps, Theme } from "@mui/material/styles";

export const recordActionButtonSx: SxProps<Theme> = {
  alignItems: "center",
  appearance: "none",
  boxSizing: "border-box",
  cursor: "pointer",
  display: "inline-flex",
  fontFamily: "Inter, sans-serif",
  fontSize: "0.9rem",
  fontWeight: 600,
  justifyContent: "center",
  letterSpacing: "0.01em",
  lineHeight: 1.75,
  margin: 0,
  minWidth: 64,
  outline: 0,
  padding: "6px 16px",
  position: "relative",
  textTransform: "none",
  transition:
    "background-color 250ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1), border-color 250ms cubic-bezier(0.4, 0, 0.2, 1)",
  userSelect: "none",
  verticalAlign: "middle",
  WebkitTapHighlightColor: "transparent",
  "&.MuiButton-contained": {
    boxShadow: "0 8px 18px rgba(143, 19, 22, 0.16)",
  },
  "&.MuiButton-contained:hover": {
    boxShadow: "0 10px 20px rgba(143, 19, 22, 0.2)",
  },
  "& .MuiButton-endIcon, & .MuiButton-startIcon": {
    alignItems: "center",
    display: "inline-flex",
    lineHeight: 0,
    "& svg": {
      height: 16,
      width: 16,
    },
  },
};

export const recordViewActionButtonSx = recordActionButtonSx;

export const recordFormActionButtonSx = recordActionButtonSx;

export function getListingToolbarButtonSx(theme: Theme) {
  return {
    minHeight: 34,
    px: theme.spacing(2),
    borderRadius: `${theme.customTokens.radius.md}px`,
    backgroundColor: theme.customTokens.brand.primary,
    color: theme.customTokens.text.inverse,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: 700,
    lineHeight: 1,
    textTransform: "none",
    boxShadow: "none",
    "& .MuiButton-endIcon, & .MuiButton-startIcon": {
      alignItems: "center",
      display: "inline-flex",
      lineHeight: 0,
      "& svg": {
        height: 14,
        width: 14,
      },
    },
    "&:hover": {
      backgroundColor: theme.customTokens.brand.primaryScale[800],
      boxShadow: "none",
    },
    "&.Mui-disabled": {
      backgroundColor: theme.customTokens.neutrals[200],
      color: theme.customTokens.neutrals[500],
    },
  };
}

export const listingToolbarButtonSx: SxProps<Theme> = getListingToolbarButtonSx;
