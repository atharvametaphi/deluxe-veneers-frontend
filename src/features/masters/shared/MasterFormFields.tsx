import { useEffect, useRef, useState } from "react";
import { Eye, Upload, X } from "lucide-react";
import {
  getCountries,
  getCountryCallingCode,
  type CountryCode,
} from "libphonenumber-js";
import {
  Box,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";

import { ErpToggleSwitch } from "../../../components/inputs/ErpToggleSwitch";
import {
  getLocationByPincode,
  loadLocationCityOptions,
  loadLocationCountryOptions,
  loadLocationStateOptions,
  locationSearchVisibleOptionLimit,
} from "../../shared/locationOptions";
import { ErpDatePickerField, ErpSelectField } from "../../../pages/ComponentLibrary/shared/ErpFieldControls";
import { getCompactFieldSx } from "../../../pages/ComponentLibrary/sections/inputs/components/inputFieldStyles";
import type {
  MasterDefinition,
  MasterFieldDefinition,
  MasterFieldValue,
  MasterUploadedFileValue,
} from "./types";
import { normalizeMasterStatusValue } from "./utils";

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

const acceptedUploadExtensions = [".pdf", ".png", ".jpg", ".jpeg"];
const acceptedUploadMimeTypes = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
]);

const uploadAcceptAttribute =
  ".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg";

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
  "emailAddress",
  "firstName",
  "gstPercentage",
  "hsnCode",
  "itemCode",
  "itemName",
  "itemSubCategory",
  "lastName",
  "address",
  "city",
  "country",
  "phoneNo",
  "phoneNumber",
  "pincode",
  "role",
  "roleName",
  "state",
  "mobileNumber",
  "supplierName",
  "transporterId",
  "transporterName",
  "unitName",
  "userName",
  "warehouseCode",
  "warehouseName",
]);

const countryNameFormatter = new Intl.DisplayNames(["en"], { type: "region" });

const countryCodeOptions = Array.from(
  getCountries()
    .reduce((countryGroups, country) => {
      const code = `+${getCountryCallingCode(country)}`;
      const countries = countryGroups.get(code) ?? [];

      countries.push(getCountryName(country));
      countryGroups.set(code, countries);

      return countryGroups;
    }, new Map<string, string[]>())
    .entries(),
)
  .map(([code, countries]) => {
    const sortedCountries = countries.sort((first, second) =>
      first.localeCompare(second),
    );
    const firstCountry = sortedCountries[0] ?? code;
    const displayCountries =
      sortedCountries.length > 2
        ? `${sortedCountries.slice(0, 2).join(" / ")} +${sortedCountries.length - 2}`
        : sortedCountries.join(" / ");

    return {
      code,
      label: displayCountries,
      sortLabel: firstCountry,
    };
  })
  .sort((first, second) => first.sortLabel.localeCompare(second.sortLabel));

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
  const [locationOptions, setLocationOptions] = useState<Record<string, string[]>>(
    {},
  );
  const createdPreviewUrlsRef = useRef<Set<string>>(new Set());
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const fields = getOrderedFormFields(definition.fields);
  const selectedCountry = getLocationValue(definition.fields, values, "country");
  const selectedState = getLocationValue(definition.fields, values, "state");
  const handleFieldChange = (
    field: MasterFieldDefinition,
    value: MasterFieldValue,
  ) => {
    onChange(field.key, value);

    if (isCountryField(field)) {
      clearDependentLocationFields(definition.fields, onChange, ["state", "city"]);
      return;
    }

    if (isStateField(field)) {
      clearDependentLocationFields(definition.fields, onChange, ["city"]);
      return;
    }

    if (!isPincodeField(field) || typeof value !== "string") {
      return;
    }

    const location = getLocationByPincode(value);

    if (!location) {
      return;
    }

    applyPincodeLocation(definition.fields, location, onChange);
  };

  useEffect(() => {
    return () => {
      createdPreviewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      createdPreviewUrlsRef.current.clear();
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    const locationKeys = Array.from(
      new Set(
        definition.fields
          .filter(isLocationField)
          .map((field) => getNormalizedFieldKey(field)),
      ),
    );

    if (locationKeys.length === 0) {
      return () => {
        ignore = true;
      };
    }

    Promise.all(
      locationKeys.map(async (key) => {
        if (key === "country") {
          return [key, await loadLocationCountryOptions()] as const;
        }

        if (key === "state") {
          return [key, await loadLocationStateOptions(selectedCountry)] as const;
        }

        if (key === "city") {
          return [
            key,
            await loadLocationCityOptions(selectedCountry, selectedState),
          ] as const;
        }

        return [key, await loadLocationCityOptions("India")] as const;
      }),
    ).then((loadedOptions) => {
      if (ignore) {
        return;
      }

      setLocationOptions((current) => ({
        ...current,
        ...Object.fromEntries(loadedOptions),
      }));
    });

    return () => {
      ignore = true;
    };
  }, [definition.fields, selectedCountry, selectedState]);

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
        {fields.map((field) => {
          const fieldValue = values[field.key] ?? null;
          const renderedFieldType = isStatusField(field) ? "toggle" : field.type;
          const isFullWidth = field.span === "full" || field.type === "textarea";
          const fieldIsReadOnly = readOnly || Boolean(field.readOnly);
          const fieldHasRequiredError =
            showRequiredErrors &&
            !fieldIsReadOnly &&
            isRequiredFieldEmpty(field, fieldValue);
          const fieldValidationError =
            showRequiredErrors && !fieldIsReadOnly
              ? getFieldValidationError(field, fieldValue)
              : "";
          const fieldState = fieldHasRequiredError
            ? "error"
            : fieldValidationError
              ? "error"
              : fieldIsReadOnly
                ? "readOnly"
                : "default";
          const interactiveFieldState = fieldHasRequiredError
            ? "error"
            : fieldValidationError
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

              {field.type === "text" && isPhoneField(field) ? (
                <Box
                  sx={(currentTheme) => ({
                    display: "grid",
                    gap: currentTheme.spacing(1),
                    gridTemplateColumns: "92px minmax(0, 1fr)",
                  })}
                >
                  <TextField
                    disabled={fieldIsReadOnly}
                    select
                    value={getPhoneCountryCode(values, field.key)}
                    onChange={(event) =>
                      onChange(getPhoneCountryCodeKey(field.key), event.target.value)
                    }
                    sx={[
                      getCompactFieldSx(
                        theme,
                        fieldIsReadOnly ? "readOnly" : "default",
                      ),
                      {
                        "& .MuiSelect-select": {
                          alignItems: "center",
                          boxSizing: "border-box",
                          display: "flex",
                          height: "100%",
                          justifyContent: "flex-start",
                          lineHeight: 1,
                          minHeight: "0 !important",
                          paddingLeft: `${theme.spacing(1.5)} !important`,
                          paddingRight: `${theme.spacing(3.5)} !important`,
                          paddingTop: "0 !important",
                          paddingBottom: "0 !important",
                        },
                        "& .MuiSelect-icon": {
                          right: theme.spacing(1),
                          top: "50%",
                          transform: "translateY(-50%)",
                        },
                      },
                    ]}
                    slotProps={{
                      input: {
                        readOnly: fieldIsReadOnly,
                      },
                      select: {
                        MenuProps: {
                          anchorOrigin: {
                            horizontal: "left",
                            vertical: "bottom",
                          },
                          MenuListProps: {
                            dense: true,
                            sx: {
                              py: 0.5,
                            },
                          },
                          PaperProps: {
                            sx: {
                              border: `1px solid ${theme.customTokens.borders.default}`,
                              borderRadius: `${theme.customTokens.radius.md}px`,
                              boxShadow: "none",
                              maxHeight: 240,
                              mt: 0.5,
                              overflowY: "auto",
                              scrollbarColor: `${theme.customTokens.brand.primary} ${theme.customTokens.surfaces.alt}`,
                              scrollbarWidth: "thin",
                              width: 280,
                              "&::-webkit-scrollbar": {
                                width: 6,
                              },
                              "&::-webkit-scrollbar-track": {
                                backgroundColor: theme.customTokens.surfaces.alt,
                                borderRadius: 999,
                              },
                              "&::-webkit-scrollbar-thumb": {
                                backgroundColor: theme.customTokens.brand.primary,
                                borderRadius: 999,
                              },
                              "&::-webkit-scrollbar-thumb:hover": {
                                backgroundColor:
                                  theme.customTokens.brand.primaryScale[800],
                              },
                            },
                          },
                          transformOrigin: {
                            horizontal: "left",
                            vertical: "top",
                          },
                          variant: "menu",
                        },
                        renderValue: (selected) => String(selected),
                      },
                    }}
                  >
                    {countryCodeOptions.map((countryCode) => (
                      <MenuItem
                        key={countryCode.code}
                        value={countryCode.code}
                        sx={(theme) => ({
                          fontSize: theme.typography.body2.fontSize,
                          minHeight: 32,
                        })}
                      >
                        {countryCode.code} - {countryCode.label}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    fullWidth
                    error={Boolean(fieldHasRequiredError || fieldValidationError)}
                    helperText={fieldValidationError || field.helperText}
                    value={getPhoneDisplayValue(
                      fieldValue,
                      getPhoneCountryCode(values, field.key),
                    )}
                    onChange={(event) =>
                      onChange(
                        field.key,
                        normalizeTextInputValue(field, event.target.value),
                      )
                    }
                    sx={getCompactFieldSx(theme, fieldState)}
                    slotProps={{
                      input: {
                        readOnly: fieldIsReadOnly,
                      },
                      htmlInput: {
                        inputMode: "numeric",
                        maxLength: 10,
                        pattern: "[0-9]*",
                      },
                    }}
                  />
                </Box>
              ) : null}

              {renderedFieldType === "text" &&
              !isPhoneField(field) &&
              !isLocationField(field) ? (
                <TextField
                  fullWidth
                  error={Boolean(fieldHasRequiredError || fieldValidationError)}
                  helperText={fieldValidationError || field.helperText}
                  value={typeof fieldValue === "string" ? fieldValue : ""}
                  onChange={(event) => {
                    const nextValue = normalizeTextInputValue(
                      field,
                      event.target.value,
                    );

                    handleFieldChange(field, nextValue);
                  }}
                  sx={getCompactFieldSx(theme, fieldState)}
                  slotProps={getTextFieldSlotProps(field, fieldIsReadOnly)}
                />
              ) : null}

              {renderedFieldType === "textarea" ? (
                <TextField
                  fullWidth
                  error={Boolean(fieldHasRequiredError || fieldValidationError)}
                  helperText={fieldValidationError || field.helperText}
                  multiline
                  minRows={field.rows ?? 3}
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

              {renderedFieldType === "select" || isLocationField(field) ? (
                <ErpSelectField
                  helperText={field.helperText}
                  maxVisibleOptions={
                    isLocationField(field)
                      ? locationSearchVisibleOptionLimit
                      : undefined
                  }
                  onChange={(value) => handleFieldChange(field, value)}
                  options={getSelectOptions(field, locationOptions)}
                  searchable
                  state={interactiveFieldState}
                  value={typeof fieldValue === "string" ? fieldValue : ""}
                />
              ) : null}

              {renderedFieldType === "date" ? (
                <ErpDatePickerField
                  helperText={field.helperText}
                  onChange={(value) => onChange(field.key, value)}
                  state={interactiveFieldState}
                  value={fieldValue instanceof Date ? fieldValue : null}
                />
              ) : null}

              {renderedFieldType === "file" ? (() => {
                const fileName = getMasterFileName(fieldValue);
                const uploadedFieldValue = isMasterUploadedFileValue(fieldValue)
                  ? fieldValue
                  : null;
                const canPreview = fileName.length > 0;

                const previewButton = canPreview ? (
                  <IconButton
                    aria-label={`Preview ${field.label.toLowerCase()}`}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      const previewMimeType = getUploadPreviewMimeType(
                        fileName,
                        uploadedFieldValue?.mimeType,
                      );

                      setPreviewState({
                        ...(previewMimeType ? { mimeType: previewMimeType } : {}),
                        name: fileName,
                        previewUrl: uploadedFieldValue?.previewUrl ?? "",
                      });
                    }}
                    size="small"
                    sx={{
                      color: theme.customTokens.navigation.activeText,
                      height: theme.spacing(3.25),
                      width: theme.spacing(3.25),
                    }}
                  >
                    <Eye size={14} />
                  </IconButton>
                ) : null;

                if (fieldIsReadOnly) {
                  return (
                    <TextField
                      fullWidth
                      value={fileName}
                      sx={getCompactFieldSx(theme, fieldHasRequiredError ? "error" : "readOnly")}
                      slotProps={{
                        input: {
                          readOnly: true,
                          endAdornment: canPreview ? (
                            <InputAdornment position="end">
                              {previewButton}
                            </InputAdornment>
                          ) : null,
                        },
                      }}
                    />
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
                      accept={uploadAcceptAttribute}
                      type="file"
                      onChange={(event) => {
                        const file = event.target.files?.[0];

                        if (!file) {
                          event.currentTarget.value = "";
                          return;
                        }

                        if (!isAcceptedUploadFile(file)) {
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

                    <TextField
                      fullWidth
                      value={fileName}
                      sx={getCompactFieldSx(theme, fieldHasRequiredError ? "error" : "readOnly")}
                      slotProps={{
                        input: {
                          readOnly: true,
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label={`Upload ${field.label.toLowerCase()}`}
                                onClick={() =>
                                  fileInputRefs.current[field.key]?.click()
                                }
                                size="small"
                                sx={{
                                  color: theme.customTokens.navigation.activeText,
                                  height: theme.spacing(3.25),
                                  width: theme.spacing(3.25),
                                }}
                              >
                                <Upload size={14} />
                              </IconButton>
                              {previewButton}
                              {fileName.length > 0 ? (
                                <IconButton
                                  aria-label={`Remove ${field.label.toLowerCase()}`}
                                  onClick={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    if (uploadedFieldValue?.previewUrl) {
                                      URL.revokeObjectURL(
                                        uploadedFieldValue.previewUrl,
                                      );
                                      createdPreviewUrlsRef.current.delete(
                                        uploadedFieldValue.previewUrl,
                                      );
                                    }

                                    onChange(field.key, "");
                                  }}
                                  size="small"
                                  sx={{
                                    color: theme.palette.text.secondary,
                                    height: theme.spacing(3.25),
                                    width: theme.spacing(3.25),
                                  }}
                                >
                                  <X size={14} />
                                </IconButton>
                              ) : null}
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  </Box>
                );
              })() : null}

              {renderedFieldType === "toggle" ? (
                <Box
                  sx={(theme) => ({
                    minHeight: theme.spacing(4.5),
                    display: "flex",
                    alignItems: "center",
                    px: isStatusField(field) ? 0 : theme.spacing(1),
                    border: isStatusField(field)
                      ? "none"
                      : `1px solid ${theme.customTokens.borders.default}`,
                    borderRadius: isStatusField(field)
                      ? 0
                      : `${theme.customTokens.radius.md}px`,
                  })}
                >
                  <FormControlLabel
                    control={
                      <ErpToggleSwitch
                        checked={getToggleCheckedValue(field, fieldValue)}
                        disabled={fieldIsReadOnly}
                        onChange={(nextChecked) =>
                          onChange(
                            field.key,
                            isStatusField(field)
                              ? getStatusFieldValue(nextChecked)
                              : nextChecked,
                          )
                        }
                      />
                    }
                    label={
                      isStatusField(field)
                        ? getStatusFieldValue(getToggleCheckedValue(field, fieldValue))
                        : getToggleCheckedValue(field, fieldValue)
                          ? "Enabled"
                          : "Disabled"
                    }
                    sx={(theme) => ({
                      m: 0,
                      gap: theme.spacing(1),
                      "& .MuiFormControlLabel-label": {
                        color: theme.customTokens.text.primary,
                        fontSize: theme.typography.body2.fontSize,
                      },
                    })}
                  />
                </Box>
              ) : null}

              {renderedFieldType === "checkbox" ? (
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
          {previewState?.previewUrl &&
          previewState.mimeType?.startsWith("image/") ? (
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
          ) : previewState?.previewUrl &&
            previewState?.mimeType === "application/pdf" ? (
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
              Preview is available after selecting a PDF, PNG, JPG, or JPEG file in this form.
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

export function hasFormFieldErrors(
  fields: readonly MasterFieldDefinition[],
  values: Record<string, MasterFieldValue>,
) {
  return fields.some((field) =>
    isRequiredFieldEmpty(field, values[field.key] ?? null) ||
    Boolean(getFieldValidationError(field, values[field.key] ?? null)),
  );
}

function getFieldValidationError(
  field: MasterFieldDefinition,
  value: MasterFieldValue | null,
) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return "";
  }

  const textValue = value.trim();

  if (isEmailField(field)) {
    if (!/^[A-Za-z0-9._-]+@[A-Za-z0-9.-]+$/.test(textValue)) {
      return "Please enter a valid email.";
    }
  }

  if (isPhoneField(field)) {
    if (/[A-Za-z]/.test(textValue)) {
      return "Phone number should contain numbers only.";
    }

    if (getPhoneLocalDigits(textValue).length > 10) {
      return "Phone number cannot exceed 10 digits.";
    }
  }

  if (isGstOrHsnNumericField(field) && !/^\d+$/.test(textValue)) {
    return `${field.label.replace("*", "")} should contain numbers only.`;
  }

  if (isPincodeField(field) && !/^\d{6}$/.test(textValue)) {
    return "Pincode should be exactly 6 digits.";
  }

  if (isAgeField(field)) {
    if (!/^\d+$/.test(textValue)) {
      return "Age should be an integer.";
    }

    if (Number(textValue) > 100) {
      return "Age should not exceed 100.";
    }
  }

  return "";
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

function normalizeTextInputValue(field: MasterFieldDefinition, value: string) {
  if (isEmailField(field)) {
    return value.replace(/[^A-Za-z0-9@._-]/g, "");
  }

  if (isPhoneField(field)) {
    return value.replace(/\D/g, "").slice(0, 10);
  }

  if (isGstOrHsnNumericField(field)) {
    return value.replace(/\D/g, "");
  }

  if (isPincodeField(field)) {
    return value.replace(/\D/g, "").slice(0, 6);
  }

  if (isAgeField(field)) {
    const integerValue = value.replace(/\D/g, "").slice(0, 3);

    if (!integerValue) {
      return "";
    }

    return String(Math.min(Number(integerValue), 100));
  }

  return value;
}

function getNormalizedFieldKey(field: MasterFieldDefinition) {
  return field.key.toLowerCase();
}

function getNormalizedFieldLabel(field: MasterFieldDefinition) {
  return field.label.toLowerCase();
}

function isEmailField(field: MasterFieldDefinition) {
  return getNormalizedFieldKey(field).includes("email");
}

function isPhoneField(field: MasterFieldDefinition) {
  const key = getNormalizedFieldKey(field);
  const label = getNormalizedFieldLabel(field);

  return (
    key.includes("phone") ||
    key.includes("mobile") ||
    label.includes("phone") ||
    label.includes("mobile")
  );
}

function isPincodeField(field: MasterFieldDefinition) {
  const key = getNormalizedFieldKey(field);
  const label = getNormalizedFieldLabel(field);

  return key.includes("pincode") || label.includes("pincode");
}

function isAgeField(field: MasterFieldDefinition) {
  return getNormalizedFieldKey(field) === "age" || getNormalizedFieldLabel(field) === "age";
}

function isGstOrHsnNumericField(field: MasterFieldDefinition) {
  const key = getNormalizedFieldKey(field);
  const label = getNormalizedFieldLabel(field).replace(/\s+/g, "");

  return (
    key === "gstpercentage" ||
    key === "hsncode" ||
    label === "gst%" ||
    label === "hsncode"
  );
}

function isStatusField(field: MasterFieldDefinition) {
  return getNormalizedFieldKey(field) === "status";
}

function isLocationField(field: MasterFieldDefinition) {
  const key = getNormalizedFieldKey(field);

  return (
    key === "city" ||
    key === "state" ||
    key === "country" ||
    key === "areaofoperation"
  );
}

function isCountryField(field: MasterFieldDefinition) {
  return getNormalizedFieldKey(field) === "country";
}

function isStateField(field: MasterFieldDefinition) {
  return getNormalizedFieldKey(field) === "state";
}

function getLocationValue(
  fields: readonly MasterFieldDefinition[],
  values: Record<string, MasterFieldValue>,
  key: "country" | "state",
) {
  const field = fields.find(
    (currentField) => getNormalizedFieldKey(currentField) === key,
  );
  const value = field ? values[field.key] : "";

  return typeof value === "string" ? value : "";
}

function clearDependentLocationFields(
  fields: readonly MasterFieldDefinition[],
  onChange: (key: string, value: MasterFieldValue) => void,
  keys: Array<"state" | "city">,
) {
  keys.forEach((key) => {
    const field = fields.find(
      (currentField) => getNormalizedFieldKey(currentField) === key,
    );

    if (field) {
      onChange(field.key, "");
    }
  });
}

function isPincodeOrLocationField(field: MasterFieldDefinition) {
  return isPincodeField(field) || isLocationField(field);
}

function getOrderedFormFields(fields: readonly MasterFieldDefinition[]) {
  const fieldsWithStatusLast = getFieldsWithStatusLast(fields);
  const locationFields = fieldsWithStatusLast.filter(isPincodeOrLocationField);

  if (!locationFields.some(isPincodeField)) {
    return fieldsWithStatusLast;
  }

  const orderedLocationFields = ["pincode", "country", "state", "city"]
    .map((key) =>
      locationFields.find((field) => getNormalizedFieldKey(field) === key),
    )
    .filter((field): field is MasterFieldDefinition => Boolean(field));

  let locationFieldsInserted = false;

  return fieldsWithStatusLast.reduce<MasterFieldDefinition[]>((orderedFields, field) => {
    if (!isPincodeOrLocationField(field)) {
      orderedFields.push(field);
      return orderedFields;
    }

    if (!locationFieldsInserted) {
      orderedFields.push(...orderedLocationFields);
      locationFieldsInserted = true;
    }

    return orderedFields;
  }, []);
}

function getFieldsWithStatusLast(fields: readonly MasterFieldDefinition[]) {
  const statusFields = fields.filter(isStatusField);

  if (statusFields.length === 0) {
    return fields;
  }

  return [
    ...fields.filter((field) => !isStatusField(field)),
    ...statusFields,
  ];
}

function applyPincodeLocation(
  fields: readonly MasterFieldDefinition[],
  location: { city: string; country: string; state: string },
  onChange: (key: string, value: MasterFieldValue) => void,
) {
  const countryField = fields.find(
    (field) => getNormalizedFieldKey(field) === "country",
  );
  const stateField = fields.find((field) => getNormalizedFieldKey(field) === "state");
  const cityField = fields.find((field) => getNormalizedFieldKey(field) === "city");

  if (countryField) {
    onChange(countryField.key, location.country);
  }

  if (stateField) {
    onChange(stateField.key, location.state);
  }

  if (cityField) {
    onChange(cityField.key, location.city);
  }
}

function getSelectOptions(
  field: MasterFieldDefinition,
  locationOptions: Record<string, string[]>,
) {
  const key = getNormalizedFieldKey(field);

  if (key === "country") {
    return locationOptions.country ?? [];
  }

  if (key === "state") {
    return locationOptions.state ?? [];
  }

  if (key === "city") {
    return locationOptions.city ?? [];
  }

  if (key === "areaofoperation") {
    return locationOptions.areaofoperation ?? [];
  }

  if (field.options && field.options.length > 0) {
    return field.options;
  }

  return [];
}

function getTextInputHtmlProps(field: MasterFieldDefinition) {
  if (isGstOrHsnNumericField(field) || isPincodeField(field) || isAgeField(field)) {
    return {
      inputMode: "numeric" as const,
      pattern: "[0-9]*",
    };
  }

  return undefined;
}

function getTextFieldSlotProps(
  field: MasterFieldDefinition,
  readOnly: boolean,
) {
  const htmlInput = getTextInputHtmlProps(field);

  return htmlInput
    ? {
        input: {
          readOnly,
        },
        htmlInput,
      }
    : {
        input: {
          readOnly,
        },
      };
}

function getToggleCheckedValue(
  field: MasterFieldDefinition,
  value: MasterFieldValue | null,
) {
  if (isStatusField(field)) {
    return normalizeMasterStatusValue(value) === "Active";
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return ["active", "enabled", "true"].includes(value.trim().toLowerCase());
  }

  return Boolean(value);
}

function getStatusFieldValue(checked: boolean) {
  return checked ? "Active" : "Inactive";
}

function isAcceptedUploadFile(file: File) {
  const normalizedName = file.name.toLowerCase();

  return (
    acceptedUploadMimeTypes.has(file.type) ||
    acceptedUploadExtensions.some((extension) =>
      normalizedName.endsWith(extension),
    )
  );
}

function getUploadPreviewMimeType(fileName: string, mimeType?: string) {
  if (mimeType) {
    return mimeType;
  }

  const normalizedName = fileName.toLowerCase();

  if (normalizedName.endsWith(".pdf")) {
    return "application/pdf";
  }

  if (normalizedName.endsWith(".png")) {
    return "image/png";
  }

  if (normalizedName.endsWith(".jpg") || normalizedName.endsWith(".jpeg")) {
    return "image/jpeg";
  }

  return undefined;
}

function getPhoneCountryCodeKey(fieldKey: string) {
  return `${fieldKey}CountryCode`;
}

function getCountryName(country: CountryCode) {
  return countryNameFormatter.of(country) ?? country;
}

function getPhoneCountryCode(
  values: Record<string, MasterFieldValue>,
  fieldKey: string,
) {
  const value = values[getPhoneCountryCodeKey(fieldKey)];

  return typeof value === "string" && countryCodeOptions.some((option) => option.code === value)
    ? value
    : "+91";
}

function getPhoneDisplayValue(
  value: MasterFieldValue | null,
  countryCode: string,
) {
  if (typeof value !== "string") {
    return "";
  }

  const digits = value.replace(/\D/g, "");
  const countryDigits = countryCode.replace(/\D/g, "");

  if (digits.length > 10 && digits.startsWith(countryDigits)) {
    return digits.slice(countryDigits.length, countryDigits.length + 10);
  }

  return digits.slice(0, 10);
}

function getPhoneLocalDigits(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.length > 10 && digits.startsWith("91")) {
    return digits.slice(2);
  }

  return digits;
}
