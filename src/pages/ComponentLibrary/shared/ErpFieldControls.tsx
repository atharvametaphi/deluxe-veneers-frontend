import { useState } from "react";
import type { ReactNode } from "react";
import { Box, IconButton, Menu, MenuItem, Popover, Stack, Typography, useTheme } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

export type InteractiveFieldState =
  | "default"
  | "filled"
  | "focus"
  | "hover"
  | "disabled"
  | "error"
  | "readOnly";

type FieldSize = "regular" | "dense";

type BaseFieldProps = {
  helperText?: string | undefined;
  placeholder: string;
  size?: FieldSize;
  state?: InteractiveFieldState;
};

export type ErpSelectFieldProps = BaseFieldProps & {
  onChange: (value: string) => void;
  options: ReadonlyArray<string>;
  value: string;
};

export type ErpDatePickerFieldProps = BaseFieldProps & {
  onChange: (value: Date | null) => void;
  value: Date | null;
};

const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function startOfMonth(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), 1);
}

function addMonths(value: Date, months: number) {
  return new Date(value.getFullYear(), value.getMonth() + months, 1);
}

function addDays(value: Date, days: number) {
  const next = new Date(value);
  next.setDate(next.getDate() + days);
  return next;
}

function isSameDay(left: Date | null, right: Date | null) {
  if (!left || !right) {
    return false;
  }

  return startOfDay(left).getTime() === startOfDay(right).getTime();
}

function getMonthDays(month: Date) {
  const monthStart = startOfMonth(month);
  const offset = (monthStart.getDay() + 6) % 7;
  const gridStart = addDays(monthStart, -offset);

  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
}

function formatMonthLabel(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(value);
}

function formatDateLabel(value: Date | null) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

function getControlMetrics(theme: Theme, size: FieldSize) {
  return {
    calendarWidth: size === "dense" ? theme.spacing(24) : theme.spacing(26),
    controlHeight: size === "dense" ? theme.spacing(4) : theme.spacing(4.5),
    daySize: size === "dense" ? theme.spacing(3.25) : theme.spacing(3.5),
    iconButtonSize: size === "dense" ? theme.spacing(3.25) : theme.spacing(3.5),
    menuItemHeight: size === "dense" ? theme.spacing(4) : theme.spacing(4.5),
    popoverPadding: size === "dense" ? 0.75 : 1,
  } as const;
}

function getInteractiveFieldStyles(
  theme: Theme,
  state: InteractiveFieldState = "default",
  open = false,
) {
  const isDisabled = state === "disabled";
  const isError = state === "error";
  const isReadOnly = state === "readOnly";
  const isFocus = open || state === "focus";
  const isHover = state === "hover";

  const borderColor = isError
    ? theme.palette.error.main
    : isFocus
      ? theme.customTokens.borders.focus
      : isHover
        ? theme.customTokens.borders.hover
        : theme.customTokens.borders.default;

  return {
    backgroundColor:
      isDisabled || isReadOnly
        ? theme.customTokens.surfaces.alt
        : theme.customTokens.surfaces.surface,
    borderColor,
    boxShadow: isFocus
      ? `0 0 0 3px ${theme.customTokens.navigation.activeBackground}`
      : "none",
    color: isDisabled
      ? theme.palette.text.disabled
      : theme.palette.text.primary,
    cursor: isDisabled ? "not-allowed" : "pointer",
    helperColor: isError ? theme.palette.error.main : theme.palette.text.secondary,
  } as const;
}

function FieldValue({
  placeholder,
  size,
  theme,
  value,
}: {
  placeholder: string;
  size: FieldSize;
  theme: Theme;
  value: string;
}) {
  const hasValue = value.trim().length > 0;

  return (
    <Typography
      variant="body2"
      sx={{
        color: hasValue ? theme.palette.text.primary : theme.palette.text.secondary,
        fontSize:
          size === "dense"
            ? theme.typography.caption.fontSize
            : theme.typography.body2.fontSize,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {hasValue ? value : placeholder}
    </Typography>
  );
}

function CalendarMonth({
  month,
  onSelectDate,
  selectedDate,
  size,
}: {
  month: Date;
  onSelectDate: (date: Date) => void;
  selectedDate?: Date | null;
  size: FieldSize;
}) {
  const theme = useTheme();
  const metrics = getControlMetrics(theme, size);
  const today = startOfDay(new Date());
  const days = getMonthDays(month);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
        gap: theme.spacing(0.5),
      }}
    >
      {weekdayLabels.map((label) => (
        <Typography
          key={label}
          variant="caption"
          sx={{
            textAlign: "center",
            color: theme.palette.text.secondary,
            fontSize: theme.typography.caption.fontSize,
            fontWeight: 600,
            pb: theme.spacing(0.25),
          }}
        >
          {label}
        </Typography>
      ))}

      {days.map((day) => {
        const isCurrentMonth = day.getMonth() === month.getMonth();
        const isSelected = isSameDay(day, selectedDate ?? null);
        const isToday = isSameDay(day, today);

        return (
          <Box
            key={day.toISOString()}
            component="button"
            onClick={() => onSelectDate(day)}
            sx={{
              appearance: "none",
              border: isSelected
                ? `1px solid ${theme.customTokens.brand.primary}`
                : isToday
                  ? `1px solid ${theme.customTokens.brand.secondary}`
                  : "1px solid transparent",
              backgroundColor: isSelected
                ? theme.customTokens.brand.primary
                : "transparent",
              borderRadius: `${theme.customTokens.radius.sm}px`,
              color: isSelected
                ? theme.customTokens.text.inverse
                : isCurrentMonth
                  ? theme.palette.text.primary
                  : theme.palette.text.secondary,
              cursor: "pointer",
              height: metrics.daySize,
              fontSize: theme.typography.caption.fontSize,
              fontWeight: isSelected ? 600 : 500,
              opacity: isCurrentMonth ? 1 : 0.56,
              transition: theme.transitions.create(["background-color", "border-color"], {
                duration: theme.transitions.duration.shorter,
              }),
              "&:hover": {
                backgroundColor: isSelected
                  ? theme.customTokens.brand.secondary
                  : theme.customTokens.navigation.hoverBackground,
              },
            }}
            type="button"
          >
            {day.getDate()}
          </Box>
        );
      })}
    </Box>
  );
}

function CalendarSurface({
  children,
  month,
  onNext,
  onPrevious,
  size,
}: {
  children: ReactNode;
  month: Date;
  onNext: () => void;
  onPrevious: () => void;
  size: FieldSize;
}) {
  const theme = useTheme();
  const metrics = getControlMetrics(theme, size);

  return (
    <Stack
      sx={{
        gap: theme.spacing(0.75),
        minWidth: metrics.calendarWidth,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: theme.spacing(1),
        }}
      >
        <IconButton
          aria-label="Previous month"
          onClick={onPrevious}
          size="small"
          sx={{
            width: metrics.iconButtonSize,
            height: metrics.iconButtonSize,
            border: `1px solid ${theme.customTokens.borders.default}`,
            color: theme.customTokens.navigation.activeText,
            backgroundColor: theme.customTokens.surfaces.surface,
            "&:hover": {
              backgroundColor: theme.customTokens.navigation.hoverBackground,
            },
          }}
        >
          <ChevronLeft size={14} />
        </IconButton>

        <Typography variant="body2" color="text.primary" fontWeight={600}>
          {formatMonthLabel(month)}
        </Typography>

        <IconButton
          aria-label="Next month"
          onClick={onNext}
          size="small"
          sx={{
            width: metrics.iconButtonSize,
            height: metrics.iconButtonSize,
            border: `1px solid ${theme.customTokens.borders.default}`,
            color: theme.customTokens.navigation.activeText,
            backgroundColor: theme.customTokens.surfaces.surface,
            "&:hover": {
              backgroundColor: theme.customTokens.navigation.hoverBackground,
            },
          }}
        >
          <ChevronRight size={14} />
        </IconButton>
      </Box>

      {children}
    </Stack>
  );
}

export function ErpSelectField({
  helperText,
  onChange,
  options,
  placeholder,
  size = "regular",
  state = "default",
  value,
}: ErpSelectFieldProps) {
  const theme = useTheme();
  const metrics = getControlMetrics(theme, size);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const open = Boolean(anchorEl);
  const styles = getInteractiveFieldStyles(theme, state, open);

  return (
    <Stack
      sx={{
        width: "100%",
        gap: theme.spacing(0.75),
      }}
    >
      <Box
        component="button"
        onClick={(event) => {
          if (state !== "disabled") {
            setAnchorEl(event.currentTarget);
          }
        }}
        sx={{
          appearance: "none",
          width: "100%",
          textAlign: "left",
          border: `1px solid ${styles.borderColor}`,
          borderRadius: `${theme.customTokens.radius.md}px`,
          backgroundColor: styles.backgroundColor,
          boxShadow: styles.boxShadow,
          color: styles.color,
          cursor: styles.cursor,
          minHeight: metrics.controlHeight,
          px: theme.spacing(1.5),
          py: size === "dense" ? theme.spacing(0.75) : theme.spacing(1),
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: theme.spacing(1),
          "&:hover": {
            borderColor:
              state === "disabled" || state === "error"
                ? styles.borderColor
                : theme.customTokens.borders.hover,
            backgroundColor:
              state === "disabled"
                ? styles.backgroundColor
                : theme.customTokens.surfaces.surface,
          },
        }}
        type="button"
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <FieldValue
            placeholder={placeholder}
            size={size}
            theme={theme}
            value={value}
          />
        </Box>

        <ChevronDown
          color={state === "disabled" ? theme.palette.text.disabled : theme.customTokens.navigation.activeText}
          size={size === "dense" ? 14 : theme.customTokens.iconSizes.sm}
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 160ms ease",
          }}
        />
      </Box>

      {helperText ? (
        <Typography variant="caption" sx={{ color: styles.helperColor }}>
          {helperText}
        </Typography>
      ) : null}

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: {
              mt: theme.spacing(0.75),
              minWidth: anchorEl ? anchorEl.clientWidth : theme.spacing(30),
              maxHeight: theme.spacing(30),
              border: `1px solid ${theme.customTokens.borders.default}`,
              borderRadius: `${theme.customTokens.radius.md}px`,
              backgroundColor: theme.customTokens.surfaces.surface,
              boxShadow: "none",
              overflow: "hidden",
            },
          },
        }}
      >
        {options.map((option) => {
          const selected = option === value;

          return (
            <MenuItem
              key={option}
              selected={selected}
              onClick={() => {
                onChange(option);
                setAnchorEl(null);
              }}
              sx={{
                minHeight: metrics.menuItemHeight,
                fontSize:
                  size === "dense"
                    ? theme.typography.caption.fontSize
                    : theme.typography.body2.fontSize,
                "&.Mui-selected": {
                  backgroundColor: theme.customTokens.brand.primary,
                  color: theme.customTokens.text.inverse,
                },
                "&.Mui-selected:hover": {
                  backgroundColor: theme.customTokens.brand.secondary,
                },
                "&:hover": {
                  backgroundColor: selected
                    ? theme.customTokens.brand.secondary
                    : theme.customTokens.navigation.hoverBackground,
                },
              }}
            >
              {option}
            </MenuItem>
          );
        })}
      </Menu>
    </Stack>
  );
}

export function ErpDatePickerField({
  helperText,
  onChange,
  placeholder,
  size = "regular",
  state = "default",
  value,
}: ErpDatePickerFieldProps) {
  const theme = useTheme();
  const metrics = getControlMetrics(theme, size);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [month, setMonth] = useState<Date>(startOfMonth(value ?? new Date()));

  const open = Boolean(anchorEl);
  const styles = getInteractiveFieldStyles(theme, state, open);

  const displayValue = formatDateLabel(value);

  return (
    <Stack
      sx={{
        width: "100%",
        gap: theme.spacing(0.75),
      }}
    >
      <Box
        component="button"
        onClick={(event) => {
          if (state !== "disabled") {
            setMonth(startOfMonth(value ?? new Date()));
            setAnchorEl(event.currentTarget);
          }
        }}
        sx={{
          appearance: "none",
          width: "100%",
          textAlign: "left",
          border: `1px solid ${styles.borderColor}`,
          borderRadius: `${theme.customTokens.radius.md}px`,
          backgroundColor: styles.backgroundColor,
          boxShadow: styles.boxShadow,
          color: styles.color,
          cursor: styles.cursor,
          minHeight: metrics.controlHeight,
          px: theme.spacing(1.5),
          py: size === "dense" ? theme.spacing(0.75) : theme.spacing(1),
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: theme.spacing(1),
          "&:hover": {
            borderColor:
              state === "disabled" || state === "error"
                ? styles.borderColor
                : theme.customTokens.borders.hover,
          },
        }}
        type="button"
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <FieldValue
            placeholder={placeholder}
            size={size}
            theme={theme}
            value={displayValue}
          />
        </Box>

        <CalendarDays
          color={state === "disabled" ? theme.palette.text.disabled : theme.customTokens.navigation.activeText}
          size={size === "dense" ? 14 : theme.customTokens.iconSizes.sm}
        />
      </Box>

      {helperText ? (
        <Typography variant="caption" sx={{ color: styles.helperColor }}>
          {helperText}
        </Typography>
      ) : null}

      <Popover
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: {
              mt: theme.spacing(0.75),
              p: metrics.popoverPadding,
              border: `1px solid ${theme.customTokens.borders.default}`,
              borderRadius: `${theme.customTokens.radius.lg}px`,
              backgroundColor: theme.customTokens.surfaces.surface,
              boxShadow: "none",
            },
          },
        }}
      >
        <CalendarSurface
          month={month}
          onNext={() => setMonth((current) => addMonths(current, 1))}
          onPrevious={() => setMonth((current) => addMonths(current, -1))}
          size={size}
        >
          <CalendarMonth
            month={month}
            onSelectDate={(day) => {
              onChange(startOfDay(day));
              setAnchorEl(null);
            }}
            selectedDate={value}
            size={size}
          />
        </CalendarSurface>
      </Popover>
    </Stack>
  );
}
