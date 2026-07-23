import { useEffect, useRef, useState } from "react";
import { Eye, X } from "lucide-react";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";

import { ErpToggleSwitch } from "../../../components/inputs/ErpToggleSwitch";
import { ErpDatePickerField, ErpSelectField } from "../../../pages/ComponentLibrary/shared/ErpFieldControls";
import { getCompactFieldSx } from "../../../pages/ComponentLibrary/sections/inputs/components/inputFieldStyles";
import type {
  MasterDefinition,
  MasterFieldDefinition,
  MasterFieldValue,
  MasterUploadedFileValue,
} from "./types";

type FormFieldLayoutDefinition = {
  fields: readonly MasterFieldDefinition[];
  gridColumns: MasterDefinition["gridColumns"];
};

interface MasterFormFieldsProps {
  definition: FormFieldLayoutDefinition;
  onChange: (key: string, value: MasterFieldValue) => void;
  readOnly?: boolean;
  showRequiredErrors?: boolean;
  values: Record<string, MasterFieldValue>;
}

interface PreviewState {
  mimeType?: string;
  name: string;
  previewUrl: string;
}

function isMasterUploadedFileValue(
  value: MasterFieldValue,
): value is MasterUploadedFileValue {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    typeof value.name === "string"
  );
}

function getMasterFileName(value: MasterFieldValue) {
  if (typeof value === "string") {
    return value;
  }

  if (isMasterUploadedFileValue(value)) {
    return value.name;
  }

  return "";
}

const requiredFieldKeys = new Set([
  "category",
  "categoryName",
  "colorName",
  "consumableName",
  "currencyName",
  "customerName",
  "cutName",
  "department",
  "departmentName",
  "email",
  "firstName",
  "gstPercentage",
  "hsnCode",
  "itemCode",
  "itemName",
  "itemSubCategory",
  "lastName",
  "phoneNo",
  "role",
  "roleName",
  "supplierName",
  "transporterId",
  "transporterName",
  "unitName",
  "userName",
  "warehouseCode",
  "warehouseName",
]);

export function MasterFormFields({
  definition,
  onChange,
  readOnly = false,
  showRequiredErrors = false,
  values,
}: MasterFormFieldsProps) {
  const theme = useTheme();
  const desktopColumns =
    definition.gridColumns === 5 ? 5 : definition.gridColumns === 4 ? 4 : 3;
  const [previewState, setPreviewState] = useState<PreviewState | null>(null);
  const createdPreviewUrlsRef = useRef<Set<string>>(new Set());
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    return () => {
      createdPreviewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      createdPreviewUrlsRef.current.clear();
    };
  }, []);

  return (
    <>
      <Box
        sx={(theme) => ({
          display: "grid",
          gap: theme.spacing(2),
          gridTemplateColumns: {
            xs: "repeat(1, minmax(0, 1fr))",
            md: "repeat(2, minmax(0, 1fr))",
            lg:
              desktopColumns === 5
                ? "repeat(4, minmax(0, 1fr))"
                : `repeat(${desktopColumns}, minmax(0, 1fr))`,
            xl: `repeat(${desktopColumns}, minmax(0, 1fr))`,
          },
        })}
      >
        {definition.fields.map((field) => {
          const fieldValue = values[field.key] ?? null;
          const isFullWidth = field.span === "full" || field.type === "textarea";
          const fieldIsReadOnly = readOnly || Boolean(field.readOnly);
          const fieldHasRequiredError =
            showRequiredErrors &&
            !fieldIsReadOnly &&
            isRequiredFieldEmpty(field, fieldValue);
          const fieldState = fieldHasRequiredError
            ? "error"
            : fieldIsReadOnly
              ? "readOnly"
              : "default";
          const interactiveFieldState = fieldHasRequiredError
            ? "error"
            : fieldIsReadOnly
              ? "disabled"
              : "default";

          return (
            <Stack
              key={field.key}
              sx={(theme) => ({
                gap: theme.spacing(0.75),
                gridColumn: isFullWidth
                  ? {
                      xs: "span 1",
                      lg: `span ${Math.min(desktopColumns, 2)}`,
                      xl: `span ${Math.min(desktopColumns, 2)}`,
                    }
                  : undefined,
              })}
            >
              <Typography variant="subtitle2" color="text.primary">
                {field.label}
              </Typography>

              {field.type === "text" ? (
                <TextField
                  fullWidth
                  placeholder={field.placeholder ?? `Enter ${field.label}`}
                  value={typeof fieldValue === "string" ? fieldValue : ""}
                  onChange={(event) => onChange(field.key, event.target.value)}
                  sx={getCompactFieldSx(theme, fieldState)}
                  slotProps={{
                    input: {
                      readOnly: fieldIsReadOnly,
                    },
                  }}
                />
              ) : null}

              {field.type === "textarea" ? (
                <TextField
                  fullWidth
                  multiline
                  minRows={field.rows ?? 3}
                  placeholder={field.placeholder ?? `Enter ${field.label}`}
                  value={typeof fieldValue === "string" ? fieldValue : ""}
                  onChange={(event) => onChange(field.key, event.target.value)}
                  sx={getCompactFieldSx(theme, fieldState)}
                  slotProps={{
                    input: {
                      readOnly: fieldIsReadOnly,
                    },
                  }}
                />
              ) : null}

              {field.type === "select" ? (
                <ErpSelectField
                  helperText={field.helperText}
                  onChange={(value) => onChange(field.key, value)}
                  options={field.options ?? []}
                  placeholder={field.placeholder ?? `Select ${field.label}`}
                  state={interactiveFieldState}
                  value={typeof fieldValue === "string" ? fieldValue : ""}
                />
              ) : null}

              {field.type === "date" ? (
                <ErpDatePickerField
                  helperText={field.helperText}
                  onChange={(value) => onChange(field.key, value)}
                  placeholder={field.placeholder ?? `Select ${field.label}`}
                  state={interactiveFieldState}
                  value={fieldValue instanceof Date ? fieldValue : null}
                />
              ) : null}

              {field.type === "file" ? (() => {
                const fileName = getMasterFileName(fieldValue);
                const uploadedFieldValue = isMasterUploadedFileValue(fieldValue)
                  ? fieldValue
                  : null;
                const canPreview =
                  uploadedFieldValue !== null &&
                  typeof uploadedFieldValue.previewUrl === "string" &&
                  uploadedFieldValue.previewUrl.length > 0;

                const previewButton = canPreview ? (
                  <IconButton
                    aria-label={`Preview ${field.label.toLowerCase()}`}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setPreviewState({
                        ...(uploadedFieldValue?.mimeType
                          ? { mimeType: uploadedFieldValue.mimeType }
                          : {}),
                        name: uploadedFieldValue?.name ?? "",
                        previewUrl: uploadedFieldValue?.previewUrl ?? "",
                      });
                    }}
                    size="small"
                    sx={{
                      border: `1px solid ${theme.customTokens.borders.default}`,
                      borderRadius: `${theme.customTokens.radius.md}px`,
                      color: theme.customTokens.navigation.activeText,
                    }}
                  >
                    <Eye size={14} />
                  </IconButton>
                ) : null;

                if (fieldIsReadOnly) {
                  return (
                    <Box
                      sx={(currentTheme) => ({
                        display: "flex",
                        gap: currentTheme.spacing(1),
                        alignItems: "center",
                      })}
                    >
                      <TextField
                        fullWidth
                        placeholder={field.placeholder ?? "No file uploaded"}
                        value={fileName}
                        sx={getCompactFieldSx(theme, fieldHasRequiredError ? "error" : "readOnly")}
                        slotProps={{
                          input: {
                            readOnly: true,
                          },
                        }}
                      />
                      {previewButton}
                    </Box>
                  );
                }

                return (
                  <Box
                    sx={(currentTheme) => ({
                      display: "flex",
                      gap: currentTheme.spacing(1),
                      alignItems: "center",
                    })}
                  >
                    <input
                      ref={(element) => {
                        fileInputRefs.current[field.key] = element;
                      }}
                      hidden
                      type="file"
                      onChange={(event) => {
                        const file = event.target.files?.[0];

                        if (!file) {
                          event.currentTarget.value = "";
                          return;
                        }

                        if (uploadedFieldValue?.previewUrl) {
                          URL.revokeObjectURL(uploadedFieldValue.previewUrl);
                          createdPreviewUrlsRef.current.delete(
                            uploadedFieldValue.previewUrl,
                          );
                        }

                        const previewUrl = URL.createObjectURL(file);
                        createdPreviewUrlsRef.current.add(previewUrl);

                        onChange(field.key, {
                          file,
                          mimeType: file.type,
                          name: file.name,
                          previewUrl,
                        });
                        event.currentTarget.value = "";
                      }}
                    />

                    <Button
                      variant="outlined"
                      onClick={() => fileInputRefs.current[field.key]?.click()}
                    >
                      Upload
                    </Button>

                    <TextField
                      fullWidth
                      placeholder={field.placeholder ?? "No file selected"}
                      value={fileName}
                      sx={getCompactFieldSx(theme, fieldHasRequiredError ? "error" : "readOnly")}
                      slotProps={{
                        input: {
                          readOnly: true,
                        },
                      }}
                    />

                    {previewButton}
                    {fileName.length > 0 ? (
                      <IconButton
                        aria-label={`Remove ${field.label.toLowerCase()}`}
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          if (uploadedFieldValue?.previewUrl) {
                            URL.revokeObjectURL(uploadedFieldValue.previewUrl);
                            createdPreviewUrlsRef.current.delete(
                              uploadedFieldValue.previewUrl,
                            );
                          }

                          onChange(field.key, "");
                        }}
                        size="small"
                        sx={{
                          border: `1px solid ${theme.customTokens.borders.default}`,
                          borderRadius: `${theme.customTokens.radius.md}px`,
                          color: theme.palette.text.secondary,
                        }}
                      >
                        <X size={14} />
                      </IconButton>
                    ) : null}
                  </Box>
                );
              })() : null}

              {field.type === "toggle" ? (
                <Box
                  sx={(theme) => ({
                    minHeight: theme.spacing(4.5),
                    display: "flex",
                    alignItems: "center",
                    px: theme.spacing(1),
                    border: `1px solid ${theme.customTokens.borders.default}`,
                    borderRadius: `${theme.customTokens.radius.md}px`,
                  })}
                >
                  <FormControlLabel
                    control={
                      <ErpToggleSwitch
                        checked={Boolean(fieldValue)}
                        disabled={readOnly}
                        onChange={(nextChecked) => onChange(field.key, nextChecked)}
                      />
                    }
                    label={Boolean(fieldValue) ? "Enabled" : "Disabled"}
                    sx={{ m: 0 }}
                  />
                </Box>
              ) : null}

              {field.type === "checkbox" ? (
                <Box
                  sx={(theme) => ({
                    minHeight: theme.spacing(4.5),
                    display: "flex",
                    alignItems: "center",
                    px: theme.spacing(1),
                    border: `1px solid ${theme.customTokens.borders.default}`,
                    borderRadius: `${theme.customTokens.radius.md}px`,
                  })}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={Boolean(fieldValue)}
                        disabled={readOnly}
                        onChange={(event) =>
                          onChange(field.key, event.target.checked)
                        }
                      />
                    }
                    label={field.helperText ?? field.label}
                    sx={{ m: 0 }}
                  />
                </Box>
              ) : null}
            </Stack>
          );
        })}
      </Box>

      <Dialog
        fullWidth
        maxWidth="md"
        onClose={() => setPreviewState(null)}
        open={previewState !== null}
      >
        <DialogTitle>{previewState?.name ?? "File Preview"}</DialogTitle>
        <DialogContent dividers>
          {previewState?.mimeType?.startsWith("image/") ? (
            <Box
              component="img"
              src={previewState.previewUrl}
              alt={previewState.name}
              sx={{
                width: "100%",
                maxHeight: 520,
                objectFit: "contain",
                display: "block",
              }}
            />
          ) : previewState?.mimeType === "application/pdf" ? (
            <Box
              component="iframe"
              src={previewState.previewUrl}
              title={previewState.name}
              sx={{
                width: "100%",
                height: 520,
                border: 0,
              }}
            />
          ) : (
            <Typography variant="body2" color="text.secondary">
              Preview is available for image and PDF uploads.
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export function hasRequiredFieldErrors(
  fields: readonly MasterFieldDefinition[],
  values: Record<string, MasterFieldValue>,
) {
  return fields.some((field) =>
    isRequiredFieldEmpty(field, values[field.key] ?? null),
  );
}

function isRequiredFieldEmpty(
  field: MasterFieldDefinition,
  value: MasterFieldValue | null,
) {
  if (!isRequiredField(field)) {
    return false;
  }

  if (typeof value === "string") {
    return value.trim().length === 0;
  }

  if (value === null) {
    return true;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime());
  }

  if (isMasterUploadedFileValue(value)) {
    return value.name.trim().length === 0;
  }

  return false;
}

function isRequiredField(field: MasterFieldDefinition) {
  if (field.required !== undefined) {
    return field.required;
  }

  if (field.type === "toggle" || field.type === "checkbox") {
    return false;
  }

  return (
    field.label.trim().endsWith("*") ||
    requiredFieldKeys.has(field.key)
  );
}
