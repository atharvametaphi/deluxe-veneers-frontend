import { useState } from "react";
import { ChevronRight } from "lucide-react";
import {
  Breadcrumbs,
  Box,
  Button,
  Link,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";

import { NavigationShowcaseCard } from "./NavigationShowcaseCard";
import { NavigationTokenBadge } from "./NavigationTokenBadge";

export function PageHeaderShowcase() {
  const [lastAction, setLastAction] = useState("None");
  const theme = useTheme();
  const breadcrumbToken = theme.navigation.breadcrumb.default;

  return (
    <NavigationShowcaseCard
      title="ERP Page Header"
      description="Reusable page header for module listing pages, transaction entry screens, and record-detail workflows."
      token="theme.navigation.header"
      footer={
        <Typography variant="caption" color="text.secondary">
          Last header interaction: {lastAction}
        </Typography>
      }
    >
      <Box
        sx={(theme) => ({
          border: `1px solid ${theme.customTokens.borders.light}`,
          borderRadius: `${theme.customTokens.radius.md}px`,
          backgroundColor: theme.customTokens.surfaces.alt,
          p: theme.spacing(3),
        })}
      >
        <Stack
          sx={(theme) => ({
            gap: theme.spacing(2.5),
          })}
        >
          <Stack
            sx={(theme) => ({
              gap: theme.spacing(1),
            })}
          >
            <NavigationTokenBadge token="theme.navigation.header.breadcrumb" />

            <Breadcrumbs
              separator={<ChevronRight size={14} style={{ opacity: 0.7 }} />}
              sx={{
                "& .MuiBreadcrumbs-separator": {
                  color: breadcrumbToken.separatorColor,
                },
              }}
            >
              {["Home", "Inventory", "Inward"].map((item) => (
                <Link
                  key={item}
                  component="button"
                  onClick={() => setLastAction(`Opened ${item}`)}
                  type="button"
                  underline="hover"
                  variant="body2"
                  sx={{
                    color: breadcrumbToken.itemColor,
                    fontWeight: breadcrumbToken.itemFontWeight,
                  }}
                >
                  {item}
                </Link>
              ))}

              <Typography
                variant="body2"
                sx={{
                  color: breadcrumbToken.currentColor,
                  fontWeight: breadcrumbToken.currentFontWeight,
                }}
              >
                Inventory Inward
              </Typography>
            </Breadcrumbs>
          </Stack>

          <Box
            sx={(theme) => ({
              display: "flex",
              justifyContent: "space-between",
              alignItems: {
                xs: "flex-start",
                md: "center",
              },
              gap: theme.spacing(2),
              flexWrap: "wrap",
            })}
          >
            <Stack
              sx={(theme) => ({
                gap: theme.spacing(1),
              })}
            >
              <NavigationTokenBadge token="theme.navigation.header.titleBlock" />

              <Typography variant="h2" color="text.primary">
                Inventory Inward
              </Typography>

              <Typography variant="body1" color="text.secondary">
                Manage inward veneer entries.
              </Typography>
            </Stack>

            <Stack
              direction="row"
              sx={(theme) => ({
                gap: theme.spacing(1.5),
                flexWrap: "wrap",
              })}
            >
              <Stack
                sx={(theme) => ({
                  gap: theme.spacing(0.75),
                })}
              >
                <NavigationTokenBadge token="theme.navigation.header.secondaryAction" />

                <Button
                  disableElevation
                  onClick={() => setLastAction("Export")}
                  variant="outlined"
                  sx={(theme) => ({
                    borderColor: theme.customTokens.borders.default,
                    color: theme.customTokens.navigation.activeText,
                    borderRadius: `${theme.customTokens.radius.md}px`,
                    px: theme.spacing(2),
                    "&:hover": {
                      borderColor: theme.customTokens.navigation.activeText,
                      backgroundColor: theme.customTokens.navigation.hoverBackground,
                    },
                  })}
                >
                  Export
                </Button>
              </Stack>

              <Stack
                sx={(theme) => ({
                  gap: theme.spacing(0.75),
                })}
              >
                <NavigationTokenBadge token="theme.navigation.header.primaryAction" />

                <Button
                  disableElevation
                  onClick={() => setLastAction("New Entry")}
                  variant="contained"
                  sx={(theme) => ({
                    borderRadius: `${theme.customTokens.radius.md}px`,
                    px: theme.spacing(2),
                    backgroundColor: theme.customTokens.brand.primary,
                    color: theme.customTokens.text.inverse,
                    "&:hover": {
                      backgroundColor: theme.customTokens.brand.secondary,
                    },
                  })}
                >
                  New Entry
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </NavigationShowcaseCard>
  );
}
