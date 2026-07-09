import type { PropsWithChildren, ReactNode } from "react";
import { Box, Stack, Typography } from "@mui/material";

import {
  ErpBreadcrumbs,
  type ErpBreadcrumbItem,
} from "../../../components/navigation/ErpBreadcrumbs";

interface MasterPageShellProps extends PropsWithChildren {
  breadcrumbs: ErpBreadcrumbItem[];
  title: string;
  actions?: ReactNode;
  contentGap?: number;
}

export function MasterPageShell({
  actions,
  breadcrumbs,
  children,
  contentGap = 3,
  title,
}: MasterPageShellProps) {
  return (
    <Box
      sx={(theme) => ({
        minHeight: "100%",
        bgcolor: "background.paper",
        px: { xs: theme.spacing(2), md: theme.spacing(3) },
        py: { xs: theme.spacing(2), md: theme.spacing(3) },
      })}
    >
      <Stack
        sx={(theme) => ({
          gap: theme.spacing(contentGap),
        })}
      >
        <Stack
          sx={(theme) => ({
            gap: theme.spacing(1.5),
            pb: theme.spacing(2.5),
            borderBottom: `1px solid ${theme.customTokens.borders.divider}`,
          })}
        >
          <ErpBreadcrumbs items={breadcrumbs} />

          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
          >
            <Typography variant="h2" color="text.primary">
              {title}
            </Typography>

            {actions}
          </Stack>
        </Stack>

        {children}
      </Stack>
    </Box>
  );
}
