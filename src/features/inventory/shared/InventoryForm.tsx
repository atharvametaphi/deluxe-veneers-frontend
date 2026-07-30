import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  Alert,
  Box,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { ChevronLeft, Pencil, Save } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router";

import { ModuleProcessTabs } from "../../../components/navigation/ModuleProcessTabs";
import { ErpSelectField } from "../../../pages/ComponentLibrary/shared/ErpFieldControls";
import {
  MasterFormFields,
  MasterSectionCard,
  hasFormFieldErrors,
  type MasterFieldDefinition,
  type MasterFieldValue,
} from "../../masters/shared";
import {
  canAccessPermission,
  getWarehousePermissionKey,
} from "../../permissions";
import {
  recordFormActionButtonSx,
  recordViewActionButtonSx,
} from "../../shared/buttonStyles";
import {
  warehouseAInventoryConfigs,
  warehouseBInventoryConfigs,
  warehouseBRawVeneerTabConfigs,
  warehouseCInventoryConfigs,
  warehouseRawVeneerTabConfigs,
  type WarehouseAInventorySlug,
  type WarehouseCInventorySlug,
  type WarehouseInventorySlug,
} from "../../warehouses/shared/warehouseTableData";
import { InventoryPageShell } from "./InventoryPageShell";
import {
  isWarehouseAAddStockSlug,
} from "./WarehouseAAddStockLineItems";
import {
  WarehouseAAddStockWorkspace,
  type WarehouseAAddStockWorkspaceHandle,
} from "./WarehouseAAddStockWorkspace";
import {
  buildInventoryInitialValues,
  getInventoryPageTitle,
  getInventoryProcessTab,
  getInventoryPaths,
  getInventoryWarehouseContext,
  getWarehouseInventoryListPath,
  getWarehouseLabel,
  getWarehouseRootPath,
  type InventoryWarehouseContext,
} from "./inventoryUtils";
import type { InventoryDefinition, InventoryPageMode, InventoryRecord } from "./types";

interface InventoryFormProps<Row extends InventoryRecord> {
  definition: InventoryDefinition<Row>;
  mode: Exclude<InventoryPageMode, "list">;
}

type InventoryRecordDetailTab = "item-details" | "invoice-details";

const warehouseARecordDetailTabs = [
  { label: "Item Details", value: "item-details" },
  { label: "Invoice Details", value: "invoice-details" },
] as const satisfies readonly {
  label: string;
  value: InventoryRecordDetailTab;
}[];

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
  const warehouseLabel = getWarehouseLabel(activeWarehouse);
  const warehouseRootPath = getWarehouseRootPath(activeWarehouse);
  const inventoryListPath = getWarehouseInventoryListPath(
    activeWarehouse,
    definition.slug,
    activeProcessTab,
  );
  const inventoryRows = getInventoryContextRows(definition, activeWarehouse);

  const row =
    mode === "add"
      ? undefined
      : findInventoryContextRow(inventoryRows, params.id);
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
  const shouldSplitInventoryDetails = mode === "view" || mode === "edit";
  const viewFieldGroups = shouldSplitInventoryDetails
    ? getInventoryViewFieldGroups(fields)
    : null;
  const warehouseAInvoiceFields =
    shouldSplitInventoryDetails && activeWarehouse === "warehouse-a"
      ? getWarehouseAInvoiceDetailFields(fields)
      : [];

  const [values, setValues] = useState<Record<string, MasterFieldValue>>(() =>
    buildInventoryInitialValues(fields, row),
  );
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const warehouseAWorkspaceRef = useRef<WarehouseAAddStockWorkspaceHandle>(null);

  useEffect(() => {
    setValues(buildInventoryInitialValues(fields, row));
  }, [fields, row]);

  if ((mode === "edit" || mode === "view") && !row) {
    return (
      <InventoryPageShell
        breadcrumbs={getInventoryBreadcrumbs({
          currentLabel: "Not Found",
          definitionTitle: definition.title,
          inventoryListPath,
          warehouseLabel,
          warehouseRootPath,
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
          currentLabel: mode === "add" ? "Add Stock" : mode === "edit" ? "Edit" : "View",
          definitionTitle: definition.title,
          inventoryListPath,
          warehouseLabel,
          warehouseRootPath,
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
    currentLabel: mode === "add" ? "Add Stock" : mode === "edit" ? "Edit" : "View",
    definitionTitle: definition.title,
    inventoryListPath,
    warehouseLabel,
    warehouseRootPath,
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
          {shouldSplitInventoryDetails && viewFieldGroups ? (
            <Stack sx={(theme) => ({ gap: theme.spacing(3) })}>
              <MasterFormFields
                key={`${definition.slug}-${mode}-${row?.id ?? "new"}-common`}
                definition={{
                  gridColumns: 4,
                  fields: viewFieldGroups.commonFields,
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

              {activeWarehouse === "warehouse-a" &&
              warehouseAInvoiceFields.length > 0 ? (
                <WarehouseARecordDetailTabs
                  invoiceDetails={
                    <WarehouseAInvoiceDetails
                      fields={warehouseAInvoiceFields}
                      onChange={(key, value) =>
                        setValues((current) => ({
                          ...current,
                          [key]: value,
                        }))
                      }
                      readOnly={mode === "view"}
                      showTitle={false}
                      values={values}
                    />
                  }
                  itemDetails={
                    <InventoryItemDetailsTable
                      fields={viewFieldGroups.itemFields}
                      onChange={(key, value) =>
                        setValues((current) => ({
                          ...current,
                          [key]: value,
                        }))
                      }
                      readOnly={mode === "view"}
                      values={values}
                    />
                  }
                />
              ) : (
                <InventoryItemDetailsTable
                  fields={viewFieldGroups.itemFields}
                  onChange={(key, value) =>
                    setValues((current) => ({
                      ...current,
                      [key]: value,
                    }))
                  }
                  readOnly={mode === "view"}
                  values={values}
                />
              )}
            </Stack>
          ) : (
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
                mode !== "view" && hasSubmitted
              }
              values={values}
            />
          )}

          {warehouseAAddStockSlug ? (
            <WarehouseAAddStockWorkspace
              ref={warehouseAWorkspaceRef}
              slug={warehouseAAddStockSlug}
            />
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
                  sx={recordViewActionButtonSx}
                >
                  Back
                </Button>

                {row && canEdit ? (
                  <Button
                    variant="contained"
                    startIcon={<Pencil size={16} />}
                    onClick={() => navigate(paths.edit(row.id))}
                    sx={recordViewActionButtonSx}
                  >
                    Edit
                  </Button>
                ) : null}
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => navigate(paths.list)}
                  sx={recordFormActionButtonSx}
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  variant="contained"
                  startIcon={<Save size={16} />}
                  sx={recordFormActionButtonSx}
                  onClick={() => {
                    setHasSubmitted(true);

                    const workspaceIsValid =
                      warehouseAAddStockSlug
                        ? warehouseAWorkspaceRef.current?.validate() ?? true
                        : true;

                    if (
                      hasFormFieldErrors(fields, values) ||
                      !workspaceIsValid
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

const inventoryItemDetailFieldKeys = new Set([
  "amount",
  "availableNoOfSheets",
  "availableQuantity",
  "availableSqf",
  "availableSqm",
  "availableUnits",
  "avSheets",
  "avSqf",
  "avSqm",
  "bundleNumber",
  "category",
  "color",
  "consumables",
  "cutName",
  "expenseAmount",
  "grade",
  "itemName",
  "itemSrNo",
  "length",
  "logCode",
  "mdfSrNo",
  "mdfType",
  "noOfLeaves",
  "noOfLeavesSheets",
  "palletNo",
  "palletNumber",
  "plywoodType",
  "processColor",
  "processName",
  "quantity",
  "referenceSrNo",
  "remark",
  "seriesName",
  "subCategory",
  "supplierItemName",
  "thickness",
  "timberCode",
  "timberColor",
  "totalNoOfSheets",
  "totalSqf",
  "totalSqm",
  "totalUnits",
  "unitName",
  "veneerSrNo",
  "width",
]);

const warehouseAInvoiceDetailFieldKeys = new Set([
  "additionalCharges",
  "amount",
  "currency",
  "expenseAmount",
  "inwardDate",
  "invoiceNo",
  "remark",
]);

const warehouseAAdditionalChargesField: MasterFieldDefinition = {
  key: "additionalCharges",
  label: "Additional Charges",
  placeholder: "Enter Additional Charges",
  type: "text",
};

function getInventoryViewFieldGroups(
  fields: readonly MasterFieldDefinition[],
) {
  const commonFields = fields.filter(
    (field) => !inventoryItemDetailFieldKeys.has(field.key),
  );
  const itemFields = fields.filter((field) =>
    inventoryItemDetailFieldKeys.has(field.key),
  );

  return {
    commonFields: commonFields.length > 0 ? commonFields : fields,
    itemFields,
  };
}

function getWarehouseAInvoiceDetailFields(
  fields: readonly MasterFieldDefinition[],
) {
  const invoiceFields = fields.filter((field) =>
    warehouseAInvoiceDetailFieldKeys.has(field.key),
  );

  if (invoiceFields.some((field) => field.key === "additionalCharges")) {
    return invoiceFields;
  }

  const remarkIndex = invoiceFields.findIndex((field) => field.key === "remark");
  const nextFields = [...invoiceFields];

  if (remarkIndex >= 0) {
    nextFields.splice(remarkIndex, 0, warehouseAAdditionalChargesField);
    return nextFields;
  }

  return [...nextFields, warehouseAAdditionalChargesField];
}

function WarehouseARecordDetailTabs({
  invoiceDetails,
  itemDetails,
}: {
  invoiceDetails: ReactNode;
  itemDetails: ReactNode;
}) {
  const [activeTab, setActiveTab] =
    useState<InventoryRecordDetailTab>("item-details");

  return (
    <Stack sx={(theme) => ({ gap: theme.spacing(2) })}>
      <ModuleProcessTabs
        onChange={setActiveTab}
        tabs={warehouseARecordDetailTabs}
        value={activeTab}
      />

      <Box sx={{ display: activeTab === "item-details" ? "block" : "none" }}>
        {itemDetails}
      </Box>

      <Box sx={{ display: activeTab === "invoice-details" ? "block" : "none" }}>
        {invoiceDetails}
      </Box>
    </Stack>
  );
}

function WarehouseAInvoiceDetails({
  fields,
  onChange,
  readOnly,
  showTitle = true,
  values,
}: {
  fields: readonly MasterFieldDefinition[];
  onChange: (key: string, value: MasterFieldValue) => void;
  readOnly: boolean;
  showTitle?: boolean;
  values: Record<string, MasterFieldValue>;
}) {
  if (fields.length === 0) {
    return null;
  }

  return (
    <Box>
      <MasterFormFields
        definition={{
          gridColumns: 4,
          fields,
        }}
        onChange={onChange}
        readOnly={readOnly}
        values={values}
      />
    </Box>
  );
}

function InventoryItemDetailsTable({
  fields,
  onChange,
  readOnly,
  showTitle = true,
  values,
}: {
  fields: readonly MasterFieldDefinition[];
  onChange: (key: string, value: MasterFieldValue) => void;
  readOnly: boolean;
  showTitle?: boolean;
  values: Record<string, MasterFieldValue>;
}) {
  if (fields.length === 0) {
    return null;
  }

  return (
    <Box>
      {showTitle ? (
        <Typography
          variant="subtitle1"
          sx={(theme) => ({
            mb: theme.spacing(2),
            fontWeight: 700,
          })}
        >
          Item Details
        </Typography>
      ) : null}

      <Box
        sx={(theme) => ({
          border: `1px solid ${theme.customTokens.borders.default}`,
          borderRadius: `${theme.customTokens.radius.md}px`,
          overflow: "hidden",
        })}
      >
        <Box
          sx={(theme) => ({
            overflowX: "auto",
            scrollbarColor: `${theme.palette.primary.main} ${theme.customTokens.surfaces.alt}`,
            scrollbarWidth: "thin",
            "&::-webkit-scrollbar": {
              height: 8,
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: theme.customTokens.surfaces.alt,
              borderRadius: theme.customTokens.radius.pill,
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: theme.palette.primary.main,
              borderRadius: theme.customTokens.radius.pill,
            },
            "&::-webkit-scrollbar-thumb:hover": {
              backgroundColor: theme.palette.primary.dark,
            },
          })}
        >
          <Table
            size="small"
            sx={{
              minWidth: Math.max(fields.length * 150, 720),
              tableLayout: "auto",
            }}
          >
            <TableHead>
              <TableRow>
                {fields.map((field) => (
                  <TableCell
                    key={field.key}
                    sx={(theme) => ({
                      backgroundColor: theme.palette.primary.main,
                      borderRight: `1px solid ${theme.palette.primary.dark}`,
                      color: theme.palette.primary.contrastText,
                      fontSize: theme.typography.caption.fontSize,
                      fontWeight: 700,
                      px: theme.spacing(1.5),
                      py: theme.spacing(1),
                      whiteSpace: "nowrap",
                      "&:last-of-type": {
                        borderRight: 0,
                      },
                    })}
                  >
                    {field.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              <TableRow>
                {fields.map((field) => (
                  <TableCell
                    key={field.key}
                    sx={(theme) => ({
                      borderRight: `1px solid ${theme.customTokens.borders.default}`,
                      color: theme.palette.text.primary,
                      fontSize: theme.typography.body2.fontSize,
                      px: theme.spacing(1.5),
                      py: theme.spacing(1.25),
                      whiteSpace: "nowrap",
                      "&:last-of-type": {
                        borderRight: 0,
                      },
                    })}
                  >
                    {readOnly || field.readOnly ? (
                      formatInventoryViewValue(values[field.key])
                    ) : (
                      <InventoryItemDetailsInput
                        field={field}
                        onChange={(value) => onChange(field.key, value)}
                        value={values[field.key]}
                      />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </Box>
      </Box>
    </Box>
  );
}

function InventoryItemDetailsInput({
  field,
  onChange,
  value,
}: {
  field: MasterFieldDefinition;
  onChange: (value: MasterFieldValue) => void;
  value: MasterFieldValue | undefined;
}) {
  const fieldValue = getInventoryInputValue(value);

  if (field.type === "select" && field.options && field.options.length > 0) {
    return (
      <ErpSelectField
        value={fieldValue}
        onChange={onChange}
        options={field.options}
        size="dense"
      />
    );
  }

  return (
    <TextField
      fullWidth
      multiline={field.type === "textarea"}
      size="small"
      value={fieldValue}
      onChange={(event) => onChange(event.target.value)}
      sx={inventoryItemDetailsInputSx}
    />
  );
}

function getInventoryInputValue(value: MasterFieldValue | undefined) {
  if (typeof value === "string") {
    return value;
  }

  if (value instanceof Date) {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(value);
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return "";
}

const inventoryItemDetailsInputSx = (theme: Theme) => ({
  minWidth: 150,
  "& .MuiInputBase-root": {
    minHeight: 34,
    borderRadius: `${theme.customTokens.radius.sm}px`,
    fontSize: theme.typography.caption.fontSize,
  },
  "& .MuiInputBase-input": {
    px: theme.spacing(1),
    py: theme.spacing(0.75),
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.customTokens.borders.default,
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.primary.main,
  },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.primary.main,
  },
});

function formatInventoryViewValue(value: MasterFieldValue | undefined) {
  if (value instanceof Date) {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(value);
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "object" && value !== null && "name" in value) {
    return value.name || "-";
  }

  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }

  return "-";
}

function getInventoryBreadcrumbs({
  currentLabel,
  definitionTitle,
  inventoryListPath,
  warehouseLabel,
  warehouseRootPath,
}: {
  currentLabel: string;
  definitionTitle: string;
  inventoryListPath: string;
  warehouseLabel: string;
  warehouseRootPath: string;
}) {
  return [
    { label: warehouseLabel, to: warehouseRootPath },
    { label: definitionTitle, to: inventoryListPath },
    { label: currentLabel },
  ];
}

function getInventoryContextRows<Row extends InventoryRecord>(
  definition: InventoryDefinition<Row>,
  warehouse: InventoryWarehouseContext,
): readonly InventoryRecord[] {
  const rows: InventoryRecord[] = [...definition.rows];
  const pushRows = (sourceRows?: readonly InventoryRecord[]) => {
    if (!sourceRows) {
      return;
    }

    rows.push(...sourceRows);
  };

  if (warehouse === "warehouse-a" && definition.slug in warehouseAInventoryConfigs) {
    pushRows(
      warehouseAInventoryConfigs[definition.slug as WarehouseAInventorySlug].rows,
    );
  }

  if (warehouse === "warehouse-b") {
    if (definition.slug in warehouseBInventoryConfigs) {
      pushRows(
        warehouseBInventoryConfigs[definition.slug as WarehouseInventorySlug].rows,
      );
    }

    if (definition.slug in warehouseAInventoryConfigs) {
      pushRows(
        warehouseAInventoryConfigs[definition.slug as WarehouseAInventorySlug].rows,
      );
    }

    if (definition.slug === "raw-veneer") {
      Object.values(warehouseBRawVeneerTabConfigs).forEach((config) =>
        pushRows(config.rows),
      );
      Object.values(warehouseRawVeneerTabConfigs).forEach((config) =>
        pushRows(config.rows),
      );
    }
  }

  if (warehouse === "warehouse-c" && definition.slug in warehouseCInventoryConfigs) {
    pushRows(
      warehouseCInventoryConfigs[definition.slug as WarehouseCInventorySlug].rows,
    );
  }

  return Array.from(new Map(rows.map((row) => [row.id, row])).values());
}

function findInventoryContextRow(
  rows: readonly InventoryRecord[],
  recordId: string | undefined,
) {
  if (!recordId) {
    return undefined;
  }

  return rows.find((row) => {
    if (row.id === recordId) {
      return true;
    }

    const inventoryRecordId = row["inventoryRecordId"];

    if (typeof inventoryRecordId !== "string") {
      return false;
    }

    return (
      inventoryRecordId === recordId ||
      inventoryRecordId.replace(/-production$/, "") === recordId
    );
  });
}
