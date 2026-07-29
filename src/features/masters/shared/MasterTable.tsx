import { useEffect, useMemo, useState } from "react";
import type { Dispatch, MouseEvent, SetStateAction } from "react";
import {
  ArrowDownWideNarrow,
  ArrowUpDown,
  ArrowUpWideNarrow,
  ChevronLeft,
  ChevronRight,
  ListFilter,
  MoreHorizontal,
  X,
} from "lucide-react";
import {
  Avatar,
  Box,
  Button,
  IconButton,
  InputAdornment,
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

type AuditColumnType = "created" | "updated";

type MasterDisplayColumn = MasterColumn & {
  audit?: {
    dateKey?: string;
    nameKey?: string;
    type: AuditColumnType;
  };
};

interface MasterTableProps {
  canChangeStatus?: boolean;
  canEdit?: boolean;
  canView?: boolean;
  columns: MasterColumn[];
  rows: MasterRecord[];
  getEditPath: (id: string) => string;
  getViewPath: (id: string) => string;
  onStatusChange?: (row: MasterRecord, checked: boolean) => Promise<void> | void;
}

const actionColumnWidth = 88;

export function MasterTable({
  canChangeStatus = true,
  canEdit = true,
  canView = true,
  columns,
  getEditPath,
  getViewPath,
  onStatusChange,
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
  const [filterMenuWidth, setFilterMenuWidth] = useState(240);
  const [filterSearch, setFilterSearch] = useState("");
  const [activeFilterColumn, setActiveFilterColumn] = useState<string | null>(
    null,
  );
  const [actionMenuAnchor, setActionMenuAnchor] = useState<HTMLElement | null>(null);
  const [activeActionRowId, setActiveActionRowId] = useState<string | null>(null);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, boolean>>(
    {},
  );
  const hasRowActions = canView || canEdit;
  const displayColumns = useMemo(
    () => getMasterDisplayColumns(columns),
    [columns],
  );
  const filterValueOptions = useMemo(() => {
    if (!activeFilterColumn) {
      return [];
    }

    const normalizedSearch = filterSearch.trim().toLowerCase();

    return Array.from(
      new Set(
        rows
          .map((row) => formatMasterValue(row[activeFilterColumn]).trim())
          .filter(Boolean),
      ),
    )
      .filter(
        (value) =>
          !normalizedSearch ||
          value.toLowerCase().includes(normalizedSearch),
      )
      .sort((first, second) =>
        first.localeCompare(second, undefined, {
          numeric: true,
          sensitivity: "base",
        }),
      )
      .slice(0, 100);
  }, [activeFilterColumn, filterSearch, rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) =>
      Object.entries(columnFilters).every(([key, value]) => {
        if (!value) {
          return true;
        }

        return formatMasterValue(row[key])
          .toLowerCase()
          .includes(value.trim().toLowerCase());
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
    const anchorElement =
      event.currentTarget.closest("th") ?? event.currentTarget;

    setActiveFilterColumn(columnKey);
    setFilterSearch(columnFilters[columnKey] ?? "");
    setFilterMenuWidth(anchorElement.getBoundingClientRect().width);
    setFilterMenuAnchor(anchorElement as HTMLElement);
  };

  const handleFilterSearchChange = (value: string) => {
    if (!activeFilterColumn) {
      return;
    }

    setFilterSearch(value);
    setColumnFilters((current) => {
      const next = { ...current };
      const normalizedValue = value.trim();

      if (!normalizedValue) {
        delete next[activeFilterColumn];
      } else {
        next[activeFilterColumn] = normalizedValue;
      }

      return next;
    });

    setPage(1);
  };

  const handleFilterValueSelect = (value: string) => {
    if (!activeFilterColumn) {
      return;
    }

    setFilterSearch(value);
    setColumnFilters((current) => ({
      ...current,
      [activeFilterColumn]: value,
    }));
    setPage(1);
    setFilterMenuAnchor(null);
    setActiveFilterColumn(null);
  };

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
                {displayColumns.map((column) => {
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
                  {displayColumns.map((column) => (
                    <TableCell key={column.key} sx={bodyCellSx}>
                      {renderMasterTableCell(
                        row,
                        column,
                        statusOverrides,
                        setStatusOverrides,
                        onStatusChange,
                        theme,
                        canChangeStatus,
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
                      {hasRowActions ? (
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
                      ) : null}
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
            alignItems: "center",
            gap: theme.spacing(2),
            flexWrap: "wrap",
            px: theme.spacing(2),
            py: theme.spacing(1),
            borderTop: `1px solid ${theme.customTokens.borders.default}`,
          })}
        >
          <Box
            sx={(theme) => ({
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: theme.spacing(1.25),
              flexWrap: "wrap",
              width: "100%",
            })}
          >
            <Box
              sx={(theme) => ({
                display: "flex",
                alignItems: "center",
                gap: theme.spacing(0.75),
                flexWrap: "wrap",
                justifyContent: "flex-end",
                ml: "auto",
              })}
            >
              <Typography variant="caption" color="text.secondary">
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
                  minWidth: 68,
                  height: 30,
                  borderRadius: `${theme.customTokens.radius.md}px`,
                  "& .MuiSelect-select": {
                    py: theme.spacing(0.5),
                    pr: `${theme.spacing(3)} !important`,
                    pl: theme.spacing(1),
                    fontSize: theme.typography.caption.fontSize,
                  },
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

              <Typography variant="caption" color="text.secondary">
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
                sx={(theme) => ({
                  width: 58,
                  "& .MuiOutlinedInput-root": {
                    height: 30,
                    borderRadius: `${theme.customTokens.radius.md}px`,
                    fontSize: theme.typography.caption.fontSize,
                  },
                  "& .MuiInputBase-input": {
                    py: theme.spacing(0.5),
                  },
                })}
              />

              <Button
                size="small"
                variant="outlined"
                onClick={() => setPage(clampPage(goToPage, totalPages))}
                sx={paginationButtonSx}
              >
                Go
              </Button>

              <Stack
                direction="row"
                spacing={0.5}
                sx={(theme) => ({ ml: theme.spacing(1) })}
                useFlexGap
              >
                <Button
                  aria-label="Previous page"
                  size="small"
                  variant="outlined"
                  disabled={safePage === 1}
                  onClick={() => setPage((current) => Math.max(current - 1, 1))}
                  sx={paginationIconButtonSx}
                >
                  <ChevronLeft size={13} />
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
                  aria-label="Next page"
                  size="small"
                  variant="outlined"
                  disabled={safePage === totalPages}
                  onClick={() =>
                    setPage((current) => Math.min(current + 1, totalPages))
                  }
                  sx={paginationIconButtonSx}
                >
                  <ChevronRight size={13} />
                </Button>
              </Stack>
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
        {canView ? (
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
        ) : null}

        {canEdit ? (
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
        ) : null}
      </Menu>

      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor && activeFilterColumn)}
        onClose={() => {
          setFilterSearch("");
          setFilterMenuAnchor(null);
          setActiveFilterColumn(null);
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        MenuListProps={{ dense: true }}
        PaperProps={{
          sx: {
            border: `1px solid ${theme.customTokens.borders.default}`,
            borderRadius: `${theme.customTokens.radius.md}px`,
            boxShadow: "none",
            mt: 1,
            overflowX: "hidden",
            width: filterMenuWidth,
          },
        }}
      >
        <Box
          sx={{
            px: theme.spacing(1),
            py: theme.spacing(0.75),
          }}
        >
          <TextField
            autoFocus
            fullWidth
            size="small"
            value={filterSearch}
            onChange={(event) => handleFilterSearchChange(event.target.value)}
            onClick={(event) => event.stopPropagation()}
            slotProps={{
              input: {
                endAdornment: filterSearch ? (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="Clear filter search"
                      edge="end"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleFilterSearchChange("");
                      }}
                      onMouseDown={(event) => event.preventDefault()}
                      size="small"
                      sx={{
                        color: theme.customTokens.text.secondary,
                        p: theme.spacing(0.25),
                        "&:hover": {
                          backgroundColor:
                            theme.customTokens.navigation.hoverBackground,
                          color: theme.palette.primary.main,
                        },
                      }}
                    >
                      <X size={12} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: `${theme.customTokens.radius.md}px`,
                fontSize: theme.typography.body2.fontSize,
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.customTokens.borders.default,
              },
            }}
          />
        </Box>

        <Box
          sx={{
            borderTop: `1px solid ${theme.customTokens.borders.default}`,
            maxHeight: 224,
            overflowX: "hidden",
            overflowY: "auto",
            py: theme.spacing(0.5),
            scrollbarWidth: "thin",
            scrollbarColor: `${theme.customTokens.brand.primary} ${theme.customTokens.surfaces.alt}`,
            "&::-webkit-scrollbar": {
              width: 6,
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: theme.customTokens.surfaces.alt,
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: theme.customTokens.brand.primary,
              borderRadius: theme.customTokens.radius.pill,
            },
          }}
        >
          {filterValueOptions.length > 0 ? (
            filterValueOptions.map((option) => {
              const selected = option === columnFilters[activeFilterColumn ?? ""];

              return (
                <MenuItem
                  key={option}
                  selected={selected}
                  onClick={() => handleFilterValueSelect(option)}
                  sx={{
                    color: theme.customTokens.text.primary,
                    fontSize: theme.typography.body2.fontSize,
                    minHeight: 32,
                    overflow: "hidden",
                    px: theme.spacing(1.5),
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    "&.Mui-selected": {
                      backgroundColor: theme.customTokens.navigation.activeBackground,
                      color: theme.customTokens.navigation.activeText,
                      fontWeight: 700,
                    },
                    "&.Mui-selected:hover, &:hover": {
                      backgroundColor: theme.customTokens.navigation.hoverBackground,
                      color: theme.customTokens.navigation.activeText,
                    },
                  }}
                >
                  {option}
                </MenuItem>
              );
            })
          ) : (
            <MenuItem
              disabled
              sx={{
                color: theme.customTokens.text.secondary,
                fontSize: theme.typography.caption.fontSize,
                minHeight: 32,
                px: theme.spacing(1.5),
              }}
            >
              No values found
            </MenuItem>
          )}
        </Box>
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

const paginationButtonSx = (theme: Theme) => ({
  minHeight: 28,
  minWidth: 32,
  px: theme.spacing(1),
  borderRadius: `${theme.customTokens.radius.md}px`,
  borderColor: theme.customTokens.borders.default,
  color: theme.customTokens.navigation.activeText,
  fontSize: theme.typography.caption.fontSize,
  fontWeight: 700,
  lineHeight: 1,
  textTransform: "none",
  boxShadow: "none",
  "&:hover": {
    borderColor: theme.customTokens.brand.primary,
    backgroundColor: theme.customTokens.navigation.hoverBackground,
    boxShadow: "none",
  },
  "&.Mui-disabled": {
    borderColor: theme.customTokens.borders.default,
    color: theme.customTokens.neutrals[400],
    backgroundColor: theme.customTokens.surfaces.alt,
  },
});

const paginationIconButtonSx = (theme: Theme) => ({
  ...paginationButtonSx(theme),
  width: 28,
  minWidth: 28,
  height: 28,
  p: 0,
  color: theme.customTokens.text.primary,
  "& svg": {
    color: theme.customTokens.text.primary,
    strokeWidth: 2.25,
  },
  "&:hover": {
    borderColor: theme.customTokens.text.primary,
    backgroundColor: theme.customTokens.navigation.hoverBackground,
    color: theme.customTokens.text.primary,
    boxShadow: "none",
  },
});

const actionMenuItemSx = {
  color: "text.primary",
  "&:hover": {
    backgroundColor: "action.hover",
    color: "primary.main",
  },
};

function pageNumberButtonSx(active: boolean) {
  return (theme: Theme) => ({
    minHeight: 28,
    minWidth: 28,
    px: theme.spacing(0.75),
    borderRadius: `${theme.customTokens.radius.md}px`,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: 700,
    lineHeight: 1,
    color: active
      ? theme.customTokens.text.inverse
      : theme.customTokens.navigation.activeText,
    backgroundColor: active
      ? theme.customTokens.brand.primary
      : "transparent",
    borderColor: active
      ? theme.customTokens.brand.primary
      : theme.customTokens.borders.default,
    boxShadow: "none",
    "&:hover": {
      backgroundColor: active
        ? theme.customTokens.brand.primaryScale[800]
        : theme.customTokens.navigation.hoverBackground,
      borderColor: theme.customTokens.brand.primary,
      boxShadow: "none",
    },
  });
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
  column: MasterDisplayColumn,
  statusOverrides: Record<string, boolean>,
  setStatusOverrides: Dispatch<SetStateAction<Record<string, boolean>>>,
  onStatusChange: MasterTableProps["onStatusChange"],
  theme: Theme,
  canChangeStatus: boolean,
) {
  if (column.audit) {
    return renderAuditCell(
      row[column.audit.nameKey ?? column.key],
      row[column.audit.dateKey ?? column.key],
      theme,
    );
  }

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
      disabled={!canChangeStatus}
      onChange={(nextChecked) => {
        setStatusOverrides((current) => ({
          ...current,
          [toggleKey]: nextChecked,
        }));

        Promise.resolve(onStatusChange?.(row, nextChecked)).catch(() => {
          setStatusOverrides((current) => ({
            ...current,
            [toggleKey]: checked,
          }));
        });
      }}
    />
  );
}

function getMasterDisplayColumns(columns: readonly MasterColumn[]) {
  const createdNameKey = findAuditColumnKey(columns, auditColumnKeys.createdName);
  const createdDateKey = findAuditColumnKey(columns, auditColumnKeys.createdDate);
  const updatedNameKey = findAuditColumnKey(columns, auditColumnKeys.updatedName);
  const updatedDateKey = findAuditColumnKey(columns, auditColumnKeys.updatedDate);
  const hasCreatedAudit = Boolean(createdNameKey || createdDateKey);
  const hasUpdatedAudit = Boolean(updatedNameKey || updatedDateKey);
  let createdAdded = false;
  let updatedAdded = false;
  const displayColumns: MasterDisplayColumn[] = [];

  columns.forEach((column) => {
    if (isSerialNumberColumn(column)) {
      return;
    }

    const auditType = getAuditColumnType(column.key);

    if (!auditType) {
      displayColumns.push(column);
      return;
    }

    if (auditType === "created") {
      if (!createdAdded && hasCreatedAudit) {
        createdAdded = true;
        displayColumns.push({
          key: createdDateKey ?? createdNameKey ?? column.key,
          label: "Created",
          audit: {
            ...(createdDateKey ? { dateKey: createdDateKey } : {}),
            ...(createdNameKey ? { nameKey: createdNameKey } : {}),
            type: "created",
          },
        });
      }

      return;
    }

    if (!updatedAdded && hasUpdatedAudit) {
      updatedAdded = true;
      displayColumns.push({
        key: updatedDateKey ?? updatedNameKey ?? column.key,
        label: "Updated",
        audit: {
          ...(updatedDateKey ? { dateKey: updatedDateKey } : {}),
          ...(updatedNameKey ? { nameKey: updatedNameKey } : {}),
          type: "updated",
        },
      });
    }
  });

  return orderMasterDisplayColumns(displayColumns);
}

function orderMasterDisplayColumns(columns: readonly MasterDisplayColumn[]) {
  const remarkColumns = columns.filter(isRemarkColumn);
  const statusColumns = columns.filter(isStatusColumn);
  const createdColumns = columns.filter((column) => column.audit?.type === "created");
  const updatedColumns = columns.filter((column) => column.audit?.type === "updated");
  const trailingColumnKeys = new Set(
    [...remarkColumns, ...statusColumns, ...createdColumns, ...updatedColumns].map(
      (column) => column.key,
    ),
  );

  return [
    ...columns.filter((column) => !trailingColumnKeys.has(column.key)),
    ...remarkColumns,
    ...statusColumns,
    ...createdColumns,
    ...updatedColumns,
  ];
}

function isRemarkColumn(column: MasterColumn) {
  const normalizedLabel = normalizeColumnIdentifier(column.label);
  const normalizedKey = normalizeColumnIdentifier(column.key);

  return (
    normalizedLabel === "remark" ||
    normalizedLabel === "remarks" ||
    normalizedKey === "remark" ||
    normalizedKey === "remarks"
  );
}

function isStatusColumn(column: MasterColumn) {
  const normalizedLabel = normalizeColumnIdentifier(column.label);
  const normalizedKey = normalizeColumnIdentifier(column.key);

  return normalizedLabel === "status" || normalizedKey === "status";
}

function isSerialNumberColumn(column: MasterColumn) {
  const normalizedLabel = normalizeColumnIdentifier(column.label);
  const normalizedKey = normalizeColumnIdentifier(column.key);

  return (
    normalizedLabel === "srno" ||
    normalizedLabel === "sno" ||
    normalizedLabel === "serialno" ||
    normalizedKey === "srno" ||
    normalizedKey === "sno" ||
    normalizedKey === "serialno"
  );
}

function normalizeColumnIdentifier(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

const auditColumnKeys = {
  createdDate: new Set(["createdDate", "createdAt", "createdEditedDate", "createdEditedAt"]),
  createdName: new Set(["createdBy", "createdEditedBy"]),
  updatedDate: new Set(["updatedDate", "updatedAt"]),
  updatedName: new Set(["updatedBy", "editedBy"]),
};

function getAuditColumnType(key: string): AuditColumnType | null {
  if (
    auditColumnKeys.createdName.has(key) ||
    auditColumnKeys.createdDate.has(key)
  ) {
    return "created";
  }

  if (
    auditColumnKeys.updatedName.has(key) ||
    auditColumnKeys.updatedDate.has(key)
  ) {
    return "updated";
  }

  return null;
}

function findAuditColumnKey(columns: readonly MasterColumn[], keys: Set<string>) {
  return columns.find((column) => keys.has(column.key))?.key;
}

function renderAuditCell(
  nameValue: MasterRecord[string],
  dateValue: MasterRecord[string],
  theme: Theme,
) {
  const name = formatMasterValue(nameValue) || "-";
  const date = formatMasterValue(dateValue) || "-";
  const initials = getAuditInitials(name);

  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Avatar
        sx={{
          width: 28,
          height: 28,
          bgcolor: theme.customTokens.brand.primary,
          color: theme.customTokens.text.inverse,
          fontSize: theme.typography.caption.fontSize,
          fontWeight: 700,
        }}
      >
        {initials}
      </Avatar>

      <Stack spacing={0.25} sx={{ minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{
            color: theme.customTokens.text.primary,
            fontWeight: 600,
            lineHeight: 1.25,
          }}
        >
          {name}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: theme.customTokens.text.secondary,
            lineHeight: 1.2,
          }}
        >
          {date}
        </Typography>
      </Stack>
    </Stack>
  );
}

function getAuditInitials(name: string) {
  const parts = name
    .replace("-", "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function clampPage(value: string, totalPages: number) {
  const parsed = Number(value);

  if (Number.isNaN(parsed) || parsed < 1) {
    return 1;
  }

  return Math.min(parsed, totalPages);
}
