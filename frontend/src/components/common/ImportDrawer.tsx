"use client";

import { useRef, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Typography,
} from "@mui/material";

import CommonDrawer from "@/components/common/CommonDrawer";
import { apiRequest } from "@/lib/api";

interface ImportDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;

  title: string;
  endpoint: string;

  description: string;
  requiredColumns: string;
  example: string;

  entityName: string;
}

interface ImportResponse {
  message: string;
  imported_count: number;
}

export default function ImportDrawer({
  open,
  onClose,
  onSuccess,

  title,
  endpoint,

  description,
  requiredColumns,
  example,

  entityName,
}: ImportDrawerProps) {

  // =====================================================
  // FILE INPUT
  // =====================================================

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  // =====================================================
  // STATE
  // =====================================================

  const [file, setFile] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // =====================================================
  // FILE CHANGE
  // =====================================================

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {

    const selectedFile =
      event.target.files?.[0] ?? null;

    setError("");
    setSuccess("");

    if (!selectedFile) {

      setFile(null);

      return;
    }

    // ---------------------------------------------------
    // CSV VALIDATION
    // ---------------------------------------------------

    if (
      !selectedFile.name
        .toLowerCase()
        .endsWith(".csv")
    ) {

      setError(
        "Only CSV files are supported.",
      );

      setFile(null);

      if (fileInputRef.current) {

        fileInputRef.current.value = "";
      }

      return;
    }

    // ---------------------------------------------------
    // FILE SIZE
    // ---------------------------------------------------

    const maxFileSize =
      5 * 1024 * 1024;

    if (
      selectedFile.size > maxFileSize
    ) {

      setError(
        "CSV file size cannot exceed 5 MB.",
      );

      setFile(null);

      if (fileInputRef.current) {

        fileInputRef.current.value = "";
      }

      return;
    }

    setFile(selectedFile);
  };

  // =====================================================
  // IMPORT
  // =====================================================

  const handleImport = async () => {

    if (!file) {

      setError(
        "Please select a CSV file.",
      );

      return;
    }

    try {

      setLoading(true);
      setError("");
      setSuccess("");

      // -------------------------------------------------
      // FORM DATA
      // -------------------------------------------------

      const formData =
        new FormData();

      formData.append(
        "file",
        file,
      );

      // -------------------------------------------------
      // API REQUEST
      // -------------------------------------------------

      const response =
        await apiRequest<ImportResponse>(
          endpoint,
          {
            method: "POST",
            body: formData,
          },
        );

      // -------------------------------------------------
      // SUCCESS
      // -------------------------------------------------

      setSuccess(
        `${response.message} ${response.imported_count} ${entityName} imported.`,
      );

      // -------------------------------------------------
      // REFRESH TABLE
      // -------------------------------------------------

      onSuccess();

    } catch (error) {

      console.error(
        `${entityName} import failed:`,
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : `Failed to import ${entityName}.`,
      );

    } finally {

      setLoading(false);
    }
  };

  // =====================================================
  // CLOSE
  // =====================================================

  const handleClose = () => {

    if (loading) {

      return;
    }

    setFile(null);
    setError("");
    setSuccess("");

    if (fileInputRef.current) {

      fileInputRef.current.value = "";
    }

    onClose();
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <CommonDrawer
      open={open}
      title={title}
      onClose={handleClose}
      onSave={handleImport}
      loading={loading}
      saveText="Import"
    >

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >

        {/* =================================================
            DESCRIPTION
        ================================================= */}

        <Typography
          variant="body2"
          color="text.secondary"
        >
          {description}
        </Typography>

        {/* =================================================
            FILE INPUT
        ================================================= */}

        <Box>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            style={{
              display: "none",
            }}
            id={`${entityName}-csv-upload`}
          />

          <label
            htmlFor={`${entityName}-csv-upload`}
          >

            <Button
              component="span"
              variant="outlined"
              fullWidth
              disabled={loading}
            >
              Choose CSV File
            </Button>

          </label>

        </Box>

        {/* =================================================
            SELECTED FILE
        ================================================= */}

        {file && (

          <Box
            sx={{
              p: 1.5,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
            }}
          >

            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
              }}
            >
              Selected file
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.5,
                wordBreak: "break-word",
              }}
            >
              {file.name}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
            >
              {(
                file.size / 1024
              ).toFixed(1)}{" "}
              KB
            </Typography>

          </Box>
        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <Alert severity="error">
            {error}
          </Alert>
        )}

        {/* =================================================
            SUCCESS
        ================================================= */}

        {success && (

          <Alert severity="success">
            {success}
          </Alert>
        )}

        {/* =================================================
            CSV FORMAT
        ================================================= */}

        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: "action.hover",
          }}
        >

          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              mb: 0.5,
            }}
          >
            Required CSV columns
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              lineHeight: 1.7,
              wordBreak: "break-word",
            }}
          >
            {requiredColumns}
          </Typography>

        </Box>

        {/* =================================================
            EXAMPLE
        ================================================= */}

        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: "action.hover",
          }}
        >

          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              mb: 0.5,
            }}
          >
            Example
          </Typography>

          <Typography
            variant="caption"
            component="div"
            color="text.secondary"
            sx={{
              wordBreak: "break-word",
              lineHeight: 1.6,
            }}
          >
            {example}
          </Typography>

        </Box>

      </Box>

    </CommonDrawer>
  );
}