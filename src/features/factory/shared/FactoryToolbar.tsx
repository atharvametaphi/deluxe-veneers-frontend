import { Button, Stack } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { FileOutput } from "lucide-react";

export function FactoryToolbar() {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1.25}
      useFlexGap
      sx={{ alignItems: { xs: "stretch", md: "center" } }}
    >
      <Button
        type="button"
        variant="outlined"
        startIcon={<FileOutput size={14} />}
        sx={factoryExportButtonSx}
      >
        Export
      </Button>

    </Stack>
  );
}

const factoryExportButtonSx: SxProps<Theme> = (theme) => ({
  minHeight: 34,
  px: theme.spacing(2),
  borderRadius: `${theme.customTokens.radius.md}px`,
  borderColor: theme.customTokens.brand.primary,
  backgroundColor: theme.customTokens.surfaces.surface,
  color: theme.customTokens.brand.primary,
  fontSize: theme.typography.caption.fontSize,
  fontWeight: 700,
  lineHeight: 1,
  textTransform: "none",
  boxShadow: "none",
  "& .MuiButton-startIcon": {
    alignItems: "center",
    display: "inline-flex",
    lineHeight: 0,
    marginRight: theme.spacing(0.75),
    "& svg": {
      height: 14,
      width: 14,
      strokeWidth: 2,
    },
  },
  "&:hover": {
    borderColor: theme.customTokens.brand.primaryScale[800],
    backgroundColor: theme.customTokens.navigation.hoverBackground,
    boxShadow: "none",
  },
  "&.Mui-focusVisible": {
    borderColor: theme.customTokens.brand.primary,
    outline: `2px solid ${theme.customTokens.brand.primaryScale[200]}`,
    outlineOffset: 2,
  },
});
