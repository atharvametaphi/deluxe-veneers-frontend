import { useEffect, useMemo, useState } from "react";
import type { Dispatch, MouseEvent, ReactNode, SetStateAction, WheelEvent } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowDownWideNarrow,
  ArrowUpDown,
  ArrowUpWideNarrow,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  ListFilter,
  MoreHorizontal,
  Pencil,
} from "lucide-react";
import {
  Box,
  Button,
  Checkbox,
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

import { ErpToggleSwitch } from "../inputs/ErpToggleSwitch";

export type EnterpriseTableCellValue =
  | string
  | boolean
  | Date
  | null
  | undefined;

export type EnterpriseTableRow = {
  id: string;
  [key: string]: EnterpriseTableCellValue;
};

export type EnterpriseTableSortDirection = "asc" | "desc";

export type EnterpriseTableSortConfig<
  Row extends EnterpriseTableRow = EnterpriseTableRow,
> = {
  direction: EnterpriseTableSortDirection;
  key: keyof Row & string;
} | null;

export interface EnterpriseTableColumn<
  Row extends EnterpriseTableRow = EnterpriseTableRow,
> {
  key: keyof Row & string;
  label: string;
}

export interface EnterpriseTableAction<
  Row extends EnterpriseTableRow = EnterpriseTableRow,
> {
  id: string;
  label: string;
  icon?: LucideIcon;
  onSelect: (row: Row) => void;
}

interface EnterpriseDataTableProps<Row extends EnterpriseTableRow> {
  actions?: readonly EnterpriseTableAction<Row>[];
  actionColumnLabel?: string;
  actionColumnWidth?: number;
  columns: readonly EnterpriseTableColumn<Row>[];
  defaultRowsPerPage?: number;
  emptyStateLabel?: string;
  getRowActions?: (row: Row) => readonly EnterpriseTableAction<Row>[];
  initialSort?: EnterpriseTableSortConfig<Row>;
  maxBodyHeight?: number;
  onSelectionChange?: (rows: Row[]) => void;
  renderActionCell?: (row: Row) => ReactNode;
  rows: readonly Row[];
  rowsPerPageOptions?: readonly number[];
  selectable?: boolean;
}

export function EnterpriseDataTable<Row extends EnterpriseTableRow>({
  actions = [],
  actionColumnLabel = "Actions",
  actionColumnWidth = 88,
  columns,
  defaultRowsPerPage = 10,
  emptyStateLabel = "No records found.",
  getRowActions,
  initialSort = null,
  maxBodyHeight = 440,
  onSelectionChange,
  renderActionCell,
  rows,
  rowsPerPageOptions = [10, 25, 50, 75, 100, 200],
  selectable = false,
}: EnterpriseDataTableProps<Row>) {
  const theme = useTheme();
  const [sortConfig, setSortConfig] =
    useState<EnterpriseTableSortConfig<Row>>(initialSort);
  const [filters, setFilters] = useState<
    Partial<Record<keyof Row & string, string>>
  >({});
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const [goToPage, setGoToPage] = useState("1");
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<HTMLElement | null>(
    null,
  );
  const [activeFilterColumn, setActiveFilterColumn] = useState<
    (keyof Row & string) | null
  >(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<HTMLElement | null>(
    null,
  );
  const [activeActionRowId, setActiveActionRowId] = useState<string | null>(
    null,
  );
  const [statusOverrides, setStatusOverrides] = useState<Record<string, boolean>>(
    {},
  );

  const usesActionMenu = actions.length > 0 || Boolean(getRowActions);
  const hasActions = usesActionMenu || Boolean(renderActionCell);
  useEffect(() => {
    setSortConfig(initialSort);
  }, [initialSort]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) =>
      Object.entries(filters).every(([key, value]) => {
        if (!value) {
          return true;
        }

        return formatEnterpriseValue(row[key]) === value;
      }),
    );
  }, [filters, rows]);

  const sortedRows = useMemo(() => {
    if (!sortConfig) {
      return filteredRows;
    }

    return [...filteredRows].sort((left, right) => {
      const leftValue = normalizeSortValue(left[sortConfig.key]);
      const rightValue = normalizeSortValue(right[sortConfig.key]);

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
  const currentPageIds = currentPageRows.map((row) => row.id);
  const allCurrentPageSelected =
    selectable &&
    currentPageIds.length > 0 &&
    currentPageIds.every((rowId) => selectedRowIds.includes(rowId));
  const someCurrentPageSelected =
    selectable &&
    currentPageIds.some((rowId) => selectedRowIds.includes(rowId)) &&
    !allCurrentPageSelected;

  const selectedRows = useMemo(
    () => rows.filter((row) => selectedRowIds.includes(row.id)),
    [rows, selectedRowIds],
  );

  useEffect(() => {
    if (page !== safePage) {
      setPage(safePage);
    }
  }, [page, safePage]);

  useEffect(() => {
    setGoToPage(String(safePage));
  }, [safePage]);

  useEffect(() => {
    onSelectionChange?.(selectedRows);
  }, [onSelectionChange, selectedRows]);

  const totalActiveFilters = Object.keys(filters).length;

  const handleHorizontalWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (!event.shiftKey || Math.abs(event.deltaY) < Math.abs(event.deltaX)) {
      return;
    }

    event.currentTarget.scrollLeft += event.deltaY;
    event.preventDefault();
  };

  const handleSort = (columnKey: keyof Row & string) => {
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
    columnKey: keyof Row & string,
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    setActiveFilterColumn(columnKey);
    setFilterMenuAnchor(event.currentTarget);
  };

  const handleApplyFilter = (value: string | null) => {
    if (!activeFilterColumn) {
      return;
    }

    setFilters((current) => {
      const nextFilters = { ...current };

      if (!value) {
        delete nextFilters[activeFilterColumn];
      } else {
        nextFilters[activeFilterColumn] = value;
      }

      return nextFilters;
    });

    setPage(1);
    setFilterMenuAnchor(null);
    setActiveFilterColumn(null);
  };

  const handleToggleRowSelection = (rowId: string) => {
    setSelectedRowIds((current) =>
      current.includes(rowId)
        ? current.filter((selectedRowId) => selectedRowId !== rowId)
        : [...current, rowId],
    );
  };

  const handleTogglePageSelection = () => {
    if (!selectable) {
      return;
    }

    setSelectedRowIds((current) => {
      if (allCurrentPageSelected || someCurrentPageSelected) {
        return current.filter((rowId) => !currentPageIds.includes(rowId));
      }

      return Array.from(new Set([...current, ...currentPageIds]));
    });
  };

  const filterOptions = activeFilterColumn
    ? Array.from(
        new Set(
          rows
            .map((row) => formatEnterpriseValue(row[activeFilterColumn]))
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

  const activeRow =
    activeActionRowId === null
      ? undefined
      : rows.find((row) => row.id === activeActionRowId);
  const activeRowActions = activeRow
    ? getRowActions?.(activeRow) ?? actions
    : actions;

  return (
    <>
      <Box
        sx={{
          border: `1px solid ${theme.customTokens.borders.default}`,
          borderRadius: `${theme.customTokens.radius.md}px`,
          overflow: "hidden",
          backgroundColor: theme.customTokens.surfaces.surface,
        }}
      >
        <TableContainer
          onWheel={handleHorizontalWheel}
          sx={{
            maxHeight: rowsPerPage === defaultRowsPerPage ? "none" : maxBodyHeight,
            overflowX: "auto",
            overflowY: rowsPerPage === defaultRowsPerPage ? "hidden" : "auto",
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
          }}
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
                {selectable ? (
                  <TableCell sx={headerCellSx(theme)}>
                    <Checkbox
                      checked={Boolean(allCurrentPageSelected)}
                      indeterminate={Boolean(someCurrentPageSelected)}
                      onChange={handleTogglePageSelection}
                      sx={headerCheckboxSx(theme)}
                    />
                  </TableCell>
                ) : null}

                {columns.map((column) => {
                  const isSorted = sortConfig?.key === column.key;
                  const isFiltered = Boolean(filters[column.key]);

                  return (
                    <TableCell key={column.key} sx={headerCellSx(theme)}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: theme.spacing(0.5),
                        }}
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
                          onClick={(event) => handleOpenFilter(column.key, event)}
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

                {hasActions ? (
                  <TableCell
                    sx={actionHeaderCellSx(theme, actionColumnWidth)}
                  >
                    <Typography
                      variant="subtitle2"
                      color={theme.customTokens.text.inverse}
                    >
                      {actionColumnLabel}
                    </Typography>
                  </TableCell>
                ) : null}
              </TableRow>
            </TableHead>

            <TableBody>
              {currentPageRows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={
                      columns.length + (selectable ? 1 : 0) + (hasActions ? 1 : 0)
                    }
                    sx={emptyStateCellSx(theme)}
                  >
                    {emptyStateLabel}
                  </TableCell>
                </TableRow>
              ) : null}

              {currentPageRows.map((row, rowIndex) => {
                const isSelected = selectedRowIds.includes(row.id);

                return (
                  <TableRow
                    key={row.id}
                    hover
                    onClick={
                      selectable
                        ? () => handleToggleRowSelection(row.id)
                        : undefined
                    }
                    sx={{
                      cursor: selectable ? "pointer" : "default",
                      "& td": {
                        backgroundColor: isSelected
                          ? theme.customTokens.navigation.activeBackground
                          : rowIndex % 2 === 0
                            ? theme.customTokens.surfaces.surface
                            : theme.customTokens.surfaces.alt,
                      },
                      "&:hover td": {
                        backgroundColor: isSelected
                          ? theme.customTokens.brand.primaryScale[100]
                          : theme.customTokens.navigation.hoverBackground,
                      },
                    }}
                  >
                    {selectable ? (
                      <TableCell sx={bodyCellSx(theme)}>
                        <Checkbox
                          checked={isSelected}
                          onClick={(event) => event.stopPropagation()}
                          onChange={() => handleToggleRowSelection(row.id)}
                          sx={checkboxSx}
                        />
                      </TableCell>
                    ) : null}

                    {columns.map((column) => (
                      <TableCell key={column.key} sx={bodyCellSx(theme)}>
                        {renderEnterpriseTableCell(
                          row,
                          column,
                          statusOverrides,
                          setStatusOverrides,
                          theme,
                        )}
                      </TableCell>
                    ))}

                    {hasActions ? (
                      <TableCell
                        sx={actionBodyCellSx(theme, actionColumnWidth)}
                      >
                        {renderActionCell ? (
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                            }}
                          >
                            {renderActionCell(row)}
                          </Box>
                        ) : (
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
                              sx={{
                                color: theme.customTokens.navigation.activeText,
                                "&:hover": {
                                  backgroundColor:
                                    theme.customTokens.navigation.hoverBackground,
                                  color: theme.customTokens.brand.secondary,
                                },
                              }}
                            >
                              <MoreHorizontal size={16} />
                            </IconButton>
                          </Box>
                        )}
                      </TableCell>
                    ) : null}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: theme.spacing(2),
            flexWrap: "wrap",
            borderTop: `1px solid ${theme.customTokens.borders.default}`,
            px: { xs: theme.spacing(1.5), md: theme.spacing(2) },
            py: theme.spacing(1.5),
            backgroundColor: theme.customTokens.surfaces.surface,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: theme.spacing(1.5),
              flexWrap: "wrap",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Showing {startRecord}-{endRecord} of {sortedRows.length} records
            </Typography>

            {selectable ? (
              <Typography variant="body2" color="text.secondary">
                {selectedRows.length} rows selected
              </Typography>
            ) : null}

            {selectable ? (
              <Button
                size="small"
                variant="text"
                onClick={() => setSelectedRowIds([])}
                sx={{
                  minWidth: "auto",
                  color: theme.customTokens.navigation.activeText,
                  px: 0,
                  "&:hover": {
                    backgroundColor: "transparent",
                    color: theme.customTokens.brand.secondary,
                  },
                }}
              >
                Clear Selection
              </Button>
            ) : null}

            <Typography variant="body2" color="text.secondary">
              {totalActiveFilters} active filters
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: theme.spacing(1.25),
              flexWrap: "wrap",
            }}
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
              sx={{
                minWidth: 88,
                borderRadius: `${theme.customTokens.radius.md}px`,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.customTokens.borders.default,
                },
              }}
            >
              {rowsPerPageOptions.map((option) => (
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
                onClick={() => setPage(1)}
                sx={paginationButtonSx(theme)}
              >
                <ChevronsLeft size={14} />
              </Button>

              <Button
                size="small"
                variant="outlined"
                disabled={safePage === 1}
                onClick={() => setPage((current) => Math.max(current - 1, 1))}
                sx={paginationButtonSx(theme)}
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
                    sx={pageNumberButtonSx(theme, pageNumber === safePage)}
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
                sx={paginationButtonSx(theme)}
              >
                Next
              </Button>

              <Button
                size="small"
                variant="outlined"
                disabled={safePage === totalPages}
                onClick={() => setPage(totalPages)}
                sx={paginationButtonSx(theme)}
              >
                <ChevronsRight size={14} />
              </Button>
            </Stack>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: theme.spacing(1),
                flexWrap: "wrap",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Go To Page
              </Typography>

              <TextField
                size="small"
                value={goToPage}
                onChange={(event) => setGoToPage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== "Enter") {
                    return;
                  }

                  setPage(clampPage(goToPage, totalPages));
                }}
                sx={{
                  width: 76,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: `${theme.customTokens.radius.md}px`,
                  },
                }}
              />

              <Button
                size="small"
                variant="outlined"
                onClick={() => setPage(clampPage(goToPage, totalPages))}
                sx={paginationButtonSx(theme)}
              >
                Go
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(usesActionMenu && actionMenuAnchor && activeRow)}
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
        {activeRowActions.map((action) => {
          const Icon = action.icon;

          return (
            <MenuItem
              key={action.id}
              onClick={() => {
                if (!activeRow) {
                  return;
                }

                action.onSelect(activeRow);
                handleCloseActionMenu();
              }}
              sx={{
                color: theme.customTokens.text.primary,
                gap: theme.spacing(1),
                "&:hover": {
                  backgroundColor: theme.customTokens.navigation.hoverBackground,
                  color: theme.customTokens.navigation.activeText,
                },
              }}
            >
              {Icon ? <Icon size={14} /> : null}
              {action.label}
            </MenuItem>
          );
        })}
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
        <MenuItem onClick={() => handleApplyFilter(null)}>
          All Values
        </MenuItem>

        {filterOptions.map((option) => (
          <MenuItem
            key={option}
            selected={
              activeFilterColumn ? filters[activeFilterColumn] === option : false
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
    direction?: EnterpriseTableSortDirection | undefined;
  }) {
    if (!active || !direction) {
      return (
        <ArrowUpDown color={theme.customTokens.text.inverse} size={14} />
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

export const standardInventoryTableActions = {
  edit: Pencil,
  view: Eye,
};

function headerCellSx(theme: Theme) {
  return {
    position: "sticky" as const,
    top: 0,
    zIndex: 2,
    py: 1.25,
    px: 1.5,
    borderBottom: `1px solid ${theme.customTokens.brand.primaryScale[800]}`,
    backgroundColor: theme.customTokens.brand.primary,
  };
}

function actionHeaderCellSx(
  theme: Theme,
  actionColumnWidth: number,
) {
  return {
    ...headerCellSx(theme),
    position: "sticky" as const,
    right: 0,
    zIndex: 5,
    minWidth: actionColumnWidth,
    boxShadow: `-1px 0 0 ${theme.customTokens.brand.primaryScale[800]}`,
  };
}

function bodyCellSx(theme: Theme) {
  return {
    py: 1.25,
    px: 1.5,
    borderBottom: `1px solid ${theme.customTokens.borders.default}`,
  };
}

function actionBodyCellSx(
  theme: Theme,
  actionColumnWidth: number,
) {
  return {
    ...bodyCellSx(theme),
    position: "sticky" as const,
    right: 0,
    zIndex: 1,
    minWidth: actionColumnWidth,
    whiteSpace: "normal",
    boxShadow: `-1px 0 0 ${theme.customTokens.borders.default}`,
  };
}

function emptyStateCellSx(theme: Theme) {
  return {
    ...bodyCellSx(theme),
    py: theme.spacing(4),
    textAlign: "center",
    color: theme.customTokens.text.secondary,
  };
}

function headerCheckboxSx(theme: Theme) {
  return {
    ...checkboxSx,
    color: theme.customTokens.text.inverse,
    "&.Mui-checked": {
      color: theme.customTokens.text.inverse,
    },
    "&.MuiCheckbox-indeterminate": {
      color: theme.customTokens.text.inverse,
    },
    "&:hover": {
      backgroundColor: theme.customTokens.brand.secondary,
    },
  };
}

const checkboxSx = {
  color: "text.secondary",
  "&.Mui-checked": {
    color: "primary.main",
  },
  "&.MuiCheckbox-indeterminate": {
    color: "primary.main",
  },
};

const headerIconButtonSx = {
  width: 24,
  height: 24,
  color: "common.white",
};

function paginationButtonSx(theme: Theme) {
  return {
    borderColor: theme.customTokens.borders.default,
    color: theme.customTokens.navigation.activeText,
    minWidth: 40,
    px: 1.25,
    "&:hover": {
      borderColor: theme.customTokens.brand.primary,
      backgroundColor: theme.customTokens.navigation.hoverBackground,
    },
  };
}

function pageNumberButtonSx(
  theme: Theme,
  active: boolean,
) {
  return {
    minWidth: 40,
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
        ? theme.customTokens.brand.secondary
        : theme.customTokens.navigation.hoverBackground,
      borderColor: theme.customTokens.brand.primary,
      boxShadow: "none",
    },
  };
}

const enterpriseStatusToggleValueMap: Record<string, boolean> = {
  active: true,
  enabled: true,
  inactive: false,
  disabled: false,
};

function getEnterpriseStatusToggleState<Row extends EnterpriseTableRow>(
  column: EnterpriseTableColumn<Row>,
  value: EnterpriseTableCellValue,
) {
  const isStatusColumn =
    column.label === "Status" ||
    column.key === "status" ||
    column.key === "statusLabel";

  if (!isStatusColumn) {
    return null;
  }

  const normalizedValue = formatEnterpriseValue(value).trim().toLowerCase();
  return normalizedValue in enterpriseStatusToggleValueMap
    ? enterpriseStatusToggleValueMap[normalizedValue]
    : null;
}

function renderEnterpriseTableCell<Row extends EnterpriseTableRow>(
  row: Row,
  column: EnterpriseTableColumn<Row>,
  statusOverrides: Record<string, boolean>,
  setStatusOverrides: Dispatch<SetStateAction<Record<string, boolean>>>,
  theme: Theme,
) {
  const toggleState = getEnterpriseStatusToggleState(column, row[column.key]);

  if (toggleState === null) {
    return formatEnterpriseValue(row[column.key]);
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

function normalizeSortValue(value: EnterpriseTableCellValue) {
  if (value instanceof Date) {
    return value.getTime();
  }

  const textValue = formatEnterpriseValue(value);
  const parsedDate = Date.parse(textValue);

  if (!Number.isNaN(parsedDate) && /[A-Za-z]{3}|\d{4}/.test(textValue)) {
    return parsedDate;
  }

  const numericCandidate = textValue.replace(/[^0-9.-]/g, "");

  if (numericCandidate && !Number.isNaN(Number(numericCandidate))) {
    return Number(numericCandidate);
  }

  return textValue.toLowerCase();
}

function formatEnterpriseValue(value: EnterpriseTableCellValue) {
  if (value instanceof Date) {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(value);
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (value === null || typeof value === "undefined") {
    return "";
  }

  return String(value);
}
