import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { Navigate, useNavigate } from "react-router";

import deluxeLogo from "../../../assets/deluxe-veneers.png";
import { getCompactFieldSx } from "../../../pages/ComponentLibrary/sections/inputs/components/inputFieldStyles";
import {
  demoCredentials,
  isAuthenticated,
  resetDemoPassword,
  signIn,
} from "../authSession";

type ForgotPasswordStep = "email" | "otp";

export function LoginPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const authenticated = useMemo(() => isAuthenticated(), []);
  const [email, setEmail] = useState<string>(demoCredentials.email);
  const [password, setPassword] = useState<string>(demoCredentials.password);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loginNotice, setLoginNotice] = useState("");
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] =
    useState<ForgotPasswordStep>("email");
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordOtp, setForgotPasswordOtp] = useState("");
  const [forgotPasswordNewPassword, setForgotPasswordNewPassword] = useState("");
  const [forgotPasswordConfirmPassword, setForgotPasswordConfirmPassword] =
    useState("");
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState("");
  const [forgotPasswordError, setForgotPasswordError] = useState("");

  if (authenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      if (await signIn(email, password)) {
        navigate("/dashboard", { replace: true });
        return;
      }

      setLoginNotice("");
      setErrorMessage("Invalid email or password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForgotPasswordState = () => {
    setForgotPasswordStep("email");
    setForgotPasswordEmail(email);
    setForgotPasswordOtp("");
    setForgotPasswordNewPassword("");
    setForgotPasswordConfirmPassword("");
    setForgotPasswordMessage("");
    setForgotPasswordError("");
    setResetPasswordOpen(false);
  };

  const handleOpenForgotPassword = () => {
    resetForgotPasswordState();
    setForgotPasswordOpen(true);
  };

  const handleCloseForgotPassword = () => {
    setForgotPasswordOpen(false);
    setForgotPasswordMessage("");
    setForgotPasswordError("");
  };

  const handleCloseResetPassword = () => {
    setResetPasswordOpen(false);
    setForgotPasswordNewPassword("");
    setForgotPasswordConfirmPassword("");
    setForgotPasswordMessage("");
    setForgotPasswordError("");
  };

  const handleForgotPasswordAction = () => {
    setForgotPasswordError("");

    if (forgotPasswordStep === "email") {
      if (!forgotPasswordEmail.trim()) {
        setForgotPasswordError("Enter email address.");
        return;
      }

      if (forgotPasswordEmail.trim().toLowerCase() !== demoCredentials.email) {
        setForgotPasswordError("Email address not found.");
        return;
      }

      setForgotPasswordStep("otp");
      setForgotPasswordMessage("OTP sent. Enter the OTP to continue.");
      return;
    }

    if (forgotPasswordStep === "otp") {
      if (!forgotPasswordOtp.trim()) {
        setForgotPasswordError("Enter OTP.");
        return;
      }

      if (forgotPasswordOtp.trim().length < 4) {
        setForgotPasswordError("Enter a valid OTP.");
        return;
      }

      setForgotPasswordOpen(false);
      setResetPasswordOpen(true);
      setForgotPasswordMessage("Email verified. Set your new password.");
    }
  };

  const handleResetPasswordAction = () => {
    setForgotPasswordError("");

    if (!forgotPasswordNewPassword.trim()) {
      setForgotPasswordError("Enter new password.");
      return;
    }

    if (forgotPasswordNewPassword.trim().length < 4) {
      setForgotPasswordError("Password must be at least 4 characters.");
      return;
    }

    if (forgotPasswordNewPassword !== forgotPasswordConfirmPassword) {
      setForgotPasswordError("Passwords do not match.");
      return;
    }

    resetDemoPassword(forgotPasswordNewPassword);
    setEmail(forgotPasswordEmail.trim().toLowerCase());
    setPassword("");
    setErrorMessage("");
    setLoginNotice("Password reset successful. Sign in with the new password.");
    handleCloseResetPassword();
    resetForgotPasswordState();
  };

  const forgotPasswordPrimaryLabel =
    forgotPasswordStep === "email"
      ? "Verify Email"
      : "Verify";

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 3, md: 5 },
        backgroundColor: theme.customTokens.surfaces.background,
      }}
    >
      <Paper
        component="section"
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 920,
          border: `1px solid ${theme.customTokens.borders.default}`,
          borderRadius: `${theme.customTokens.radius.xl}px`,
          backgroundColor: theme.customTokens.surfaces.surface,
          boxShadow: theme.customTokens.elevation.sm,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "minmax(300px, 1fr) minmax(320px, 0.9fr)",
            },
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              px: { xs: 3, sm: 5, md: 7 },
              py: { xs: 4, md: 7 },
              borderBottom: {
                xs: `1px solid ${theme.customTokens.borders.divider}`,
                md: "none",
              },
              borderRight: {
                xs: "none",
                md: `1px solid ${theme.customTokens.borders.divider}`,
              },
              backgroundColor: theme.customTokens.surfaces.surface,
            }}
          >
            <Box
              component="img"
              src={deluxeLogo}
              alt="Deluxe Veneers"
              sx={{
                width: "100%",
                maxWidth: { xs: 220, sm: 250, md: 280 },
                objectFit: "contain",
              }}
            />
          </Box>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              px: { xs: 3, sm: 5, md: 7 },
              py: { xs: 4, md: 7 },
            }}
          >
            <Stack
              sx={{
                width: "100%",
                maxWidth: 380,
                mx: "auto",
                gap: theme.spacing(2.5),
              }}
            >
              <Stack spacing={0.75}>
                <Typography variant="h2" color="text.primary">
                  Sign In
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Access the Deluxe Veneers ERP portal.
                </Typography>
              </Stack>

              <TextField
                autoComplete="username"
                label="Email Address"
                placeholder="Enter email address"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (errorMessage) {
                    setErrorMessage("");
                  }
                }}
                sx={getCompactFieldSx(theme, errorMessage ? "error" : "default")}
              />

              <TextField
                autoComplete="current-password"
                label="Password"
                placeholder="Enter password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (errorMessage) {
                    setErrorMessage("");
                  }
                }}
                sx={getCompactFieldSx(theme, errorMessage ? "error" : "default")}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={showPassword}
                    onChange={(event) => setShowPassword(event.target.checked)}
                    sx={{
                      color: theme.customTokens.borders.strong,
                      "&.Mui-checked": {
                        color: theme.customTokens.brand.primary,
                      },
                    }}
                  />
                }
                label="Show Password"
                sx={{
                  m: 0,
                  color: theme.customTokens.text.secondary,
                  "& .MuiFormControlLabel-label": {
                    fontSize: theme.typography.body2.fontSize,
                    fontWeight: 500,
                  },
                }}
              />

              {errorMessage ? (
                <Alert
                  severity="error"
                  sx={{
                    borderRadius: `${theme.customTokens.radius.md}px`,
                  }}
                >
                  {errorMessage}
                </Alert>
              ) : null}

              {loginNotice ? (
                <Alert
                  severity="success"
                  sx={{
                    borderRadius: `${theme.customTokens.radius.md}px`,
                  }}
                >
                  {loginNotice}
                </Alert>
              ) : null}

              <Button
                disabled={isSubmitting}
                type="submit"
                variant="contained"
                size="large"
                sx={{
                  minHeight: 44,
                  borderRadius: `${theme.customTokens.radius.md}px`,
                  boxShadow: "none",
                  "&:hover": {
                    boxShadow: "none",
                  },
                }}
              >
                {isSubmitting ? "Signing In" : "Sign In"}
              </Button>

              <Button
                type="button"
                onClick={handleOpenForgotPassword}
                variant="text"
                sx={{
                  width: "fit-content",
                  px: 0,
                  color: theme.customTokens.text.secondary,
                  "&:hover": {
                    backgroundColor: "transparent",
                    color: theme.customTokens.brand.primary,
                  },
                }}
              >
                Forgot Password?
              </Button>
            </Stack>
          </Box>
        </Box>
      </Paper>

      <Dialog
        fullWidth
        maxWidth="xs"
        open={forgotPasswordOpen}
        onClose={handleCloseForgotPassword}
        slotProps={{
          paper: {
            sx: {
              border: `1px solid ${theme.customTokens.borders.default}`,
              borderRadius: `${theme.customTokens.radius.lg}px`,
              boxShadow: theme.customTokens.elevation.sm,
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            pb: 1,
          }}
        >
          Forgot Password
        </DialogTitle>

        <DialogContent
          sx={{
            pt: 1,
          }}
        >
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Verify your email and OTP before setting a new password.
            </Typography>

            <TextField
              label="Email Address"
              placeholder="Enter email address"
              value={forgotPasswordEmail}
              onChange={(event) => {
                setForgotPasswordEmail(event.target.value);
                if (forgotPasswordError) {
                  setForgotPasswordError("");
                }
              }}
              sx={getCompactFieldSx(
                theme,
                forgotPasswordError && forgotPasswordStep === "email"
                  ? "error"
                  : forgotPasswordStep === "email"
                    ? "default"
                    : "readOnly",
              )}
              slotProps={{
                input: {
                  readOnly: forgotPasswordStep !== "email",
                },
              }}
            />

            {forgotPasswordStep !== "email" ? (
              <TextField
                label="OTP"
                placeholder="Enter OTP"
                value={forgotPasswordOtp}
                onChange={(event) => {
                  setForgotPasswordOtp(event.target.value);
                  if (forgotPasswordError) {
                    setForgotPasswordError("");
                  }
                }}
                sx={getCompactFieldSx(
                  theme,
                  forgotPasswordError && forgotPasswordStep === "otp"
                    ? "error"
                    : forgotPasswordStep === "otp"
                      ? "default"
                      : "readOnly",
                )}
                slotProps={{
                  input: {
                    readOnly: false,
                  },
                }}
              />
            ) : null}

            {forgotPasswordMessage ? (
              <Alert
                severity="success"
                sx={{
                  borderRadius: `${theme.customTokens.radius.md}px`,
                }}
              >
                {forgotPasswordMessage}
              </Alert>
            ) : null}

            {forgotPasswordError ? (
              <Alert
                severity="error"
                sx={{
                  borderRadius: `${theme.customTokens.radius.md}px`,
                }}
              >
                {forgotPasswordError}
              </Alert>
            ) : null}
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 3,
            pt: 1,
          }}
        >
          <Button variant="outlined" onClick={handleCloseForgotPassword}>
            Cancel
          </Button>

          <Button variant="contained" onClick={handleForgotPasswordAction}>
            {forgotPasswordPrimaryLabel}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        fullWidth
        maxWidth="xs"
        open={resetPasswordOpen}
        onClose={handleCloseResetPassword}
        slotProps={{
          paper: {
            sx: {
              border: `1px solid ${theme.customTokens.borders.default}`,
              borderRadius: `${theme.customTokens.radius.lg}px`,
              boxShadow: theme.customTokens.elevation.sm,
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            pb: 1,
          }}
        >
          Reset Password
        </DialogTitle>

        <DialogContent
          sx={{
            pt: 1,
          }}
        >
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Set a new password for {forgotPasswordEmail || "your account"}.
            </Typography>

            <TextField
              label="New Password"
              placeholder="Enter new password"
              type="password"
              value={forgotPasswordNewPassword}
              onChange={(event) => {
                setForgotPasswordNewPassword(event.target.value);
                if (forgotPasswordError) {
                  setForgotPasswordError("");
                }
              }}
              sx={getCompactFieldSx(
                theme,
                forgotPasswordError ? "error" : "default",
              )}
            />

            <TextField
              label="Confirm New Password"
              placeholder="Confirm new password"
              type="password"
              value={forgotPasswordConfirmPassword}
              onChange={(event) => {
                setForgotPasswordConfirmPassword(event.target.value);
                if (forgotPasswordError) {
                  setForgotPasswordError("");
                }
              }}
              sx={getCompactFieldSx(
                theme,
                forgotPasswordError ? "error" : "default",
              )}
            />

            {forgotPasswordMessage ? (
              <Alert
                severity="success"
                sx={{
                  borderRadius: `${theme.customTokens.radius.md}px`,
                }}
              >
                {forgotPasswordMessage}
              </Alert>
            ) : null}

            {forgotPasswordError ? (
              <Alert
                severity="error"
                sx={{
                  borderRadius: `${theme.customTokens.radius.md}px`,
                }}
              >
                {forgotPasswordError}
              </Alert>
            ) : null}
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 3,
            pt: 1,
          }}
        >
          <Button variant="outlined" onClick={handleCloseResetPassword}>
            Cancel
          </Button>

          <Button variant="contained" onClick={handleResetPasswordAction}>
            Reset Password
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
