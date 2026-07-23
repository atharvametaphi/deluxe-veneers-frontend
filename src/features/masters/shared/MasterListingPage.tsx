import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  InputAdornment,
  Stack,
  TextField,
  useTheme,
} from "@mui/material";
import { Search } from "lucide-react";
import { Link as RouterLink } from "react-router";

import {
  canAccessAnyAction,
  canAccessPermission,
  getMasterPermissionKey,
} from "../../permissions";
import { MasterPageShell } from "./MasterPageShell";
import { MasterTable } from "./MasterTable";
import type { MasterDefinition } from "./types";
import { formatMasterValue, getMasterPaths } from "./utils";
import { getCompactFieldSx } from "../../../pages/ComponentLibrary/sections/inputs/components/inputFieldStyles";

interface MasterListingPageProps {
  definition: MasterDefinition;
}

export function MasterListingPage({ definition }: MasterListingPageProps) {
  const theme = useTheme();
  const paths = getMasterPaths(definition.slug);
  const permissionKey = getMasterPermissionKey(definition.slug);
  const canCreate = canAccessPermission(permissionKey, "create");
  const canEdit = canAccessPermission(permissionKey, "edit");
  const canView = canAccessPermission(permissionKey, "view");
  const canOpenPage = canAccessAnyAction(permissionKey);
  const [searchValue, setSearchValue] = useState("");

  const filteredRows = useMemo(() => {
    return definition.rows.filter((row) => {
      const matchesSearch =
        searchValue.trim().length === 0 ||
        Object.values(row).some((value) =>
          formatMasterValue(value)
            .toLowerCase()
            .includes(searchValue.trim().toLowerCase()),
        );

      return matchesSearch;
    });
  }, [definition.rows, searchValue]);

  const addButtonLabel = `Add ${definition.title.replace(/ Master$/, "")}`;

  return (
    <MasterPageShell
      breadcrumbs={[
        { label: "Masters", to: "/masters" },
        { label: definition.title },
      ]}
      title={definition.title}
    >
      {!canOpenPage ? (
        <Alert severity="warning">
          You do not have permission to access this master.
        </Alert>
      ) : null}

      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ xs: "stretch", md: "center" }}
        justifyContent="space-between"
        spacing={2}
      >
        <TextField
          placeholder="Search"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          sx={[
            getCompactFieldSx(theme),
            {
              width: { xs: "100%", md: 320 },
              maxWidth: "100%",
            },
          ]}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <Search
                    color={theme.customTokens.text.secondary}
                    size={16}
                  />
                </InputAdornment>
              ),
            },
          }}
        />

        {canCreate ? (
          <Button
            component={RouterLink}
            to={paths.add}
            variant="contained"
            sx={{ alignSelf: { xs: "flex-start", md: "center" } }}
          >
            {addButtonLabel}
          </Button>
        ) : null}
      </Stack>

      <Stack
        sx={(theme) => ({
          pt: theme.spacing(0.5),
        })}
      >
        <MasterTable
          canChangeStatus={canEdit}
          canEdit={canEdit}
          canView={canView}
          columns={definition.columns}
          getEditPath={paths.edit}
          getViewPath={paths.view}
          rows={canView ? filteredRows : []}
        />
      </Stack>
    </MasterPageShell>
  );
}
