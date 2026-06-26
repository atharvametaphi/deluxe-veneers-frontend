import { Box, Stack, Typography, useTheme } from "@mui/material";

export function TypographyScale() {
  const theme = useTheme();

  const samples = [
    {
      label: "Display",
      preview: "Deluxe Veneers ERP",
      tokenName: "customTokens.typographyScale.display",
      value: theme.customTokens.typographyScale.display,
    },
    {
      label: "H1",
      preview: "Component Foundations",
      tokenName: "typography.h1",
      value: theme.customTokens.typographyScale.h1,
    },
    {
      label: "H2",
      preview: "Enterprise Page Structure",
      tokenName: "typography.h2",
      value: theme.customTokens.typographyScale.h2,
    },
    {
      label: "H3",
      preview: "Section Heading",
      tokenName: "typography.h3",
      value: theme.customTokens.typographyScale.h3,
    },
    {
      label: "Title",
      preview: "Reusable component title",
      tokenName: "typography.subtitle1",
      value: theme.customTokens.typographyScale.title,
    },
    {
      label: "Body Large",
      preview: "Primary reading copy for ERP layouts and product guidance.",
      tokenName: "typography.body1",
      value: theme.customTokens.typographyScale.bodyLarge,
    },
    {
      label: "Body",
      preview: "Secondary supporting copy for interface descriptions and notes.",
      tokenName: "typography.body2",
      value: theme.customTokens.typographyScale.body,
    },
    {
      label: "Caption",
      preview: "Token metadata and compact annotations.",
      tokenName: "typography.caption",
      value: theme.customTokens.typographyScale.caption,
    },
    {
      label: "Label",
      preview: "FIELD LABEL",
      tokenName: "typography.subtitle2",
      value: theme.customTokens.typographyScale.label,
    },
  ] as const;

  return (
    <Stack>
      {samples.map((sample, index) => (
        <Box
          key={sample.label}
          sx={(theme) => ({
            py: theme.spacing(2),
            borderTop:
              index === 0
                ? "none"
                : `1px solid ${theme.customTokens.borders.light}`,
          })}
        >
          <Box
            sx={(theme) => ({
              display: "grid",
              gap: theme.spacing(2),
              gridTemplateColumns: {
                xs: "1fr",
                lg: "minmax(0, 1.4fr) minmax(0, 0.8fr)",
              },
              alignItems: "start",
            })}
          >
            <Stack
              sx={(theme) => ({
                gap: theme.spacing(1),
              })}
            >
              <Typography
                color="text.primary"
                sx={{
                  fontFamily: theme.typography.fontFamily,
                  fontSize: sample.value.fontSize,
                  fontWeight: sample.value.fontWeight,
                  lineHeight: sample.value.lineHeight,
                  letterSpacing: sample.value.letterSpacing,
                }}
              >
                {sample.preview}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                {sample.label}
              </Typography>
            </Stack>

            <Box
              sx={(theme) => ({
                display: "grid",
                gap: theme.spacing(1),
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                border: `1px solid ${theme.customTokens.borders.light}`,
                borderRadius: `${theme.customTokens.radius.md}px`,
                backgroundColor: theme.customTokens.surfaces.surface,
                p: theme.spacing(2),
              })}
            >
              <MetadataItem label="Font size" value={sample.value.fontSize} />
              <MetadataItem
                label="Weight"
                value={String(sample.value.fontWeight)}
              />
              <MetadataItem
                label="Line height"
                value={String(sample.value.lineHeight)}
              />
              <MetadataItem label="Token" value={sample.tokenName} />
            </Box>
          </Box>
        </Box>
      ))}
    </Stack>
  );
}

type MetadataItemProps = {
  label: string;
  value: string;
};

function MetadataItem({ label, value }: MetadataItemProps) {
  return (
    <Stack
      sx={(theme) => ({
        gap: theme.spacing(0.5),
      })}
    >
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>

      <Typography
        variant="body2"
        color="text.primary"
        sx={{
          wordBreak: "break-word",
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}
