import { Box, Stack, Typography } from "@mui/material";

import {
  ErpBreadcrumbs,
} from "../../../components/navigation/ErpBreadcrumbs";

export function DashboardPage() {
  return (
    <Box
      sx={(theme) => ({
        minHeight: "100%",
        bgcolor: "background.paper",
        px: { xs: theme.spacing(2), md: theme.spacing(3) },
        py: { xs: theme.spacing(2), md: theme.spacing(3) },
        display: "flex",
        flexDirection: "column",
      })}
    >
      <Stack
        sx={(theme) => ({
          gap: theme.spacing(2),
          flex: 1,
        })}
      >
        <Stack
          sx={(theme) => ({
            gap: theme.spacing(1),
            pb: theme.spacing(2),
            borderBottom: `1px solid ${theme.customTokens.borders.divider}`,
          })}
        >
          <ErpBreadcrumbs items={[{ label: "Dashboard" }]} />

          <Typography variant="h2" color="text.primary">
            Dashboard
          </Typography>
        </Stack>

        <Box
          sx={(theme) => ({
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: theme.spacing(40),
          })}
        >
          <Typography
            variant="h3"
            color="text.secondary"
            sx={{
              textAlign: "center",
            }}
          >
            Coming soon
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
