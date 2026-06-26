import {
  Box,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  useTheme,
} from "@mui/material";
import { ChevronDown, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useState } from "react";
import { Link as RouterLink, useLocation } from "react-router";

import deluxeWordmark from "../assets/deluxe-veneers.png";
import { sidebarNavigation } from "./sidebarNavigation";

type SidebarProps = {
  collapsed: boolean;
  isDesktop: boolean;
  open: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
};

export function Sidebar({
  collapsed,
  isDesktop,
  open,
  onClose,
  onToggleCollapse,
}: SidebarProps) {
  const theme = useTheme();
  const { pathname } = useLocation();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      sidebarNavigation.map((group) => [group.id, group.defaultOpen]),
    ),
  );
  const drawerWidth = collapsed
    ? theme.customTokens.layout.sidebarCollapsedWidth
    : theme.customTokens.layout.sidebarExpandedWidth;

  const sharedDrawerStyles = {
    width: isDesktop ? 0 : `${drawerWidth}px`,
    flexShrink: 0,
    overflow: "visible",
    "& .MuiDrawer-paper": {
      width: `${drawerWidth}px`,
      boxSizing: "border-box",
      transition: theme.transitions.create("width", {
        duration: theme.transitions.duration.standard,
        easing: theme.transitions.easing.easeInOut,
      }),
      overflowX: "hidden",
      boxShadow: "none",
      backgroundColor: theme.customTokens.navigation.surface,
    },
  } as const;

  const toggleGroup = (groupId: string) => {
    setOpenGroups((current) => ({
      ...current,
      [groupId]: !current[groupId],
    }));
  };

  return (
    <Drawer
      elevation={0}
      ModalProps={{ keepMounted: true }}
      open={open}
      onClose={onClose}
      variant={isDesktop ? "permanent" : "temporary"}
      sx={sharedDrawerStyles}
    >
      <Stack
        sx={{
          height: "100%",
          px: collapsed ? 1 : 2,
          py: 2,
          gap: 1,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            minHeight: 48,
            px: collapsed ? 0 : 1,
            borderRadius: `${theme.customTokens.radius.lg}px`,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={collapsed ? 0 : 1.5}
            sx={{
              minWidth: 0,
              overflow: "hidden",
            }}
          >
            {!collapsed ? (
              <Box
                component="img"
                src={deluxeWordmark}
                alt="Deluxe Veneers"
                sx={{
                  width: "100%",
                  maxWidth: 168,
                  height: "auto",
                  objectFit: "contain",
                }}
              />
            ) : null}
          </Stack>

          {isDesktop ? (
            <IconButton
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              color="inherit"
              onClick={onToggleCollapse}
              sx={{
                color: theme.customTokens.navigation.inactiveText,
                border: 1,
                borderColor: "divider",
                width: 32,
                height: 32,
                bgcolor: "transparent",
                "&:hover": {
                  bgcolor: theme.customTokens.navigation.hoverBackground,
                  borderColor: "divider",
                },
              }}
            >
              {collapsed ? (
                <PanelLeftOpen size={theme.customTokens.iconSizes.sm} />
              ) : (
                <PanelLeftClose size={theme.customTokens.iconSizes.sm} />
              )}
            </IconButton>
          ) : null}
        </Stack>

        <Divider sx={{ borderColor: "divider" }} />

        <Stack
          sx={{
            flexGrow: 1,
            minHeight: 0,
          }}
        >
          <List
            disablePadding
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            {sidebarNavigation.map((group) => {
              const GroupIcon = group.icon;
              const isGroupOpen = collapsed ? true : (openGroups[group.id] ?? group.defaultOpen);

              return (
                <Box key={group.id}>
                  <ListItemButton
                    disableRipple
                    onClick={() => {
                      if (!collapsed) {
                        toggleGroup(group.id);
                      }
                    }}
                    sx={{
                      minHeight: 40,
                      px: collapsed ? 1 : 1.5,
                      py: 0.5,
                      justifyContent: collapsed ? "center" : "flex-start",
                      color: theme.customTokens.navigation.inactiveText,
                      borderRadius: `${theme.customTokens.radius.md}px`,
                      "&:hover": {
                        bgcolor: theme.customTokens.navigation.hoverBackground,
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: collapsed ? 0 : 32,
                        justifyContent: "center",
                        color: theme.customTokens.navigation.inactiveText,
                      }}
                    >
                      <GroupIcon size={theme.customTokens.iconSizes.sm} />
                    </ListItemIcon>

                    {!collapsed ? (
                      <>
                        <ListItemText
                          primary={group.label}
                          primaryTypographyProps={{
                            variant: "subtitle2",
                            fontWeight: 600,
                            color: theme.customTokens.navigation.inactiveText,
                          }}
                        />
                        <ChevronDown
                          size={theme.customTokens.iconSizes.sm}
                          style={{
                            color: theme.customTokens.navigation.inactiveText,
                            transform: isGroupOpen ? "rotate(0deg)" : "rotate(-90deg)",
                            transition: "transform 180ms ease",
                          }}
                        />
                      </>
                    ) : null}
                  </ListItemButton>

                  <Collapse
                    in={isGroupOpen}
                    orientation="vertical"
                    timeout="auto"
                  >
                    <List
                      disablePadding
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                        pt: 0.5,
                        pl: collapsed ? 0 : 3,
                      }}
                    >
                      {group.items.map((item) => {
                        const isActive = item.match(pathname);
                        const ItemIcon = item.icon;

                        return (
                          <ListItemButton
                            key={item.id}
                            disableRipple
                            component={RouterLink}
                            onClick={!isDesktop ? onClose : undefined}
                            selected={isActive}
                            to={item.to}
                            sx={{
                              position: "relative",
                              overflow: "hidden",
                              minHeight: 40,
                              px: collapsed ? 1 : 1.5,
                              py: 0.5,
                              justifyContent: collapsed ? "center" : "flex-start",
                              color: isActive
                                ? theme.customTokens.navigation.activeText
                                : theme.customTokens.navigation.inactiveText,
                              bgcolor: isActive
                                ? theme.customTokens.navigation.activeBackground
                                : "transparent",
                              borderRadius: `${theme.customTokens.radius.md}px`,
                              "&::before": isActive
                                ? {
                                    content: '""',
                                    position: "absolute",
                                    left: 0,
                                    top: 6,
                                    bottom: 6,
                                    width: theme.customTokens.navigation.indicatorWidth,
                                    borderRadius: `${theme.customTokens.radius.pill}px`,
                                    bgcolor: theme.customTokens.navigation.activeIndicator,
                                  }
                                : {},
                              "&:hover": {
                                bgcolor: isActive
                                  ? theme.customTokens.navigation.activeBackground
                                  : theme.customTokens.navigation.hoverBackground,
                              },
                              "&.Mui-selected": {
                                bgcolor: theme.customTokens.navigation.activeBackground,
                              },
                              "&.Mui-selected:hover": {
                                bgcolor: theme.customTokens.navigation.activeBackground,
                              },
                            }}
                          >
                            <ListItemIcon
                              sx={{
                                minWidth: collapsed ? 0 : 32,
                                justifyContent: "center",
                                color: isActive
                                  ? theme.customTokens.navigation.activeText
                                  : theme.customTokens.navigation.inactiveText,
                              }}
                            >
                              <ItemIcon size={theme.customTokens.iconSizes.sm} />
                            </ListItemIcon>

                            {!collapsed ? (
                              <ListItemText
                                primary={item.label}
                                primaryTypographyProps={{
                                  variant: "body2",
                                  fontWeight: isActive ? 600 : 500,
                                  color: isActive
                                    ? theme.customTokens.navigation.activeText
                                    : theme.customTokens.navigation.inactiveText,
                                }}
                              />
                            ) : null}
                          </ListItemButton>
                        );
                      })}
                    </List>
                  </Collapse>
                </Box>
              );
            })}
          </List>
        </Stack>
      </Stack>
    </Drawer>
  );
}
