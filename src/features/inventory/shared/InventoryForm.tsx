import { useEffect, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { ChevronLeft, Save } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router";

import {
  MasterFormFields,
  MasterSectionCard,
  type MasterFieldValue,
} from "../../masters/shared";
import { InventoryPageShell } from "./InventoryPageShell";
import {
  isWarehouseAAddStockSlug,
  WarehouseAAddStockLineItems,
} from "./WarehouseAAddStockLineItems";
import {
  buildInventoryInitialValues,
  getInventoryPageSubtitle,
  getInventoryPageTitle,
  getInventoryProcessTab,
  getInventoryPaths,
  getInventoryWarehouseContext,
  getWarehouseInventoryListPath,
  getWarehouseLabel,
  getWarehouseRootPath,
} from "./inventoryUtils";
import type { InventoryDefinition, InventoryPageMode, InventoryRecord } from "./types";

interface InventoryFormProps<Row extends InventoryRecord> {
  definition: InventoryDefinition<Row>;
  mode: Exclude<InventoryPageMode, "list">;
}

export function InventoryForm<Row extends InventoryRecord>({
  definition,
  mode,
}: InventoryFormProps<Row>) {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const activeWarehouse = getInventoryWarehouseContext(
    searchParams.get("warehouse"),
  );
  const activeProcessTab = getInventoryProcessTab(searchParams.get("tab"));
  const paths = getInventoryPaths(
    definition.slug,
    activeProcessTab,
    activeWarehouse,
  );
  const inventoryBreadcrumbLabel =
    activeProcessTab === "history" ? "History" : "Inventory";
  const warehouseLabel = getWarehouseLabel(activeWarehouse);
  const warehouseRootPath = getWarehouseRootPath(activeWarehouse);
  const inventoryListPath = getWarehouseInventoryListPath(
    activeWarehouse,
    definition.slug,
    activeProcessTab,
  );
  const inventoryTitlePath = getWarehouseInventoryListPath(
    activeWarehouse,
    definition.slug,
    "issued",
  );

  const row =
    mode === "add"
      ? undefined
      : definition.rows.find((record) => record.id === params.id);

  const fields = mode === "view" ? definition.viewFields : definition.formFields;

  const [values, setValues] = useState<Record<string, MasterFieldValue>>(() =>
    buildInventoryInitialValues(fields, row),
  );

  useEffect(() => {
    setValues(buildInventoryInitialValues(fields, row));
  }, [fields, row]);

  if ((mode === "edit" || mode === "view") && !row) {
    return (
      <InventoryPageShell
        breadcrumbs={getInventoryBreadcrumbs({
          currentLabel: "Not Found",
          definitionTitle: definition.title,
          inventoryBreadcrumbLabel,
          inventoryListPath,
          inventoryTitlePath,
          warehouseLabel,
          warehouseRootPath,
          warehouseType: activeWarehouse,
        })}
        title={definition.title}
      >
        <MasterSectionCard>
          <Typography variant="body2" color="text.secondary">
            The requested inventory record could not be found in the mock dataset.
          </Typography>
        </MasterSectionCard>
      </InventoryPageShell>
    );
  }

  const primaryLabel = mode === "add" ? "Save" : "Update";
  const warehouseInventoryBreadcrumbs = getInventoryBreadcrumbs({
    currentLabel: mode === "add" ? "Add" : mode === "edit" ? "Edit" : "View",
    definitionTitle: definition.title,
    inventoryBreadcrumbLabel,
    inventoryListPath,
    inventoryTitlePath,
    warehouseLabel,
    warehouseRootPath,
    warehouseType: activeWarehouse,
  });
  const warehouseAAddStockSlug =
    mode === "add" &&
    activeWarehouse === "warehouse-a" &&
    isWarehouseAAddStockSlug(definition.slug)
      ? definition.slug
      : null;
  const pageSubtitle =
    warehouseAAddStockSlug === null
      ? getInventoryPageSubtitle(definition, mode)
      : null;

  return (
    <InventoryPageShell
      breadcrumbs={warehouseInventoryBreadcrumbs}
      title={getInventoryPageTitle(definition, mode)}
      {...(pageSubtitle ? { subtitle: pageSubtitle } : {})}
    >
      <MasterSectionCard>
        <Box
          sx={(theme) => ({
            display: "flex",
            flexDirection: "column",
            gap: theme.spacing(3),
          })}
        >
          <MasterFormFields
            definition={{
              gridColumns: 4,
              fields,
            }}
            onChange={(key, value) =>
              setValues((current) => ({
                ...current,
                [key]: value,
              }))
            }
            readOnly={mode === "view"}
            values={values}
          />

          {warehouseAAddStockSlug ? (
            <WarehouseAAddStockLineItems slug={warehouseAAddStockSlug} />
          ) : null}

          <Box
            sx={(theme) => ({
              display: "flex",
              justifyContent: "center",
              gap: theme.spacing(1.5),
              flexWrap: "wrap",
            })}
          >
            {mode === "view" ? (
              <>
                <Button
                  variant="outlined"
                  startIcon={<ChevronLeft size={16} />}
                  onClick={() => navigate(paths.list)}
                >
                  Back
                </Button>
              </>
            ) : (
              <>
                <Button variant="outlined" onClick={() => navigate(paths.list)}>
                  Cancel
                </Button>

                <Button
                  variant="contained"
                  startIcon={<Save size={16} />}
                  onClick={() => navigate(paths.list)}
                >
                  {primaryLabel}
                </Button>
              </>
            )}
          </Box>
        </Box>
      </MasterSectionCard>
    </InventoryPageShell>
  );
}

function getInventoryBreadcrumbs({
  currentLabel,
  definitionTitle,
  inventoryBreadcrumbLabel,
  inventoryListPath,
  inventoryTitlePath,
  warehouseLabel,
  warehouseRootPath,
  warehouseType,
}: {
  currentLabel: string;
  definitionTitle: string;
  inventoryBreadcrumbLabel: string;
  inventoryListPath: string;
  inventoryTitlePath: string;
  warehouseLabel: string;
  warehouseRootPath: string;
  warehouseType: "warehouse-a" | "warehouse-b" | "warehouse-c";
}) {
  if (warehouseType === "warehouse-b") {
    return [
      { label: warehouseLabel, to: warehouseRootPath },
      {
        label: definitionTitle,
        to: inventoryTitlePath,
      },
      { label: inventoryBreadcrumbLabel, to: inventoryListPath },
      { label: currentLabel },
    ];
  }

  return [
    { label: warehouseLabel, to: warehouseRootPath },
    { label: definitionTitle, to: inventoryListPath },
    { label: currentLabel },
  ];
}
