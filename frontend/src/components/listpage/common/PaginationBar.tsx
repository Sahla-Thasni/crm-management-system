"use client";

import {
  Box,
  Pagination,
  PaginationItem,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

interface PaginationBarProps {
  page: number;
  count: number;
  onPageChange: (page: number) => void;
}

export default function PaginationBar({
  page,
  count,
  onPageChange,
}: PaginationBarProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        width: "100%",
      }}
    >
      <Pagination
        page={page}
        count={count}
        onChange={(_, newPage) => {
          onPageChange(newPage);
        }}
        hideNextButton={false}
        hidePrevButton={false}
        renderItem={(item) => (
          <PaginationItem
            {...item}
            slots={{
              previous: () => (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <ArrowBackIcon fontSize="small" />
                  <span>Previous</span>
                </Box>
              ),

              next: () => (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <span>Next</span>
                  <ArrowForwardIcon fontSize="small" />
                </Box>
              ),
            }}
            sx={{
              "&.Mui-selected": {
                backgroundColor: "primary.main",
                color: "primary.contrastText",

                "&:hover": {
                  backgroundColor: "primary.dark",
                },
              },

              "&.MuiPaginationItem-page": {
                minWidth: 46,
                height: 46,
                borderRadius: 1,
              },

              "&.MuiPaginationItem-previousNext": {
                color: "text.disabled",
              },

              "&.MuiPaginationItem-previousNext.Mui-disabled": {
                color: "text.disabled",
                opacity: 1,
              },
            }}
          />
        )}
      />
    </Box>
  );
}