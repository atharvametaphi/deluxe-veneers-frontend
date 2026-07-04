import { Checkbox, Stack, Typography, useTheme } from "@mui/material";
import { Box } from "@mui/system";

import {
  type UserPermissionAction,
  type UserPermissionFlags,
  userPermissionSections,
} from "./userManagementConfig";

interface UserPermissionMatrixProps {
  onToggle: (
    itemKey: string,
    action: UserPermissionAction,
    checked: boolean,
  ) => void;
  permissions: Record<string, UserPermissionFlags>;
  readOnly?: boolean;
}

const permissionActions: readonly UserPermissionAction[] = [
  "view",
  "edit",
  "create",
];

export function UserPermissionMatrix({
  onToggle,
  permissions,
  readOnly = false,
}: UserPermissionMatrixProps) {
  const theme = useTheme();

  return (
    <Stack
      sx={(currentTheme) => ({
        gap: currentTheme.spacing(2),
      })}
    >
      <Typography variant="h4" color="text.primary">
        Access Configuration
      </Typography>

      <Box
        sx={{
          border: `1px solid ${theme.customTokens.borders.default}`,
          borderRadius: `${theme.customTokens.radius.md}px`,
          overflow: "hidden",
          backgroundColor: theme.customTokens.surfaces.surface,
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "minmax(220px, 1fr) repeat(3, 92px)",
            alignItems: "center",
            px: theme.spacing(2),
            py: theme.spacing(1.25),
            borderBottom: `1px solid ${theme.customTokens.borders.default}`,
            backgroundColor: theme.customTokens.surfaces.alt,
            overflowX: "auto",
          }}
        >
          <Typography variant="subtitle2" color="text.secondary">
            Module
          </Typography>

          {permissionActions.map((action) => (
            <Typography
              key={action}
              variant="subtitle2"
              color="text.secondary"
              sx={{ textAlign: "center", textTransform: "capitalize" }}
            >
              {action}
            </Typography>
          ))}
        </Box>

        {userPermissionSections.map((section) => (
          <Box key={section.id}>
            <Box
              sx={{
                px: theme.spacing(2),
                py: theme.spacing(0.875),
                backgroundColor: theme.customTokens.navigation.hoverBackground,
                borderTop: `1px solid ${theme.customTokens.borders.default}`,
              }}
            >
              <Typography
                variant="caption"
                color={theme.customTokens.navigation.activeText}
                sx={{
                  display: "block",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {section.label}
              </Typography>
            </Box>

            {section.items.map((item) => (
              <Box
                key={item.key}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "minmax(220px, 1fr) repeat(3, 92px)",
                  alignItems: "center",
                  px: theme.spacing(2),
                  py: theme.spacing(0.5),
                  borderTop: `1px solid ${theme.customTokens.borders.default}`,
                  overflowX: "auto",
                }}
              >
                <Typography variant="body2" color="text.primary">
                  {item.label}
                </Typography>

                {permissionActions.map((action) => (
                  <Box
                    key={action}
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <Checkbox
                      checked={permissions[item.key]?.[action] ?? false}
                      disabled={readOnly}
                      onChange={(event) =>
                        onToggle(item.key, action, event.target.checked)
                      }
                      sx={{
                        color: theme.customTokens.borders.strong,
                        "&.Mui-checked": {
                          color: theme.customTokens.brand.primary,
                        },
                        "&.MuiCheckbox-indeterminate": {
                          color: theme.customTokens.brand.primary,
                        },
                      }}
                    />
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    </Stack>
  );
}
