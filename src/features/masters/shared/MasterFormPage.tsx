import { useEffect, useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { ChevronLeft, Pencil, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router";

import { MasterFormFields } from "./MasterFormFields";
import { MasterPageShell } from "./MasterPageShell";
import { MasterSectionCard } from "./MasterSectionCard";
import type { MasterDefinition, MasterFieldValue, MasterRecord } from "./types";
import {
  buildMasterInitialValues,
  getMasterPageTitle,
  getMasterPaths,
} from "./utils";

interface MasterFormPageProps {
  definition: MasterDefinition;
  mode: "add" | "edit" | "view";
}

export function MasterFormPage({
  definition,
  mode,
}: MasterFormPageProps) {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const paths = getMasterPaths(definition.slug);

  const row =
    mode === "add"
      ? undefined
      : definition.rows.find((record) => record.id === params.id);

  const [values, setValues] = useState<Record<string, MasterFieldValue>>(() =>
    buildMasterInitialValues(definition, row),
  );

  useEffect(() => {
    setValues(buildMasterInitialValues(definition, row));
  }, [definition, row]);

  if ((mode === "edit" || mode === "view") && !row) {
    return (
      <MasterPageShell
        breadcrumbs={[
          { label: "Masters", to: "/masters" },
          { label: definition.title, to: paths.list },
          { label: "Not Found" },
        ]}
        title={definition.title}
      >
        <MasterSectionCard>
          <Typography variant="body2" color="text.secondary">
            The requested record could not be found in the mock dataset.
          </Typography>
        </MasterSectionCard>
      </MasterPageShell>
    );
  }

  return (
    <MasterPageShell
      breadcrumbs={[
        { label: "Masters", to: "/masters" },
        { label: definition.title, to: paths.list },
        { label: mode === "add" ? "Add" : mode === "edit" ? "Edit" : "View" },
      ]}
      title={getMasterPageTitle(definition, mode)}
    >
      <MasterSectionCard>
        <Stack
          sx={(theme) => ({
            gap: theme.spacing(3),
          })}
        >
          <MasterFormFields
            definition={definition}
            onChange={(key, value) =>
              setValues((current) => ({
                ...current,
                [key]: value,
              }))
            }
            readOnly={mode === "view"}
            values={values}
          />

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
                <Button
                  variant="outlined"
                  onClick={() => navigate(paths.list)}
                >
                  Cancel
                </Button>

                <Button
                  variant="contained"
                  startIcon={<Save size={16} />}
                  onClick={() => navigate(paths.list)}
                >
                  Save
                </Button>
              </>
            )}
          </Box>
        </Stack>
      </MasterSectionCard>
    </MasterPageShell>
  );
}
