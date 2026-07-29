import {
  IconButton,
  InputAdornment,
  TextField,
  type SxProps,
  type Theme,
  useTheme,
} from "@mui/material";
import { Search, X } from "lucide-react";

import { getCompactFieldSx } from "../../pages/ComponentLibrary/sections/inputs/components/inputFieldStyles";

interface ClearableSearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  sx?: SxProps<Theme>;
}

export function ClearableSearchField({
  value,
  onChange,
  sx,
}: ClearableSearchFieldProps) {
  const theme = useTheme();

  return (
    <TextField
      value={value}
      onChange={(event) => onChange(event.target.value)}
      sx={[
        getCompactFieldSx(theme),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              {value ? (
                <IconButton
                  aria-label="Clear search"
                  edge="end"
                  onClick={() => onChange("")}
                  size="small"
                  sx={{
                    color: theme.customTokens.text.secondary,
                    mr: theme.spacing(-0.5),
                    p: theme.spacing(0.25),
                    "&:hover": {
                      backgroundColor:
                        theme.customTokens.navigation.hoverBackground,
                      color: theme.palette.primary.main,
                    },
                  }}
                >
                  <X size={14} />
                </IconButton>
              ) : (
                <Search color={theme.customTokens.text.secondary} size={16} />
              )}
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
