import { Components } from "@mui/material/styles";

export const components: Components = {
  MuiButton: {
    defaultProps: {
      disableElevation: true,
    },

    styleOverrides: {
      root: {
        borderRadius: 8,
        padding: "10px 20px",
        textTransform: "none",
        fontWeight: 600,
      },
    },
  },

  MuiCard: {
    styleOverrides: {
      root: {
        border: "1px solid #E5E7EB",
        borderRadius: 12,
        boxShadow: "0px 8px 24px rgba(91, 90, 196, 0.08)",
      },
    },
  },

  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 4,
      },
    },
  },

  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        height: 40,
        borderRadius: 6,
        backgroundColor: "#FFFFFF",

        "& fieldset": {
          borderColor: "#D9D9D9",
        },

        "&:hover fieldset": {
          borderColor: "#BFBFBF",
        },

        "&.Mui-focused fieldset": {
          borderColor: "#2563EB",
          borderWidth: 1,
        },
      },

      input: {
        padding: "10px 12px",
        fontSize: 14,
      },
    },
  },

  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        fontWeight: 500,
      },
    },
  },

  MuiTableHead: {
    styleOverrides: {
      root: {
        backgroundColor: "#d0d2d6",
      },
    },
  },

  MuiTableCell: {
    styleOverrides: {
      head: {
        backgroundColor: "#FAFAFA",
        color: "#0F0F1A",
        fontWeight: 600,
      },
    },
  },
};
