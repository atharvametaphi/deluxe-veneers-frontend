import { useEffect, useMemo, useState } from "react";
import { Avatar, Box, Button, Stack, Typography } from "@mui/material";
import { Save } from "lucide-react";
import { useNavigate } from "react-router";

import {
  getCurrentUser,
  getUserDisplayName,
  getUserInitials,
  saveCurrentUser,
  type AuthenticatedUserProfile,
} from "../../auth";
import {
  MasterFormFields,
  MasterPageShell,
  MasterSectionCard,
  type MasterFieldDefinition,
  type MasterFieldValue,
} from "../../masters/shared";
import { userManagementFormFields } from "../../user-management/shared";

export function ProfilePage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<AuthenticatedUserProfile>(() =>
    getCurrentUser(),
  );
  const [values, setValues] = useState<Record<string, MasterFieldValue>>(() =>
    buildProfileInitialValues(currentUser),
  );

  useEffect(() => {
    setValues(buildProfileInitialValues(currentUser));
  }, [currentUser]);

  const displayName = useMemo(() => getUserDisplayName(currentUser), [currentUser]);
  const initials = useMemo(() => getUserInitials(displayName), [displayName]);

  const handleCancel = () => {
    const persistedUser = getCurrentUser();
    setCurrentUser(persistedUser);
    setValues(buildProfileInitialValues(persistedUser));
    closeProfilePage(navigate);
  };

  const handleSave = () => {
    const nextUser = buildProfileFromValues(values, currentUser);
    saveCurrentUser(nextUser);
    setCurrentUser(nextUser);
    setValues(buildProfileInitialValues(nextUser));
    closeProfilePage(navigate);
  };

  return (
    <MasterPageShell breadcrumbs={[{ label: "Profile" }]} title="Profile">
      <MasterSectionCard>
        <Stack
          sx={(theme) => ({
            gap: theme.spacing(3),
          })}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={3}
            alignItems={{ xs: "flex-start", md: "center" }}
            sx={(theme) => ({
              pb: theme.spacing(3),
              borderBottom: `1px solid ${theme.customTokens.borders.divider}`,
            })}
          >
            <Avatar
              sx={(theme) => ({
                width: 72,
                height: 72,
                bgcolor: theme.customTokens.brand.primary,
                color: theme.customTokens.text.inverse,
                fontSize: theme.typography.h3.fontSize,
                fontWeight: 700,
              })}
            >
              {initials}
            </Avatar>

            <Stack spacing={0.5}>
              <Typography variant="h3" color="text.primary">
                {displayName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {currentUser.accountRole}
              </Typography>
            </Stack>
          </Stack>

          <MasterFormFields
            definition={{
              fields: userManagementFormFields as MasterFieldDefinition[],
              gridColumns: 4,
            }}
            onChange={(key, value) =>
              setValues((current) => ({
                ...current,
                [key]: value,
              }))
            }
            values={values}
          />

          <Box
            sx={(theme) => ({
              display: "flex",
              justifyContent: "center",
              gap: theme.spacing(1.5),
              flexWrap: "wrap",
            })}
          >
            <Button onClick={handleCancel} variant="outlined">
              Cancel
            </Button>

            <Button
              onClick={handleSave}
              startIcon={<Save size={16} />}
              variant="contained"
            >
              Save
            </Button>
          </Box>
        </Stack>
      </MasterSectionCard>
    </MasterPageShell>
  );
}

function buildProfileInitialValues(user: AuthenticatedUserProfile) {
  return userManagementFormFields.reduce<Record<string, MasterFieldValue>>(
    (accumulator, field) => {
      const value = user[field.key as keyof AuthenticatedUserProfile];

      if (field.type === "date") {
        accumulator[field.key] = value instanceof Date ? value : null;
        return accumulator;
      }

      accumulator[field.key] = typeof value === "string" ? value : "";
      return accumulator;
    },
    {},
  );
}

function buildProfileFromValues(
  values: Record<string, MasterFieldValue>,
  currentUser: AuthenticatedUserProfile,
): AuthenticatedUserProfile {
  return {
    accountRole: currentUser.accountRole,
    address: getStringValue(values.address),
    age: getStringValue(values.age),
    approver: getStringValue(values.approver),
    bloodGroup: getStringValue(values.bloodGroup),
    city: getStringValue(values.city),
    country: getStringValue(values.country),
    dateOfBirth: values.dateOfBirth instanceof Date ? values.dateOfBirth : null,
    department: getStringValue(values.department),
    email: getStringValue(values.email),
    firstName: getStringValue(values.firstName),
    gender: getStringValue(values.gender),
    id: currentUser.id,
    lastName: getStringValue(values.lastName),
    phoneNo: getStringValue(values.phoneNo),
    pincode: getStringValue(values.pincode),
    permissions: currentUser.permissions,
    remarks: getStringValue(values.remarks),
    role: getStringValue(values.role),
    state: getStringValue(values.state),
    userName: getStringValue(values.userName),
    userType: getStringValue(values.userType),
  };
}

function getStringValue(value: MasterFieldValue | undefined) {
  return typeof value === "string" ? value : "";
}

function closeProfilePage(navigate: ReturnType<typeof useNavigate>) {
  if (typeof window !== "undefined" && window.history.length > 1) {
    navigate(-1);
    return;
  }

  navigate("/dashboard");
}
