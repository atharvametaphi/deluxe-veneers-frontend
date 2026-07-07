import { useMemo, useState } from "react";
import { InputAdornment, Stack, TextField, useTheme } from "@mui/material";
import { Eye, Pencil, Plus } from "lucide-react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router";

import { ModuleProcessTabs } from "../../../components/navigation/ModuleProcessTabs";
import {
  EnterpriseDataTable,
  type EnterpriseTableAction,
} from "../../../components/data-display/EnterpriseDataTable";
import { getCompactFieldSx } from "../../../pages/ComponentLibrary/sections/inputs/components/inputFieldStyles";
import { FactoryPageShell } from "./FactoryPageShell";
import { FactoryToolbar } from "./FactoryToolbar";
import {
  getFactoryPaths,
  getFactoryProcessTabs,
  getFactoryRowsForTab,
  type FactoryProcessTab,
} from "./factoryUtils";
import type { FactoryDefinition, FactoryRecord } from "./types";

interface FactoryListingProps<Row extends FactoryRecord> {
  definition: FactoryDefinition<Row>;
}

export function FactoryListing<Row extends FactoryRecord>({
  definition,
}: FactoryListingProps<Row>) {
  const theme = useTheme();
  const navigate = useNavigate();
  const paths = getFactoryPaths(definition.slug);
  const [activeTab, setActiveTab] = useState<FactoryProcessTab>("issued");
  const [searchValue, setSearchValue] = useState("");
  const tabs = useMemo(
    () => getFactoryProcessTabs(definition.title),
    [definition.title],
  );
  const tabRows = useMemo(
    () => getFactoryRowsForTab(definition.rows, activeTab),
    [activeTab, definition.rows],
  );
  const filteredRows = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    if (!normalizedSearch) {
      return tabRows;
    }

    return tabRows.filter((row) =>
      Object.values(row).some((value) =>
        formatFactorySearchValue(value).includes(normalizedSearch),
      ),
    );
  }, [searchValue, tabRows]);

  const rowActions = useMemo<ReadonlyArray<EnterpriseTableAction<Row>>>(
    () => {
      const baseActions: EnterpriseTableAction<Row>[] = [
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

      if (activeTab === "issued") {
        baseActions.unshift({
          id: "create-process",
          label: `Create ${definition.title}`,
          icon: Plus,
          onSelect: (row) => navigate(paths.add, { state: { sourceRow: row } }),
        });
      }

      return baseActions;
    },
    [activeTab, definition.title, navigate, paths],
  );

  const getRowActions = useMemo<
    ((row: Row) => readonly EnterpriseTableAction<Row>[]) | undefined
  >(() => {
    if (activeTab !== "done") {
      return undefined;
    }

    return (row) => {
      const nextProcessAction = getFactoryNextProcessAction(row, navigate);

      if (!nextProcessAction) {
        return rowActions;
      }

      return [...rowActions, nextProcessAction];
    };
  }, [activeTab, navigate, rowActions]);

  return (
    <FactoryPageShell
      breadcrumbs={[
        { label: "Factory", to: "/factory" },
        { label: definition.title },
      ]}
      processTabs={
        <ModuleProcessTabs
          onChange={setActiveTab}
          tabs={tabs}
          value={activeTab}
        />
      }
      title={definition.title}
    >
      <Stack
        sx={(currentTheme) => ({
          gap: currentTheme.spacing(2),
        })}
      >
        <Stack
          direction={{ xs: "column", lg: "row" }}
          alignItems={{ xs: "stretch", lg: "center" }}
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
          <FactoryToolbar />
        </Stack>

        <EnterpriseDataTable
          key={`${definition.slug}-${activeTab}`}
          actions={rowActions}
          columns={definition.listColumns}
          defaultRowsPerPage={10}
          rows={filteredRows}
          {...(getRowActions ? { getRowActions } : {})}
          {...(definition.initialSort
            ? { initialSort: definition.initialSort }
            : {})}
        />
      </Stack>
    </FactoryPageShell>
  );
}

function formatFactorySearchValue(value: RowValue) {
  if (value instanceof Date) {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
      .format(value)
      .toLowerCase();
  }

  if (value === null || typeof value === "undefined") {
    return "";
  }

  return String(value).toLowerCase();
}

type RowValue = RowLike[string];

interface RowLike {
  [key: string]: unknown;
}

function getFactoryNextProcessAction<Row extends FactoryRecord>(
  row: Row,
  navigate: ReturnType<typeof useNavigate>,
): EnterpriseTableAction<Row> | null {
  const issuedFor = typeof row.issuedFor === "string" ? row.issuedFor.trim() : "";
  const nextPath = factoryNextProcessRouteMap[issuedFor];

  if (!issuedFor || !nextPath) {
    return null;
  }

  return {
    id: `issue-for-${issuedFor.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    label: `Issue for ${issuedFor}`,
    onSelect: () => navigate(nextPath),
  };
}

const factoryNextProcessRouteMap: Record<string, string> = {
  "CNC / Fluting": "/factory/cnc-fluting",
  Dispatch: "/dispatch",
  Drying: "/factory/drying",
  Embossing: "/factory/embossing",
  "Export / OEM": "/factory/export-oem",
  Finishing: "/factory/finishing",
  Grouping: "/factory/grouping",
  Inspection: "/qc/pending",
  Marquetry: "/factory/marquetry",
  Packing: "/packing",
  Pressing: "/factory/pressing",
  "Sample Sheets": "/factory/sample-sheets",
  Splicing: "/factory/splicing",
};
