import type { LucideIcon } from "lucide-react";
import { Box, Divider, Menu, MenuItem } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { Fragment } from "react";
import {
  actionMenuDividerSx,
  actionMenuIconProps,
  actionMenuIconSlotSx,
  actionMenuItemSx,
  actionMenuListSx,
  actionMenuPaperSx,
  resolveActionMenuTone,
} from "./actionMenuStyles";
export type RowActionsMenuItem = {
  id: string;
  label: string;
  icon?: LucideIcon;
  tone?: "primary" | "default" | "danger";
  disabled?: boolean;
  onSelect: () => void;
};
type RowActionsMenuProps = {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  actions: readonly RowActionsMenuItem[];
  anchorOrigin?: {
    vertical: "top" | "bottom" | "center";
    horizontal: "left" | "right" | "center";
  };
  transformOrigin?: {
    vertical: "top" | "bottom" | "center";
    horizontal: "left" | "right" | "center";
  };
};
export function RowActionsMenu({
  anchorEl,
  open,
  onClose,
  actions,
  anchorOrigin = { vertical: "bottom", horizontal: "right" },
  transformOrigin = { vertical: "top", horizontal: "right" },
}: RowActionsMenuProps) {
  const resolved = actions.map((action) => ({
    ...action,
    resolvedTone: resolveActionMenuTone(action.label, action.tone),
  }));
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
      transformOrigin={transformOrigin}
      MenuListProps={{
        dense: true,
        sx: actionMenuListSx(),
      }}
      slotProps={{
        paper: {
          sx: (theme: Theme) => actionMenuPaperSx(theme),
        },
      }}
    >
      {resolved.map((action, index) => {
        const Icon = action.icon;
        const previous = index > 0 ? resolved[index - 1] : undefined;
        const showDivider =
          Boolean(previous) &&
          action.resolvedTone === "danger" &&
          previous!.resolvedTone !== "danger";
        return (
          <Fragment key={action.id}>
            {showDivider ? (
              <Divider sx={(theme) => actionMenuDividerSx(theme)} />
            ) : null}
            <MenuItem
              disabled={action.disabled}
              onClick={() => {
                action.onSelect();
                onClose();
              }}
              sx={(theme) => actionMenuItemSx(theme, action.resolvedTone)}
            >
              <Box
                component="span"
                sx={(theme) => actionMenuIconSlotSx(theme)}
                aria-hidden
              >
                {Icon ? <Icon {...actionMenuIconProps} /> : null}
              </Box>
              {action.label}
            </MenuItem>
          </Fragment>
        );
      })}
    </Menu>
  );
}