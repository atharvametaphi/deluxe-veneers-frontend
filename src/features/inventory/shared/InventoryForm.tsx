import { useEffect, useState } from "react";
import { Alert, Box, Button, Typography } from "@mui/material";
import { ChevronLeft, Pencil, Save } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router";

import {
  MasterFormFields,
  MasterSectionCard,
  hasRequiredFieldErrors,
  type MasterFieldDefinition,
  type MasterFieldValue,
} from "../../masters/shared";
import {
  canAccessPermission,
  getWarehousePermissionKey,
} from "../../permissions";
import { InventoryPageShell } from "./InventoryPageShell";
import {
  isWarehouseAAddStockSlug,
} from "./WarehouseAAddStockLineItems";
import { WarehouseAAddStockWorkspace } from "./WarehouseAAddStockWorkspace";
import {
  buildInventoryInitialValues,
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
  const permissionKey = getWarehousePermissionKey(activeWarehouse);
  const canCreate = canAccessPermission(permissionKey, "create");
  const canEdit = canAccessPermission(permissionKey, "edit");
  const canView = canAccessPermission(permissionKey, "view");
  const canUseMode =
    (mode === "add" && canCreate) ||
    (mode === "edit" && canEdit) ||
    (mode === "view" && canView);
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
  const warehouseAAddStockSlug =
    mode === "add" &&
    activeWarehouse === "warehouse-a" &&
    isWarehouseAAddStockSlug(definition.slug)
      ? definition.slug
      : null;

  const baseFields =
    mode === "add"
      ? definition.formFields
      : mode === "edit"
        ? definition.editFields ?? definition.viewFields
        : definition.viewFields;
  const fields = warehouseAAddStockSlug
    ? getWarehouseAAddStockFormFields(baseFields)
    : baseFields;

  const [values, setValues] = useState<Record<string, MasterFieldValue>>(() =>
    buildInventoryInitialValues(fields, row),
  );
  const [hasSubmitted, setHasSubmitted] = useState(false);

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

  if (!canUseMode) {
    return (
      <InventoryPageShell
        breadcrumbs={getInventoryBreadcrumbs({
          currentLabel: mode === "add" ? "Add" : mode === "edit" ? "Edit" : "View",
          definitionTitle: definition.title,
          inventoryBreadcrumbLabel,
          inventoryListPath,
          inventoryTitlePath,
          warehouseLabel,
          warehouseRootPath,
          warehouseType: activeWarehouse,
        })}
        title={getInventoryPageTitle(definition, mode)}
      >
        <Alert severity="warning">
          You do not have permission to {mode} this inventory record.
        </Alert>
      </InventoryPageShell>
    );
  }

  const primaryLabel = "Save";
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
  return (
    <InventoryPageShell
      breadcrumbs={warehouseInventoryBreadcrumbs}
      title={getInventoryPageTitle(definition, mode)}
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
            key={`${definition.slug}-${mode}-${row?.id ?? "new"}`}
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
            showRequiredErrors={
              mode === "add" && !warehouseAAddStockSlug && hasSubmitted
            }
            values={values}
          />

          {warehouseAAddStockSlug ? (
            <WarehouseAAddStockWorkspace slug={warehouseAAddStockSlug} />
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

                {row && canEdit ? (
                  <Button
                    variant="contained"
                    startIcon={<Pencil size={16} />}
                    onClick={() => navigate(paths.edit(row.id))}
                  >
                    Edit
                  </Button>
                ) : null}
              </>
            ) : (
              <>
                <Button variant="outlined" onClick={() => navigate(paths.list)}>
                  Cancel
                </Button>

                <Button
                  variant="contained"
                  startIcon={<Save size={16} />}
                  onClick={() => {
                    setHasSubmitted(true);
                    if (
                      mode === "add" &&
                      !warehouseAAddStockSlug &&
                      hasRequiredFieldErrors(fields, values)
                    ) {
                      return;
                    }
                    navigate(paths.list);
                  }}
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

function getWarehouseAAddStockFormFields(
  fields: readonly MasterFieldDefinition[],
) {
  return fields.map<MasterFieldDefinition>((field) => {
    if (field.key !== "inwardType" && field.key !== "shift") {
      return field;
    }

    const { options: _options, ...fieldWithoutOptions } = field;

    return {
      ...fieldWithoutOptions,
      placeholder:
        field.key === "inwardType" ? "Enter Inward Type" : "Enter Shift",
      type: "text",
    };
  });
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
