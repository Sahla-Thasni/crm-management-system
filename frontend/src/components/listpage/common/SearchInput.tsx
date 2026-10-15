"use client";

import { Box, InputBase } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
}

export default function SearchInput({
  placeholder = "Search...",
  value = "",
  onChange,
}: SearchInputProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        px: 2,
        py: 1,
        borderRadius: 2,
        bgcolor: "action.hover",
        border: "1px solid",
        borderColor: "divider",
        width: {
          xs: "100%",
          md: 410,
        },
        maxWidth: "100%",
      }}
    >
      <SearchIcon />

      <InputBase
  placeholder={placeholder}
  value={value}
  onChange={onChange}
  sx={{
    ml: 1,
    flex: 1,
  }}
/>
    </Box>
  );
}