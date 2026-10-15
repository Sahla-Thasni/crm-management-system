"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import MuiLink from "@mui/material/Link";
import NextLink from "next/link";
import { apiRequest } from "@/lib/api";

import {
  Snackbar,
  Alert,
  Box,
  Button,
  FormControl,
  Grid,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  SelectChangeEvent,
} from "@mui/material";

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  companyName: string;
  industryType: string;
  country: string;
  role: string;
};

type FormErrors = FormData;

export default function Register() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    industryType: "",
    country: "",
    role: "",
  });

  const [errors, setErrors] = useState<FormErrors>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    industryType: "",
    country: "",
    role: "",
  });

  const [open, setOpen] = useState(false);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name!]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name!]: "",
    }));
  };

  const validate = () => {
    const newErrors: FormErrors = {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      companyName: "",
      industryType: "",
      country: "",
      role: "",
    };

    let valid = true;

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
      valid = false;
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
      valid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email";
      valid = false;
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
      valid = false;
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Enter a valid 10-digit phone number";
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      valid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
      valid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      valid = false;
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
      valid = false;
    }

    if (!formData.industryType) {
      newErrors.industryType = "Please choose an industry";
      valid = false;
    }

    if (!formData.country) {
      newErrors.country = "Please select a country";
      valid = false;
    }

    if (!formData.role) {
      newErrors.role = "Please select a role";
      valid = false;
    }

    setErrors(newErrors);

    return valid;
  };

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const data = await apiRequest<{
        message: string;
        user: {
          id: number;
          first_name: string;
          last_name: string;
          email: string;
          role: string;
        };
      }>("/users/register/", {
        method: "POST",
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          company_name: formData.companyName,
          industry_type: formData.industryType,
          country: formData.country,
          role: formData.role,
        }),
      });

      console.log("Registration response:", data);

      setOpen(true);

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error) {
      console.error("Registration error:", error);

      setErrors((prev) => ({
        ...prev,
        email:
          error instanceof Error
            ? error.message
            : "Registration failed. Please try again.",
      }));
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
        py: 4,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 600,
        }}
      >
        <Paper
          elevation={4}
          sx={{
            width: "100%",
            maxWidth: 700,
            p: 3,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              textAlign: "center",
              mb: 3,
            }}
          >
            Register
          </Typography>

          <form onSubmit={handleRegister}>
            <Grid container spacing={2}>
              {/* First Name */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  First Name
                </Typography>

                <TextField
                  fullWidth
                  size="small"
                  placeholder="Enter First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                />
              </Grid>

              {/* Last Name */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  Last Name
                </Typography>

                <TextField
                  fullWidth
                  size="small"
                  placeholder="Enter Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                />
              </Grid>

              {/* Email */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  Email
                </Typography>

                <TextField
                  fullWidth
                  size="small"
                  type="email"
                  placeholder="Enter Email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={!!errors.email}
                  helperText={errors.email}
                />
              </Grid>

              {/* Phone */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  Phone Number
                </Typography>

                <TextField
                  fullWidth
                  size="small"
                  placeholder="Enter Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  error={!!errors.phone}
                  helperText={errors.phone}
                />
              </Grid>

              {/* Password */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  Password
                </Typography>

                <TextField
                  fullWidth
                  size="small"
                  type="password"
                  placeholder="Enter Password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  error={!!errors.password}
                  helperText={errors.password}
                />
              </Grid>

              {/* Confirm Password */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  Confirm Password
                </Typography>

                <TextField
                  fullWidth
                  size="small"
                  type="password"
                  placeholder="Confirm Password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                />
              </Grid>

              {/* Company Name */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  Company Name
                </Typography>

                <TextField
                  fullWidth
                  size="small"
                  placeholder="Enter your company name"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  error={!!errors.companyName}
                  helperText={errors.companyName}
                />
              </Grid>

              {/* Industry */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  Industry Type
                </Typography>

                <FormControl
                  fullWidth
                  size="small"
                  error={!!errors.industryType}
                >
                  <Select
                    displayEmpty
                    name="industryType"
                    value={formData.industryType}
                    onChange={handleSelectChange}
                    renderValue={(selected) =>
                      selected ? (
                        selected
                      ) : (
                        <Typography sx={{ color: "text.secondary" }}>
                          Choose
                        </Typography>
                      )
                    }
                  >
                    <MenuItem value="" disabled>
                      Choose
                    </MenuItem>
                    <MenuItem value="IT">IT</MenuItem>
                    <MenuItem value="Healthcare">Healthcare</MenuItem>
                    <MenuItem value="Finance">Finance</MenuItem>
                    <MenuItem value="Education">Education</MenuItem>
                    <MenuItem value="Manufacturing">Manufacturing</MenuItem>
                  </Select>
                  <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                    {errors.industryType}
                  </Typography>
                </FormControl>
              </Grid>

              {/* Country */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  Country / Region
                </Typography>

                <FormControl fullWidth size="small" error={!!errors.country}>
                  <Select
                    displayEmpty
                    name="country"
                    value={formData.country}
                    onChange={handleSelectChange}
                    renderValue={(selected) =>
                      selected ? (
                        selected
                      ) : (
                        <Typography sx={{ color: "text.secondary" }}>
                          Enter your country or region
                        </Typography>
                      )
                    }
                  >
                    <MenuItem value="" disabled>
                      Select Country
                    </MenuItem>
                    <MenuItem value="India">India</MenuItem>
                    <MenuItem value="USA">USA</MenuItem>
                    <MenuItem value="UK">United Kingdom</MenuItem>
                    <MenuItem value="Canada">Canada</MenuItem>
                  </Select>
                  <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                    {errors.country}
                  </Typography>
                </FormControl>
              </Grid>

              {/* Role */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  Role
                </Typography>

                <FormControl fullWidth size="small" error={!!errors.role}>
                  <Select
                    displayEmpty
                    name="role"
                    value={formData.role}
                    onChange={handleSelectChange}
                    renderValue={(selected) =>
                      selected ? (
                        selected
                      ) : (
                        <Typography sx={{ color: "text.secondary" }}>
                          Choose
                        </Typography>
                      )
                    }
                  >
                    <MenuItem value="" disabled>
                      Select Role
                    </MenuItem>
                    <MenuItem value="Admin">Admin</MenuItem>
                    <MenuItem value="User">User</MenuItem>
                  </Select>
                  <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                    {errors.role}
                  </Typography>
                </FormControl>
              </Grid>
            </Grid>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                mt: 3,
                py: 1,
              }}
            >
              Register
            </Button>
          </form>
        </Paper>
        <Typography variant="body2" sx={{ textAlign: "center", mt: 2 }}>
          Already have an account?{" "}
          <MuiLink
            component={NextLink}
            href="/login"
            underline="hover"
            sx={{
              color: "primary.main",
              fontWeight: 500,
            }}
          >
            Login
          </MuiLink>
        </Typography>
      </Box>
      <Snackbar
        open={open}
        autoHideDuration={2000}
        onClose={() => setOpen(false)}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setOpen(false)}
        >
          Registration Successful!
        </Alert>
      </Snackbar>
    </Box>
  );
}
