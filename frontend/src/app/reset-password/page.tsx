"use client";

import { useState } from "react";
import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import MuiLink from "@mui/material/Link";
import NextLink from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

export default function ResetPassword() {

  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    if (!password || !confirmPassword) {
      setError("Please enter and confirm your new password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    try {
      setLoading(true);

      const data = await apiRequest<{ message: string }>(
        "/users/reset-password/",
        {
          method: "POST",
          body: JSON.stringify({
            token,
            password,
          }),
        }
      );

      setMessage(data.message);

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to reset password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          width: "100%",
          maxWidth: 420,
          p: 4,
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{ textAlign: "center" }}
        >
          Reset Password
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center", mb: 3 }}
        >
          Enter your new password below.
        </Typography>

        <form onSubmit={handleReset}>
          <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
            New Password
          </Typography>

          <TextField
            fullWidth
            type="password"
            placeholder="Enter new password"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Typography variant="body2" sx={{ fontWeight: 500, mt: 2 }}>
            Confirm Password
          </Typography>

          <TextField
            fullWidth
            type="password"
            placeholder="Confirm password"
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button
            type="submit"
            disabled={loading}
            variant="contained"
            fullWidth
            sx={{ mt: 4, py: 1.4 }}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
        {message && (
          <Typography
            variant="body2"
            color="success.main"
            sx={{ mt: 2, textAlign: "center" }}
          >
            {message}
          </Typography>
        )}

        {error && (
          <Typography
            variant="body2"
            color="error"
            sx={{ mt: 2, textAlign: "center" }}
          >
            {error}
          </Typography>
        )}

        <Typography
          variant="body2"
          sx={{ textAlign: "center", mt: 3 }}
        >
          Back to{" "}
          <MuiLink component={NextLink} href="/login">
            Login
          </MuiLink>
        </Typography>
      </Paper>
    </Box>
  );
}
