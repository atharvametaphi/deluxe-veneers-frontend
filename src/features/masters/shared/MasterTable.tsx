import { useEffect, useMemo, useState } from "react";
import type { Dispatch, MouseEvent, SetStateAction } from "react";
import {
  ArrowDownWideNarrow,
  ArrowUpDown,
  ArrowUpWideNarrow,
  ListFilter,
  MoreHorizontal,
} from "lucide-react";
import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { useNavigate } from "react-router";

import { ErpToggleSwitch } from "../../../components/inputs/ErpToggleSwitch";
import type { MasterColumn, MasterRecord } from "./types";
import { formatMasterValue, normalizeMasterSortValue } from "./utils";

type SortDirection = "asc" | "desc";

type SortConfig = {
  direction: SortDirection;
  key: string;
} | null;

interface MasterTableProps {
  columns: MasterColumn[];
  rows: MasterRecord[];
  getEditPath: (id: string) => string;
  getViewPath: (id: string) => string;
}

const actionColumnWidth = 88;

export function MasterTable({
  columns,
  getEditPath,
  getViewPath,
  rows,
}: MasterTableProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [goToPage, setGoToPage] = useState("1");
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<HTMLElement | null>(null);
  const [activeFilterColumn, setActiveFilterColumn] = useState<string | null>(
    null,
  );
  const [actionMenuAnchor, setActionMenuAnchor] = useState<HTMLElement | null>(null);
  const [activeActionRowId, setActiveActionRowId] = useState<string | null>(null);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, boolean>>(
    {},
  );

  const filteredRows = useMemo(() => {
    return rows.filter((row) =>
      Object.entries(columnFilters).every(([key, value]) => {
        if (!value) {
          return true;
        }

        return formatMasterValue(row[key]) === value;
      }),
    );
  }, [columnFilters, rows]);

  const sortedRows = useMemo(() => {
    if (!sortConfig) {
      return filteredRows;
    }

    return [...filteredRows].sort((left, right) => {
      const leftValue = normalizeMasterSortValue(left[sortConfig.key]);
      const rightValue = normalizeMasterSortValue(right[sortConfig.key]);

      if (leftValue < rightValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }

      if (leftValue > rightValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }

      return 0;
    });
  }, [filteredRows, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / rowsPerPage));
  const safePage = Math.min(page, totalPages);
  const pageStartIndex = (safePage - 1) * rowsPerPage;
  const currentPageRows = sortedRows.slice(
    pageStartIndex,
    pageStartIndex + rowsPerPage,
  );
  const startRecord = sortedRows.length === 0 ? 0 : pageStartIndex + 1;
  const endRecord = pageStartIndex + currentPageRows.length;

  useEffect(() => {
    if (page !== safePage) {
      setPage(safePage);
    }
  }, [page, safePage]);

  useEffect(() => {
    setGoToPage(String(safePage));
  }, [safePage]);

  const handleSort = (columnKey: string) => {
    setPage(1);
    setSortConfig((current) => {
      if (!current || current.key !== columnKey) {
        return { key: columnKey, direction: "asc" };
      }

      return {
        key: columnKey,
        direction: current.direction === "asc" ? "desc" : "asc",
      };
    });
  };

  const handleOpenFilter = (
    columnKey: string,
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    setActiveFilterColumn(columnKey);
    setFilterMenuAnchor(event.currentTarget);
  };

  const handleApplyFilter = (value: string | null) => {
    if (!activeFilterColumn) {
      return;
    }

    setColumnFilters((current) => {
      const next = { ...current };

      if (!value) {
        delete next[activeFilterColumn];
      } else {
        next[activeFilterColumn] = value;
      }

      return next;
    });

    setPage(1);
    setFilterMenuAnchor(null);
    setActiveFilterColumn(null);
  };

  const filterOptions = activeFilterColumn
    ? Array.from(
        new Set(
          rows
            .map((row) => formatMasterValue(row[activeFilterColumn]))
            .filter(Boolean),
        ),
      )
    : [];

  const handleOpenActionMenu = (
    rowId: string,
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();
    setActiveActionRowId(rowId);
    setActionMenuAnchor(event.currentTarget);
  };

  const handleCloseActionMenu = () => {
    setActionMenuAnchor(null);
    setActiveActionRowId(null);
  };

  return (
    <>
      <Box
        sx={(theme) => ({
          border: `1px solid ${theme.customTokens.borders.default}`,
          borderRadius: `${theme.customTokens.radius.md}px`,
          overflow: "hidden",
          backgroundColor: theme.customTokens.surfaces.surface,
        })}
      >
        <TableContainer
          sx={(theme) => ({
            maxHeight: rowsPerPage === 10 ? "none" : 520,
            overflowX: "auto",
            overflowY: rowsPerPage === 10 ? "hidden" : "auto",
            scrollbarWidth: "thin",
            scrollbarColor: `${theme.customTokens.brand.primary} ${theme.customTokens.surfaces.alt}`,
            WebkitOverflowScrolling: "touch",
            "&::-webkit-scrollbar": {
              width: 8,
              height: 8,
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: theme.customTokens.surfaces.alt,
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: theme.customTokens.brand.primary,
              borderRadius: theme.customTokens.radius.pill,
              border: `1px solid ${theme.customTokens.surfaces.alt}`,
            },
            "&::-webkit-scrollbar-thumb:hover": {
              backgroundColor: theme.customTokens.brand.secondary,
            },
          })}
        >
          <Table
            stickyHeader
            sx={{
              width: "max-content",
              minWidth: "100%",
              tableLayout: "auto",
              "& .MuiTableCell-root": {
                whiteSpace: "nowrap",
              },
            }}
          >
            <TableHead>
              <TableRow>
                {columns.map((column) => {
                  const isSorted = sortConfig?.key === column.key;
                  const isFiltered = Boolean(columnFilters[column.key]);

                  return (
                    <TableCell key={column.key} sx={headerCellSx}>
                      <Box
                        sx={(theme) => ({
                          display: "flex",
                          alignItems: "center",
                          gap: theme.spacing(0.5),
                        })}
                      >
                        <Typography
                          variant="subtitle2"
                          color={theme.customTokens.text.inverse}
                        >
                          {column.label}
                        </Typography>

                        <IconButton
                          size="small"
                          onClick={() => handleSort(column.key)}
                          sx={headerIconButtonSx}
                        >
                          <SortIndicator
                            active={isSorted}
                            direction={sortConfig?.direction}
                          />
                        </IconButton>

                        <IconButton
                          size="small"
                          onClick={(event) =>
                            handleOpenFilter(column.key, event)
                          }
                          sx={headerIconButtonSx}
                        >
                          <ListFilter
                            color={
                              isFiltered
                                ? theme.customTokens.brand.primaryScale[100]
                                : theme.customTokens.text.inverse
                            }
                            size={14}
                          />
                        </IconButton>
                      </Box>
                    </TableCell>
                  );
                })}

                <TableCell
                  sx={[
                    headerCellSx,
                    {
                      position: "sticky",
                      right: 0,
                      zIndex: 5,
                      minWidth: actionColumnWidth,
                      boxShadow: `-1px 0 0 ${theme.customTokens.brand.primaryScale[800]}`,
                    },
                  ]}
                >
                  <Typography
                    variant="subtitle2"
                    color={theme.customTokens.text.inverse}
                  >
                    Actions
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {currentPageRows.map((row, rowIndex) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={(theme) => ({
                    "& td": {
                      backgroundColor:
                        rowIndex % 2 === 0
                          ? theme.customTokens.surfaces.surface
                          : theme.customTokens.surfaces.alt,
                    },
                    "&:hover td": {
                      backgroundColor:
                        theme.customTokens.navigation.hoverBackground,
                    },
                  })}
                >
                  {columns.map((column) => (
                    <TableCell key={column.key} sx={bodyCellSx}>
                      {renderMasterTableCell(
                        row,
                        column,
                        statusOverrides,
                        setStatusOverrides,
                        theme,
                      )}
                    </TableCell>
                  ))}

                  <TableCell
                    sx={[
                      bodyCellSx,
                      {
                        position: "sticky",
                        right: 0,
                        zIndex: 1,
                        minWidth: actionColumnWidth,
                        boxShadow: `-1px 0 0 ${theme.customTokens.borders.default}`,
                      },
                    ]}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <IconButton
                        size="small"
                        aria-label="Open row actions"
                        onClick={(event) => handleOpenActionMenu(row.id, event)}
                        sx={(theme) => ({
                          color: theme.customTokens.navigation.activeText,
                          "&:hover": {
                            backgroundColor:
                              theme.customTokens.navigation.hoverBackground,
                            color: theme.customTokens.brand.secondary,
                          },
                        })}
                      >
                        <MoreHorizontal size={16} />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box
          sx={(theme) => ({
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: theme.spacing(2),
            flexWrap: "wrap",
            px: theme.spacing(2),
            py: theme.spacing(1.5),
            borderTop: `1px solid ${theme.customTokens.borders.default}`,
          })}
        >
          <Typography variant="body2" color="text.secondary">
            Showing {startRecord}-{endRecord} of {sortedRows.length} records
          </Typography>

          <Box
            sx={(theme) => ({
              display: "flex",
              alignItems: "center",
              gap: theme.spacing(1.25),
              flexWrap: "wrap",
            })}
          >
            <Typography variant="body2" color="text.secondary">
              Rows per page
            </Typography>

            <Select
              size="small"
              value={String(rowsPerPage)}
              onChange={(event) => {
                setRowsPerPage(Number(event.target.value));
                setPage(1);
              }}
              sx={(theme) => ({
                minWidth: 88,
                borderRadius: `${theme.customTokens.radius.md}px`,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.customTokens.borders.default,
                },
              })}
            >
              {[10, 25, 50, 75, 100, 200].map((option) => (
                <MenuItem key={option} value={String(option)}>
                  {option}
                </MenuItem>
              ))}
            </Select>

            <Stack direction="row" spacing={1} useFlexGap>
              <Button
                size="small"
                variant="outlined"
                disabled={safePage === 1}
                onClick={() => setPage((current) => Math.max(current - 1, 1))}
                sx={paginationButtonSx}
              >
                Previous
              </Button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (pageNumber) => (
                  <Button
                    key={pageNumber}
                    size="small"
                    variant={pageNumber === safePage ? "contained" : "outlined"}
                    onClick={() => setPage(pageNumber)}
                    sx={pageNumberButtonSx(pageNumber === safePage)}
                  >
                    {pageNumber}
                  </Button>
                ),
              )}

              <Button
                size="small"
                variant="outlined"
                disabled={safePage === totalPages}
                onClick={() =>
                  setPage((current) => Math.min(current + 1, totalPages))
                }
                sx={paginationButtonSx}
              >
                Next
              </Button>
            </Stack>

            <Box
              sx={(theme) => ({
                display: "flex",
                alignItems: "center",
                gap: theme.spacing(1),
                flexWrap: "wrap",
              })}
            >
              <Typography variant="body2" color="text.secondary">
                Go To Page
              </Typography>

              <TextField
                size="small"
                value={goToPage}
                onChange={(event) => setGoToPage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    setPage(clampPage(goToPage, totalPages));
                  }
                }}
                sx={{
                  width: 76,
                }}
              />

              <Button
                size="small"
                variant="outlined"
                onClick={() => setPage(clampPage(goToPage, totalPages))}
                sx={paginationButtonSx}
              >
                Go
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor && activeActionRowId)}
        onClose={handleCloseActionMenu}
        MenuListProps={{ dense: true }}
        PaperProps={{
          sx: {
            border: `1px solid ${theme.customTokens.borders.default}`,
            borderRadius: `${theme.customTokens.radius.md}px`,
            boxShadow: "none",
            mt: 1,
          },
        }}
      >
        <MenuItem
          onClick={() => {
            if (activeActionRowId) {
              navigate(getViewPath(activeActionRowId));
            }
            handleCloseActionMenu();
          }}
          sx={actionMenuItemSx}
        >
          View
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (activeActionRowId) {
              navigate(getEditPath(activeActionRowId));
            }
            handleCloseActionMenu();
          }}
          sx={actionMenuItemSx}
        >
          Edit
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor && activeFilterColumn)}
        onClose={() => {
          setFilterMenuAnchor(null);
          setActiveFilterColumn(null);
        }}
        MenuListProps={{ dense: true }}
        PaperProps={{
          sx: {
            border: `1px solid ${theme.customTokens.borders.default}`,
            borderRadius: `${theme.customTokens.radius.md}px`,
            boxShadow: "none",
            mt: 1,
          },
        }}
      >
        <MenuItem onClick={() => handleApplyFilter(null)}>All Values</MenuItem>

        {filterOptions.map((option) => (
          <MenuItem
            key={option}
            selected={
              activeFilterColumn
                ? columnFilters[activeFilterColumn] === option
                : false
            }
            onClick={() => handleApplyFilter(option)}
          >
            {option}
          </MenuItem>
        ))}
      </Menu>
    </>
  );

  function SortIndicator({
    active,
    direction,
  }: {
    active: boolean;
    direction?: SortDirection | undefined;
  }) {
    if (!active || !direction) {
      return (
        <ArrowUpDown
          color={theme.customTokens.text.inverse}
          size={14}
        />
      );
    }

    if (direction === "asc") {
      return (
        <ArrowUpWideNarrow
          color={theme.customTokens.brand.primaryScale[100]}
          size={14}
        />
      );
    }

    return (
      <ArrowDownWideNarrow
        color={theme.customTokens.brand.primaryScale[100]}
        size={14}
      />
    );
  }
}

const headerCellSx = {
  position: "sticky" as const,
  top: 0,
  zIndex: 2,
  py: 1.25,
  px: 1.5,
  borderBottom: "1px solid",
  borderColor: "primary.dark",
  backgroundColor: "primary.main",
};

const bodyCellSx = {
  py: 1.25,
  px: 1.5,
  borderBottom: "1px solid",
  borderColor: "divider",
};

const headerIconButtonSx = {
  width: 24,
  height: 24,
  color: "common.white",
};

const paginationButtonSx = {
  borderColor: "divider",
  color: "primary.main",
  minWidth: 40,
  "&:hover": {
    borderColor: "primary.main",
    backgroundColor: "action.hover",
  },
};

const actionMenuItemSx = {
  color: "text.primary",
  "&:hover": {
    backgroundColor: "action.hover",
    color: "primary.main",
  },
};

function pageNumberButtonSx(active: boolean) {
  return {
    minWidth: 40,
    color: active ? "common.white" : "primary.main",
    backgroundColor: active ? "primary.main" : "transparent",
    borderColor: active ? "primary.main" : "divider",
    boxShadow: "none",
    "&:hover": {
      backgroundColor: active ? "primary.dark" : "action.hover",
      borderColor: "primary.main",
      boxShadow: "none",
    },
  };
}

const statusToggleValueMap: Record<string, boolean> = {
  active: true,
  enabled: true,
  inactive: false,
  disabled: false,
};

function getStatusToggleState(
  column: MasterColumn,
  value: MasterRecord[string],
) {
  const isStatusColumn =
    column.label === "Status" ||
    column.key === "status" ||
    column.key === "statusLabel";

  if (!isStatusColumn) {
    return null;
  }

  const normalizedValue = formatMasterValue(value).trim().toLowerCase();
  return normalizedValue in statusToggleValueMap
    ? statusToggleValueMap[normalizedValue]
    : null;
}

function renderMasterTableCell(
  row: MasterRecord,
  column: MasterColumn,
  statusOverrides: Record<string, boolean>,
  setStatusOverrides: Dispatch<SetStateAction<Record<string, boolean>>>,
  theme: Theme,
) {
  const toggleState = getStatusToggleState(column, row[column.key]);

  if (toggleState === null) {
    return formatMasterValue(row[column.key]);
  }

  const toggleKey = `${row.id}:${column.key}`;
  const checked = statusOverrides[toggleKey] ?? Boolean(toggleState);

  return (
    <ErpToggleSwitch
      ariaLabel={`${column.label} for row ${row.id}`}
      checked={checked}
      onChange={(nextChecked) =>
        setStatusOverrides((current) => ({
          ...current,
          [toggleKey]: nextChecked,
        }))
      }
    />
  );
}

function clampPage(value: string, totalPages: number) {
  const parsed = Number(value);

  if (Number.isNaN(parsed) || parsed < 1) {
    return 1;
  }

  return Math.min(parsed, totalPages);
}
