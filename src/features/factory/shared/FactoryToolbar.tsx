import { Button, Stack } from "@mui/material";
import { FileOutput } from "lucide-react";

export function FactoryToolbar() {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1.25}
      useFlexGap
      sx={{ alignItems: { xs: "stretch", md: "center" } }}
    >
      <Button variant="outlined" startIcon={<FileOutput size={16} />}>
        Export
      </Button>

    </Stack>
  );
}
