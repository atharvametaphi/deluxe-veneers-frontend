import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Download,
  FileArchive,
  FileText,
  FolderClosed,
  House,
  Info,
  Menu,
  PanelLeft,
  Pencil,
  Plus,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  User,
  UserCog,
  Users,
  XCircle,
} from "lucide-react";
import { Box, Stack, Typography, useTheme } from "@mui/material";

type IconCategory = {
  icons: ReadonlyArray<{
    icon: LucideIcon;
    name: string;
  }>;
  title: string;
};

const iconCategories: ReadonlyArray<IconCategory> = [
  {
    title: "Navigation",
    icons: [
      { icon: House, name: "House" },
      { icon: PanelLeft, name: "PanelLeft" },
      { icon: Menu, name: "Menu" },
      { icon: ChevronRight, name: "ChevronRight" },
    ],
  },
  {
    title: "Actions",
    icons: [
      { icon: Plus, name: "Plus" },
      { icon: Pencil, name: "Pencil" },
      { icon: Download, name: "Download" },
      { icon: Trash2, name: "Trash2" },
    ],
  },
  {
    title: "Status",
    icons: [
      { icon: CheckCircle2, name: "CheckCircle2" },
      { icon: AlertTriangle, name: "AlertTriangle" },
      { icon: XCircle, name: "XCircle" },
      { icon: Info, name: "Info" },
    ],
  },
  {
    title: "Files",
    icons: [
      { icon: FileText, name: "FileText" },
      { icon: FolderClosed, name: "FolderClosed" },
      { icon: FileArchive, name: "FileArchive" },
      { icon: ShieldCheck, name: "ShieldCheck" },
    ],
  },
  {
    title: "Users",
    icons: [
      { icon: User, name: "User" },
      { icon: Users, name: "Users" },
      { icon: UserCog, name: "UserCog" },
      { icon: ShieldCheck, name: "ShieldCheck" },
    ],
  },
  {
    title: "Settings",
    icons: [
      { icon: Settings, name: "Settings" },
      { icon: SlidersHorizontal, name: "SlidersHorizontal" },
      { icon: PanelLeft, name: "PanelLeft" },
      { icon: UserCog, name: "UserCog" },
    ],
  },
] as const;

export function IconGallery() {
  const theme = useTheme();

  return (
    <Stack
      sx={(theme) => ({
        gap: theme.spacing(3),
      })}
    >
      {iconCategories.map((category) => (
        <Stack
          key={category.title}
          sx={(theme) => ({
            gap: theme.spacing(1.5),
          })}
        >
          <Typography variant="subtitle1" color="text.primary">
            {category.title}
          </Typography>

          <Box
            sx={(theme) => ({
              display: "grid",
              gap: theme.spacing(2),
              gridTemplateColumns: {
                xs: "repeat(2, minmax(0, 1fr))",
                md: "repeat(4, minmax(0, 1fr))",
              },
            })}
          >
            {category.icons.map((item) => (
              <Box
                key={`${category.title}-${item.name}`}
                sx={(theme) => ({
                  border: `1px solid ${theme.customTokens.borders.light}`,
                  borderRadius: `${theme.customTokens.radius.md}px`,
                  backgroundColor: theme.customTokens.surfaces.surface,
                  p: theme.spacing(2),
                })}
              >
                <Stack
                  alignItems="center"
                  justifyContent="center"
                  sx={(theme) => ({
                    minHeight: theme.spacing(12),
                    gap: theme.spacing(1.5),
                  })}
                >
                  <item.icon
                    color={theme.customTokens.navigation.activeText}
                    size={theme.customTokens.iconSizes.md}
                  />

                  <Typography
                    align="center"
                    variant="caption"
                    color="text.secondary"
                  >
                    {item.name}
                  </Typography>
                </Stack>
              </Box>
            ))}
          </Box>
        </Stack>
      ))}
    </Stack>
  );
}
