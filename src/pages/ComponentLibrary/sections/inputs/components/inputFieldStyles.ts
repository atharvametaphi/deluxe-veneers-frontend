import type { Theme } from "@mui/material/styles";

export type FieldVisualState =
  | "default"
  | "hover"
  | "focus"
  | "filled"
  | "disabled"
  | "readOnly"
  | "error"
  | "success";

type FieldStyleOptions = {
  compact?: boolean;
  large?: boolean;
};

export function getFieldSx(
  theme: Theme,
  state: FieldVisualState = "default",
  options?: FieldStyleOptions,
) {
  const isCompact = options?.compact ?? false;
  const isDisabled = state === "disabled";
  const isError = state === "error";
  const isSuccess = state === "success";
  const isReadOnly = state === "readOnly";
  const isFocus = state === "focus";
  const isHover = state === "hover";
  const compactControlHeight = options?.large ? theme.spacing(5) : theme.spacing(4.5);
  const compactFontSize = theme.typography.body2.fontSize ?? "0.875rem";
  const compactLineHeight = theme.typography.body2.lineHeight ?? 1.43;

  const baseBorderColor = isError
    ? theme.palette.error.main
    : isSuccess
      ? theme.palette.success.main
      : isFocus
        ? theme.customTokens.borders.focus
        : isHover
          ? theme.customTokens.borders.hover
          : theme.customTokens.borders.default;

  const labelColor = isDisabled
    ? theme.palette.text.disabled
    : isError
      ? theme.palette.error.main
      : isSuccess
        ? theme.palette.success.main
        : isFocus
          ? theme.customTokens.navigation.activeText
          : theme.palette.text.secondary;

  const helperColor = isError
    ? theme.palette.error.main
    : isSuccess
      ? theme.palette.success.main
      : theme.palette.text.secondary;

  return {
    "& .MuiInputLabel-root": {
      color: labelColor,
      ...(isCompact
        ? {
            fontSize: theme.typography.caption.fontSize,
            transform: "translate(14px, 9px) scale(1)",
            "&.MuiInputLabel-shrink": {
              transform: "translate(14px, -7px) scale(0.88)",
            },
          }
        : {}),
      "&.Mui-focused": {
        color: labelColor,
      },
      "&.Mui-disabled": {
        color: theme.palette.text.disabled,
      },
    },
    "& .MuiOutlinedInput-root": {
      borderRadius: `${theme.customTokens.radius.md}px`,
      ...(isCompact
        ? {
            alignItems: "center",
            boxSizing: "border-box",
            height: compactControlHeight,
            minHeight: compactControlHeight,
          }
        : {}),
      backgroundColor:
        isDisabled || isReadOnly
          ? theme.customTokens.surfaces.alt
          : theme.customTokens.surfaces.surface,
      transition: theme.transitions.create(
        ["background-color", "border-color", "box-shadow"],
        {
          duration: theme.transitions.duration.shorter,
        },
      ),
      "& fieldset": {
        borderColor: baseBorderColor,
        borderWidth: isFocus || isError || isSuccess ? 1.5 : 1,
      },
      "&:hover fieldset": {
        borderColor:
          isDisabled || isReadOnly
            ? baseBorderColor
            : isError
              ? theme.palette.error.main
              : isSuccess
                ? theme.palette.success.main
                : theme.customTokens.borders.hover,
      },
      "&.Mui-focused fieldset": {
        borderColor: isError
          ? theme.palette.error.main
          : isSuccess
            ? theme.palette.success.main
            : theme.customTokens.borders.focus,
        borderWidth: 1.5,
      },
      "&.Mui-disabled fieldset": {
        borderColor: theme.customTokens.borders.light,
      },
      ...(isCompact
        ? {
            "& .MuiInputBase-input": {
              boxSizing: "border-box",
              fontSize: compactFontSize,
              height: "100%",
              lineHeight: compactLineHeight,
              paddingTop: 0,
              paddingBottom: 0,
            },
            "&.MuiInputBase-multiline": {
              alignItems: "flex-start",
              height: "auto",
              minHeight: "auto",
            },
            "& textarea": {
              fontSize: compactFontSize,
              paddingTop: theme.spacing(1),
              paddingBottom: theme.spacing(1),
            },
          }
        : {}),
      "& input, & textarea": {
        color: isDisabled
          ? theme.palette.text.disabled
          : theme.palette.text.primary,
      },
      "& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & textarea:-webkit-autofill, & textarea:-webkit-autofill:hover, & textarea:-webkit-autofill:focus": {
        WebkitTextFillColor: isDisabled
          ? theme.palette.text.disabled
          : theme.palette.text.primary,
        caretColor: isDisabled
          ? theme.palette.text.disabled
          : theme.palette.text.primary,
        WebkitBoxShadow: `0 0 0 1000px ${
          isDisabled || isReadOnly
            ? theme.customTokens.surfaces.alt
            : theme.customTokens.surfaces.surface
        } inset`,
        boxShadow: `0 0 0 1000px ${
          isDisabled || isReadOnly
            ? theme.customTokens.surfaces.alt
            : theme.customTokens.surfaces.surface
        } inset`,
        borderRadius: `${theme.customTokens.radius.md}px`,
        transition: "background-color 9999s ease-out 0s",
      },
      ...(options?.large && !isCompact
        ? {
            "& input": {
              paddingTop: theme.spacing(1.75),
              paddingBottom: theme.spacing(1.75),
            },
            "& textarea": {
              paddingTop: theme.spacing(1.75),
              paddingBottom: theme.spacing(1.75),
            },
          }
        : {}),
    },
    "& .MuiFormHelperText-root": {
      marginLeft: 0,
      fontSize: theme.typography.caption.fontSize,
      color: helperColor,
    },
  };
}

export function getCompactFieldSx(
  theme: Theme,
  state: FieldVisualState = "default",
  options?: Omit<FieldStyleOptions, "compact">,
) {
  return getFieldSx(theme, state, {
    ...options,
    compact: true,
  });
}
