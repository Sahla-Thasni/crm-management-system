"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  Alert,
  Snackbar,
  Box,
  Button,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import MuiLink from "@mui/material/Link";
import NextLink from "next/link";

import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store/store";
import { loginSuccess } from "@/store/slices/authSlice";
import { apiRequest } from "@/lib/api";

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

   // Show message when access token has expired
  useEffect(() => {
    if (searchParams.get("sessionExpired") === "true") {
      setSuccess(false);
      setMessage("Session expired. Please login again.");

      // Remove query parameter from URL
      window.history.replaceState(
        null,
        "",
        "/login"
      );
    }
  }, [searchParams]);
   
  const handleLogin = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    try {
      const data = await apiRequest<{
        message: string;
        access: string;
        refresh: string;
        user: {
          id: number;
          first_name: string;
          last_name: string;
          email: string;
          role: string;
        };
      }>("/users/login/", {
        method: "POST",
       // Login does not require an existing JWT
        auth: false,

        body: JSON.stringify({
          email,
          password,
        }),
      });

      dispatch(
        loginSuccess({
          user: {
            id: data.user.id,
            name: `${data.user.first_name} ${data.user.last_name}`,
            email: data.user.email,
          },
          accessToken: data.access,
        })
      );

      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("user", JSON.stringify(data.user));

      setSuccess(true);
      setMessage(data.message || "Login Successful!");

      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch {
      setSuccess(false);
      setMessage("Invalid email or password.");
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
      <Paper elevation={4} sx={{ width: "100%", maxWidth: 420, p: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ textAlign: "center" }}>
          Login
        </Typography>
        <form onSubmit={handleLogin}>
          <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
            Email
          </Typography>

          <TextField
            fullWidth
            placeholder="Enter your Email"
            type="email"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 2,
              mb: 1,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Password
            </Typography>

            <MuiLink
              component={NextLink}
              href="/forgot-password"
              underline="hover"
              color="primary"
            >
              Forgot Password?
            </MuiLink>
          </Box>

          <TextField
            fullWidth
            placeholder="Enter your password"
            type="password"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 4, py: 1.4 }}
          >
            Login
          </Button>
        </form>

        <Typography variant="body2" sx={{ textAlign: "center", mt: 3 }}>
          Don't have an account?{" "}
          <MuiLink
            component={NextLink}
            href="/register"
            underline="hover"
            color="primary"
          >
            Sign Up
          </MuiLink>
        </Typography>
      </Paper>

      <Snackbar
        open={message !== ""}
        autoHideDuration={2000}
        onClose={() => setMessage("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={success ? "success" : "error"}
          variant="filled"
          onClose={() => setMessage("")}
        >
          {message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
