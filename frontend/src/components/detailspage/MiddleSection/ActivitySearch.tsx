"use client";

import { Box, Button, InputAdornment, OutlinedInput } from "@mui/material";
import { SearchActivityProps } from "@/types/detailspage/activity";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

export default function SearchActivity({
  search,
  onSearchChange,
  showButton = false,
  buttonText = "Convert",
  onButtonClick,
}: SearchActivityProps) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        alignItems: "center",
        width: "100%",
      }}
    >
      <OutlinedInput
        fullWidth
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search activities"
        startAdornment={
          <InputAdornment position="start" sx={{ mr: 0 }}>
            <SearchOutlinedIcon
              sx={{
                fontSize: 18,
                color: "text.secondary",
              }}
            />

            <Box
              sx={{
                width: "1px",
                height: 20,
                bgcolor: "#E4E7EC",
                mx: 1.5,
              }}
            />
          </InputAdornment>
        }
        sx={{
          height: 46,
          bgcolor: "background.paper",
          borderRadius: "8px",

          "& .MuiOutlinedInput-input": {
            fontSize: 14,
            py: 1.5,
          },

          "& fieldset": {
            borderColor: "divider",
          },

          "&:hover fieldset": {
            borderColor: "grey.400",
          },

          "&.Mui-focused fieldset": {
            borderColor: "primary.main",
            borderWidth: 1,
          },
        }}
      />

      {showButton && (
        <Button
          variant="contained"
          onClick={onButtonClick}
          sx={{
            minWidth: 96,
            height: 44,
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          {buttonText}
        </Button>
      )}
    </Box>
  );
}
