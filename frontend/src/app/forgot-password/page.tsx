"use client";

import { useState } from "react";
import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import MuiLink from "@mui/material/Link";
import NextLink from "next/link";
import { apiRequest } from "@/lib/api";

export default function ForgotPassword() {

  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    try {
      setLoading(true);

      const data = await apiRequest<{ message: string }>(
        "/users/forgot-password/",
        {
          method: "POST",
          body: JSON.stringify({
            email: email.trim(),
          }),
        }
      );

      setMessage(data.message);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to send reset instructions."
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
        <Typography variant="h4" gutterBottom sx={{ textAlign: "center" }}>
          Forgot Password
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center", mb: 3 }}
        >
          Enter your email to receive reset instructions
        </Typography>

        <form onSubmit={handleSubmit}>
          <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
            Email
          </Typography>

          <TextField
            fullWidth
            placeholder="Enter your email"
            type="email"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Button
            type="submit"
            disabled={loading}
            variant="contained"
            fullWidth
            sx={{ mt: 4, py: 1.4 }}
          >
            {loading ? "Sending..." : "Set Password"}
          </Button>
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
        </form>

        <Typography variant="body2" sx={{ textAlign: "center", mt: 3 }}>
          Remember your password?{" "}
          <MuiLink component={NextLink} href="/login">
            Back to Login
          </MuiLink>
        </Typography>
      </Paper>
    </Box>
  );
}
