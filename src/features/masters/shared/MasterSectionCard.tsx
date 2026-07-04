import type { PropsWithChildren } from "react";
import { Box } from "@mui/material";

export function MasterSectionCard({ children }: PropsWithChildren) {
  return (
    <Box
      sx={(theme) => ({
        border: `1px solid ${theme.customTokens.borders.default}`,
        borderRadius: `${theme.customTokens.radius.md}px`,
        backgroundColor: theme.customTokens.surfaces.surface,
        p: { xs: theme.spacing(2), md: theme.spacing(3) },
      })}
    >
      {children}
    </Box>
  );
}
