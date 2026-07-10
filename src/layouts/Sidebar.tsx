import {
  Avatar,
  Box,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  ListItemIcon,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { ChevronDown, ChevronLeft, LogOut, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router";

import deluxeWordmark from "../assets/deluxe-veneers.png";
import deluxeFavicon from "../assets/favicon.png";
import {
  AUTH_USER_UPDATED_EVENT,
  getCurrentUser,
  getUserDisplayName,
  getUserInitials,
  signOut,
} from "../features/auth";
import {
  getDynamicSidebarWarehouses,
  LOCAL_WAREHOUSES_UPDATED_EVENT,
} from "../features/warehouses/shared/localWarehouseStore";
import {
  getSidebarNavigation,
  type SidebarNavigationEntry,
  type SidebarNavigationGroup,
  type SidebarMatchLocation,
} from "./sidebarNavigation";

type SidebarProps = {
  collapsed: boolean;
  isDesktop: boolean;
  open: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
};

const isExpandableGroup = (
  entry: SidebarNavigationEntry,
): entry is SidebarNavigationGroup => "items" in entry;

export function Sidebar({
  collapsed,
  isDesktop,
  open,
  onClose,
  onToggleCollapse,
}: SidebarProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [dynamicWarehouses, setDynamicWarehouses] = useState(() =>
    getDynamicSidebarWarehouses(),
  );
  const userDisplayName = useMemo(
    () => getUserDisplayName(currentUser),
    [currentUser],
  );
  const userInitials = useMemo(
    () => getUserInitials(userDisplayName),
    [userDisplayName],
  );
  const sidebarLocation: SidebarMatchLocation = {
    pathname: location.pathname,
    search: location.search,
  };
  const navigationEntries = useMemo(
    () => getSidebarNavigation(dynamicWarehouses),
    [dynamicWarehouses],
  );
  const [accountMenuAnchorEl, setAccountMenuAnchorEl] =
    useState<HTMLElement | null>(null);

  const activeGroupId =
    navigationEntries.find(
      (entry) =>
        isExpandableGroup(entry) &&
        (
          entry.items.some((item) => item.match(sidebarLocation)) ||
          entry.additionalMatches?.some((match) => match(sidebarLocation))
        ),
    )?.id ?? null;

  const initialOpenGroupId =
    activeGroupId ??
    navigationEntries.find(
      (entry) => isExpandableGroup(entry) && entry.defaultOpen,
    )?.id ??
    null;

  const [openGroupId, setOpenGroupId] = useState<string | null>(
    initialOpenGroupId,
  );

  useEffect(() => {
    if (activeGroupId) {
      setOpenGroupId(activeGroupId);
    }
  }, [activeGroupId]);

  useEffect(() => {
    const handleUserUpdate = () => {
      setCurrentUser(getCurrentUser());
    };

    window.addEventListener(AUTH_USER_UPDATED_EVENT, handleUserUpdate);
    return () => {
      window.removeEventListener(AUTH_USER_UPDATED_EVENT, handleUserUpdate);
    };
  }, []);

  useEffect(() => {
    const handleWarehousesUpdate = () => {
      setDynamicWarehouses(getDynamicSidebarWarehouses());
    };

    window.addEventListener(
      LOCAL_WAREHOUSES_UPDATED_EVENT,
      handleWarehousesUpdate,
    );
    window.addEventListener("storage", handleWarehousesUpdate);

    return () => {
      window.removeEventListener(
        LOCAL_WAREHOUSES_UPDATED_EVENT,
        handleWarehousesUpdate,
      );
      window.removeEventListener("storage", handleWarehousesUpdate);
    };
  }, []);

  const drawerWidth = collapsed
    ? theme.customTokens.layout.sidebarCollapsedWidth
    : theme.customTokens.layout.sidebarExpandedWidth;
  const isProfileRoute = location.pathname === "/profile";

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

  const collapsedNavButtonSize = theme.spacing(6);

  const renderTopLevelIcon = (entry: SidebarNavigationEntry) => {
    const EntryIcon = entry.icon;

    return (
      <EntryIcon
        fill={entry.filledIcon ? "currentColor" : "none"}
        size={theme.customTokens.iconSizes.md}
        strokeWidth={entry.filledIcon ? 1.8 : 2}
      />
    );
  };

  const handleAccountMenuClose = () => {
    setAccountMenuAnchorEl(null);
  };

  const handleOpenProfile = () => {
    handleAccountMenuClose();
    if (!isDesktop) {
      onClose();
    }
    navigate("/profile");
  };

  const handleLogout = () => {
    handleAccountMenuClose();
    signOut();
    if (!isDesktop) {
      onClose();
    }
    navigate("/", { replace: true });
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
          overflow: "hidden",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          sx={{
            minHeight: 52,
            px: 0,
            borderRadius: `${theme.customTokens.radius.lg}px`,
            width: "100%",
          }}
        >
          {!collapsed ? (
            <>
              <Box
                sx={{
                  flexGrow: 1,
                  minWidth: 0,
                  pr: 1,
                  overflow: "hidden",
                }}
              >
                <Box
                  component="img"
                  src={deluxeWordmark}
                  alt="Deluxe Veneers"
                  sx={{
                    display: "block",
                    width: "100%",
                    maxWidth: "100%",
                    height: "auto",
                    objectFit: "contain",
                  }}
                />
              </Box>

              {isDesktop ? (
                <IconButton
                  aria-label="Collapse sidebar"
                  color="inherit"
                  onClick={onToggleCollapse}
                  sx={{
                    flexShrink: 0,
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
                  <ChevronLeft size={theme.customTokens.iconSizes.sm} />
                </IconButton>
              ) : null}
            </>
          ) : isDesktop ? (
            <IconButton
              aria-label="Expand sidebar"
              color="inherit"
              onClick={onToggleCollapse}
              sx={{
                width: 36,
                height: 36,
                p: 0.75,
                border: 1,
                borderColor: "divider",
                borderRadius: `${theme.customTokens.radius.md}px`,
                bgcolor: theme.customTokens.surfaces.surface,
                "&:hover": {
                  bgcolor: theme.customTokens.navigation.hoverBackground,
                  borderColor: theme.customTokens.borders.hover,
                },
              }}
            >
              <Box
                component="img"
                src={deluxeFavicon}
                alt="Expand Deluxe Veneers sidebar"
                sx={{
                  display: "block",
                  width: 22,
                  minWidth: 22,
                  height: "auto",
                  objectFit: "contain",
                }}
              />
            </IconButton>
          ) : null}
        </Stack>

        <Divider sx={{ borderColor: "divider" }} />

        <Stack
          sx={{
            flexGrow: 1,
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          <List
            disablePadding
            sx={{
              display: "flex",
              flexDirection: "column",
              flexGrow: 1,
              gap: 1,
              alignItems: collapsed ? "center" : "stretch",
              minHeight: 0,
              overflowY: "auto",
              overflowX: "hidden",
              pb: 1,
              scrollbarWidth: "thin",
              "&::-webkit-scrollbar": {
                width: 6,
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: theme.customTokens.borders.default,
                borderRadius: `${theme.customTokens.radius.pill}px`,
              },
            }}
          >
            {navigationEntries.map((entry) => {
              const hasChildren = isExpandableGroup(entry);
              const isActive = hasChildren
                ? entry.items.some((item) => item.match(sidebarLocation))
                : entry.match(sidebarLocation);
              const isOpen = !collapsed && openGroupId === entry.id;

              const parentButtonSx = {
                position: "relative",
                overflow: "hidden",
                minHeight: 40,
                width: collapsed ? collapsedNavButtonSize : "100%",
                minWidth: collapsed ? collapsedNavButtonSize : undefined,
                mx: collapsed ? "auto" : 0,
                px: collapsed ? 0 : 1.5,
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
                      left: collapsed ? 4 : 0,
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
              } as const;

              const parentButton = hasChildren ? (
                <ListItemButton
                  disableRipple
                  onClick={() => {
                    if (collapsed && isDesktop) {
                      setOpenGroupId(entry.id);
                      onToggleCollapse();
                      return;
                    }

                    if (!collapsed) {
                      setOpenGroupId((current) =>
                        current === entry.id ? null : entry.id,
                      );
                    }
                  }}
                  selected={isActive}
                  sx={parentButtonSx}
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
                    {renderTopLevelIcon(entry)}
                  </ListItemIcon>

                  {!collapsed ? (
                    <>
                      <ListItemText
                        primary={entry.label}
                        primaryTypographyProps={{
                          variant: "subtitle2",
                          fontWeight: 600,
                          color: isActive
                            ? theme.customTokens.navigation.activeText
                            : theme.customTokens.navigation.inactiveText,
                        }}
                      />
                      <ChevronDown
                        size={theme.customTokens.iconSizes.sm}
                        style={{
                          color: isActive
                            ? theme.customTokens.navigation.activeText
                            : theme.customTokens.navigation.inactiveText,
                          transform: isOpen
                            ? "rotate(0deg)"
                            : "rotate(-90deg)",
                          transition: "transform 180ms ease",
                        }}
                      />
                    </>
                  ) : null}
                </ListItemButton>
              ) : (
                <ListItemButton
                  disableRipple
                  component={RouterLink}
                  onClick={!isDesktop ? onClose : undefined}
                  selected={isActive}
                  to={entry.to}
                  sx={parentButtonSx}
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
                    {renderTopLevelIcon(entry)}
                  </ListItemIcon>

                  {!collapsed ? (
                    <ListItemText
                      primary={entry.label}
                      primaryTypographyProps={{
                        variant: "subtitle2",
                        fontWeight: 600,
                        color: isActive
                          ? theme.customTokens.navigation.activeText
                          : theme.customTokens.navigation.inactiveText,
                      }}
                    />
                  ) : null}
                </ListItemButton>
              );

              return (
                <Box key={entry.id}>
                  {collapsed ? (
                    <Tooltip placement="right" title={entry.label}>
                      <Box>{parentButton}</Box>
                    </Tooltip>
                  ) : (
                    parentButton
                  )}

                  {hasChildren && !collapsed ? (
                    <Collapse in={isOpen} orientation="vertical" timeout="auto">
                      <List
                        disablePadding
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 0.5,
                          pt: 0.5,
                          pl: 4,
                        }}
                      >
                        {entry.items.map((item) => {
                          const isItemActive = item.match(sidebarLocation);

                          return (
                            <ListItemButton
                              key={item.id}
                              disableRipple
                              component={RouterLink}
                              onClick={!isDesktop ? onClose : undefined}
                              selected={isItemActive}
                              to={item.to}
                              sx={{
                                position: "relative",
                                overflow: "hidden",
                                minHeight: 38,
                                px: 1.5,
                                py: 0.5,
                                gap: 1,
                                justifyContent: "flex-start",
                                color: isItemActive
                                  ? theme.customTokens.navigation.activeText
                                  : theme.customTokens.navigation.inactiveText,
                                bgcolor: isItemActive
                                  ? theme.customTokens.navigation.activeBackground
                                  : "transparent",
                                borderRadius: `${theme.customTokens.radius.md}px`,
                                "&::before": isItemActive
                                  ? {
                                      content: '""',
                                      position: "absolute",
                                      left: 0,
                                      top: 6,
                                      bottom: 6,
                                      width: theme.customTokens.navigation.indicatorWidth,
                                      borderRadius: `${theme.customTokens.radius.pill}px`,
                                      bgcolor:
                                        theme.customTokens.navigation.activeIndicator,
                                    }
                                  : {},
                                "&:hover": {
                                  bgcolor: isItemActive
                                    ? theme.customTokens.navigation.activeBackground
                                    : theme.customTokens.navigation.hoverBackground,
                                },
                                "&.Mui-selected": {
                                  bgcolor:
                                    theme.customTokens.navigation.activeBackground,
                                },
                                "&.Mui-selected:hover": {
                                  bgcolor:
                                    theme.customTokens.navigation.activeBackground,
                                },
                              }}
                            >
                              <Box
                                component="span"
                                sx={{
                                  minWidth: 16,
                                  textAlign: "center",
                                  color: isItemActive
                                    ? theme.customTokens.navigation.activeText
                                    : theme.customTokens.text.secondary,
                                  fontSize: "1rem",
                                  lineHeight: 1,
                                }}
                              >
                                {"\u2022"}
                              </Box>

                              <ListItemText
                                primary={item.label}
                                primaryTypographyProps={{
                                  variant: "body2",
                                  fontWeight: isItemActive ? 600 : 500,
                                  color: isItemActive
                                    ? theme.customTokens.navigation.activeText
                                    : theme.customTokens.navigation.inactiveText,
                                }}
                              />
                            </ListItemButton>
                          );
                        })}
                      </List>
                    </Collapse>
                  ) : null}
                </Box>
              );
            })}
          </List>
        </Stack>

        <Divider
          sx={{
            borderColor: "divider",
            flexShrink: 0,
          }}
        />

        <Box
          sx={{
            pt: 1,
            flexShrink: 0,
          }}
        >
          <Tooltip
            disableHoverListener={!collapsed}
            placement="right"
            title={collapsed ? userDisplayName : ""}
          >
            <Box
              component="button"
              onClick={(event) => setAccountMenuAnchorEl(event.currentTarget)}
              sx={{
                appearance: "none",
                width: "100%",
                border: 0,
                p: collapsed ? 0 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: collapsed ? "center" : "flex-start",
                gap: collapsed ? 0 : 1.25,
                borderRadius: `${theme.customTokens.radius.lg}px`,
                backgroundColor: isProfileRoute
                  ? theme.customTokens.navigation.activeBackground
                  : "transparent",
                color: theme.customTokens.navigation.inactiveText,
                cursor: "pointer",
                transition: theme.transitions.create("background-color", {
                  duration: theme.transitions.duration.shorter,
                }),
                "&:hover": {
                  backgroundColor: theme.customTokens.navigation.hoverBackground,
                },
              }}
              type="button"
            >
              <Avatar
                sx={{
                  width: collapsed ? 40 : 42,
                  height: collapsed ? 40 : 42,
                  bgcolor: theme.customTokens.brand.primary,
                  color: theme.customTokens.text.inverse,
                  fontSize: theme.typography.body2.fontSize,
                  fontWeight: 700,
                }}
              >
                {userInitials}
              </Avatar>

              {!collapsed ? (
                <Stack
                  sx={{
                    minWidth: 0,
                    alignItems: "flex-start",
                    gap: 0.125,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    color="text.primary"
                    sx={{
                      maxWidth: "100%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {userDisplayName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {currentUser.accountRole}
                  </Typography>
                </Stack>
              ) : null}
            </Box>
          </Tooltip>
        </Box>
      </Stack>

      <Menu
        anchorEl={accountMenuAnchorEl}
        open={Boolean(accountMenuAnchorEl)}
        onClose={handleAccountMenuClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "bottom", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              mt: theme.spacing(-1),
              minWidth: 240,
              border: `1px solid ${theme.customTokens.borders.default}`,
              borderRadius: `${theme.customTokens.radius.lg}px`,
              backgroundColor: theme.customTokens.surfaces.surface,
              boxShadow: theme.customTokens.elevation.sm,
              overflow: "hidden",
            },
          },
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.5,
          }}
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: theme.customTokens.brand.primary,
                color: theme.customTokens.text.inverse,
                fontSize: theme.typography.body2.fontSize,
                fontWeight: 700,
              }}
              >
                {userInitials}
              </Avatar>

              <Stack sx={{ minWidth: 0 }}>
              <Typography
                variant="subtitle2"
                color="text.primary"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {userDisplayName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {currentUser.accountRole}
              </Typography>
            </Stack>
          </Stack>
        </Box>

        <Divider sx={{ borderColor: "divider" }} />

        <MenuItem
          onClick={handleOpenProfile}
          sx={{
            minHeight: 42,
            gap: 1.25,
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 28,
              color: theme.customTokens.navigation.inactiveText,
            }}
          >
            <User size={16} />
          </ListItemIcon>
          <Typography variant="body2" color="text.primary">
            Profile
          </Typography>
        </MenuItem>

        <MenuItem
          onClick={handleLogout}
          sx={{
            minHeight: 42,
            gap: 1.25,
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 28,
              color: theme.customTokens.navigation.inactiveText,
            }}
          >
            <LogOut size={16} />
          </ListItemIcon>
          <Typography variant="body2" color="text.primary">
            Logout
          </Typography>
        </MenuItem>
      </Menu>
    </Drawer>
  );
}
