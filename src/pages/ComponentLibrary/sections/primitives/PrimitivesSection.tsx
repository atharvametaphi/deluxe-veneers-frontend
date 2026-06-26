import { Stack } from "@mui/material";

import { ColorPalette } from "./components/ColorPalette";
import { IconGallery } from "./components/IconGallery";
import { RadiusScale } from "./components/RadiusScale";
import { SectionCard } from "./components/SectionCard";
import { ShadowScale } from "./components/ShadowScale";
import { SpacingScale } from "./components/SpacingScale";
import { TypographyScale } from "./components/TypographyScale";

export function PrimitivesSection() {
  return (
    <Stack
      sx={(theme) => ({
        gap: theme.spacing(3),
      })}
    >
      <SectionCard
        description="Foundational ERP palette tokens used across interface, content, borders, and semantic feedback."
        title="Colors"
      >
        <ColorPalette />
      </SectionCard>

      <SectionCard
        description="Core typography tokens for product headings, supporting copy, labels, and system documentation."
        title="Typography"
      >
        <TypographyScale />
      </SectionCard>

      <SectionCard
        description="Spacing tokens built on the Deluxe Veneers 8-point system for consistent layout rhythm."
        title="Spacing"
      >
        <SpacingScale />
      </SectionCard>

      <SectionCard
        description="Radius tokens for surfaces, navigation states, and future component framing."
        title="Border Radius"
      >
        <RadiusScale />
      </SectionCard>

      <SectionCard
        description="Subtle elevation tokens for layered ERP surfaces, overlays, and contextual separation."
        title="Elevation & Shadows"
      >
        <ShadowScale />
      </SectionCard>

      <SectionCard
        description="Lucide-based icon language grouped into common ERP system categories."
        title="Icons"
      >
        <IconGallery />
      </SectionCard>
    </Stack>
  );
}
