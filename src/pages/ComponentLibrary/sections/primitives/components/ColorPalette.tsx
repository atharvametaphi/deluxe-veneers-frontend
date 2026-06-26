import { Box, Stack, Typography, useTheme } from "@mui/material";

export function ColorPalette() {
  const theme = useTheme();

  const categories = [
    {
      description: "Core Deluxe Veneers brand expression used across primary ERP touchpoints.",
      title: "Brand",
      items: [
        {
          label: "Primary",
          tokenName: "palette.primary.main",
          value: theme.palette.primary.main,
        },
        {
          label: "Secondary",
          tokenName: "palette.secondary.main",
          value: theme.palette.secondary.main,
        },
        {
          label: "Accent",
          tokenName: "palette.secondary.light",
          value: theme.palette.secondary.light,
        },
      ],
    },
    {
      description: "Base surfaces that establish page depth and reading comfort in the ERP.",
      title: "Surface",
      items: [
        {
          label: "Background",
          tokenName: "palette.background.default",
          value: theme.palette.background.default,
        },
        {
          label: "Surface",
          tokenName: "customTokens.surfaces.surface",
          value: theme.customTokens.surfaces.surface,
        },
        {
          label: "Paper",
          tokenName: "palette.background.paper",
          value: theme.palette.background.paper,
        },
      ],
    },
    {
      description: "Text hierarchy tokens for interface chrome, body content, and inverse contexts.",
      title: "Text",
      items: [
        {
          label: "Primary",
          tokenName: "palette.text.primary",
          value: theme.palette.text.primary,
        },
        {
          label: "Secondary",
          tokenName: "palette.text.secondary",
          value: theme.palette.text.secondary,
        },
        {
          label: "Disabled",
          tokenName: "palette.text.disabled",
          value: theme.palette.text.disabled,
        },
        {
          label: "Inverse",
          tokenName: "customTokens.text.inverse",
          value: theme.customTokens.text.inverse,
        },
      ],
    },
    {
      description: "Border tokens for subtle separation, light containment, and stronger emphasis.",
      title: "Border",
      items: [
        {
          label: "Default",
          tokenName: "palette.divider",
          value: theme.palette.divider,
        },
        {
          label: "Light",
          tokenName: "customTokens.borders.light",
          value: theme.customTokens.borders.light,
        },
        {
          label: "Strong",
          tokenName: "customTokens.borders.strong",
          value: theme.customTokens.borders.strong,
        },
      ],
    },
    {
      description: "Semantic system colors for system state, messaging, and operational feedback.",
      title: "Semantic",
      items: [
        {
          label: "Success",
          tokenName: "palette.success.main",
          value: theme.palette.success.main,
        },
        {
          label: "Warning",
          tokenName: "palette.warning.main",
          value: theme.palette.warning.main,
        },
        {
          label: "Error",
          tokenName: "palette.error.main",
          value: theme.palette.error.main,
        },
        {
          label: "Info",
          tokenName: "palette.info.main",
          value: theme.palette.info.main,
        },
      ],
    },
  ] as const;

  return (
    <Stack
      sx={(theme) => ({
        gap: theme.spacing(3),
      })}
    >
      {categories.map((category) => (
        <Stack
          key={category.title}
          sx={(theme) => ({
            gap: theme.spacing(2),
          })}
        >
          <Stack
            sx={(theme) => ({
              gap: theme.spacing(0.5),
            })}
          >
            <Typography variant="subtitle1" color="text.primary">
              {category.title}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {category.description}
            </Typography>
          </Stack>

          <Box
            sx={(theme) => ({
              display: "grid",
              gap: theme.spacing(2),
              gridTemplateColumns: {
                xs: "repeat(1, minmax(0, 1fr))",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(4, minmax(0, 1fr))",
              },
            })}
          >
            {category.items.map((item) => (
              <Box
                key={item.tokenName}
                sx={(theme) => ({
                  border: `1px solid ${theme.customTokens.borders.light}`,
                  borderRadius: `${theme.customTokens.radius.md}px`,
                  backgroundColor: theme.customTokens.surfaces.surface,
                  p: theme.spacing(2),
                })}
              >
                <Stack
                  sx={(theme) => ({
                    gap: theme.spacing(1.5),
                  })}
                >
                  <Box
                    sx={(theme) => ({
                      height: theme.spacing(8),
                      borderRadius: `${theme.customTokens.radius.sm}px`,
                      border: `1px solid ${theme.customTokens.borders.subtle}`,
                      backgroundColor: item.value,
                    })}
                  />

                  <Stack
                    sx={(theme) => ({
                      gap: theme.spacing(0.5),
                    })}
                  >
                    <Typography variant="subtitle2" color="text.primary">
                      {item.label}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {item.value.toUpperCase()}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        wordBreak: "break-word",
                      }}
                    >
                      {item.tokenName}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Box>
        </Stack>
      ))}
    </Stack>
  );
}
