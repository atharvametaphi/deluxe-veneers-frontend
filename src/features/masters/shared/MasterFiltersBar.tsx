import { Box, Stack, TextField, Typography, useTheme } from "@mui/material";
import { Search } from "lucide-react";

import { ErpSelectField } from "../../../pages/ComponentLibrary/shared/ErpFieldControls";
import { getCompactFieldSx } from "../../../pages/ComponentLibrary/sections/inputs/components/inputFieldStyles";
import type { MasterFilterDefinition } from "./types";

interface MasterFiltersBarProps {
  filterValues: Record<string, string>;
  filters: MasterFilterDefinition[];
  onFilterChange: (key: string, value: string) => void;
  onSearchChange: (value: string) => void;
  searchValue: string;
}

export function MasterFiltersBar({
  filterValues,
  filters,
  onFilterChange,
  onSearchChange,
  searchValue,
}: MasterFiltersBarProps) {
  const theme = useTheme();

  return (
    <Stack
      sx={(theme) => ({
        gap: theme.spacing(2),
      })}
    >
      <Box
        sx={(theme) => ({
          display: "grid",
          gap: theme.spacing(1.5),
          gridTemplateColumns: {
            xs: "repeat(1, minmax(0, 1fr))",
            md: "minmax(0, 1.5fr) repeat(2, minmax(0, 1fr))",
            xl: "minmax(0, 1.75fr) repeat(3, minmax(0, 1fr))",
          },
        })}
      >
        <Stack
          sx={(theme) => ({
            gap: theme.spacing(0.75),
          })}
        >
          <Typography variant="subtitle2" color="text.primary">
            Search
          </Typography>

          <TextField
            fullWidth
            placeholder="Search records"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            sx={getCompactFieldSx(theme)}
            slotProps={{
              input: {
                startAdornment: (
                  <Search
                    color={theme.customTokens.text.secondary}
                    size={16}
                    style={{ marginRight: 10 }}
                  />
                ),
              },
            }}
          />
        </Stack>

        {filters.map((filter) => (
          <Stack
            key={filter.key}
            sx={(theme) => ({
              gap: theme.spacing(0.75),
            })}
          >
            <Typography variant="subtitle2" color="text.primary">
              {filter.label}
            </Typography>

            <ErpSelectField
              onChange={(value) => onFilterChange(filter.key, value)}
              options={filter.options}
              placeholder={`All ${filter.label}`}
              value={filterValues[filter.key] ?? ""}
            />
          </Stack>
        ))}
      </Box>
    </Stack>
  );
}
