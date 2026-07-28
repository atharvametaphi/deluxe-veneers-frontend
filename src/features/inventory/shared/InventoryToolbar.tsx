import { Button, Stack } from "@mui/material";
import { FileOutput, Plus } from "lucide-react";
import { Link as RouterLink } from "react-router";

interface InventoryToolbarProps {
  addLabel: string;
  addPath: string;
  canAdd?: boolean;
}

export function InventoryToolbar({
  addLabel,
  addPath,
  canAdd = true,
}: InventoryToolbarProps) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1.25}
      useFlexGap
      sx={{ alignItems: { xs: "stretch", md: "center" } }}
    >
      {canAdd ? (
        <Button
          component={RouterLink}
          to={addPath}
          variant="contained"
          startIcon={<Plus size={16} />}
          sx={inventoryToolbarButtonSx}
        >
          {addLabel}
        </Button>
      ) : null}

      <Button
        variant="outlined"
        startIcon={<FileOutput size={16} />}
        sx={inventoryToolbarButtonSx}
      >
        Export
      </Button>

    </Stack>
  );
}

export const inventoryToolbarButtonSx = {
  alignItems: "center",
  appearance: "none",
  boxSizing: "border-box",
  cursor: "pointer",
  display: "inline-flex",
  fontFamily: "Inter, sans-serif",
  fontSize: "0.9rem",
  fontWeight: 600,
  justifyContent: "center",
  letterSpacing: "0.01em",
  lineHeight: 1.75,
  margin: 0,
  minWidth: 64,
  outline: 0,
  padding: "6px 16px",
  position: "relative",
  textTransform: "none",
  transition:
    "background-color 250ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1), border-color 250ms cubic-bezier(0.4, 0, 0.2, 1)",
  userSelect: "none",
  verticalAlign: "middle",
  WebkitTapHighlightColor: "transparent",
} as const;
