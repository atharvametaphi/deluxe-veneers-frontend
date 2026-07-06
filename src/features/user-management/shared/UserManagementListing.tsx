import { useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { ChevronDown, Eye, Pencil, Search } from "lucide-react";
import { Link as RouterLink, useNavigate } from "react-router";

import {
  type EnterpriseTableAction,
  EnterpriseDataTable,
} from "../../../components/data-display/EnterpriseDataTable";
import { ErpSelectField } from "../../../pages/ComponentLibrary/shared/ErpFieldControls";
import { getCompactFieldSx } from "../../../pages/ComponentLibrary/sections/inputs/components/inputFieldStyles";
import { formatMasterValue, MasterPageShell } from "../../masters/shared";
import {
  departmentOptions,
  getUserManagementSearchValues,
  getUserManagementPaths,
  userManagementColumns,
  userManagementRows,
} from "./userManagementConfig";

const statusOptions = ["Active", "Inactive"] as const;
const allDepartmentsOption = "All Departments";
const allStatusesOption = "All Statuses";

export function UserManagementListing() {
  const theme = useTheme();
  const navigate = useNavigate();
  const paths = getUserManagementPaths();
  const [searchValue, setSearchValue] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filteredRows = useMemo(() => {
    return userManagementRows.filter((row) => {
      const matchesSearch =
        searchValue.trim().length === 0 ||
        getUserManagementSearchValues(row).some((value) =>
          formatMasterValue(value)
            .toLowerCase()
            .includes(searchValue.trim().toLowerCase()),
        );

      const matchesDepartment =
        departmentFilter.length === 0 || row.department === departmentFilter;
      const matchesStatus =
        statusFilter.length === 0 || row.statusLabel === statusFilter;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [departmentFilter, searchValue, statusFilter]);

  const tableActions: readonly EnterpriseTableAction<
    (typeof userManagementRows)[number]
  >[] = [
    {
      id: "view",
      label: "View",
      icon: Eye,
      onSelect: (row) => navigate(paths.view(row.id)),
    },
    {
      id: "edit",
      label: "Edit",
      icon: Pencil,
      onSelect: (row) => navigate(paths.edit(row.id)),
    },
  ];

  return (
    <MasterPageShell
      breadcrumbs={[{ label: "User Management" }]}
      title="User Management"
    >
      <Accordion
        disableGutters
        sx={{
          border: `1px solid ${theme.customTokens.borders.default}`,
          borderRadius: `${theme.customTokens.radius.md}px !important`,
          boxShadow: "none",
          overflow: "hidden",
          "&::before": {
            display: "none",
          },
        }}
      >
        <AccordionSummary
          expandIcon={<ChevronDown size={16} />}
          sx={{
            px: theme.spacing(2),
            minHeight: theme.spacing(6),
            backgroundColor: theme.customTokens.surfaces.surface,
            "& .MuiAccordionSummary-content": {
              my: theme.spacing(1.25),
            },
          }}
        >
          <Typography variant="subtitle1" color="text.primary">
            Filters
          </Typography>
        </AccordionSummary>

        <AccordionDetails
          sx={{
            p: theme.spacing(2),
            borderTop: `1px solid ${theme.customTokens.borders.default}`,
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            useFlexGap
          >
            <Stack sx={{ width: { xs: "100%", md: 280 } }}>
              <ErpSelectField
                onChange={(value) =>
                  setDepartmentFilter(
                    value === allDepartmentsOption ? "" : value,
                  )
                }
                options={[allDepartmentsOption, ...departmentOptions]}
                placeholder="Filter by department"
                value={departmentFilter}
              />
            </Stack>

            <Stack sx={{ width: { xs: "100%", md: 220 } }}>
              <ErpSelectField
                onChange={(value) =>
                  setStatusFilter(value === allStatusesOption ? "" : value)
                }
                options={[allStatusesOption, ...statusOptions]}
                placeholder="Filter by status"
                value={statusFilter}
              />
            </Stack>
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
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
                  <Search size={16} />
                </InputAdornment>
              ),
            },
          }}
        />

        <Button
          component={RouterLink}
          to={paths.add}
          variant="contained"
        >
          Add User
        </Button>
      </Stack>

      <EnterpriseDataTable
        actionColumnLabel="Actions"
        actions={tableActions}
        columns={userManagementColumns}
        defaultRowsPerPage={10}
        initialSort={{ key: "updatedDate", direction: "desc" }}
        rows={filteredRows}
      />
    </MasterPageShell>
  );
}
