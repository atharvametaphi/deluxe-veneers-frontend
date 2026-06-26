import type { PropsWithChildren } from "react";
import { Box } from "@mui/material";

export function ContentContainer({ children }: PropsWithChildren) {
  return (
    <Box
      sx={(theme) => ({
        minHeight: {
          xs: theme.spacing(40),
          md: theme.spacing(48),
        },
        border: `1px solid ${theme.customTokens.borders.subtle}`,
        borderRadius: `${theme.customTokens.radius.lg}px`,
        backgroundColor: "background.paper",
        boxShadow: "none",
        p: { xs: theme.spacing(3), md: theme.spacing(4) },
      })}
    >
      {children}
    </Box>
  );
}
