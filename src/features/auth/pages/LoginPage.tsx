import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
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
import { isAuthenticated, signIn } from "../authSession";

export function LoginPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const authenticated = useMemo(() => isAuthenticated(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (authenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (signIn(email, password)) {
      navigate("/dashboard", { replace: true });
      return;
    }

    setErrorMessage("Invalid email or password.");
  };

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

              <Button
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
                Sign In
              </Button>

              <Button
                type="button"
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
    </Box>
  );
}
