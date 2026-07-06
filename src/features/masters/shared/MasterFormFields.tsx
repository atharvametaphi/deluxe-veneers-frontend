import { X } from "lucide-react";
import { Box, Button, Checkbox, FormControlLabel, IconButton, Stack, Switch, TextField, Typography, useTheme } from "@mui/material";

import { ErpDatePickerField, ErpSelectField } from "../../../pages/ComponentLibrary/shared/ErpFieldControls";
import { getCompactFieldSx } from "../../../pages/ComponentLibrary/sections/inputs/components/inputFieldStyles";
import type { MasterDefinition, MasterFieldDefinition, MasterFieldValue } from "./types";

type FormFieldLayoutDefinition = {
  fields: readonly MasterFieldDefinition[];
  gridColumns: MasterDefinition["gridColumns"];
};

interface MasterFormFieldsProps {
  definition: FormFieldLayoutDefinition;
  onChange: (key: string, value: MasterFieldValue) => void;
  readOnly?: boolean;
  values: Record<string, MasterFieldValue>;
}

export function MasterFormFields({
  definition,
  onChange,
  readOnly = false,
  values,
}: MasterFormFieldsProps) {
  const theme = useTheme();
  const desktopColumns =
    definition.gridColumns === 5 ? 5 : definition.gridColumns === 4 ? 4 : 3;

  return (
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
        const fieldValue = values[field.key];
        const isFullWidth = field.span === "full" || field.type === "textarea";
        const fieldIsReadOnly = readOnly || Boolean(field.readOnly);

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
                sx={getCompactFieldSx(theme, fieldIsReadOnly ? "readOnly" : "default")}
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
                sx={getCompactFieldSx(theme, fieldIsReadOnly ? "readOnly" : "default")}
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
                state={fieldIsReadOnly ? "disabled" : "default"}
                value={typeof fieldValue === "string" ? fieldValue : ""}
              />
            ) : null}

            {field.type === "date" ? (
              <ErpDatePickerField
                helperText={field.helperText}
                onChange={(value) => onChange(field.key, value)}
                placeholder={field.placeholder ?? `Select ${field.label}`}
                state={fieldIsReadOnly ? "disabled" : "default"}
                value={fieldValue instanceof Date ? fieldValue : null}
              />
            ) : null}

            {field.type === "file" ? (
              readOnly ? (
                <TextField
                  fullWidth
                  placeholder={field.placeholder ?? "No file uploaded"}
                  value={typeof fieldValue === "string" ? fieldValue : ""}
                  sx={getCompactFieldSx(theme, "readOnly")}
                  slotProps={{
                    input: {
                      readOnly: true,
                    },
                  }}
                />
              ) : (
                <Box
                  sx={(currentTheme) => ({
                    display: "flex",
                    gap: currentTheme.spacing(1),
                    alignItems: "center",
                  })}
                >
                  <Button component="label" variant="outlined">
                    Upload
                    <input
                      hidden
                      type="file"
                      onChange={(event) => {
                        onChange(
                          field.key,
                          event.target.files?.[0]?.name ?? "",
                        );
                        event.currentTarget.value = "";
                      }}
                    />
                  </Button>

                  <TextField
                    fullWidth
                    placeholder={field.placeholder ?? "No file selected"}
                    value={typeof fieldValue === "string" ? fieldValue : ""}
                    sx={getCompactFieldSx(theme, "readOnly")}
                    slotProps={{
                      input: {
                        endAdornment:
                          typeof fieldValue === "string" && fieldValue.length > 0 ? (
                            <IconButton
                              aria-label={`Remove ${field.label.toLowerCase()}`}
                              edge="end"
                              onClick={() => onChange(field.key, "")}
                              size="small"
                            >
                              <X size={14} />
                            </IconButton>
                          ) : undefined,
                        readOnly: true,
                      },
                    }}
                  />
                </Box>
              )
            ) : null}

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
                    <Switch
                      checked={Boolean(fieldValue)}
                      disabled={readOnly}
                      onChange={(event) =>
                        onChange(field.key, event.target.checked)
                      }
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
  );
}
