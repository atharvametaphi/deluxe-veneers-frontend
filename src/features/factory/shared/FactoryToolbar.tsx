import { Button, Stack } from "@mui/material";
import { Download, FileOutput, Plus } from "lucide-react";
import { Link as RouterLink } from "react-router";

interface FactoryToolbarProps {
  addPath: string;
}

export function FactoryToolbar({
  addPath,
}: FactoryToolbarProps) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1.25}
      useFlexGap
      sx={{ alignItems: { xs: "stretch", md: "center" } }}
    >
      <Button
        component={RouterLink}
        to={addPath}
        variant="contained"
        startIcon={<Plus size={16} />}
      >
        New Entry
      </Button>

      <Button variant="outlined" startIcon={<FileOutput size={16} />}>
        Export
      </Button>

      <Button variant="outlined" startIcon={<Download size={16} />}>
        Download
      </Button>
    </Stack>
  );
}
