import { useEffect, useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { ChevronLeft, Pencil, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router";

import {
  MasterFormFields,
  MasterSectionCard,
  type MasterFieldValue,
} from "../../masters/shared";
import { FactoryPageShell } from "./FactoryPageShell";
import {
  buildFactoryInitialValues,
  getFactoryPageSubtitle,
  getFactoryPageTitle,
  getFactoryPaths,
} from "./factoryUtils";
import type { FactoryDefinition, FactoryPageMode, FactoryRecord } from "./types";

interface FactoryFormProps<Row extends FactoryRecord> {
  definition: FactoryDefinition<Row>;
  mode: Exclude<FactoryPageMode, "list">;
}

export function FactoryForm<Row extends FactoryRecord>({
  definition,
  mode,
}: FactoryFormProps<Row>) {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const paths = getFactoryPaths(definition.slug);

  const row =
    mode === "add"
      ? undefined
      : definition.rows.find((record) => record.id === params.id);

  const [values, setValues] = useState<Record<string, MasterFieldValue>>(() =>
    buildFactoryInitialValues(definition.formSections, row),
  );

  useEffect(() => {
    setValues(buildFactoryInitialValues(definition.formSections, row));
  }, [definition.formSections, row]);

  if ((mode === "edit" || mode === "view") && !row) {
    return (
      <FactoryPageShell
        breadcrumbs={[
          { label: "Factory", to: "/factory" },
          { label: definition.title, to: paths.list },
          { label: "Not Found" },
        ]}
        title={definition.title}
      >
        <MasterSectionCard>
          <Typography variant="body2" color="text.secondary">
            The requested factory process record could not be found in the mock dataset.
          </Typography>
        </MasterSectionCard>
      </FactoryPageShell>
    );
  }

  const primaryLabel = mode === "add" ? "Save" : "Update";

  return (
    <FactoryPageShell
      breadcrumbs={[
        { label: "Factory", to: "/factory" },
        { label: definition.title, to: paths.list },
        { label: mode === "add" ? "Add" : mode === "edit" ? "Edit" : "View" },
      ]}
      subtitle={getFactoryPageSubtitle(definition, mode)}
      title={getFactoryPageTitle(definition, mode)}
    >
      <MasterSectionCard>
        <Stack
          sx={(theme) => ({
            gap: theme.spacing(4),
          })}
        >
          {definition.formSections.map((section) => (
            <Stack
              key={section.title}
              sx={(theme) => ({
                gap: theme.spacing(2),
              })}
            >
              <Stack
                sx={(theme) => ({
                  gap: theme.spacing(0.75),
                })}
              >
                <Typography variant="h3" color="text.primary">
                  {section.title}
                </Typography>

                {section.description ? (
                  <Typography variant="body2" color="text.secondary">
                    {section.description}
                  </Typography>
                ) : null}
              </Stack>

              <MasterFormFields
                definition={{
                  gridColumns: 4,
                  fields: section.fields,
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
            </Stack>
          ))}

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

                <Button
                  variant="contained"
                  startIcon={<Pencil size={16} />}
                  onClick={() => {
                    if (row) {
                      navigate(paths.edit(row.id));
                    }
                  }}
                >
                  Edit
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
        </Stack>
      </MasterSectionCard>
    </FactoryPageShell>
  );
}
